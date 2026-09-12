import React from 'react';
import { Box, Container, Grid, Typography, Divider, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import TerrainIcon from '@mui/icons-material/Terrain';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';

const Footer = () => {
  return (
    <Box sx={{ backgroundColor: '#081C15', color: '#ffffff', pt: 7, pb: 4, mt: 'auto', borderTop: '1px solid #1B382B' }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Brand & Mission */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 2 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2.5,
                  background: 'linear-gradient(135deg, #2D6A4F 0%, #1B4332 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}
              >
                <TerrainIcon sx={{ fontSize: 22 }} />
              </Box>
              <Typography variant="h5" fontWeight={800} letterSpacing="-0.02em" sx={{ display: 'flex', alignItems: 'center' }}>
                <Box component="span" sx={{ color: '#52B788' }}>True</Box>
                <Box component="span" sx={{ color: '#ffffff' }}>Fellow</Box>
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.82, lineHeight: 1.8, mb: 2.5, color: '#D8F3DC', maxWidth: 360 }}>
              Pakistan's premier platform for discovering hand-crafted guided tours, matching with compatible travel companions, and enjoying safe, verified trips across our majestic northern valleys.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.7)', bgcolor: 'rgba(255,255,255,0.06)', '&:hover': { color: '#52B788', bgcolor: 'rgba(255,255,255,0.12)' } }}>
                <FacebookIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.7)', bgcolor: 'rgba(255,255,255,0.06)', '&:hover': { color: '#52B788', bgcolor: 'rgba(255,255,255,0.12)' } }}>
                <InstagramIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.7)', bgcolor: 'rgba(255,255,255,0.06)', '&:hover': { color: '#52B788', bgcolor: 'rgba(255,255,255,0.12)' } }}>
                <TwitterIcon fontSize="small" />
              </IconButton>
            </Box>
          </Grid>

          {/* Top Categories */}
          <Grid size={{ xs: 6, sm: 4, md: 2.5 }}>
            <Typography variant="subtitle1" fontWeight={750} sx={{ color: '#ffffff !important', mb: 2 }}>
              Tour Categories
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {['HIKING', 'CULTURAL', 'ADVENTURE', 'FAMILY', 'PHOTOGRAPHY', 'LUXURY'].map((cat) => (
                <Box
                  key={cat}
                  component={Link}
                  to="/"
                  sx={{
                    display: 'block',
                    fontSize: '0.88rem',
                    color: 'rgba(255,255,255,0.75)',
                    textDecoration: 'none',
                    py: 0.2,
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease',
                    '&:hover': { color: '#52B788', transform: 'translateX(4px)' },
                  }}
                >
                  {cat.charAt(0) + cat.slice(1).toLowerCase()} Tours
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid size={{ xs: 6, sm: 4, md: 2.5 }}>
            <Typography variant="subtitle1" fontWeight={750} sx={{ color: '#ffffff !important', mb: 2 }}>
              Explore TrueFellow
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[
                { title: 'Explore Active Tours', path: '/' },
                { title: 'Tourist Dashboard', path: '/dashboard' },
                { title: 'Become an Organizer', path: '/apply-organizer' },
                { title: 'Sign In / Register', path: '/login' },
              ].map((item) => (
                <Box
                  key={item.title}
                  component={Link}
                  to={item.path}
                  sx={{
                    display: 'block',
                    fontSize: '0.88rem',
                    color: 'rgba(255,255,255,0.75)',
                    textDecoration: 'none',
                    py: 0.2,
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease',
                    '&:hover': { color: '#52B788', transform: 'translateX(4px)' },
                  }}
                >
                  {item.title}
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Contact Details */}
          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            <Typography variant="subtitle1" fontWeight={750} sx={{ color: '#ffffff !important', mb: 2 }}>
              Contact & Support
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                <EmailIcon sx={{ fontSize: 18, color: '#52B788' }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                  support@truefellow.pk
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                <PhoneIcon sx={{ fontSize: 18, color: '#52B788' }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                  +92 (51) 280-5555
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2 }}>
                <LocationOnIcon sx={{ fontSize: 18, color: '#52B788', mt: 0.3 }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                  Beverly Centre, Blue Area, Islamabad, Pakistan
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4.5, borderColor: 'rgba(255,255,255,0.1)' }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
            &copy; {new Date().getFullYear()} TrueFellow Technologies Ltd. All rights reserved.
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
            Designed with ❤️ for Pakistan Tourism & Adventure Travel.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
