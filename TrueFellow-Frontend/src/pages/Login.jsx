import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  IconButton,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import TerrainIcon from '@mui/icons-material/Terrain';

const Login = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || null;

  useEffect(() => {
    if (user) {
      if (from) {
        navigate(from, { replace: true });
      } else if (user.role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'ORGANIZER') {
        navigate('/organizer', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, from, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedUser = await login(email, password);
      if (from) {
        navigate(from, { replace: true });
      } else if (loggedUser?.role === 'ADMIN') {
        navigate('/admin');
      } else if (loggedUser?.role === 'ORGANIZER') {
        navigate('/organizer');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '85vh', display: 'flex', alignItems: 'center', bgcolor: '#F8FAF7', py: 8 }}>
      <Container maxWidth="md">
        <Paper
          elevation={4}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            border: '1px solid #E4EDE6',
            boxShadow: '0 12px 40px rgba(8, 28, 21, 0.08)',
          }}
        >
          <Grid container>
            {/* Left Scenic Cover */}
            <Grid
              size={{ xs: 12, md: 5.5 }}
              sx={{
                background: 'linear-gradient(rgba(8, 28, 21, 0.55), rgba(8, 28, 21, 0.85)), url("https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=85")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: 'white',
                p: 4.5,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: { xs: 220, md: 480 },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2.5,
                    bgcolor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                  }}
                >
                  <TerrainIcon sx={{ fontSize: 22 }} />
                </Box>
                <Typography variant="h6" fontWeight={800} color="white">
                  TrueFellow
                </Typography>
              </Box>

              <Box>
                <Typography variant="h4" fontWeight={800} gutterBottom sx={{ color: '#ffffff !important', lineHeight: 1.25 }}>
                  Welcome Back, Explorer
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.92) !important', lineHeight: 1.6 }}>
                  Log in to manage your bookings, discover compatible companions, or access your organizer portal.
                </Typography>
              </Box>

              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.75) !important' }}>
                Passu Cones &bull; Hunza Valley, Pakistan
              </Typography>
            </Grid>

            {/* Right Form Container */}
            <Grid size={{ xs: 12, md: 6.5 }} sx={{ p: { xs: 3.5, sm: 5 }, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography variant="h5" fontWeight={800} color="#081C15" mb={1}>
                Sign In to Your Account
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Enter your credentials below to continue.
              </Typography>

              {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2.5 }}>{error}</Alert>}

              <form onSubmit={handleSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.2 }}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              size="small"
                            >
                              {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={loading}
                    sx={{
                      mt: 1,
                      py: 1.3,
                      borderRadius: 3,
                      fontWeight: 700,
                      boxShadow: '0 4px 16px rgba(45, 106, 79, 0.3)',
                    }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Log In'}
                  </Button>
                </Box>
              </form>

              <Box sx={{ mt: 3.5, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Don't have an account yet?{' '}
                  <Link to="/register" style={{ color: '#2D6A4F', fontWeight: 700 }}>
                    Sign Up Free
                  </Link>
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
