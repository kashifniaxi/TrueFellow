import React, { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { Link } from 'react-router-dom';
import { APPLY_ORGANIZER_MUTATION } from '../graphql/operations';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const ApplyOrganizer = () => {
  const [organizationName, setOrganizationName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');

  const [apply, { loading, error, data }] = useMutation(APPLY_ORGANIZER_MUTATION);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apply({
        variables: {
          input: {
            organizationName,
            phone,
            bio,
            website,
            socialLinks: {
              facebook,
              instagram,
            },
          },
        },
      });
    } catch (err) {
      console.error(err);
    }
  };

  const isSubmitted = Boolean(data?.applyForOrganizer);

  return (
    <Box sx={{ minHeight: '85vh', py: 8, bgcolor: '#F8FAF7' }}>
      <Container maxWidth="sm">
        <Paper
          elevation={4}
          sx={{
            p: { xs: 3.5, sm: 5 },
            borderRadius: 4,
            border: '1px solid #E4EDE6',
            boxShadow: '0 12px 40px rgba(8, 28, 21, 0.08)',
            bgcolor: '#FFFFFF',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2.5,
                background: 'linear-gradient(135deg, #2D6A4F 0%, #1B4332 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <StorefrontIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={800} color="#081C15">
                Apply as Tour Organizer
              </Typography>
              <Chip
                label="VERIFICATION REQUIRED"
                size="small"
                color="primary"
                variant="outlined"
                sx={{ height: 20, fontSize: '0.66rem', fontWeight: 700 }}
              />
            </Box>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, mb: 3.5, lineHeight: 1.6 }}>
            Submit your business or guiding credentials to list tour packages, host departures, and connect directly with thousands of tourists across Pakistan.
          </Typography>

          {isSubmitted && (
            <Alert
              severity="success"
              icon={<CheckCircleIcon />}
              sx={{ mb: 3.5, borderRadius: 3 }}
            >
              <Typography variant="subtitle2" fontWeight={750} gutterBottom>
                Application Submitted Successfully!
              </Typography>
              Current status: <strong>{data.applyForOrganizer.status}</strong>. Our admin team will review your application within 24-48 hours and notify your account.
              <Box sx={{ mt: 1.5 }}>
                <Button component={Link} to="/dashboard" size="small" variant="outlined" color="success">
                  Back to Dashboard
                </Button>
              </Box>
            </Alert>
          )}

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>{error.message}</Alert>}

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.2 }}>
              <TextField
                fullWidth
                label="Organization / Business Name"
                placeholder="e.g. Karakoram Treks & Tours"
                required
                disabled={isSubmitted}
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
              />
              <TextField
                fullWidth
                label="Primary Contact Phone"
                placeholder="+92 300 1234567"
                required
                disabled={isSubmitted}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Organization Bio & Experience"
                placeholder="Briefly describe your team, experience operating tours in Pakistan, license details, and regions of expertise..."
                disabled={isSubmitted}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
              <TextField
                fullWidth
                label="Official Website (Optional)"
                placeholder="https://example.com"
                disabled={isSubmitted}
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
              <TextField
                fullWidth
                label="Facebook Page URL (Optional)"
                placeholder="https://facebook.com/yourpage"
                disabled={isSubmitted}
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
              />
              <TextField
                fullWidth
                label="Instagram Profile URL (Optional)"
                placeholder="https://instagram.com/yourhandle"
                disabled={isSubmitted}
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={loading || isSubmitted}
                sx={{
                  mt: 1.5,
                  py: 1.3,
                  borderRadius: 3,
                  fontWeight: 700,
                  boxShadow: '0 4px 16px rgba(45, 106, 79, 0.3)',
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit Verification Request'}
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default ApplyOrganizer;
