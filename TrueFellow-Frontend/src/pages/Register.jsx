import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
} from '@mui/material';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(name, email, password);
      // New users start as TOURIST by default
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minHeight="90vh" display="flex" alignItems="center" bgcolor="#f7f9f6">
      <Container maxWidth="md">
        <Paper elevation={4} sx={{ borderRadius: 4, overflow: 'hidden' }}>
          <Grid container>
            {/* Left side cover */}
            <Grid
              item
              xs={12}
              md={6}
              sx={{
                background: 'linear-gradient(rgba(74, 122, 55, 0.4), rgba(11, 37, 24, 0.8)), url("https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: 'white',
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                minHeight: { xs: 200, md: 450 },
              }}
            >
              <Typography variant="h4" fontWeight={800} gutterBottom color="white">
                Begin Your Journey
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Create an account to join local guided tours, rate organizer services, and find travel companions.
              </Typography>
            </Grid>

            {/* Right side form */}
            <Grid item xs={12} md={6} sx={{ p: 4, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography variant="h5" fontWeight={700} mb={3}>
                Create Account
              </Typography>

              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

              <form onSubmit={handleSubmit}>
                <Box display="flex" flexDirection="column" gap={2}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <TextField
                    fullWidth
                    label="Password (min 6 characters)"
                    type="password"
                    required
                    inputProps={{ minLength: 6 }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={loading}
                    sx={{ mt: 1, py: 1.2, borderRadius: 2 }}
                  >
                    {loading ? 'Registering...' : 'Sign Up'}
                  </Button>
                </Box>
              </form>
              <Box mt={3} textAlign="center">
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{' '}
                  <Link to="/login" style={{ color: '#4A7A37', fontWeight: 600 }}>
                    Login
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

export default Register;
