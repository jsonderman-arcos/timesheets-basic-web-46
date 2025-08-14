-- Create enum types for roles and statuses
CREATE TYPE public.user_role AS ENUM ('admin', 'usp_admin', 'ep_manager', 'supervisor', 'crew_member');
CREATE TYPE public.exception_status AS ENUM ('pending', 'approved', 'denied');
CREATE TYPE public.timesheet_status AS ENUM ('submitted', 'approved', 'rejected');

-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'crew_member',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create crews table
CREATE TABLE public.crews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  supervisor_id UUID REFERENCES public.profiles(id),
  utility TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create crew members junction table
CREATE TABLE public.crew_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_id UUID REFERENCES public.crews(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(crew_id, profile_id)
);

-- Create timesheets table
CREATE TABLE public.timesheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_id UUID REFERENCES public.crews(id) NOT NULL,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  break_duration INTEGER DEFAULT 0, -- minutes
  total_hours DECIMAL(4,2),
  location_start TEXT,
  location_end TEXT,
  work_description TEXT,
  status timesheet_status DEFAULT 'submitted',
  submitted_by UUID REFERENCES public.profiles(id),
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(crew_id, date)
);

-- Create exceptions table
CREATE TABLE public.exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timesheet_id UUID REFERENCES public.timesheets(id) ON DELETE CASCADE NOT NULL,
  exception_type TEXT NOT NULL,
  description TEXT NOT NULL,
  status exception_status DEFAULT 'pending',
  submitted_by UUID REFERENCES public.profiles(id) NOT NULL,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create GPS tracking table
CREATE TABLE public.gps_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timesheet_id UUID REFERENCES public.timesheets(id) ON DELETE CASCADE NOT NULL,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accuracy DECIMAL(6,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crew_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gps_tracking ENABLE ROW LEVEL SECURITY;

-- Create helper function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create helper function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS user_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role
  FROM public.profiles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- RLS Policies for crews
CREATE POLICY "Users can view all crews" ON public.crews FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage crews" ON public.crews FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'usp_admin') OR 
  public.has_role(auth.uid(), 'ep_manager')
);

-- RLS Policies for crew_members
CREATE POLICY "Users can view all crew members" ON public.crew_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage crew members" ON public.crew_members FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'usp_admin')
);

-- RLS Policies for timesheets
CREATE POLICY "Users can view all timesheets" ON public.timesheets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Crew members can insert timesheets for their crew" ON public.timesheets FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.crew_members cm 
    JOIN public.profiles p ON p.id = cm.profile_id 
    WHERE cm.crew_id = timesheets.crew_id AND p.user_id = auth.uid()
  ) OR
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'usp_admin')
);
CREATE POLICY "Authorized users can update timesheets" ON public.timesheets FOR UPDATE TO authenticated USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'usp_admin') OR 
  public.has_role(auth.uid(), 'ep_manager')
);

-- RLS Policies for exceptions
CREATE POLICY "Users can view all exceptions" ON public.exceptions FOR SELECT TO authenticated USING (true);
CREATE POLICY "USP Admins can create exceptions" ON public.exceptions FOR INSERT TO authenticated WITH CHECK (
  public.has_role(auth.uid(), 'usp_admin') OR 
  public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "EP Managers can update exceptions" ON public.exceptions FOR UPDATE TO authenticated USING (
  public.has_role(auth.uid(), 'ep_manager') OR 
  public.has_role(auth.uid(), 'admin')
);

-- RLS Policies for GPS tracking
CREATE POLICY "Users can view GPS data" ON public.gps_tracking FOR SELECT TO authenticated USING (true);
CREATE POLICY "Crew members can insert GPS data" ON public.gps_tracking FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.timesheets t
    JOIN public.crew_members cm ON cm.crew_id = t.crew_id
    JOIN public.profiles p ON p.id = cm.profile_id
    WHERE t.id = gps_tracking.timesheet_id AND p.user_id = auth.uid()
  ) OR
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'usp_admin')
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_crews_updated_at BEFORE UPDATE ON public.crews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_timesheets_updated_at BEFORE UPDATE ON public.timesheets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_exceptions_updated_at BEFORE UPDATE ON public.exceptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.profiles (user_id, email, full_name, role) VALUES
  (gen_random_uuid(), 'admin@company.com', 'System Admin', 'admin'),
  (gen_random_uuid(), 'usp.admin@company.com', 'USP Admin', 'usp_admin'),
  (gen_random_uuid(), 'ep.manager@company.com', 'EP Manager', 'ep_manager'),
  (gen_random_uuid(), 'supervisor1@company.com', 'John Supervisor', 'supervisor'),
  (gen_random_uuid(), 'supervisor2@company.com', 'Jane Supervisor', 'supervisor');

INSERT INTO public.crews (name, utility) VALUES
  ('Alpha Crew', 'Electric'),
  ('Beta Crew', 'Gas'),
  ('Gamma Crew', 'Water'),
  ('Delta Crew', 'Electric'),
  ('Echo Crew', 'Gas');

-- Insert sample timesheets for the past week
INSERT INTO public.timesheets (crew_id, date, start_time, end_time, total_hours, work_description)
SELECT 
  c.id,
  CURRENT_DATE - (random() * 7)::int,
  '08:00:00'::time,
  '17:00:00'::time,
  8.0,
  'Regular maintenance work'
FROM public.crews c
WHERE random() > 0.3;