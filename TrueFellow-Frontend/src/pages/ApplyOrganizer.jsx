import React, { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { useNavigate } from 'react-router-dom';
import { APPLY_ORGANIZER_MUTATION } from '../graphql/operations';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
} from '@mui/material';

const ApplyOrganizer = () => {
  const navigate = useNavigate();
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
            socialMediaLinks: {
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

  return (
    <Box minHeight="80vh" py={8} bgcolor="#f7f9f6">
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 4, border: '1px solid #E2EBE5' }}>
          <Typography variant="h5" fontWeight={800} color="secondary" gutterBottom>
            Apply as Tour Organizer
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={4}>
            Submit your organization details to start listing tour guide packages. Our admin team will review and approve your profile.
          </Typography>

          {data?.applyForOrganizer && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Application submitted successfully! Current status: <strong>{data.applyForOrganizer.status}</strong>. We will notify you once reviewed.
            </Alert>
          )}

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error.message}</Alert>}

          <form onSubmit={handleSubmit}>
            <Box display="flex" flexDirection="column" gap={2.5}>
              <TextField
                fullWidth
                label="Organization / Business Name"
                required
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
              />
              <TextField
                fullWidth
                label="Contact Phone Number"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Short Organization Bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
              <TextField
                fullWidth
                label="Website (Optional)"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
              <TextField
                fullWidth
                label="Facebook Page URL (Optional)"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
              />
              <TextField
                fullWidth
                label="Instagram Handle URL (Optional)"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={loading || data?.applyForOrganizer}
                sx={{ mt: 1, py: 1.2 }}
              >
                {loading ? 'Submitting...' : 'Submit Verification Request'}
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default ApplyOrganizer;
