-- Enable pg_cron for scheduled jobs
create extension if not exists pg_cron with schema extensions;

-- Function to shift demo time entries forward by one week
create or replace function public.shift_time_entries_week()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.time_entries
  set
    date = date + interval '7 days',
    created_at = case when created_at is not null then created_at + interval '7 days' else null end,
    submitted_at = case when submitted_at is not null then submitted_at + interval '7 days' else null end;
end;
$$;

comment on function public.shift_time_entries_week() is
  'Shifts all time entry dates forward by one week to keep demo data aligned with the current calendar.';

-- Allow service role to trigger the rollover manually if needed
grant execute on function public.shift_time_entries_week() to service_role;

do $$
begin
  if exists (select 1 from cron.job where jobname = 'weekly_time_entries_rollover') then
    perform cron.unschedule('weekly_time_entries_rollover');
  end if;
end
$$;

select cron.schedule(
  'weekly_time_entries_rollover',
  '1 0 * * 0',
  $$call public.shift_time_entries_week();$$,
  'UTC'
);
