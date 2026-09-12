import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ImageUpload from '../components/ImageUpload';
import MessagesInbox from '../components/MessagesInbox';
import { getImageUrl, DEFAULT_AVATAR, DEFAULT_TOUR_COVER } from '../utils/imageUrl';
import {
  MY_BOOKINGS_QUERY,
  CANCEL_BOOKING_MUTATION,
  TOGGLE_COMPANION_MATCHING_ON_BOOKING_MUTATION,
  MATCH_COMPANIONS_QUERY,
  UPDATE_PROFILE_MUTATION,
  WRITE_REVIEW_MUTATION,
  UNSAVE_TOUR_MUTATION,
} from '../graphql/operations';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Grid,
  Button,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  TextField,
  MenuItem,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip,
} from '@mui/material';
import EventNoteIcon from '@mui/icons-material/EventNote';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import ChatIcon from '@mui/icons-material/Chat';
import RateReviewIcon from '@mui/icons-material/RateReview';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const TouristDashboard = () => {
  const { user, updateUserProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedChatUser, setSelectedChatUser] = useState(null);

  const tabParam = searchParams.get('tab');

  useEffect(() => {
    if (tabParam === 'messages') setActiveTab(4);
    else if (tabParam === 'profile') setActiveTab(3);
    else if (tabParam === 'saved') setActiveTab(2);
    else if (tabParam === 'companion') setActiveTab(1);
    else if (tabParam === 'bookings') setActiveTab(0);
  }, [tabParam]);

  const handleTabChange = (_, newValue) => {
    setActiveTab(newValue);
    const tabMap = ['bookings', 'companion', 'saved', 'profile', 'messages'];
    setSearchParams({ tab: tabMap[newValue] });
  };

  const handleStartChatWithCompanion = (companionUser) => {
    setSelectedChatUser(companionUser);
    setActiveTab(4);
    setSearchParams({ tab: 'messages' });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Dashboard Top Profile Banner */}
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
        <Box sx={{ display: 'flex', gap: 2.2, alignItems: 'center' }}>
          <Avatar
            src={getImageUrl(user?.profilePicture, DEFAULT_AVATAR)}
            alt={user?.name}
            sx={{
              width: 68,
              height: 68,
              border: '3px solid #2D6A4F',
              boxShadow: '0 4px 14px rgba(45, 106, 79, 0.2)',
            }}
          >
            {user?.name?.charAt(0)}
          </Avatar>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <Typography variant="h4" fontWeight={800} color="#081C15">
                {user?.name}
              </Typography>
              <Chip
                label="TOURIST"
                size="small"
                color="primary"
                sx={{ height: 22, fontWeight: 700, fontSize: '0.68rem' }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
              {user?.email} &bull; Member of TrueFellow Pakistan
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            component={Link}
            to="/"
            variant="outlined"
            color="primary"
            sx={{ borderRadius: 2.5, fontWeight: 650 }}
          >
            Browse Tours
          </Button>
          <Button
            component={Link}
            to="/apply-organizer"
            variant="contained"
            color="primary"
            sx={{ borderRadius: 2.5, fontWeight: 650 }}
          >
            Become an Organizer
          </Button>
        </Box>
      </Box>

      {/* Main Tabs Container */}
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
          <Tab icon={<EventNoteIcon />} iconPosition="start" label="My Bookings" />
          <Tab icon={<PeopleAltIcon />} iconPosition="start" label="Companion Matching" />
          <Tab icon={<BookmarkIcon />} iconPosition="start" label="Saved Tours" />
          <Tab icon={<ManageAccountsIcon />} iconPosition="start" label="Profile & Preferences" />
          <Tab icon={<ChatIcon />} iconPosition="start" label="Messages" />
        </Tabs>

        <Box p={{ xs: 2.5, md: 4 }} bgcolor="#F8FAF7" minHeight="55vh">
          {activeTab === 0 && <BookingsTab />}
          {activeTab === 1 && <CompanionTab onStartChat={handleStartChatWithCompanion} />}
          {activeTab === 2 && <SavedToursTab />}
          {activeTab === 3 && <ProfileTab user={user} update={updateUserProfile} />}
          {activeTab === 4 && <MessagesInbox initialSelectedUser={selectedChatUser} />}
        </Box>
      </Paper>
    </Container>
  );
};

// ─── TABS ────────────────────────────────────────────────────────────────────

// 1. My Bookings Tab
const BookingsTab = () => {
  const { data, loading, error, refetch } = useQuery(MY_BOOKINGS_QUERY, {
    variables: { page: 1, limit: 20 },
    fetchPolicy: 'cache-and-network',
  });
  const [cancelBooking] = useMutation(CANCEL_BOOKING_MUTATION);
  const [toggleMatching] = useMutation(TOGGLE_COMPANION_MATCHING_ON_BOOKING_MUTATION);
  const [writeReview] = useMutation(WRITE_REVIEW_MUTATION);

  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewTour, setReviewTour] = useState(null);
  const [reviewBookingId, setReviewBookingId] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [aspects, setAspects] = useState({
    organization: 5,
    safety: 5,
    transportation: 5,
    accommodation: 5,
    communication: 5,
  });

  const [cancelDialog, setCancelDialog] = useState({ open: false, bookingId: null });
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });

  if (loading && !data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ borderRadius: 3 }}>{error.message}</Alert>;
  }

  const bookings = data?.myBookings?.bookings || [];

  const handleConfirmCancel = async () => {
    if (!cancelDialog.bookingId) return;
    try {
      await cancelBooking({ variables: { bookingId: cancelDialog.bookingId } });
      setToast({ open: true, message: 'Booking reservation cancelled.', severity: 'warning' });
      refetch();
    } catch (err) {
      setToast({ open: true, message: err.message, severity: 'error' });
    } finally {
      setCancelDialog({ open: false, bookingId: null });
    }
  };

  const handleToggleMatching = async (bookingId, enabled) => {
    try {
      await toggleMatching({ variables: { bookingId, enabled } });
      setToast({
        open: true,
        message: `Travel companion matching ${enabled ? 'enabled' : 'disabled'} for this departure.`,
        severity: 'success',
      });
      refetch();
    } catch (err) {
      setToast({ open: true, message: err.message, severity: 'error' });
    }
  };

  const handleOpenReview = (booking) => {
    setReviewTour(booking.tour);
    setReviewBookingId(booking.id);
    setReviewOpen(true);
  };

  const handleCloseReview = () => {
    setReviewOpen(false);
    setReviewTour(null);
    setComment('');
  };

  const handleReviewSubmit = async () => {
    try {
      await writeReview({
        variables: {
          input: {
            tourId: reviewTour.id,
            bookingId: reviewBookingId,
            rating: parseInt(rating),
            comment,
            aspects: {
              organization: parseInt(aspects.organization),
              safety: parseInt(aspects.safety),
              transportation: parseInt(aspects.transportation),
              accommodation: parseInt(aspects.accommodation),
              communication: parseInt(aspects.communication),
            },
          },
        },
      });
      setToast({ open: true, message: 'Thank you! Review posted successfully.', severity: 'success' });
      handleCloseReview();
      refetch();
    } catch (err) {
      setToast({ open: true, message: err.message, severity: 'error' });
    }
  };

  return (
    <Box>
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
      >
        <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })}>
          {toast.message}
        </Alert>
      </Snackbar>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={750} color="#081C15">
            Your Booked Tours
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your scheduled trips, companion matching toggles, and post-trip reviews.
          </Typography>
        </Box>
      </Box>

      {bookings.length > 0 ? (
        <Grid container spacing={3}>
          {bookings.map((b) => (
            <Grid size={{ xs: 12 }} key={b.id}>
              <Card
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  borderRadius: 3.5,
                  overflow: 'hidden',
                  border: '1px solid #E4EDE6',
                  boxShadow: '0 2px 12px rgba(8, 28, 21, 0.04)',
                }}
              >
                <Box sx={{ width: { xs: '100%', sm: 240 }, height: { xs: 180, sm: 'auto' }, flexShrink: 0, bgcolor: '#eef3ef' }}>
                  <img
                    src={getImageUrl(b.tour?.images?.[0], DEFAULT_TOUR_COVER)}
                    alt={b.tour?.title}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = DEFAULT_TOUR_COVER;
                    }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Box>

                <CardContent sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="h6" fontWeight={750} color="#081C15">
                      {b.tour?.title}
                    </Typography>
                    <Chip
                      label={b.status}
                      color={
                        b.status === 'CONFIRMED' ? 'success' :
                        b.status === 'COMPLETED' ? 'primary' :
                        'error'
                      }
                      size="small"
                      sx={{ fontWeight: 700, borderRadius: 2 }}
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary">
                    📍 Destination: <strong>{b.tour?.destinationCity}</strong> &bull; Starts:{' '}
                    <strong>{b.tour?.startDate ? new Date(b.tour.startDate).toLocaleDateString() : 'TBD'}</strong>
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    Booked on: {new Date(b.bookedAt).toLocaleDateString()} &bull; Total: PKR {b.tour?.price?.toLocaleString() || 0}
                  </Typography>

                  {b.status === 'CONFIRMED' && (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mt: 1, pt: 1.5, borderTop: '1px solid #F0F4F1' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={Boolean(b.companionMatchingEnabled)}
                              onChange={(e) => handleToggleMatching(b.id, e.target.checked)}
                              color="primary"
                            />
                          }
                          label={
                            <Typography variant="body2" fontWeight={600} color="#081C15">
                              Travel Companion Matching
                            </Typography>
                          }
                        />
                        <Tooltip title="When enabled, compatible tourists booked on this trip can discover each other and chat." arrow>
                          <InfoOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary', cursor: 'pointer' }} />
                        </Tooltip>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          component={Link}
                          to={`/tour/${b.tour?.id}`}
                          variant="outlined"
                          size="small"
                          sx={{ borderRadius: 2 }}
                        >
                          View Tour
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => setCancelDialog({ open: true, bookingId: b.id })}
                          sx={{ borderRadius: 2 }}
                        >
                          Cancel Booking
                        </Button>
                      </Box>
                    </Box>
                  )}

                  {b.status === 'COMPLETED' && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, pt: 1.5, borderTop: '1px solid #F0F4F1' }}>
                      <Button
                        component={Link}
                        to={`/tour/${b.tour?.id}`}
                        variant="outlined"
                        size="small"
                        sx={{ borderRadius: 2 }}
                      >
                        View Tour Details
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={<RateReviewIcon />}
                        onClick={() => handleOpenReview(b)}
                        sx={{ borderRadius: 2 }}
                      >
                        Write Review
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3.5, border: '1px solid #E4EDE6', bgcolor: '#FFFFFF' }}>
          <EventNoteIcon sx={{ fontSize: 48, color: 'primary.light', opacity: 0.4, mb: 1.5 }} />
          <Typography variant="h6" fontWeight={750} color="#081C15" gutterBottom>
            No Bookings Found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto', mb: 3 }}>
            You haven't reserved any tours yet. Explore upcoming guided packages across Pakistan!
          </Typography>
          <Button component={Link} to="/" variant="contained" color="primary" sx={{ borderRadius: 3 }}>
            Find a Tour
          </Button>
        </Paper>
      )}

      {/* Cancel Booking Dialog */}
      <Dialog open={cancelDialog.open} onClose={() => setCancelDialog({ open: false, bookingId: null })} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 750 }}>Cancel Tour Booking</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to cancel this booking? This action will release your reserved seats back to the public pool.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setCancelDialog({ open: false, bookingId: null })}>Keep Booking</Button>
          <Button onClick={handleConfirmCancel} color="error" variant="contained">
            Confirm Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={reviewOpen} onClose={handleCloseReview} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 750 }}>Rate & Review {reviewTour?.title}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Typography fontWeight={650}>Overall Rating:</Typography>
            <Rating value={rating} onChange={(_, val) => setRating(val)} size="large" />
          </Box>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Your Review"
            placeholder="Share details about the itinerary, safety, guide hospitality, and memorable moments..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <Divider sx={{ my: 0.5 }} />
          <Typography variant="subtitle2" fontWeight={750} color="#081C15">Aspect Breakdown (1 to 5 stars):</Typography>
          {Object.keys(aspects).map((aspect) => (
            <Box key={aspect} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ textTransform: 'capitalize', fontSize: '0.9rem' }}>{aspect}:</Typography>
              <Rating
                value={aspects[aspect]}
                onChange={(_, val) => setAspects((prev) => ({ ...prev, [aspect]: val }))}
              />
            </Box>
          ))}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={handleCloseReview}>Cancel</Button>
          <Button onClick={handleReviewSubmit} variant="contained" color="primary">
            Submit Review
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// 2. Companion Matching Tab
const CompanionTab = ({ onStartChat }) => {
  const { data: bookingsData } = useQuery(MY_BOOKINGS_QUERY, {
    variables: { page: 1, limit: 15, status: 'CONFIRMED' },
    fetchPolicy: 'cache-and-network',
  });
  const [selectedTourId, setSelectedTourId] = useState('');

  const { data: matchesData, loading } = useQuery(MATCH_COMPANIONS_QUERY, {
    variables: { tourId: selectedTourId },
    skip: !selectedTourId,
    fetchPolicy: 'network-only',
  });

  const bookings = bookingsData?.myBookings?.bookings || [];
  const firstTourId = bookings[0]?.tour?.id;

  // Default selection if available
  useEffect(() => {
    if (!selectedTourId && firstTourId) {
      setSelectedTourId(firstTourId);
    }
  }, [firstTourId, selectedTourId]);

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={750} color="#081C15">
          Travel Companion Matching
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Find matching travel partners booked on your upcoming trips based on shared travel styles, languages, and interests.
        </Typography>
      </Box>

      {bookings.length > 0 ? (
        <Box sx={{ mb: 4, maxWidth: 440 }}>
          <TextField
            fullWidth
            select
            size="small"
            label="Select Confirmed Tour"
            value={selectedTourId}
            onChange={(e) => setSelectedTourId(e.target.value)}
          >
            {bookings.map((b) => (
              <MenuItem key={b.tour.id} value={b.tour.id}>
                {b.tour.title}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      ) : (
        <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 3.5, border: '1px solid #E4EDE6', bgcolor: '#FFFFFF', mb: 3 }}>
          <PeopleAltIcon sx={{ fontSize: 44, color: 'primary.light', opacity: 0.4, mb: 1 }} />
          <Typography variant="subtitle1" fontWeight={750} color="#081C15" gutterBottom>
            No Confirmed Trips Yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto', mb: 2.5 }}>
            Book a tour and enable companion matching to start discovering compatible fellow travelers!
          </Typography>
          <Button component={Link} to="/" variant="contained" color="primary" sx={{ borderRadius: 2.5 }}>
            Explore Tours
          </Button>
        </Paper>
      )}

      {selectedTourId && (
        loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : matchesData?.matchCompanions?.length > 0 ? (
          <Grid container spacing={3}>
            {matchesData.matchCompanions.map((match) => (
              <Grid size={{ xs: 12, md: 6 }} key={match.user.id}>
                <Card
                  sx={{
                    border: '1px solid #E4EDE6',
                    borderRadius: 3.5,
                    position: 'relative',
                    boxShadow: '0 4px 16px rgba(8, 28, 21, 0.05)',
                  }}
                >
                  {/* Compatibility score badge */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 14,
                      right: 14,
                      background: 'linear-gradient(135deg, #2D6A4F 0%, #1B4332 100%)',
                      color: 'white',
                      px: 1.6,
                      py: 0.5,
                      borderRadius: 3,
                      fontWeight: 750,
                      fontSize: '0.82rem',
                      boxShadow: '0 2px 8px rgba(45, 106, 79, 0.3)',
                    }}
                  >
                    {match.compatibilityScore}% match
                  </Box>

                  <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.8, p: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Avatar
                        src={getImageUrl(match.user.profilePicture, DEFAULT_AVATAR)}
                        alt={match.user.name}
                        sx={{ width: 54, height: 54, border: '2px solid #2D6A4F' }}
                      >
                        {match.user.name?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={750} color="#081C15">
                          {match.user.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Travel Style: <strong>{match.user.travelPreferences?.travelStyle || 'Flexible'}</strong>
                        </Typography>
                        {match.user.bio && (
                          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', display: 'block', mt: 0.2 }}>
                            "{match.user.bio}"
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    {match.user.travelPreferences?.languages?.length > 0 && (
                      <Box>
                        <Typography variant="caption" fontWeight={650} color="text.secondary" display="block" mb={0.5}>
                          Languages Spoken:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap' }}>
                          {match.user.travelPreferences.languages.map((lang) => (
                            <Chip key={lang} label={lang} size="small" variant="outlined" sx={{ height: 22, fontSize: '0.72rem' }} />
                          ))}
                        </Box>
                      </Box>
                    )}

                    {match.sharedInterests?.length > 0 && (
                      <Box>
                        <Typography variant="caption" fontWeight={650} color="text.secondary" display="block" mb={0.5}>
                          Shared Interests:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap' }}>
                          {match.sharedInterests.map((interest) => (
                            <Chip
                              key={interest}
                              label={interest}
                              color="primary"
                              size="small"
                              sx={{ height: 22, fontSize: '0.72rem', fontWeight: 650 }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}

                    <Box sx={{ mt: 0.5, pt: 1.5, borderTop: '1px solid #F0F4F1' }}>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={<ChatIcon />}
                        onClick={() => onStartChat && onStartChat(match.user)}
                        sx={{ borderRadius: 2.5, px: 2.5 }}
                      >
                        Message Companion
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 3.5, border: '1px solid #E4EDE6', bgcolor: '#FFFFFF' }}>
            <Typography variant="subtitle1" fontWeight={750} color="#081C15" gutterBottom>
              No Companion Matches Found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 440, mx: 'auto' }}>
              Ensure "Travel Companion Matching" is turned on for your booking. As more travelers reserve this departure, they will show up here!
            </Typography>
          </Paper>
        )
      )}
    </Box>
  );
};

// 3. Saved Tours Tab
const SavedToursTab = () => {
  const { user, refreshUser } = useAuth();
  const [unsaveTour] = useMutation(UNSAVE_TOUR_MUTATION);
  const saved = user?.savedTours || [];

  const handleUnsave = async (tourId) => {
    try {
      await unsaveTour({ variables: { tourId } });
      refreshUser();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={750} color="#081C15" mb={1}>
        Saved Tours
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Your bookmarked trip packages to review or book at a later date.
      </Typography>

      {saved.length > 0 ? (
        <Grid container spacing={3}>
          {saved.map((tour) => (
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
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="subtitle1" fontWeight={750} color="#081C15" noWrap gutterBottom>
                    {tour.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    📍 {tour.destinationCity} &bull; PKR {tour.price?.toLocaleString()}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      component={Link}
                      to={`/tour/${tour.id}`}
                      variant="contained"
                      color="primary"
                      size="small"
                      sx={{ borderRadius: 2 }}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleUnsave(tour.id)}
                      sx={{ borderRadius: 2 }}
                    >
                      Remove
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3.5, border: '1px solid #E4EDE6', bgcolor: '#FFFFFF' }}>
          <BookmarkIcon sx={{ fontSize: 48, color: 'primary.light', opacity: 0.4, mb: 1.5 }} />
          <Typography variant="h6" fontWeight={750} color="#081C15" gutterBottom>
            No Saved Bookmarks
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2.5}>
            Click the bookmark icon on any tour package to save it to your wishlist.
          </Typography>
          <Button component={Link} to="/" variant="contained" color="primary" sx={{ borderRadius: 2.5 }}>
            Browse Tours
          </Button>
        </Paper>
      )}
    </Box>
  );
};

// 4. Profile & Preferences Tab
const ProfileTab = ({ user, update }) => {
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || '');

  const [interests, setInterests] = useState(user?.travelPreferences?.interests?.join(', ') || '');
  const [travelStyle, setTravelStyle] = useState(user?.travelPreferences?.travelStyle || 'GROUP');
  const [languages, setLanguages] = useState(user?.travelPreferences?.languages?.join(', ') || '');
  const [minBudget, setMinBudget] = useState(user?.travelPreferences?.budgetRange?.min || 0);
  const [maxBudget, setMaxBudget] = useState(user?.travelPreferences?.budgetRange?.max || 0);

  const [updateProfile] = useMutation(UPDATE_PROFILE_MUTATION);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    setErrorMsg('');
    setSaving(true);

    try {
      const { data } = await updateProfile({
        variables: {
          input: {
            name,
            phone,
            bio,
            profilePicture,
            travelPreferences: {
              interests: interests.split(',').map((x) => x.trim()).filter(Boolean),
              travelStyle,
              languages: languages.split(',').map((x) => x.trim()).filter(Boolean),
              budgetRange: {
                min: parseFloat(minBudget) || 0,
                max: parseFloat(maxBudget) || 0,
              },
            },
          },
        },
      });
      if (data?.updateProfile) {
        update(data.updateProfile);
        setSuccess(true);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
      <Box>
        <Typography variant="h5" fontWeight={750} color="#081C15">
          Profile Settings & Matching Preferences
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Update your public profile and preferences used to calculate companion compatibility.
        </Typography>
      </Box>

      {success && <Alert severity="success" sx={{ borderRadius: 3 }}>Profile and matching preferences updated successfully!</Alert>}
      {errorMsg && <Alert severity="error" sx={{ borderRadius: 3 }}>{errorMsg}</Alert>}

      <Paper sx={{ p: 3.5, borderRadius: 3.5, border: '1px solid #E4EDE6', bgcolor: '#FFFFFF' }}>
        <Typography variant="subtitle1" fontWeight={750} color="#081C15" mb={3}>
          Personal Information
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: 'center' }}>
            <Box sx={{ mb: 2 }}>
              <Avatar
                src={getImageUrl(profilePicture, DEFAULT_AVATAR)}
                alt={name}
                sx={{ width: 90, height: 90, mx: 'auto', border: '3px solid #2D6A4F', mb: 1.5 }}
              >
                {name?.charAt(0)}
              </Avatar>
            </Box>
            <ImageUpload
              initialImages={profilePicture ? [profilePicture] : []}
              onUploadSuccess={(url) => setProfilePicture(url)}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Phone Number" placeholder="+92 300 1234567" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Short Bio"
                  placeholder="Share a few words about your travel spirit and what kind of adventures you enjoy..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3.5, borderRadius: 3.5, border: '1px solid #E4EDE6', bgcolor: '#FFFFFF' }}>
        <Typography variant="subtitle1" fontWeight={750} color="#081C15" mb={3}>
          Companion Matching Preferences
        </Typography>

        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Interests (comma separated)"
              placeholder="hiking, photography, bonfires, history, food"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              helperText="e.g. trekking, photography, camping"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              select
              label="Preferred Travel Style"
              value={travelStyle}
              onChange={(e) => setTravelStyle(e.target.value)}
            >
              {['SOLO', 'GROUP', 'FAMILY', 'COUPLE', 'ADVENTURE', 'LUXURY', 'BUDGET'].map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Languages Spoken (comma separated)"
              placeholder="English, Urdu, Punjabi, Pashto"
              value={languages}
              onChange={(e) => setLanguages(e.target.value)}
              helperText="Used to match companion communication preference"
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <TextField
              fullWidth
              type="number"
              label="Min Budget (PKR)"
              value={minBudget}
              onChange={(e) => setMinBudget(e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <TextField
              fullWidth
              type="number"
              label="Max Budget (PKR)"
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
            />
          </Grid>
        </Grid>
      </Paper>

      <Button
        type="submit"
        variant="contained"
        color="primary"
        size="large"
        disabled={saving}
        sx={{ width: 'fit-content', borderRadius: 3, px: 4, py: 1.2, fontWeight: 700 }}
      >
        {saving ? 'Saving Changes...' : 'Save Profile & Matching Preferences'}
      </Button>
    </Box>
  );
};

export default TouristDashboard;
