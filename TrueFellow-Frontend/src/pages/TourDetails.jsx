import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { TOUR_QUERY, BOOK_TOUR_MUTATION, REVIEWS_QUERY, SAVE_TOUR_MUTATION, UNSAVE_TOUR_MUTATION } from '../graphql/operations';
import { useAuth } from '../context/AuthContext';
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
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupsIcon from '@mui/icons-material/Groups';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

const TourDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  
  const [notes, setNotes] = useState('');
  const [matchOptIn, setMatchOptIn] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  // Fetch Tour Details
  const { data, loading, error, refetch: refetchTour } = useQuery(TOUR_QUERY, {
    variables: { id },
  });

  // Fetch Reviews
  const { data: reviewData } = useQuery(REVIEWS_QUERY, {
    variables: { tourId: id, page: 1, limit: 10 },
  });

  // Book Mutation
  const [bookTour] = useMutation(BOOK_TOUR_MUTATION);

  // Save/Unsave Mutations
  const [saveTour] = useMutation(SAVE_TOUR_MUTATION);
  const [unsaveTour] = useMutation(UNSAVE_TOUR_MUTATION);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="85vh">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error || !data?.tour) {
    return (
      <Container sx={{ py: 8 }}>
        <Alert severity="error">Tour not found or error fetching details: {error?.message}</Alert>
      </Container>
    );
  }

  const tour = data.tour;
  const isBookmarked = user?.savedTours?.some((t) => t.id === tour.id);

  const handleBookmarkToggle = async () => {
    if (!user) {
      navigate('/login');
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
      navigate('/login');
      return;
    }
    if (user.role !== 'TOURIST') {
      setBookingError('Only users registered as Tourists can book tours.');
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

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Gallery Header */}
      <Box position="relative" borderRadius={4} overflow="hidden" height={{ xs: 260, md: 460 }} mb={4}>
        <img
          src={tour.images[0] || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'}
          alt={tour.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <Box
          position="absolute"
          top={16}
          right={16}
          bgcolor="rgba(255,255,255,0.9)"
          borderRadius="50%"
          boxShadow={3}
        >
          <IconButton onClick={handleBookmarkToggle}>
            {isBookmarked ? <BookmarkIcon color="primary" /> : <BookmarkBorderIcon />}
          </IconButton>
        </Box>
      </Box>

      {/* Main Grid: Info vs Sticky Booking Form */}
      <Grid container spacing={4}>
        {/* Detail Panel */}
        <Grid item xs={12} md={8}>
          <Box display="flex" flexDirection="column" gap={2} mb={4}>
            <Box display="flex" gap={1.5} flexWrap="wrap">
              <Chip label={tour.category} color="primary" variant="outlined" sx={{ fontWeight: 600 }} />
              <Chip label={`${tour.duration} Days`} color="secondary" variant="outlined" sx={{ fontWeight: 600 }} />
            </Box>
            <Typography variant="h3" fontWeight={850}>
              {tour.title}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              📍 Starts from <strong>{tour.departureCity}</strong> &bull; Exploring <strong>{tour.destinationCity}</strong>
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Quick Metrics Bar */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3 }} variant="outlined">
                <LocalOfferIcon color="primary" sx={{ fontSize: 28, mb: 0.5 }} />
                <Typography variant="caption" display="block" color="text.secondary">PRICE</Typography>
                <Typography variant="subtitle1" fontWeight={750}>PKR {tour.price.toLocaleString()}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3 }} variant="outlined">
                <AccessTimeIcon color="primary" sx={{ fontSize: 28, mb: 0.5 }} />
                <Typography variant="caption" display="block" color="text.secondary">DURATION</Typography>
                <Typography variant="subtitle1" fontWeight={750}>{tour.duration} Days</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3 }} variant="outlined">
                <GroupsIcon color="primary" sx={{ fontSize: 28, mb: 0.5 }} />
                <Typography variant="caption" display="block" color="text.secondary">CAPACITY</Typography>
                <Typography variant="subtitle1" fontWeight={750}>{tour.capacity} Seats</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3 }} variant="outlined">
                <CalendarTodayIcon color="primary" sx={{ fontSize: 28, mb: 0.5 }} />
                <Typography variant="caption" display="block" color="text.secondary">DATE</Typography>
                <Typography variant="subtitle1" fontWeight={750}>
                  {new Date(tour.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Detailed Accordions */}
          <Box display="flex" flexDirection="column" gap={2}>
            <Accordion defaultExpanded sx={{ border: '1px solid #E2EBE5', boxShadow: 'none' }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" fontWeight={700}>Overview & Description</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                  {tour.description}
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion sx={{ border: '1px solid #E2EBE5', boxShadow: 'none' }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" fontWeight={700}>Itinerary Plan</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {tour.itinerary?.length > 0 ? (
                  <Box display="flex" flexDirection="column" gap={3}>
                    {tour.itinerary.map((step, idx) => (
                      <Box key={idx} display="flex" gap={2}>
                        <Box
                          bgcolor="primary.main"
                          color="white"
                          borderRadius="50%"
                          width={32}
                          height={32}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          fontWeight={700}
                          flexShrink={0}
                        >
                          {idx + 1}
                        </Box>
                        <Typography variant="body1" sx={{ mt: 0.5, lineHeight: 1.6 }}>
                          {step}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">Itinerary details will be shared by the guide.</Typography>
                )}
              </AccordionDetails>
            </Accordion>

            <Accordion sx={{ border: '1px solid #E2EBE5', boxShadow: 'none' }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" fontWeight={700}>Services Included & Excluded</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" fontWeight={700} color="primary" mb={1}>✅ Included</Typography>
                    {tour.includedServices?.map((item, i) => (
                      <Typography key={i} variant="body2" sx={{ mb: 0.8 }}>&bull; {item}</Typography>
                    ))}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" fontWeight={700} color="error" mb={1}>❌ Excluded</Typography>
                    {tour.excludedServices?.map((item, i) => (
                      <Typography key={i} variant="body2" sx={{ mb: 0.8 }}>&bull; {item}</Typography>
                    ))}
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            <Accordion sx={{ border: '1px solid #E2EBE5', boxShadow: 'none' }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" fontWeight={700}>Frequently Asked Questions (FAQs)</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {tour.faqs?.length > 0 ? (
                  tour.faqs.map((faq, i) => (
                    <Box key={i} mb={2}>
                      <Typography variant="subtitle2" fontWeight={700} color="secondary">{faq.question}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{faq.answer}</Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">No FAQs currently provided.</Typography>
                )}
              </AccordionDetails>
            </Accordion>
          </Box>

          {/* Reviews List */}
          <Box mt={6}>
            <Typography variant="h5" fontWeight={800} mb={3}>
              Tour Reviews
            </Typography>
            {reviewData?.reviews?.reviews?.length > 0 ? (
              <Box display="flex" flexDirection="column" gap={3}>
                {reviewData.reviews.reviews.map((rev) => (
                  <Paper key={rev.id} sx={{ p: 3, borderRadius: 3 }} variant="outlined">
                    <Box display="flex" gap={2} mb={2} alignItems="center">
                      <Avatar src={rev.tourist.profilePicture} alt={rev.tourist.name} />
                      <Box>
                        <Typography variant="body1" fontWeight={700}>{rev.tourist.name}</Typography>
                        <Rating value={rev.rating} readOnly size="small" precision={0.5} />
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontStyle: 'italic' }}>
                      "{rev.comment}"
                    </Typography>
                  </Paper>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">No reviews yet. Be the first to book and rate this tour!</Typography>
            )}
          </Box>
        </Grid>

        {/* Sticky Booking Form / Sidebar */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={3}
            sx={{
              p: 3.5,
              borderRadius: 4,
              border: '1px solid #E2EBE5',
              position: 'sticky',
              top: 100,
            }}
          >
            <Typography variant="h5" fontWeight={800} color="secondary" gutterBottom>
              Book This Tour
            </Typography>
            <Box display="flex" alignItems="baseline" gap={0.5} mb={3}>
              <Typography variant="h4" fontWeight={800} color="primary">
                PKR {tour.price.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                / person
              </Typography>
            </Box>

            {bookingSuccess && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Booking placed successfully! View status in your dashboard.
              </Alert>
            )}
            {bookingError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {bookingError}
              </Alert>
            )}

            <form onSubmit={handleBookingSubmit}>
              <Box display="flex" flexDirection="column" gap={2.5}>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">DATE</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {new Date(tour.startDate).toLocaleDateString()} - {new Date(tour.endDate).toLocaleDateString()}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">AVAILABILITY</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {tour.availableSeats} seats remaining
                  </Typography>
                </Box>

                <TextField
                  fullWidth
                  label="Special Notes / Requests"
                  multiline
                  rows={3}
                  placeholder="e.g. dietary requests, pickup preference"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={matchOptIn}
                      onChange={(e) => setMatchOptIn(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" color="text.secondary">
                      Opt-in to <strong>Travel Companion Matching</strong> to find matching travel partners.
                    </Typography>
                  }
                />

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  disabled={bookingLoading || tour.availableSeats <= 0}
                  sx={{ py: 1.5 }}
                >
                  {bookingLoading ? 'Processing...' : tour.availableSeats <= 0 ? 'Fully Booked' : 'Book Now'}
                </Button>
              </Box>
            </form>

            <Divider sx={{ my: 3 }} />
            <Typography variant="caption" color="text.secondary" display="block">
              Cancellation Policy: {tour.cancellationPolicy || 'Flexible'}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default TourDetails;
