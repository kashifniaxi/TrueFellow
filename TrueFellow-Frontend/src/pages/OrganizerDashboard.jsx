import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
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
  Alert,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const CATEGORIES = [
  'ADVENTURE', 'CULTURAL', 'HIKING', 'FAMILY', 'LUXURY', 'WILDLIFE', 'BEACH', 'RELIGIOUS', 'PHOTOGRAPHY', 'OTHER'
];

const OrganizerDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h4" fontWeight={800} mb={4}>Organizer Panel</Typography>
      
      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: '1px solid #E2EBE5', px: 2, py: 1 }}
        >
          <Tab label="Analytics" />
          <Tab label="My Tours" />
          <Tab label="Tour Bookings" />
        </Tabs>

        <Box p={4} bgcolor="#fafafa" minHeight="50vh">
          {activeTab === 0 && <AnalyticsTab />}
          {activeTab === 1 && <MyToursTab />}
          {activeTab === 2 && <BookingsTab />}
        </Box>
      </Paper>
    </Container>
  );
};

// ─── TABS ────────────────────────────────────────────────────────────────────

// 1. Analytics Tab
const AnalyticsTab = () => {
  const { data: dashboardData, loading: dashLoading } = useQuery(ORGANIZER_DASHBOARD_QUERY);
  const { data: statsData, loading: statsLoading } = useQuery(MY_ORGANIZER_STATS_QUERY);

  if (dashLoading || statsLoading) return <CircularProgress color="primary" />;

  const db = dashboardData?.organizerDashboard || {};
  const stats = statsData?.myOrganizerStats || {};

  // Formats Recharts data
  const chartData = stats.monthlyBookings?.map((b) => ({
    name: `${b.month}/${b.year.toString().slice(-2)}`,
    Bookings: b.count,
  })) || [];

  return (
    <Box>
      <Typography variant="h5" fontWeight={750} mb={3}>Performance Metrics</Typography>
      
      <Grid container spacing={3} mb={5}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #E2EBE5' }}>
            <Typography variant="caption" color="text.secondary">ACTIVE TOURS</Typography>
            <Typography variant="h3" fontWeight={750} mt={1}>{db.activeToursCount || 0}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #E2EBE5' }}>
            <Typography variant="caption" color="text.secondary">TOTAL BOOKINGS</Typography>
            <Typography variant="h3" fontWeight={750} mt={1}>{db.totalBookingsCount || 0}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #E2EBE5' }}>
            <Typography variant="caption" color="text.secondary">AVERAGE RATING</Typography>
            <Typography variant="h3" fontWeight={750} mt={1}>{db.averageRating?.toFixed(1) || '0.0'} / 5.0</Typography>
          </Paper>
        </Grid>
      </Grid>

      {chartData.length > 0 && (
        <Paper sx={{ p: 4, borderRadius: 3, border: '1px solid #E2EBE5', mb: 5 }}>
          <Typography variant="h6" fontWeight={700} mb={3}>Booking Monthly Trends</Typography>
          <Box height={300}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#556B5C" />
                <YAxis stroke="#556B5C" />
                <Tooltip />
                <Bar dataKey="Bookings" fill="#4A7A37" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      )}

      <Typography variant="h6" fontWeight={750} mb={2}>Recent Bookings</Typography>
      <Paper variant="outlined">
        <List>
          {db.recentBookings?.length > 0 ? (
            db.recentBookings.map((b) => (
              <ListItem key={b.id} sx={{ borderBottom: '1px solid #f0f0f0' }}>
                <ListItemText
                  primary={`Tourist: ${b.tourist.name}`}
                  secondary={`Tour: ${b.tour.title} | Status: ${b.status}`}
                />
              </ListItem>
            ))
          ) : (
            <Typography p={3} textAlign="center" color="text.secondary">No bookings recorded yet.</Typography>
          )}
        </List>
      </Paper>
    </Box>
  );
};

// 2. My Tours Tab (List & Form)
const MyToursTab = () => {
  const { data, loading, refetch } = useQuery(MY_TOURS_QUERY, { variables: { page: 1, limit: 12 } });
  const [cancelTour] = useMutation(CANCEL_TOUR_MUTATION);
  const [createTour] = useMutation(CREATE_TOUR_MUTATION);
  const [updateTour] = useMutation(UPDATE_TOUR_MUTATION);

  // Form Modal States
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

  // Dynamic Array Fields
  const [itinerary, setItinerary] = useState(['']);
  const [includedServices, setIncludedServices] = useState(['']);
  const [excludedServices, setExcludedServices] = useState(['']);
  const [faqs, setFaqs] = useState([{ question: '', answer: '' }]);

  const tours = data?.myTours?.tours || [];

  const handleOpenForm = (tour = null) => {
    if (tour) {
      // populate for editing (needs details query or use list item fields)
      setEditingId(tour.id);
      setTitle(tour.title);
      setPrice(tour.price);
      setDuration(tour.duration);
      setStartDate(tour.startDate.slice(0, 10));
      setEndDate(tour.endDate.slice(0, 10));
      setDestinationCity(tour.destinationCity);
      setImages(tour.images || []);
      // populate others to default or empty if not present in short query
      setDescription(tour.description || '');
      setDepartureCity(tour.departureCity || '');
      setLocation(tour.location || '');
      setCategory(tour.category || 'ADVENTURE');
      setMeetingPoint(tour.meetingPoint || '');
      setCancellationPolicy(tour.cancellationPolicy || '');
      setItinerary(tour.itinerary?.length ? tour.itinerary : ['']);
      setIncludedServices(tour.includedServices?.length ? tour.includedServices : ['']);
      setExcludedServices(tour.excludedServices?.length ? tour.excludedServices : ['']);
      setFaqs(tour.faqs?.length ? tour.faqs : [{ question: '', answer: '' }]);
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
    const tourInput = {
      title,
      description,
      price: parseFloat(price),
      duration: parseInt(duration),
      capacity: parseInt(capacity),
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
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
      faqs: faqs.filter(f => f.question && f.answer),
    };

    try {
      if (editingId) {
        await updateTour({ variables: { id: editingId, input: tourInput } });
      } else {
        await createTour({ variables: { input: tourInput } });
      }
      refetch();
      handleCloseForm();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCancelTour = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this tour? Tourists will be notified.')) return;
    try {
      await cancelTour({ variables: { id } });
      refetch();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={750}>My Tours Listings</Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => handleOpenForm()}>
          Add Tour
        </Button>
      </Box>

      {loading ? (
        <CircularProgress color="primary" />
      ) : tours.length > 0 ? (
        <Grid container spacing={3}>
          {tours.map((tour) => (
            <Grid item key={tour.id} xs={12} sm={6} md={4}>
              <Card sx={{ border: '1px solid #E2EBE5' }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="subtitle1" fontWeight={750}>{tour.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Status: <strong style={{ color: tour.status === 'PUBLISHED' ? '#4A7A37' : '#d32f2f' }}>{tour.status}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Bookings: {tour.bookingsCount} / {tour.capacity} seats
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Dates: {new Date(tour.startDate).toLocaleDateString()}
                  </Typography>
                  
                  <Box display="flex" gap={1} mt={2}>
                    <Button variant="outlined" size="small" onClick={() => handleOpenForm(tour)}>Edit</Button>
                    {tour.status !== 'CANCELLED' && (
                      <Button variant="outlined" color="error" size="small" onClick={() => handleCancelTour(tour.id)}>
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
        <Typography variant="body2" color="text.secondary">No tours listed yet.</Typography>
      )}

      {/* Dynamic Form Dialog */}
      <Dialog open={formOpen} onClose={handleCloseForm} fullWidth maxWidth="md">
        <DialogTitle>{editingId ? 'Edit Tour Details' : 'Create New Tour'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField fullWidth label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <TextField fullWidth multiline rows={3} label="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
          
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <TextField fullWidth type="number" label="Price (PKR)" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField fullWidth type="number" label="Duration (Days)" value={duration} onChange={(e) => setDuration(e.target.value)} required />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField fullWidth type="number" label="Total Capacity" value={capacity} onChange={(e) => setCapacity(e.target.value)} required />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField fullWidth select label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth type="date" InputLabelProps={{ shrink: true }} label="Start Date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth type="date" InputLabelProps={{ shrink: true }} label="End Date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Departure City" value={departureCity} onChange={(e) => setDepartureCity(e.target.value)} required />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Destination City" value={destinationCity} onChange={(e) => setDestinationCity(e.target.value)} required />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Location Map URL / Ref" value={location} onChange={(e) => setLocation(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Meeting Point" value={meetingPoint} onChange={(e) => setMeetingPoint(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Cancellation Policy" value={cancellationPolicy} onChange={(e) => setCancellationPolicy(e.target.value)} />
            </Grid>
          </Grid>

          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2" fontWeight={700}>Images Upload</Typography>
          <ImageUpload multiple initialImages={images} onUploadSuccess={(urls) => setImages(urls)} />

          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2" fontWeight={700}>Itinerary Plan Steps</Typography>
          {itinerary.map((step, idx) => (
            <Box key={idx} display="flex" gap={1}>
              <TextField fullWidth label={`Day ${idx + 1}`} value={step} onChange={(e) => {
                const copy = [...itinerary];
                copy[idx] = e.target.value;
                setItinerary(copy);
              }} />
              <IconButton onClick={() => setItinerary(itinerary.filter((_, i) => i !== idx))}>
                <DeleteIcon color="error" />
              </IconButton>
            </Box>
          ))}
          <Button startIcon={<AddIcon />} size="small" onClick={() => setItinerary([...itinerary, ''])}>Add Day</Button>

          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2" fontWeight={700}>Included Services</Typography>
          {includedServices.map((service, idx) => (
            <Box key={idx} display="flex" gap={1}>
              <TextField fullWidth label={`Service ${idx + 1}`} value={service} onChange={(e) => {
                const copy = [...includedServices];
                copy[idx] = e.target.value;
                setIncludedServices(copy);
              }} />
              <IconButton onClick={() => setIncludedServices(includedServices.filter((_, i) => i !== idx))}>
                <DeleteIcon color="error" />
              </IconButton>
            </Box>
          ))}
          <Button startIcon={<AddIcon />} size="small" onClick={() => setIncludedServices([...includedServices, ''])}>Add Included Service</Button>

          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2" fontWeight={700}>FAQs</Typography>
          {faqs.map((faq, idx) => (
            <Box key={idx} display="flex" gap={1} flexDirection="column" sx={{ border: '1px solid #f0f0f0', p: 2, borderRadius: 2 }}>
              <TextField fullWidth label="Question" value={faq.question} onChange={(e) => {
                const copy = [...faqs];
                copy[idx].question = e.target.value;
                setFaqs(copy);
              }} />
              <TextField fullWidth label="Answer" value={faq.answer} onChange={(e) => {
                const copy = [...faqs];
                copy[idx].answer = e.target.value;
                setFaqs(copy);
              }} />
              <Button size="small" color="error" onClick={() => setFaqs(faqs.filter((_, i) => i !== idx))}>Remove FAQ</Button>
            </Box>
          ))}
          <Button startIcon={<AddIcon />} size="small" onClick={() => setFaqs([...faqs, { question: '', answer: '' }])}>Add FAQ</Button>

        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">Save Tour</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// 3. Tour Bookings Tab
const BookingsTab = () => {
  const { data: toursData } = useQuery(MY_TOURS_QUERY, { variables: { page: 1, limit: 20 } });
  const [selectedTourId, setSelectedTourId] = useState('');
  
  const { data: bookingsData, refetch } = useQuery(BOOKINGS_BY_TOUR_QUERY, {
    variables: { tourId: selectedTourId },
    skip: !selectedTourId,
  });

  const [completeBooking] = useMutation(COMPLETE_BOOKING_MUTATION);

  const tours = toursData?.myTours?.tours || [];
  const bookings = bookingsData?.bookingsByTour?.bookings || [];

  const handleComplete = async (bookingId) => {
    try {
      await completeBooking({ variables: { bookingId } });
      refetch();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={750} mb={3}>Manage Bookings by Tour</Typography>
      <Box mb={4} maxWidth={400}>
        <TextField
          fullWidth
          select
          label="Select Tour"
          value={selectedTourId}
          onChange={(e) => setSelectedTourId(e.target.value)}
        >
          {tours.map((t) => (
            <MenuItem key={t.id} value={t.id}>
              {t.title}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {selectedTourId ? (
        bookings.length > 0 ? (
          <Grid container spacing={2}>
            {bookings.map((b) => (
              <Grid item key={b.id} xs={12}>
                <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #E2EBE5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={750}>{b.tourist.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Email: {b.tourist.email} | Phone: {b.tourist.phone || 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Booked At: {new Date(b.bookedAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box display="flex" gap={1.5} alignItems="center">
                    <Chip label={b.status} color={b.status === 'CONFIRMED' ? 'success' : 'primary'} size="small" />
                    {b.status === 'CONFIRMED' && (
                      <Button variant="contained" color="primary" size="small" onClick={() => handleComplete(b.id)}>
                        Mark Completed
                      </Button>
                    )}
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="body2" color="text.secondary">No bookings found for this tour.</Typography>
        )
      ) : (
        <Typography variant="body2" color="text.secondary">Please select a tour to inspect customer bookings.</Typography>
      )}
    </Box>
  );
};

export default OrganizerDashboard;
