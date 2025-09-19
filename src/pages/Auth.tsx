import { type SyntheticEvent, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Tab,
  TextField,
  Typography,
} from '@mui/material';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { useAuth } from '@/hooks/useAuth';
import { showSuccessToast, showErrorToast } from '@/lib/toast-utils';

export default function Auth() {
  const { user, signIn, signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');

  const handleTabChange = (_event: SyntheticEvent, value: string) => {
    setTab(value as 'signin' | 'signup');
  };

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await signIn(email, password);
    
    if (error) {
      showErrorToast(
        "Sign in failed",
        error.message
      );
    }
    
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;

    const { error } = await signUp(email, password, fullName);
    
    if (error) {
      showErrorToast(
        "Sign up failed",
        error.message
      );
    } else {
      showSuccessToast(
        "Account created!",
        "Please check your email to verify your account."
      );
    }
    
    setLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default',
        p: 2,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 420 }}>
        <CardHeader
          title={
            <Typography variant="h5" component="h1" fontWeight={600}>
              Timesheet Management
            </Typography>
          }
          subheader="Sign in to access your timesheet dashboard"
          subheaderTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
        />
        <CardContent sx={{ pt: 0 }}>
          <TabContext value={tab}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <TabList onChange={handleTabChange} variant="fullWidth">
                <Tab label="Sign In" value="signin" />
                <Tab label="Sign Up" value="signup" />
              </TabList>
            </Box>

            <TabPanel value="signin" sx={{ p: 0 }}>
              <Box
                component="form"
                onSubmit={handleSignIn}
                sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
              >
                <TextField
                  id="signin-email"
                  name="email"
                  label="Email"
                  type="email"
                  required
                  placeholder="Enter your email"
                  fullWidth
                />
                <TextField
                  id="signin-password"
                  name="password"
                  label="Password"
                  type="password"
                  required
                  placeholder="Enter your password"
                  fullWidth
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  fullWidth
                  sx={{ textTransform: 'none' }}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </Box>
            </TabPanel>

            <TabPanel value="signup" sx={{ p: 0 }}>
              <Box
                component="form"
                onSubmit={handleSignUp}
                sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
              >
                <TextField
                  id="signup-name"
                  name="fullName"
                  label="Full Name"
                  type="text"
                  required
                  placeholder="Enter your full name"
                  fullWidth
                />
                <TextField
                  id="signup-email"
                  name="email"
                  label="Email"
                  type="email"
                  required
                  placeholder="Enter your email"
                  fullWidth
                />
                <TextField
                  id="signup-password"
                  name="password"
                  label="Password"
                  type="password"
                  required
                  placeholder="Enter your password"
                  fullWidth
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  fullWidth
                  sx={{ textTransform: 'none' }}
                >
                  {loading ? 'Creating account...' : 'Sign Up'}
                </Button>
              </Box>
            </TabPanel>
          </TabContext>
        </CardContent>
      </Card>
    </Box>
  );
}
