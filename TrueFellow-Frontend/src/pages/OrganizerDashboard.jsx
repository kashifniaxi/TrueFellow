import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { useSearchParams } from 'react-router-dom';
import {
  ORGANIZER_DASHBOARD_QUERY,
  MY_ORGANIZER_STATS_QUERY,
  MY_TOURS_QUERY,
  CREATE_TOUR_MUTATION,
  UPDATE_TOUR_MUTATION,
  CANCEL_TOUR_MUTATION,
  BOOKINGS_BY_TOUR_QUERY,
  COMPLETE_BOOKING_MUTATION,
} from '../graphql/operations';
import ImageUpload from '../components/ImageUpload';
import MessagesInbox from '../components/MessagesInbox';
import { getImageUrl, DEFAULT_TOUR_COVER } from '../utils/imageUrl';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Chip,
  Snackbar,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import InsightsIcon from '@mui/icons-material/Insights';
import TourIcon from '@mui/icons-material/Tour';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import ChatIcon from '@mui/icons-material/Chat';
import StarIcon from '@mui/icons-material/Star';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const CATEGORIES = [
  'ADVENTURE', 'CULTURAL', 'HIKING', 'FAMILY', 'LUXURY', 'WILDLIFE', 'BEACH', 'RELIGIOUS', 'PHOTOGRAPHY', 'OTHER'
];

const OrganizerDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(0);

  const tabParam = searchParams.get('tab');

  useEffect(() => {
    if (tabParam === 'messages') setActiveTab(3);
    else if (tabParam === 'bookings') setActiveTab(2);
    else if (tabParam === 'tours') setActiveTab(1);
    else if (tabParam === 'analytics') setActiveTab(0);
  }, [tabParam]);

  const handleTabChange = (_, val) => {
    setActiveTab(val);
    const tabMap = ['analytics', 'tours', 'bookings', 'messages'];
    setSearchParams({ tab: tabMap[val] });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Top Banner */}
      <Box
        sx={{
          p: 3.5,
          borderRadius: 4,
          background: 'linear-gradient(135deg, rgba(45, 106, 79, 0.08) 0%, rgba(27, 67, 50, 0.04) 100%)',
          border: '1px solid #E4EDE6',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          mb: 4,
        }}
      >
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #2D6A4F 0%, #1B4332 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 4px 14px rgba(45, 106, 79, 0.3)',
            }}
          >
            <StorefrontIcon sx={{ fontSize: 32 }} />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <Typography variant="h4" fontWeight={800} color="#081C15">
                Tour Organizer Portal
              </Typography>
              <Chip
                label="VERIFIED ORGANIZER"
                size="small"
                color="primary"
                sx={{ height: 22, fontWeight: 700, fontSize: '0.68rem' }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
              Publish trips, manage reservations, track revenue, and communicate with tourists.
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid #E4EDE6', boxShadow: '0 4px 24px rgba(8, 28, 21, 0.05)' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: '1px solid #E4EDE6', px: 2, pt: 1, bgcolor: '#FFFFFF' }}
        >
          <Tab icon={<InsightsIcon />} iconPosition="start" label="Performance & Analytics" />
          <Tab icon={<TourIcon />} iconPosition="start" label="My Tours" />
          <Tab icon={<AssignmentTurnedInIcon />} iconPosition="start" label="Tour Bookings" />
          <Tab icon={<ChatIcon />} iconPosition="start" label="Messages" />
        </Tabs>

        <Box p={{ xs: 2.5, md: 4 }} bgcolor="#F8FAF7" minHeight="55vh">
          {activeTab === 0 && <AnalyticsTab />}
          {activeTab === 1 && <MyToursTab />}
          {activeTab === 2 && <BookingsTab />}
          {activeTab === 3 && <MessagesInbox />}
        </Box>
      </Paper>
    </Container>
  );
};

// ─── TABS ────────────────────────────────────────────────────────────────────

// 1. Analytics Tab
const AnalyticsTab = () => {
  const { data: dashboardData, loading: dashLoading } = useQuery(ORGANIZER_DASHBOARD_QUERY, { fetchPolicy: 'cache-and-network' });
  const { data: statsData } = useQuery(MY_ORGANIZER_STATS_QUERY, { fetchPolicy: 'cache-and-network' });

  if (dashLoading && !dashboardData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  const db = dashboardData?.organizerDashboard || {};
  const stats = statsData?.myOrganizerStats || {};

  const chartData = stats.monthlyBookings?.map((b) => ({
    name: `${b.month}/${b.year.toString().slice(-2)}`,
    Bookings: b.count,
  })) || [];

  return (
    <Box>
      <Box mb={3.5}>
        <Typography variant="h5" fontWeight={750} color="#081C15">
          Overview & Performance Metrics
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Monitor your customer bookings, active tour listings, and traveler feedback.
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4.5 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3.5,
              border: '1px solid #E4EDE6',
              bgcolor: '#FFFFFF',
              boxShadow: '0 2px 12px rgba(8, 28, 21, 0.04)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                ACTIVE TOURS
              </Typography>
              <TourIcon color="primary" sx={{ fontSize: 22 }} />
            </Box>
            <Typography variant="h3" fontWeight={800} mt={1} color="#081C15">
              {db.activeToursCount || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Published packages visible to tourists
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3.5,
              border: '1px solid #E4EDE6',
              bgcolor: '#FFFFFF',
              boxShadow: '0 2px 12px rgba(8, 28, 21, 0.04)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                TOTAL BOOKINGS
              </Typography>
              <ConfirmationNumberIcon color="primary" sx={{ fontSize: 22 }} />
            </Box>
            <Typography variant="h3" fontWeight={800} mt={1} color="#081C15">
              {db.totalBookingsCount || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Confirmed traveler reservations placed
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3.5,
              border: '1px solid #E4EDE6',
              bgcolor: '#FFFFFF',
              boxShadow: '0 2px 12px rgba(8, 28, 21, 0.04)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                AVERAGE RATING
              </Typography>
              <StarIcon sx={{ fontSize: 22, color: '#F39C12' }} />
            </Box>
            <Typography variant="h3" fontWeight={800} mt={1} color="#081C15">
              {db.averageRating ? db.averageRating.toFixed(1) : '0.0'} <Typography component="span" variant="h6" color="text.secondary">/ 5.0</Typography>
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Based on completed trip reviews
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Chart */}
      {chartData.length > 0 && (
        <Paper sx={{ p: 3.5, borderRadius: 3.5, border: '1px solid #E4EDE6', bgcolor: '#FFFFFF', mb: 4.5 }}>
          <Typography variant="h6" fontWeight={750} color="#081C15" mb={3}>
            Monthly Bookings Volume
          </Typography>
          <Box height={280}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4EDE6" />
                <XAxis dataKey="name" stroke="#496053" fontSize={12} />
                <YAxis stroke="#496053" fontSize={12} allowDecimals={false} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#081C15',
                    borderRadius: 8,
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '0.85rem',
                  }}
                />
                <Bar dataKey="Bookings" fill="#2D6A4F" radius={[6, 6, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      )}

      {/* Recent Bookings */}
      <Box>
        <Typography variant="h6" fontWeight={750} color="#081C15" mb={2}>
          Recent Traveler Bookings
        </Typography>
        <Paper variant="outlined" sx={{ borderRadius: 3.5, border: '1px solid #E4EDE6', bgcolor: '#FFFFFF' }}>
          <List sx={{ py: 0 }}>
            {db.recentBookings?.length > 0 ? (
              db.recentBookings.map((b) => (
                <ListItem key={b.id} sx={{ borderBottom: '1px solid #F0F4F1', py: 1.8, px: 3 }}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2" fontWeight={750} color="#081C15">
                          {b.tourist?.name || 'Traveler'}
                        </Typography>
                        <Chip
                          label={b.status}
                          size="small"
                          color={b.status === 'CONFIRMED' ? 'success' : 'default'}
                          sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700 }}
                        />
                      </Box>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        Tour: <strong>{b.tour?.title}</strong> &bull; Booked on {b.bookedAt ? new Date(b.bookedAt).toLocaleDateString() : 'Recent'}
                      </Typography>
                    }
                  />
                </ListItem>
              ))
            ) : (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No customer bookings recorded yet.
                </Typography>
              </Box>
            )}
          </List>
        </Paper>
      </Box>
    </Box>
  );
};

// 2. My Tours Tab (List & Form)
const MyToursTab = () => {
  const { data, loading, refetch } = useQuery(MY_TOURS_QUERY, {
    variables: { page: 1, limit: 15 },
    fetchPolicy: 'cache-and-network',
  });
  const [cancelTour] = useMutation(CANCEL_TOUR_MUTATION);
  const [createTour] = useMutation(CREATE_TOUR_MUTATION);
  const [updateTour] = useMutation(UPDATE_TOUR_MUTATION);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [capacity, setCapacity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [departureCity, setDepartureCity] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('ADVENTURE');
  const [meetingPoint, setMeetingPoint] = useState('');
  const [cancellationPolicy, setCancellationPolicy] = useState('');
  const [images, setImages] = useState([]);

  const [itinerary, setItinerary] = useState(['']);
  const [includedServices, setIncludedServices] = useState(['']);
  const [excludedServices, setExcludedServices] = useState(['']);
  const [faqs, setFaqs] = useState([{ question: '', answer: '' }]);

  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });
  const [cancelId, setCancelId] = useState(null);

  const tours = data?.myTours?.tours || [];

  const handleOpenForm = (tour = null) => {
    if (tour) {
      setEditingId(tour.id);
      setTitle(tour.title || '');
      setPrice(tour.price !== undefined ? tour.price : '');
      setDuration(tour.duration !== undefined ? tour.duration : '');
      setCapacity(tour.capacity !== undefined ? tour.capacity : '');
      setStartDate(tour.startDate ? tour.startDate.slice(0, 10) : '');
      setEndDate(tour.endDate ? tour.endDate.slice(0, 10) : '');
      setDestinationCity(tour.destinationCity || '');
      setImages(tour.images || []);
      setDescription(tour.description || '');
      setDepartureCity(tour.departureCity || '');
      setLocation(tour.location || '');
      setCategory(tour.category || 'ADVENTURE');
      setMeetingPoint(tour.meetingPoint || '');
      setCancellationPolicy(tour.cancellationPolicy || '');
      setItinerary(tour.itinerary?.length ? tour.itinerary : ['']);
      setIncludedServices(tour.includedServices?.length ? tour.includedServices : ['']);
      setExcludedServices(tour.excludedServices?.length ? tour.excludedServices : ['']);
      setFaqs(tour.faqs?.length ? tour.faqs.map((f) => ({ question: f.question || '', answer: f.answer || '' })) : [{ question: '', answer: '' }]);
    } else {
      setEditingId(null);
      setTitle('');
      setDescription('');
      setPrice('');
      setDuration('');
      setCapacity('');
      setStartDate('');
      setEndDate('');
      setDepartureCity('');
      setDestinationCity('');
      setLocation('');
      setCategory('ADVENTURE');
      setMeetingPoint('');
      setCancellationPolicy('');
      setImages([]);
      setItinerary(['']);
      setIncludedServices(['']);
      setExcludedServices(['']);
      setFaqs([{ question: '', answer: '' }]);
    }
    setFormOpen(true);
  };

  const handleCloseForm = () => setFormOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const parsedPrice = parseFloat(price);
    const parsedDuration = parseInt(duration, 10);
    const parsedCapacity = parseInt(capacity, 10);

    if (isNaN(parsedPrice) || isNaN(parsedDuration) || isNaN(parsedCapacity)) {
      setToast({ open: true, message: 'Please provide valid numbers for price, duration, and capacity.', severity: 'error' });
      return;
    }

    if (!startDate || !endDate) {
      setToast({ open: true, message: 'Please provide both start date and end date.', severity: 'error' });
      return;
    }

    const startD = new Date(startDate);
    const endD = new Date(endDate);
    if (isNaN(startD.getTime()) || isNaN(endD.getTime())) {
      setToast({ open: true, message: 'Invalid start date or end date format.', severity: 'error' });
      return;
    }

    if (endD < startD) {
      setToast({ open: true, message: 'End date cannot be earlier than start date.', severity: 'error' });
      return;
    }

    const tourInput = {
      title,
      description,
      price: parsedPrice,
      duration: parsedDuration,
      capacity: parsedCapacity,
      startDate: startD.toISOString(),
      endDate: endD.toISOString(),
      departureCity,
      destinationCity,
      location,
      category,
      meetingPoint,
      cancellationPolicy,
      images,
      itinerary: itinerary.filter(Boolean),
      includedServices: includedServices.filter(Boolean),
      excludedServices: excludedServices.filter(Boolean),
      faqs: faqs.filter((f) => f.question && f.answer),
    };

    try {
      if (editingId) {
        await updateTour({ variables: { id: editingId, input: tourInput } });
        setToast({ open: true, message: 'Tour itinerary updated successfully!', severity: 'success' });
      } else {
        await createTour({ variables: { input: tourInput } });
        setToast({ open: true, message: 'New tour published successfully!', severity: 'success' });
      }
      refetch();
      handleCloseForm();
    } catch (err) {
      setToast({ open: true, message: err.message, severity: 'error' });
    }
  };

  const handleConfirmCancelTour = async () => {
    if (!cancelId) return;
    try {
      await cancelTour({ variables: { id: cancelId } });
      setToast({ open: true, message: 'Tour status updated to Cancelled.', severity: 'warning' });
      refetch();
    } catch (err) {
      setToast({ open: true, message: err.message, severity: 'error' });
    } finally {
      setCancelId(null);
    }
  };

  return (
    <Box>
      <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast({ ...toast, open: false })}>
        <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })}>
          {toast.message}
        </Alert>
      </Snackbar>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3.5, flexWrap: 'wrap', gap: 1.5 }}>
        <Box>
          <Typography variant="h5" fontWeight={750} color="#081C15">
            Your Tour Packages
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your active trip listings, view seat occupancy, and create new departures.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
          sx={{ borderRadius: 2.5, fontWeight: 700, px: 2.5 }}
        >
          Create New Tour
        </Button>
      </Box>

      {loading && tours.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : tours.length > 0 ? (
        <Grid container spacing={3}>
          {tours.map((tour) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={tour.id}>
              <Card sx={{ border: '1px solid #E4EDE6', borderRadius: 3.5, overflow: 'hidden' }}>
                <Box sx={{ height: 170, bgcolor: '#eef3ef' }}>
                  <img
                    src={getImageUrl(tour.images?.[0], DEFAULT_TOUR_COVER)}
                    alt={tour.title}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = DEFAULT_TOUR_COVER;
                    }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Box>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, p: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip label={tour.category} size="small" variant="outlined" color="primary" sx={{ height: 22, fontSize: '0.7rem', fontWeight: 650 }} />
                    <Chip
                      label={tour.status}
                      size="small"
                      color={tour.status === 'PUBLISHED' ? 'success' : tour.status === 'CANCELLED' ? 'error' : 'default'}
                      sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700 }}
                    />
                  </Box>

                  <Typography variant="subtitle1" fontWeight={750} color="#081C15" noWrap>
                    {tour.title}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    📍 {tour.departureCity} &rarr; {tour.destinationCity}
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    Capacity: <strong>{tour.bookingsCount} / {tour.capacity} seats booked</strong>
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    Starts: {tour.startDate ? new Date(tour.startDate).toLocaleDateString() : 'TBD'}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, mt: 1.5, pt: 1.5, borderTop: '1px solid #F0F4F1' }}>
                    <Button variant="outlined" size="small" onClick={() => handleOpenForm(tour)} sx={{ borderRadius: 2 }}>
                      Edit
                    </Button>
                    {tour.status !== 'CANCELLED' && (
                      <Button variant="outlined" color="error" size="small" onClick={() => setCancelId(tour.id)} sx={{ borderRadius: 2 }}>
                        Cancel Trip
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3.5, border: '1px solid #E4EDE6', bgcolor: '#FFFFFF' }}>
          <TourIcon sx={{ fontSize: 48, color: 'primary.light', opacity: 0.4, mb: 1.5 }} />
          <Typography variant="h6" fontWeight={750} color="#081C15" gutterBottom>
            No Tours Listed Yet
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2.5}>
            Publish your first guided tour package to start accepting tourist bookings!
          </Typography>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => handleOpenForm()} sx={{ borderRadius: 2.5 }}>
            Publish Tour
          </Button>
        </Paper>
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog open={Boolean(cancelId)} onClose={() => setCancelId(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 750 }}>Cancel Tour Confirmation</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to cancel this tour? Any tourists with confirmed bookings will be notified accordingly.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setCancelId(null)}>Keep Tour</Button>
          <Button onClick={handleConfirmCancelTour} color="error" variant="contained">
            Confirm Cancellation
          </Button>
        </DialogActions>
      </Dialog>

      {/* Tour Edit / Create Dialog */}
      <Dialog open={formOpen} onClose={handleCloseForm} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 800, color: '#081C15' }}>
          {editingId ? 'Edit Tour Package' : 'Create New Tour Package'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          <TextField fullWidth label="Tour Title" placeholder="e.g. 5-Day Autumn Colors in Hunza Valley" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <TextField fullWidth multiline rows={3} label="Description & Overview" placeholder="Describe the trip highlights, terrain, activities, and what makes this trip special..." value={description} onChange={(e) => setDescription(e.target.value)} required />

          <Grid container spacing={2}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField fullWidth type="number" label="Price per Seat (PKR)" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField fullWidth type="number" label="Duration (Days)" value={duration} onChange={(e) => setDuration(e.target.value)} required />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField fullWidth type="number" label="Total Capacity" value={capacity} onChange={(e) => setCapacity(e.target.value)} required />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField fullWidth select label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth type="date" InputLabelProps={{ shrink: true }} label="Departure Date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth type="date" InputLabelProps={{ shrink: true }} label="Return Date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth label="Departure City" placeholder="e.g. Islamabad, Lahore" value={departureCity} onChange={(e) => setDepartureCity(e.target.value)} required />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth label="Destination City" placeholder="e.g. Hunza, Skardu" value={destinationCity} onChange={(e) => setDestinationCity(e.target.value)} required />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth label="Location Map Reference" placeholder="e.g. Gilgit-Baltistan" value={location} onChange={(e) => setLocation(e.target.value)} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Pickup / Meeting Point" placeholder="e.g. I-8 Markaz, Islamabad at 6:00 AM" value={meetingPoint} onChange={(e) => setMeetingPoint(e.target.value)} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Cancellation Policy" placeholder="e.g. Full refund up to 7 days before departure" value={cancellationPolicy} onChange={(e) => setCancellationPolicy(e.target.value)} />
            </Grid>
          </Grid>

          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2" fontWeight={750} color="#081C15">Tour Photos</Typography>
          <ImageUpload multiple initialImages={images} onUploadSuccess={(urls) => setImages(urls)} />

          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2" fontWeight={750} color="#081C15">Day-by-Day Itinerary</Typography>
          {itinerary.map((step, idx) => (
            <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                fullWidth
                size="small"
                label={`Day ${idx + 1} Plan`}
                placeholder="e.g. Drive from Islamabad to Naran via Hazara Motorway..."
                value={step}
                onChange={(e) => {
                  const copy = [...itinerary];
                  copy[idx] = e.target.value;
                  setItinerary(copy);
                }}
              />
              <IconButton onClick={() => setItinerary(itinerary.filter((_, i) => i !== idx))} color="error" size="small">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
          <Button startIcon={<AddIcon />} size="small" onClick={() => setItinerary([...itinerary, ''])} sx={{ width: 'fit-content' }}>
            Add Another Day
          </Button>

          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2" fontWeight={750} color="#081C15">Included Services</Typography>
          {includedServices.map((service, idx) => (
            <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                fullWidth
                size="small"
                label={`Inclusion ${idx + 1}`}
                placeholder="e.g. 4x4 Coaster transport, 3-star hotel accommodations"
                value={service}
                onChange={(e) => {
                  const copy = [...includedServices];
                  copy[idx] = e.target.value;
                  setIncludedServices(copy);
                }}
              />
              <IconButton onClick={() => setIncludedServices(includedServices.filter((_, i) => i !== idx))} color="error" size="small">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
          <Button startIcon={<AddIcon />} size="small" onClick={() => setIncludedServices([...includedServices, ''])} sx={{ width: 'fit-content' }}>
            Add Included Service
          </Button>

          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2" fontWeight={750} color="#081C15">Excluded Services</Typography>
          {excludedServices.map((service, idx) => (
            <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                fullWidth
                size="small"
                label={`Exclusion ${idx + 1}`}
                placeholder="e.g. Personal medication, boating charges, tips"
                value={service}
                onChange={(e) => {
                  const copy = [...excludedServices];
                  copy[idx] = e.target.value;
                  setExcludedServices(copy);
                }}
              />
              <IconButton onClick={() => setExcludedServices(excludedServices.filter((_, i) => i !== idx))} color="error" size="small">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
          <Button startIcon={<AddIcon />} size="small" onClick={() => setExcludedServices([...excludedServices, ''])} sx={{ width: 'fit-content' }}>
            Add Excluded Service
          </Button>

          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2" fontWeight={750} color="#081C15">Frequently Asked Questions (FAQs)</Typography>
          {faqs.map((faq, idx) => (
            <Box key={idx} sx={{ display: 'flex', gap: 1.5, flexDirection: 'column', border: '1px solid #E4EDE6', p: 2, borderRadius: 2.5, bgcolor: '#FAFCF9' }}>
              <TextField
                fullWidth
                size="small"
                label="Question"
                placeholder="e.g. Is this trip suitable for children or elderly?"
                value={faq.question}
                onChange={(e) => {
                  const copy = [...faqs];
                  copy[idx].question = e.target.value;
                  setFaqs(copy);
                }}
              />
              <TextField
                fullWidth
                size="small"
                label="Answer"
                placeholder="e.g. Yes, all paved roads with moderate walking only..."
                value={faq.answer}
                onChange={(e) => {
                  const copy = [...faqs];
                  copy[idx].answer = e.target.value;
                  setFaqs(copy);
                }}
              />
              <Button size="small" color="error" onClick={() => setFaqs(faqs.filter((_, i) => i !== idx))} sx={{ width: 'fit-content' }}>
                Remove FAQ
              </Button>
            </Box>
          ))}
          <Button startIcon={<AddIcon />} size="small" onClick={() => setFaqs([...faqs, { question: '', answer: '' }])} sx={{ width: 'fit-content' }}>
            Add FAQ
          </Button>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseForm}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary" sx={{ px: 3, fontWeight: 700 }}>
            {editingId ? 'Save Changes' : 'Publish Tour'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// 3. Tour Bookings Tab
const BookingsTab = () => {
  const { data: toursData } = useQuery(MY_TOURS_QUERY, {
    variables: { page: 1, limit: 30 },
    fetchPolicy: 'cache-and-network',
  });
  const [selectedTourId, setSelectedTourId] = useState('');
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });

  const { data: bookingsData, refetch } = useQuery(BOOKINGS_BY_TOUR_QUERY, {
    variables: { tourId: selectedTourId },
    skip: !selectedTourId,
    fetchPolicy: 'network-only',
  });

  const [completeBooking] = useMutation(COMPLETE_BOOKING_MUTATION);

  const tours = toursData?.myTours?.tours || [];
  const bookings = bookingsData?.bookingsByTour?.bookings || [];
  const firstTourId = tours[0]?.id;

  // Default selection
  useEffect(() => {
    if (!selectedTourId && firstTourId) {
      setSelectedTourId(firstTourId);
    }
  }, [firstTourId, selectedTourId]);

  const handleComplete = async (bookingId) => {
    try {
      await completeBooking({ variables: { bookingId } });
      setToast({ open: true, message: 'Booking reservation marked as completed.', severity: 'success' });
      refetch();
    } catch (err) {
      setToast({ open: true, message: err.message, severity: 'error' });
    }
  };

  return (
    <Box>
      <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast({ ...toast, open: false })}>
        <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })}>
          {toast.message}
        </Alert>
      </Snackbar>

      <Box mb={3.5}>
        <Typography variant="h5" fontWeight={750} color="#081C15">
          Customer Bookings by Tour
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Inspect customer contact details, ticket status, and mark departures as completed.
        </Typography>
      </Box>

      {tours.length > 0 ? (
        <Box sx={{ mb: 4, maxWidth: 440 }}>
          <TextField
            fullWidth
            select
            size="small"
            label="Select Tour Package"
            value={selectedTourId}
            onChange={(e) => setSelectedTourId(e.target.value)}
          >
            {tours.map((t) => (
              <MenuItem key={t.id} value={t.id}>
                {t.title} ({t.bookingsCount} booked)
              </MenuItem>
            ))}
          </TextField>
        </Box>
      ) : (
        <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 3.5, border: '1px solid #E4EDE6', bgcolor: '#FFFFFF' }}>
          <Typography variant="subtitle1" fontWeight={750} color="#081C15">
            No Active Tours Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Publish a tour package to begin receiving bookings.
          </Typography>
        </Paper>
      )}

      {selectedTourId && (
        bookings.length > 0 ? (
          <Grid container spacing={2.5}>
            {bookings.map((b) => (
              <Grid size={{ xs: 12 }} key={b.id}>
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: 3.5,
                    border: '1px solid #E4EDE6',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 2,
                    boxShadow: '0 2px 10px rgba(8, 28, 21, 0.04)',
                    bgcolor: '#FFFFFF',
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1" fontWeight={750} color="#081C15">
                      {b.tourist.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Email: <strong>{b.tourist.email}</strong> &bull; Phone: <strong>{b.tourist.phone || 'N/A'}</strong>
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.3, display: 'block' }}>
                      Booked At: {new Date(b.bookedAt).toLocaleDateString()} &bull; Notes: {b.notes || 'None'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <Chip
                      label={b.status}
                      color={b.status === 'CONFIRMED' ? 'success' : 'primary'}
                      size="small"
                      sx={{ fontWeight: 700, borderRadius: 2 }}
                    />
                    {b.status === 'CONFIRMED' && (
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleComplete(b.id)}
                        sx={{ borderRadius: 2, fontWeight: 700 }}
                      >
                        Mark Completed
                      </Button>
                    )}
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 3.5, border: '1px solid #E4EDE6', bgcolor: '#FFFFFF' }}>
            <Typography variant="body1" fontWeight={650} color="#081C15">
              No bookings recorded for this tour yet.
            </Typography>
          </Paper>
        )
      )}
    </Box>
  );
};

export default OrganizerDashboard;
