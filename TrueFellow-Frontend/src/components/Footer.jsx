import React from 'react';
import { Box, Container, Grid, Typography, Link, Divider } from '@mui/material';

const Footer = () => {
  return (
    <Box sx={{ backgroundColor: 'secondary.main', color: '#ffffff', pt: 6, pb: 4, mt: 'auto' }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" fontWeight={800} color="primary.light" gutterBottom>
              TrueFellow
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, lineHeight: 1.8 }}>
              Pakistan's premier platform for choosing hand-picked guided tours, matching with compatible companions, and creating unforgettable memories. Inspired by the beauty of nature.
            </Typography>
          </Grid>
          
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Categories
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              <Link href="#" color="inherit" sx={{ opacity: 0.8, '&:hover': { color: 'primary.light' } }}>Hiking</Link>
              <Link href="#" color="inherit" sx={{ opacity: 0.8, '&:hover': { color: 'primary.light' } }}>Cultural</Link>
              <Link href="#" color="inherit" sx={{ opacity: 0.8, '&:hover': { color: 'primary.light' } }}>Adventure</Link>
              <Link href="#" color="inherit" sx={{ opacity: 0.8, '&:hover': { color: 'primary.light' } }}>Luxury</Link>
            </Box>
          </Grid>

          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Explore
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              <Link href="#" color="inherit" sx={{ opacity: 0.8, '&:hover': { color: 'primary.light' } }}>Active Tours</Link>
              <Link href="#" color="inherit" sx={{ opacity: 0.8, '&:hover': { color: 'primary.light' } }}>Destinations</Link>
              <Link href="#" color="inherit" sx={{ opacity: 0.8, '&:hover': { color: 'primary.light' } }}>How it works</Link>
              <Link href="#" color="inherit" sx={{ opacity: 0.8, '&:hover': { color: 'primary.light' } }}>Contact Support</Link>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Contact Us
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
              Email: support@truefellow.pk
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
              Phone: +92 (51) 111-222-333
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Address: F-7 Markaz, Islamabad, Pakistan
            </Typography>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />
        
        <Box display="flex" justifyContent="space-between" flexWrap="wrap" gap={2}>
          <Typography variant="body2" sx={{ opacity: 0.6 }}>
            &copy; {new Date().getFullYear()} TrueFellow. All rights reserved.
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.6 }}>
            Designed with ❤️ for Pakistan Tourism.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
