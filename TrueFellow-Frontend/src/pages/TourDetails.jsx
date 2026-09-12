import React, { useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { TOUR_QUERY, BOOK_TOUR_MUTATION, REVIEWS_QUERY, SAVE_TOUR_MUTATION, UNSAVE_TOUR_MUTATION } from '../graphql/operations';
import { useAuth } from '../context/AuthContext';
import { getImageUrl, DEFAULT_AVATAR, DEFAULT_TOUR_COVER } from '../utils/imageUrl';
import { FALLBACK_TOURS } from '../utils/sampleTours';
import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
  Button,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  FormControlLabel,
  Checkbox,
  Rating,
  Avatar,
  Divider,
  CircularProgress,
  IconButton,
  Alert,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupsIcon from '@mui/icons-material/Groups';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import VerifiedIcon from '@mui/icons-material/Verified';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const TourDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refreshUser } = useAuth();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [notes, setNotes] = useState('');
  const [matchOptIn, setMatchOptIn] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  const isSampleTour = Boolean(id?.startsWith('sample-'));
  const fallbackTour = FALLBACK_TOURS.find((t) => t.id === id) || FALLBACK_TOURS[0];

  // Fetch Tour Details
  const { data, loading, error, refetch: refetchTour } = useQuery(TOUR_QUERY, {
    variables: { id },
    skip: isSampleTour,
  });

  // Fetch Reviews
  const { data: reviewData } = useQuery(REVIEWS_QUERY, {
    variables: { tourId: id, page: 1, limit: 10 },
    skip: isSampleTour,
  });

  // Book Mutation
  const [bookTour] = useMutation(BOOK_TOUR_MUTATION);

  // Save/Unsave Mutations
  const [saveTour] = useMutation(SAVE_TOUR_MUTATION);
  const [unsaveTour] = useMutation(UNSAVE_TOUR_MUTATION);

  if (loading && !isSampleTour) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '75vh', gap: 2 }}>
        <CircularProgress color="primary" size={36} />
        <Typography variant="body2" color="text.secondary">Loading tour details...</Typography>
      </Box>
    );
  }

  const tour = data?.tour || fallbackTour;

  if (!tour) {
    return (
      <Container sx={{ py: 10 }}>
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          Tour not found or error fetching details: {error?.message}
        </Alert>
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button component={Link} to="/" variant="contained" color="primary">
            Back to Explore Tours
          </Button>
        </Box>
      </Container>
    );
  }

  const isBookmarked = user?.savedTours?.some((t) => t.id === tour.id);
  const displayImage = getImageUrl(tour.images?.[selectedImageIndex] || tour.images?.[0], DEFAULT_TOUR_COVER);

  const fallbackReviews = [
    {
      id: 'rev-fb-1',
      rating: 5,
      comment: 'An unforgettable adventure through northern valleys! The logistics, accommodation, and hospitality were completely top-notch.',
      aspects: { guide: 5, value: 4.8, safety: 5, itinerary: 5 },
      tourist: { name: 'Ayesha Khan', profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
      createdAt: '2026-08-14T10:00:00.000Z',
    },
    {
      id: 'rev-fb-2',
      rating: 4.8,
      comment: 'Passu cones sunset and Attabad boating were magical moments. Guide Hamza kept everyone safe and engaged.',
      aspects: { guide: 4.9, value: 4.7, safety: 5, itinerary: 4.8 },
      tourist: { name: 'Danyal Malik', profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' },
      createdAt: '2026-08-20T14:30:00.000Z',
    },
  ];

  const effectiveReviews = (reviewData?.reviews?.reviews && reviewData.reviews.reviews.length > 0)
    ? reviewData.reviews.reviews
    : (isSampleTour ? fallbackReviews : []);
  const effectiveTotalReviews = reviewData?.reviews?.total || effectiveReviews.length;

  const handleBookmarkToggle = async () => {
    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }
    try {
      if (isBookmarked) {
        await unsaveTour({ variables: { tourId: tour.id } });
      } else {
        await saveTour({ variables: { tourId: tour.id } });
      }
      refreshUser();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }
    if (user.role !== 'TOURIST') {
      setBookingError('Only accounts registered as Tourists can book tours.');
      return;
    }

    setBookingLoading(true);
    setBookingError('');
    setBookingSuccess(false);

    try {
      await bookTour({
        variables: {
          input: {
            tourId: tour.id,
            notes,
            companionMatchingEnabled: matchOptIn,
          },
        },
      });
      setBookingSuccess(true);
      setNotes('');
      setMatchOptIn(false);
      refetchTour();
    } catch (err) {
      setBookingError(err.message || 'Failed to place booking.');
    } finally {
      setBookingLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'TBD';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? 'TBD' : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const seatsTaken = Math.max(0, tour.capacity - (tour.availableSeats || 0));
  const capacityPercent = tour.capacity > 0 ? Math.min(100, Math.round((seatsTaken / tour.capacity) * 100)) : 0;

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Gallery Main Cover & Thumbnails */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            position: 'relative',
            borderRadius: 4,
            overflow: 'hidden',
            height: { xs: 280, sm: 380, md: 480 },
            mb: 2,
            bgcolor: '#eef3ef',
            boxShadow: '0 8px 30px rgba(8, 28, 21, 0.08)',
            border: '1px solid #E4EDE6',
          }}
        >
          <img
            src={displayImage}
            alt={tour.title}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = DEFAULT_TOUR_COVER;
            }}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all 0.3s ease' }}
          />
          <Tooltip title={isBookmarked ? 'Remove from Saved' : 'Save Tour'} arrow>
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                bgcolor: 'rgba(255, 255, 255, 0.94)',
                backdropFilter: 'blur(8px)',
                borderRadius: '50%',
                boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
              }}
            >
              <IconButton onClick={handleBookmarkToggle} size="small" sx={{ p: 1.2 }}>
                {isBookmarked ? (
                  <BookmarkIcon color="primary" sx={{ fontSize: 24 }} />
                ) : (
                  <BookmarkBorderIcon sx={{ fontSize: 24, color: '#081C15' }} />
                )}
              </IconButton>
            </Box>
          </Tooltip>
        </Box>

        {tour.images?.length > 1 && (
          <Box sx={{ display: 'flex', gap: 1.5, overflow: 'auto', pb: 1 }}>
            {tour.images.map((imgUrl, idx) => (
              <Box
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                sx={{
                  width: 90,
                  height: 65,
                  borderRadius: 2.5,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: selectedImageIndex === idx ? '3px solid #2D6A4F' : '2px solid transparent',
                  opacity: selectedImageIndex === idx ? 1 : 0.65,
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                  boxShadow: selectedImageIndex === idx ? '0 2px 10px rgba(45, 106, 79, 0.3)' : 'none',
                  '&:hover': { opacity: 1 },
                }}
              >
                <img
                  src={getImageUrl(imgUrl, DEFAULT_TOUR_COVER)}
                  alt={`Thumbnail ${idx + 1}`}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = DEFAULT_TOUR_COVER;
                  }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Main Grid: Detail Panel vs Sticky Booking Sidebar */}
      <Grid container spacing={4}>
        {/* Left Detail Panel */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3.5 }}>
            <Box sx={{ display: 'flex', gap: 1.2, flexWrap: 'wrap' }}>
              <Chip
                label={tour.category}
                color="primary"
                sx={{ fontWeight: 700, borderRadius: 2 }}
              />
              <Chip
                label={`${tour.duration} Days • ${tour.duration - 1} Nights`}
                variant="outlined"
                color="secondary"
                sx={{ fontWeight: 650, borderRadius: 2 }}
              />
              <Chip
                label={`Trip Status: ${tour.status}`}
                size="small"
                variant="outlined"
                color={tour.status === 'PUBLISHED' ? 'success' : 'default'}
                sx={{ fontWeight: 600, height: 26 }}
              />
            </Box>

            <Typography variant="h3" fontWeight={800} color="#081C15" sx={{ fontSize: { xs: '1.8rem', md: '2.5rem' }, lineHeight: 1.25 }}>
              {tour.title}
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.8, fontSize: '1rem' }}>
              📍 Starts from <strong>{tour.departureCity}</strong> &bull; Destination <strong>{tour.destinationCity}</strong>
            </Typography>
          </Box>

          {/* Organizer Info Card */}
          {tour.organizer && (
            <Paper
              sx={{
                p: 2.5,
                borderRadius: 3.5,
                mb: 4,
                bgcolor: '#FAFCF9',
                border: '1px solid #E4EDE6',
                boxShadow: '0 2px 12px rgba(8, 28, 21, 0.03)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  src={getImageUrl(tour.organizer.profilePicture, DEFAULT_AVATAR)}
                  alt={tour.organizer.name}
                  sx={{ width: 56, height: 56, border: '2px solid #2D6A4F' }}
                />
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <Typography variant="subtitle1" fontWeight={750} color="#081C15">
                      Organized by {tour.organizer.name}
                    </Typography>
                    <VerifiedIcon color="primary" sx={{ fontSize: 19 }} />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {tour.organizer.bio || 'Certified Travel Operator & Verified Guide'}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          )}

          {/* Quick Metrics Bar */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3, border: '1px solid #E4EDE6', bgcolor: '#F8FAF7' }}>
                <LocalOfferIcon color="primary" sx={{ fontSize: 26, mb: 0.5 }} />
                <Typography variant="caption" display="block" color="text.secondary" fontWeight={600}>PRICE</Typography>
                <Typography variant="subtitle1" fontWeight={750} color="#081C15">PKR {tour.price?.toLocaleString() || 0}</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3, border: '1px solid #E4EDE6', bgcolor: '#F8FAF7' }}>
                <AccessTimeIcon color="primary" sx={{ fontSize: 26, mb: 0.5 }} />
                <Typography variant="caption" display="block" color="text.secondary" fontWeight={600}>DURATION</Typography>
                <Typography variant="subtitle1" fontWeight={750} color="#081C15">{tour.duration} Days</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3, border: '1px solid #E4EDE6', bgcolor: '#F8FAF7' }}>
                <GroupsIcon color="primary" sx={{ fontSize: 26, mb: 0.5 }} />
                <Typography variant="caption" display="block" color="text.secondary" fontWeight={600}>CAPACITY</Typography>
                <Typography variant="subtitle1" fontWeight={750} color="#081C15">{tour.capacity} Seats</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3, border: '1px solid #E4EDE6', bgcolor: '#F8FAF7' }}>
                <CalendarTodayIcon color="primary" sx={{ fontSize: 26, mb: 0.5 }} />
                <Typography variant="caption" display="block" color="text.secondary" fontWeight={600}>DEPARTURE</Typography>
                <Typography variant="subtitle1" fontWeight={750} color="#081C15">
                  {formatDate(tour.startDate)}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Detailed Accordions */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Overview */}
            <Accordion defaultExpanded sx={{ border: '1px solid #E4EDE6', borderRadius: '14px !important', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" fontWeight={750} color="#081C15">Trip Overview & Details</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8, color: '#2C4035' }}>
                  {tour.description}
                </Typography>
                {tour.meetingPoint && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: '#F0F4F1', borderRadius: 2.5 }}>
                    <Typography variant="subtitle2" fontWeight={700} color="primary.main">
                      📍 Meeting Point:
                    </Typography>
                    <Typography variant="body2" color="#081C15">
                      {tour.meetingPoint}
                    </Typography>
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>

            {/* Itinerary Timeline */}
            <Accordion defaultExpanded sx={{ border: '1px solid #E4EDE6', borderRadius: '14px !important', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" fontWeight={750} color="#081C15">Day-by-Day Itinerary</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {tour.itinerary?.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pl: 1 }}>
                    {tour.itinerary.map((step, idx) => (
                      <Box key={idx} sx={{ display: 'flex', gap: 2, position: 'relative' }}>
                        <Box
                          sx={{
                            width: 34,
                            height: 34,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 750,
                            fontSize: '0.85rem',
                            flexShrink: 0,
                            boxShadow: '0 2px 8px rgba(45, 106, 79, 0.3)',
                          }}
                        >
                          {idx + 1}
                        </Box>
                        <Box sx={{ pt: 0.4 }}>
                          <Typography variant="subtitle2" fontWeight={750} color="#081C15">
                            Day {idx + 1}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3, lineHeight: 1.65 }}>
                            {step}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">Detailed daily schedule will be coordinated upon booking confirmation.</Typography>
                )}
              </AccordionDetails>
            </Accordion>

            {/* Inclusions / Exclusions */}
            <Accordion sx={{ border: '1px solid #E4EDE6', borderRadius: '14px !important', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" fontWeight={750} color="#081C15">Inclusions & Exclusions</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle2" fontWeight={750} color="primary.main" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <CheckCircleIcon sx={{ fontSize: 18 }} /> What's Included
                    </Typography>
                    {tour.includedServices?.length > 0 ? (
                      tour.includedServices.map((item, i) => (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main' }} />
                          <Typography variant="body2" color="#1B382B">{item}</Typography>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">Standard travel equipment & transport.</Typography>
                    )}
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle2" fontWeight={750} color="error.main" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <CancelIcon sx={{ fontSize: 18 }} /> What's Excluded
                    </Typography>
                    {tour.excludedServices?.length > 0 ? (
                      tour.excludedServices.map((item, i) => (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'error.main' }} />
                          <Typography variant="body2" color="#1B382B">{item}</Typography>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">Personal gear, tips, and optional activities.</Typography>
                    )}
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* FAQs */}
            <Accordion sx={{ border: '1px solid #E4EDE6', borderRadius: '14px !important', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" fontWeight={750} color="#081C15">Frequently Asked Questions</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {tour.faqs?.length > 0 ? (
                  tour.faqs.map((faq, i) => (
                    <Box key={i} sx={{ mb: 2, p: 2, bgcolor: '#FAFCF9', borderRadius: 2.5, border: '1px solid #E4EDE6' }}>
                      <Typography variant="subtitle2" fontWeight={750} color="#081C15">
                        Q: {faq.question}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.6 }}>
                        {faq.answer}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">No FAQs currently listed for this package. Contact the guide directly for inquiries.</Typography>
                )}
              </AccordionDetails>
            </Accordion>
          </Box>

          {/* Customer Reviews Section */}
          <Box sx={{ mt: 6 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" fontWeight={800} color="#081C15">
                Traveler Reviews & Ratings
              </Typography>
              {effectiveTotalReviews > 0 && (
                <Chip
                  label={`${effectiveTotalReviews} Reviews`}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 700 }}
                />
              )}
            </Box>

            {effectiveReviews.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {effectiveReviews.map((rev) => (
                  <Paper key={rev.id} sx={{ p: 3, borderRadius: 3.5, border: '1px solid #E4EDE6' }} variant="outlined">
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      <Box sx={{ display: 'flex', gap: 1.8, alignItems: 'center' }}>
                        <Avatar
                          src={getImageUrl(rev.tourist?.profilePicture, DEFAULT_AVATAR)}
                          alt={rev.tourist?.name}
                          sx={{ width: 44, height: 44, border: '2px solid #2D6A4F' }}
                        />
                        <Box>
                          <Typography variant="subtitle1" fontWeight={750} color="#081C15">
                            {rev.tourist?.name}
                          </Typography>
                          <Rating value={rev.rating || 5} readOnly size="small" precision={0.5} />
                        </Box>
                      </Box>
                      {rev.createdAt && (
                        <Typography variant="caption" color="text.secondary">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </Typography>
                      )}
                    </Box>

                    <Typography variant="body2" color="#2C4035" sx={{ mb: 2, fontStyle: 'italic', lineHeight: 1.6 }}>
                      "{rev.comment}"
                    </Typography>

                    {/* Detailed Aspect Scores Breakdown */}
                    {rev.aspects && (
                      <Grid container spacing={1.5} sx={{ bgcolor: '#F8FAF7', p: 2, borderRadius: 2.5, border: '1px solid #E4EDE6' }}>
                        {Object.entries(rev.aspects).map(([key, val]) => (
                          <Grid size={{ xs: 6, sm: 4 }} key={key}>
                            <Typography variant="caption" sx={{ textTransform: 'capitalize', fontWeight: 650, color: 'text.secondary' }}>
                              {key}: <strong>{val}/5</strong>
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={(val / 5) * 100}
                              color="primary"
                              sx={{ height: 5, borderRadius: 3, mt: 0.5 }}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </Paper>
                ))}
              </Box>
            ) : (
              <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3.5, border: '1px solid #E4EDE6', bgcolor: '#FAFCF9' }}>
                <Typography variant="body1" fontWeight={650} color="#081C15" gutterBottom>
                  No reviews posted yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Be among the first travelers to embark on this journey and review your experience!
                </Typography>
              </Paper>
            )}
          </Box>
        </Grid>

        {/* Right Sticky Booking Form */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={4}
            sx={{
              p: 3.5,
              borderRadius: 4,
              border: '1px solid #E4EDE6',
              position: 'sticky',
              top: 96,
              boxShadow: '0 8px 32px rgba(8, 28, 21, 0.08)',
              bgcolor: '#FFFFFF',
            }}
          >
            <Typography variant="h5" fontWeight={800} color="#081C15" gutterBottom>
              Book Your Seat
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 2.5 }}>
              <Typography variant="h4" fontWeight={800} color="primary.main">
                PKR {tour.price?.toLocaleString() || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                / traveler
              </Typography>
            </Box>

            {/* Capacity / Available Progress Bar */}
            <Box sx={{ mb: 3, p: 2, bgcolor: '#F8FAF7', borderRadius: 3, border: '1px solid #E4EDE6' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" fontWeight={700} color="text.secondary">
                  SEAT AVAILABILITY
                </Typography>
                <Typography variant="caption" fontWeight={750} color={tour.availableSeats <= 3 ? 'error.main' : 'primary.main'}>
                  {tour.availableSeats} of {tour.capacity} left
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={capacityPercent}
                color={tour.availableSeats <= 3 ? 'warning' : 'primary'}
                sx={{ height: 7, borderRadius: 4 }}
              />
            </Box>

            {bookingSuccess && (
              <Alert
                severity="success"
                sx={{ mb: 2.5, borderRadius: 3 }}
                action={
                  <Button component={Link} to="/dashboard?tab=bookings" size="small" color="inherit" sx={{ fontWeight: 700 }}>
                    View
                  </Button>
                }
              >
                Booking reserved successfully! Status is updated in your dashboard.
              </Alert>
            )}

            {bookingError && (
              <Alert severity="error" sx={{ mb: 2.5, borderRadius: 3 }}>
                {bookingError}
              </Alert>
            )}

            <form onSubmit={handleBookingSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                    SCHEDULED TRIP DATES
                  </Typography>
                  <Typography variant="body2" fontWeight={700} color="#081C15" sx={{ mt: 0.2 }}>
                    {formatDate(tour.startDate)} &mdash; {formatDate(tour.endDate)}
                  </Typography>
                </Box>

                <TextField
                  fullWidth
                  label="Special Notes or Requests"
                  multiline
                  rows={3}
                  placeholder="e.g. dietary preference, luggage accommodation, pickup location"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />

                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2.5,
                    bgcolor: 'rgba(45, 106, 79, 0.05)',
                    border: '1px solid rgba(45, 106, 79, 0.15)',
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={matchOptIn}
                        onChange={(e) => setMatchOptIn(e.target.checked)}
                        color="primary"
                      />
                    }
                    label={
                      <Typography variant="body2" color="#1B382B" sx={{ fontSize: '0.86rem', lineHeight: 1.4 }}>
                        Opt-in to <strong>Travel Companion Matching</strong> to discover other travelers on this departure.
                      </Typography>
                    }
                  />
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  disabled={bookingLoading || tour.availableSeats <= 0}
                  sx={{
                    py: 1.4,
                    borderRadius: 3,
                    fontWeight: 700,
                    boxShadow: '0 4px 16px rgba(45, 106, 79, 0.35)',
                  }}
                >
                  {bookingLoading ? 'Processing Booking...' : tour.availableSeats <= 0 ? 'Tour Fully Booked' : 'Confirm & Reserve Seat'}
                </Button>
              </Box>
            </form>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
              <Typography variant="caption" color="text.secondary">
                <strong>Cancellation Policy:</strong> {tour.cancellationPolicy || 'Flexible cancellation up to 48 hours before trip departure.'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                <strong>Instant Confirmation:</strong> Your ticket will be listed directly in your Tourist Dashboard.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default TourDetails;
