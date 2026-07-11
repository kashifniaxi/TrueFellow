import React, { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { TOURS_QUERY } from '../graphql/operations';
import TourCard from '../components/TourCard';
import {
  Box,
  Typography,
  Container,
  Grid,
  TextField,
  MenuItem,
  Button,
  Paper,
  CircularProgress,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const CATEGORIES = [
  'ADVENTURE', 'CULTURAL', 'HIKING', 'FAMILY', 'LUXURY', 'WILDLIFE', 'BEACH', 'RELIGIOUS', 'PHOTOGRAPHY', 'OTHER'
];

const Home = () => {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    departureCity: '',
    destinationCity: '',
  });

  const [activeFilters, setActiveFilters] = useState({});

  const { data, loading, error } = useQuery(TOURS_QUERY, {
    variables: { filters: { ...activeFilters, limit: 12 } },
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const cleanFilters = {};
    Object.keys(filters).forEach((key) => {
      if (filters[key]) cleanFilters[key] = filters[key];
    });
    setActiveFilters(cleanFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      category: '',
      departureCity: '',
      destinationCity: '',
    });
    setActiveFilters({});
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(rgba(11, 37, 24, 0.6), rgba(11, 37, 24, 0.45)), url("https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1920&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          py: { xs: 10, md: 16 },
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              color: 'white',
              fontSize: { xs: '2.5rem', md: '4rem' },
              mb: 2,
              lineHeight: 1.2,
            }}
          >
            Find Your Next <span style={{ color: '#6E9C5B' }}>Adventure</span> In Pakistan
          </Typography>
          <Typography variant="h6" sx={{ mb: 6, fontWeight: 400, opacity: 0.9 }}>
            Join guided tours, meet verified companions, and experience local culture first-hand.
          </Typography>

          {/* Search Tab / Card */}
          <Paper
            component="form"
            onSubmit={handleSearchSubmit}
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 4,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.12)',
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  name="search"
                  label="Search tours..."
                  size="small"
                  value={filters.search}
                  onChange={handleFilterChange}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  select
                  name="category"
                  label="Category"
                  size="small"
                  value={filters.category}
                  onChange={handleFilterChange}
                >
                  <MenuItem value="">Any Category</MenuItem>
                  {CATEGORIES.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  fullWidth
                  name="departureCity"
                  label="Departure City"
                  size="small"
                  value={filters.departureCity}
                  onChange={handleFilterChange}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  fullWidth
                  name="destinationCity"
                  label="Destination City"
                  size="small"
                  value={filters.destinationCity}
                  onChange={handleFilterChange}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<SearchIcon />}
                  sx={{ py: 1, borderRadius: 2 }}
                >
                  Search
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </Box>

      {/* Main Content Listings */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              Popular Tours
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Handpicked experiences curated by verified local guides.
            </Typography>
          </Box>
          {Object.keys(activeFilters).length > 0 && (
            <Button variant="outlined" color="primary" onClick={handleClearFilters} sx={{ borderRadius: 2 }}>
              Clear Search
            </Button>
          )}
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" py={10}>
            <CircularProgress color="primary" />
          </Box>
        ) : error ? (
          <Typography color="error" textAlign="center" py={4}>
            Error loading tours: {error.message}
          </Typography>
        ) : data?.tours?.tours?.length > 0 ? (
          <Grid container spacing={4}>
            {data.tours.tours.map((t) => (
              <Grid item key={t.id} xs={12} sm={6} md={4}>
                <TourCard tour={t} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box textAlign="center" py={8}>
            <Typography variant="h6" color="text.secondary">
              No tours match your search.
            </Typography>
          </Box>
        )}
      </Container>

      {/* Why Choose Us */}
      <Box bgcolor="#ffffff" py={8} borderTop="1px solid #E2EBE5" borderBottom="1px solid #E2EBE5">
        <Container maxWidth="lg">
          <Typography variant="h4" fontWeight={800} textAlign="center" mb={6}>
            How TrueFellow Works
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4} textAlign="center">
              <Box mb={2} color="primary.main" fontSize={48}>🗺️</Box>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Curated itineraries
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Select from our top-tier tours organized by local experts who know the best hidden gems.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} textAlign="center">
              <Box mb={2} color="primary.main" fontSize={48}>🤝</Box>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Companion Matching
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Opt-in to meet travelers with matching styles, languages, and budgets booked on the same trip.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} textAlign="center">
              <Box mb={2} color="primary.main" fontSize={48}>🛡️</Box>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Verified Guides
              </Typography>
              <Typography variant="body2" color="text.secondary">
                We manually verify all tour organizer applications, credentials, and track member reviews.
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
