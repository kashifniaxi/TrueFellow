import React, { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import { TOURS_QUERY } from '../graphql/operations';
import TourCard from '../components/TourCard';
import { FALLBACK_TOURS } from '../utils/sampleTours';
import {
  Box,
  Typography,
  Container,
  Grid,
  TextField,
  MenuItem,
  Button,
  Paper,
  Chip,
  Pagination,
  InputAdornment,
  Skeleton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import PlaceIcon from '@mui/icons-material/Place';
import CategoryIcon from '@mui/icons-material/Category';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import SparklesIcon from '@mui/icons-material/AutoAwesome';

const CATEGORIES = [
  'ADVENTURE', 'CULTURAL', 'HIKING', 'FAMILY', 'LUXURY', 'WILDLIFE', 'BEACH', 'RELIGIOUS', 'PHOTOGRAPHY', 'OTHER'
];

const POPULAR_DESTINATIONS = [
  { name: 'Hunza', title: 'Hunza Valley', image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80', desc: 'Snow peaks & ancient forts' },
  { name: 'Skardu', title: 'Skardu & Deosai', image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80', desc: 'Land of giants & blue lakes' },
  { name: 'Swat', title: 'Swat & Kalam', image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80', desc: 'Switzerland of the East' },
  { name: 'Fairy Meadows', title: 'Fairy Meadows', image: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=800&q=80', desc: 'Gateway to Nanga Parbat' },
];

const Home = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    departureCity: '',
    destinationCity: '',
    minPrice: '',
    maxPrice: '',
  });

  const [activeFilters, setActiveFilters] = useState({});

  const { data, loading, error } = useQuery(TOURS_QUERY, {
    variables: {
      filters: {
        ...activeFilters,
        page,
        limit: 9,
      },
    },
    fetchPolicy: 'cache-and-network',
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryClick = useCallback((cat) => {
    const newCategory = filters.category === cat ? '' : cat;
    setFilters((prev) => ({ ...prev, category: newCategory }));
    setPage(1);
    setActiveFilters((prev) => {
      const copy = { ...prev };
      if (newCategory) copy.category = newCategory;
      else delete copy.category;
      return copy;
    });
  }, [filters.category]);

  const handleQuickDestinationSelect = (destName) => {
    setFilters((prev) => ({ ...prev, destinationCity: destName }));
    setPage(1);
    setActiveFilters((prev) => ({ ...prev, destinationCity: destName }));
    const listingsEl = document.getElementById('tours-listings');
    if (listingsEl) {
      listingsEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    const cleanFilters = {};
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== '') {
        if (key === 'minPrice' || key === 'maxPrice') {
          const num = parseFloat(filters[key]);
          if (!isNaN(num)) cleanFilters[key] = num;
        } else {
          cleanFilters[key] = filters[key];
        }
      }
    });
    setActiveFilters(cleanFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      category: '',
      departureCity: '',
      destinationCity: '',
      minPrice: '',
      maxPrice: '',
    });
    setPage(1);
    setActiveFilters({});
  };

  const handlePageChange = (_, newPage) => {
    setPage(newPage);
    const listingsEl = document.getElementById('tours-listings');
    if (listingsEl) {
      listingsEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toursToDisplay = useMemo(() => {
    if (Array.isArray(data?.tours?.tours) && data.tours.tours.length > 0) {
      return data.tours.tours;
    }
    return FALLBACK_TOURS.filter((t) => {
      if (activeFilters.category && t.category !== activeFilters.category) return false;
      if (activeFilters.departureCity && !t.departureCity.toLowerCase().includes(activeFilters.departureCity.toLowerCase())) return false;
      if (activeFilters.destinationCity && !t.destinationCity.toLowerCase().includes(activeFilters.destinationCity.toLowerCase())) return false;
      if (activeFilters.maxPrice && t.price > activeFilters.maxPrice) return false;
      if (activeFilters.search) {
        const q = activeFilters.search.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesCity = t.destinationCity.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCity) return false;
      }
      return true;
    });
  }, [data?.tours?.tours, activeFilters]);

  const totalCount = data?.tours?.total || toursToDisplay.length;
  const totalPages = data?.tours?.totalPages || Math.ceil(toursToDisplay.length / 9) || 1;

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          background: 'linear-gradient(rgba(8, 28, 21, 0.72), rgba(8, 28, 21, 0.65)), url("https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=85")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          pt: { xs: 8, md: 13 },
          pb: { xs: 8, md: 14 },
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          {/* Trust Pill */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              px: 2.2,
              py: 0.7,
              mb: 3,
              borderRadius: 4,
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            }}
          >
            <SparklesIcon sx={{ fontSize: 16, color: '#52B788' }} />
            <Typography variant="caption" fontWeight={700} sx={{ letterSpacing: '0.04em', color: '#E8F5E9' }}>
              PAKISTAN'S PREMIER GUIDED TOURS & COMPANION MATCHING
            </Typography>
          </Box>

          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              color: 'white',
              fontSize: { xs: '2.4rem', sm: '3.2rem', md: '4rem' },
              mb: 2.5,
              lineHeight: 1.2,
              textShadow: '0 2px 14px rgba(0,0,0,0.3)',
            }}
          >
            Find Your Next <Box component="span" sx={{ color: '#52B788' }}>Adventure</Box> In Pakistan
          </Typography>

          <Typography
            variant="h6"
            sx={{
              mb: 5,
              fontWeight: 400,
              color: 'rgba(255, 255, 255, 0.92)',
              maxWidth: 680,
              mx: 'auto',
              lineHeight: 1.6,
              fontSize: { xs: '1rem', md: '1.15rem' },
            }}
          >
            Discover hand-crafted guided tour packages, connect with compatible travelers, and explore breathtaking northern valleys with certified local guides.
          </Typography>

          {/* Search Card Container */}
          <Paper
            component="form"
            onSubmit={handleSearchSubmit}
            elevation={6}
            sx={{
              p: { xs: 2.5, sm: 3 },
              borderRadius: 4,
              backgroundColor: 'rgba(255, 255, 255, 0.97)',
              backdropFilter: 'blur(16px)',
              boxShadow: '0px 14px 40px rgba(8, 28, 21, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
            }}
          >
            <Grid container spacing={1.5} sx={{ alignItems: 'center' }}>
              {/* Search text input */}
              <Grid size={{ xs: 12, sm: 6, md: 3.2 }}>
                <TextField
                  fullWidth
                  name="search"
                  placeholder="Where to? (e.g. Hunza, Skardu)"
                  size="small"
                  value={filters.search}
                  onChange={handleFilterChange}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid>

              {/* Category dropdown */}
              <Grid size={{ xs: 6, sm: 3, md: 2 }}>
                <TextField
                  fullWidth
                  select
                  name="category"
                  size="small"
                  value={filters.category}
                  onChange={handleFilterChange}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <CategoryIcon sx={{ color: 'primary.main', fontSize: 18 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {CATEGORIES.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Departure city */}
              <Grid size={{ xs: 6, sm: 3, md: 1.8 }}>
                <TextField
                  fullWidth
                  name="departureCity"
                  placeholder="Departure"
                  size="small"
                  value={filters.departureCity}
                  onChange={handleFilterChange}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationCityIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid>

              {/* Destination city */}
              <Grid size={{ xs: 6, sm: 3, md: 1.8 }}>
                <TextField
                  fullWidth
                  name="destinationCity"
                  placeholder="Destination"
                  size="small"
                  value={filters.destinationCity}
                  onChange={handleFilterChange}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <PlaceIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid>

              {/* Max budget */}
              <Grid size={{ xs: 6, sm: 3, md: 1.6 }}>
                <TextField
                  fullWidth
                  type="number"
                  name="maxPrice"
                  placeholder="Max PKR"
                  size="small"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                />
              </Grid>

              {/* Submit search button */}
              <Grid size={{ xs: 12, sm: 6, md: 1.6 }}>
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{
                    py: 1.1,
                    borderRadius: 3,
                    fontWeight: 700,
                    boxShadow: '0 4px 14px rgba(45, 106, 79, 0.35)',
                  }}
                >
                  Search
                </Button>
              </Grid>
            </Grid>

            {/* Quick Category Filter Pills */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2.5, justifyContent: 'center' }}>
              {CATEGORIES.map((cat) => {
                const isSelected = filters.category === cat;
                return (
                  <Chip
                    key={cat}
                    label={cat}
                    clickable
                    size="small"
                    color={isSelected ? 'primary' : 'default'}
                    variant={isSelected ? 'filled' : 'outlined'}
                    onClick={() => handleCategoryClick(cat)}
                    sx={{
                      fontWeight: 650,
                      fontSize: '0.74rem',
                      borderColor: isSelected ? 'transparent' : '#D7E3DA',
                      backgroundColor: isSelected ? 'primary.main' : 'rgba(240, 244, 241, 0.6)',
                      '&:hover': {
                        backgroundColor: isSelected ? 'primary.dark' : 'rgba(45, 106, 79, 0.08)',
                      },
                    }}
                  />
                );
              })}
            </Box>
          </Paper>
        </Container>
      </Box>

      {/* Featured Destinations Showcase */}
      <Box sx={{ py: 6, bgcolor: '#ffffff', borderBottom: '1px solid #E4EDE6' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
            <Box>
              <Typography variant="h5" fontWeight={800} color="#081C15">
                Top Pakistan Destinations
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Explore hand-crafted itineraries in Pakistan's most picturesque regions
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={2.5}>
            {POPULAR_DESTINATIONS.map((dest) => (
              <Grid size={{ xs: 6, md: 3 }} key={dest.name}>
                <Paper
                  onClick={() => handleQuickDestinationSelect(dest.name)}
                  sx={{
                    position: 'relative',
                    height: 160,
                    borderRadius: 3,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(8, 28, 21, 0.08)',
                    border: '1px solid #E4EDE6',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 28px rgba(8, 28, 21, 0.15)',
                      '& img': { transform: 'scale(1.08)' },
                    },
                  }}
                >
                  <img
                    src={dest.image}
                    alt={dest.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.4s ease',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(8, 28, 21, 0.85) 0%, rgba(8, 28, 21, 0.2) 60%, transparent 100%)',
                      p: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      color: 'white',
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={750} color="white">
                      {dest.title}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.85 }}>
                      {dest.desc}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Main Content: Tours Listings */}
      <Container id="tours-listings" maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={800} color="#081C15" gutterBottom>
              Available Tour Packages
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {totalCount > 0 ? `Showing ${totalCount} verified guided tour packages across Pakistan.` : 'Browse our active itineraries curated by certified operators.'}
            </Typography>
          </Box>

          {Object.keys(activeFilters).length > 0 && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<FilterAltOffIcon />}
              onClick={handleClearFilters}
              sx={{ borderRadius: 3, fontWeight: 650 }}
            >
              Clear Filters
            </Button>
          )}
        </Box>

        {loading && !data ? (
          /* Card Skeletons Fallback */
          <Grid container spacing={3.5}>
            {[1, 2, 3, 4, 5, 6].map((k) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={k}>
                <Paper sx={{ p: 2, borderRadius: 4, height: 380, border: '1px solid #E4EDE6' }}>
                  <Skeleton variant="rectangular" height={190} sx={{ borderRadius: 3, mb: 2 }} />
                  <Skeleton variant="text" width="40%" height={24} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="90%" height={28} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="60%" height={20} sx={{ mb: 3 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Skeleton variant="rounded" width={80} height={24} />
                    <Skeleton variant="rounded" width={90} height={32} />
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : toursToDisplay.length > 0 ? (
          <>
            <Grid container spacing={3.5}>
              {toursToDisplay.map((t) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={t.id}>
                  <TourCard tour={t} />
                </Grid>
              ))}
            </Grid>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 7 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                  shape="rounded"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      fontWeight: 650,
                      borderRadius: 2,
                    },
                  }}
                />
              </Box>
            )}
          </>
        ) : error ? (
          <Box sx={{ py: 6, textAlign: 'center', bgcolor: '#FCEBEB', borderRadius: 4, border: '1px solid #F8D7DA' }}>
            <Typography color="error" fontWeight={650} mb={1}>
              Unable to load tour packages
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              {error.message}
            </Typography>
            <Button variant="outlined" color="error" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </Box>
        ) : (
          <Box
            sx={{
              textAlign: 'center',
              py: 9,
              px: 3,
              bgcolor: '#ffffff',
              borderRadius: 4,
              border: '1px solid #E4EDE6',
              boxShadow: '0 4px 20px rgba(8, 28, 21, 0.04)',
            }}
          >
            <TravelExploreIcon sx={{ fontSize: 64, color: 'primary.light', mb: 2, opacity: 0.6 }} />
            <Typography variant="h5" fontWeight={750} gutterBottom color="#081C15">
              No tours match your filter criteria
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 440, mx: 'auto', mb: 3 }}>
              We couldn't find any trips matching your exact search. Try clearing city filters or exploring a different category.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleClearFilters}
              sx={{ borderRadius: 3, px: 3 }}
            >
              Reset All Filters
            </Button>
          </Box>
        )}
      </Container>

      {/* Value Proposition Highlights */}
      <Box sx={{ bgcolor: '#ffffff', py: 9, borderTop: '1px solid #E4EDE6' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Chip
              label="WHY CHOOSE TRUEFELLOW"
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 700, fontSize: '0.72rem', mb: 1.5 }}
            />
            <Typography variant="h4" fontWeight={800} color="#081C15">
              Elevating Tourism In Pakistan
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', mt: 1 }}>
              A modern digital ecosystem connecting enthusiastic travelers with verified organizers and like-minded companions.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 4,
                  border: '1px solid #E4EDE6',
                  height: '100%',
                  bgcolor: '#F8FAF7',
                  transition: 'transform 0.25s ease',
                  '&:hover': { transform: 'translateY(-4px)' },
                }}
              >
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: 3,
                    bgcolor: 'rgba(45, 106, 79, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'primary.main',
                    mb: 2.5,
                    fontSize: 26,
                  }}
                >
                  🗺️
                </Box>
                <Typography variant="caption" fontWeight={750} color="primary.main">
                  STEP 01
                </Typography>
                <Typography variant="h6" fontWeight={750} mt={0.5} mb={1} color="#081C15">
                  Curated Itineraries
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  Detailed day-by-day itineraries, transparent inclusions and exclusions, high-resolution photo galleries, and clear pricing in PKR.
                </Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 4,
                  border: '1px solid #E4EDE6',
                  height: '100%',
                  bgcolor: '#F8FAF7',
                  transition: 'transform 0.25s ease',
                  '&:hover': { transform: 'translateY(-4px)' },
                }}
              >
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: 3,
                    bgcolor: 'rgba(45, 106, 79, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'primary.main',
                    mb: 2.5,
                    fontSize: 26,
                  }}
                >
                  🤝
                </Box>
                <Typography variant="caption" fontWeight={750} color="primary.main">
                  STEP 02
                </Typography>
                <Typography variant="h6" fontWeight={750} mt={0.5} mb={1} color="#081C15">
                  Companion Matching
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  Opt-in to intelligent traveler matching based on shared languages, travel styles, and interests. Chat securely before your departure.
                </Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 4,
                  border: '1px solid #E4EDE6',
                  height: '100%',
                  bgcolor: '#F8FAF7',
                  transition: 'transform 0.25s ease',
                  '&:hover': { transform: 'translateY(-4px)' },
                }}
              >
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: 3,
                    bgcolor: 'rgba(45, 106, 79, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'primary.main',
                    mb: 2.5,
                    fontSize: 26,
                  }}
                >
                  🛡️
                </Box>
                <Typography variant="caption" fontWeight={750} color="primary.main">
                  STEP 03
                </Typography>
                <Typography variant="h6" fontWeight={750} mt={0.5} mb={1} color="#081C15">
                  Verified Local Guides
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  Every tour organizer is reviewed and approved by our team. Post-trip reviews ensure service quality and customer safety across all trips.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
