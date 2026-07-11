import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { useAuth } from '../context/AuthContext';
import ImageUpload from '../components/ImageUpload';
import {
  MY_BOOKINGS_QUERY,
  CANCEL_BOOKING_MUTATION,
  TOGGLE_COMPANION_MATCHING_ON_BOOKING_MUTATION,
  MATCH_COMPANIONS_QUERY,
  UPDATE_PROFILE_MUTATION,
  WRITE_REVIEW_MUTATION,
  MY_CONVERSATIONS_QUERY,
  CONVERSATION_QUERY,
  SEND_MESSAGE_MUTATION,
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
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
} from '@mui/material';

const TouristDashboard = () => {
  const { user, updateUserProfile, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState(0);

  // Tab change
  const handleTabChange = (_, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box display="flex" gap={2} alignItems="center" mb={4}>
        <Avatar src={user?.profilePicture} alt={user?.name} sx={{ width: 64, height: 64 }} />
        <Box>
          <Typography variant="h4" fontWeight={800}>{user?.name}</Typography>
          <Typography variant="body2" color="text.secondary">Tourist Dashboard &bull; {user?.email}</Typography>
        </Box>
      </Box>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: '1px solid #E2EBE5', px: 2, py: 1 }}
        >
          <Tab label="My Bookings" />
          <Tab label="Companion Matching" />
          <Tab label="Saved Tours" />
          <Tab label="Profile & Preferences" />
          <Tab label="Messages" />
        </Tabs>

        <Box p={4} bgcolor="#fafafa" minHeight="50vh">
          {activeTab === 0 && <BookingsTab />}
          {activeTab === 1 && <CompanionTab />}
          {activeTab === 2 && <SavedToursTab />}
          {activeTab === 3 && <ProfileTab user={user} update={updateUserProfile} />}
          {activeTab === 4 && <MessagesTab user={user} />}
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
  });
  const [cancelBooking] = useMutation(CANCEL_BOOKING_MUTATION);
  const [toggleMatching] = useMutation(TOGGLE_COMPANION_MATCHING_ON_BOOKING_MUTATION);

  // Review Dialog state
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

  const [writeReview] = useMutation(WRITE_REVIEW_MUTATION);

  if (loading) return <CircularProgress color="primary" />;
  if (error) return <Alert severity="error">{error.message}</Alert>;

  const bookings = data?.myBookings?.bookings || [];

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await cancelBooking({ variables: { bookingId } });
      refetch();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleMatching = async (bookingId, enabled) => {
    try {
      await toggleMatching({ variables: { bookingId, enabled } });
      refetch();
    } catch (err) {
      alert(err.message);
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
      alert('Review posted successfully!');
      handleCloseReview();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={750} mb={3}>Active & Past Bookings</Typography>
      {bookings.length > 0 ? (
        <Grid container spacing={3}>
          {bookings.map((b) => (
            <Grid item key={b.id} xs={12}>
              <Card sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
                <img
                  src={b.tour.images[0] || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80'}
                  alt={b.tour.title}
                  style={{ width: '100%', maxWidth: 220, objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                    <Typography variant="h6" fontWeight={750}>{b.tour.title}</Typography>
                    <Chip
                      label={b.status}
                      color={
                        b.status === 'CONFIRMED' ? 'success' :
                        b.status === 'COMPLETED' ? 'primary' :
                        'error'
                      }
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Destination: {b.tour.destinationCity} &bull; Date: {new Date(b.tour.startDate).toLocaleDateString()}
                  </Typography>

                  {b.status === 'CONFIRMED' && (
                    <Box display="flex" alignItems="center" gap={3} mt={1}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={b.companionMatchingEnabled}
                            onChange={(e) => handleToggleMatching(b.id, e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Companion Matching"
                      />
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleCancel(b.id)}
                      >
                        Cancel Ticket
                      </Button>
                    </Box>
                  )}

                  {b.status === 'COMPLETED' && (
                    <Box mt={1}>
                      <Button variant="contained" color="primary" size="small" onClick={() => handleOpenReview(b)}>
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
        <Typography variant="body1" color="text.secondary">No bookings found.</Typography>
      )}

      {/* Review Dialog */}
      <Dialog open={reviewOpen} onClose={handleCloseReview} fullWidth maxWidth="sm">
        <DialogTitle>Write a Review for {reviewTour?.title}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          <Box display="flex" gap={1} alignItems="center">
            <Typography>Overall Rating:</Typography>
            <Rating value={rating} onChange={(_, val) => setRating(val)} />
          </Box>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Comment"
            placeholder="Share your travel experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2" fontWeight={700}>Aspect Ratings (1 - 5):</Typography>
          {Object.keys(aspects).map((aspect) => (
            <Box key={aspect} display="flex" justifyContent="space-between" alignItems="center">
              <Typography sx={{ textTransform: 'capitalize' }}>{aspect}:</Typography>
              <Rating
                value={aspects[aspect]}
                onChange={(_, val) => setAspects((prev) => ({ ...prev, [aspect]: val }))}
              />
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReview}>Cancel</Button>
          <Button onClick={handleReviewSubmit} variant="contained" color="primary">Submit Review</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// 2. Companion Matching Tab
const CompanionTab = () => {
  const { data: bookingsData } = useQuery(MY_BOOKINGS_QUERY, { variables: { page: 1, limit: 10, status: 'CONFIRMED' } });
  const [selectedTourId, setSelectedTourId] = useState('');

  const { data: matchesData, loading } = useQuery(MATCH_COMPANIONS_QUERY, {
    variables: { tourId: selectedTourId },
    skip: !selectedTourId,
  });

  const bookings = bookingsData?.myBookings?.bookings || [];

  return (
    <Box>
      <Typography variant="h5" fontWeight={750} mb={3}>Find Travel Companions</Typography>
      <Box mb={4} maxWidth={400}>
        <TextField
          fullWidth
          select
          label="Select your Confirmed Tour"
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

      {selectedTourId ? (
        loading ? (
          <CircularProgress color="primary" />
        ) : matchesData?.matchCompanions?.length > 0 ? (
          <Grid container spacing={3}>
            {matchesData.matchCompanions.map((match) => (
              <Grid item key={match.user.id} xs={12} md={6}>
                <Card sx={{ border: '1px solid #E2EBE5', position: 'relative' }}>
                  {/* Score badge */}
                  <Box
                    position="absolute"
                    top={12}
                    right={12}
                    bgcolor="primary.light"
                    color="white"
                    px={1.5}
                    py={0.5}
                    borderRadius={3}
                    fontWeight={700}
                    fontSize="0.85rem"
                  >
                    {match.compatibilityScore}% match
                  </Box>

                  <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box display="flex" gap={2} alignItems="center">
                      <Avatar src={match.user.profilePicture} sx={{ width: 48, height: 48 }} />
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700}>{match.user.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Style: {match.user.travelPreferences?.travelStyle || 'Any'}
                        </Typography>
                      </Box>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary">Languages:</Typography>
                      <Box display="flex" gap={0.5} flexWrap="wrap" mt={0.5}>
                        {match.user.travelPreferences?.languages?.map((lang) => (
                          <Chip key={lang} label={lang} size="small" />
                        ))}
                      </Box>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary">Shared Interests:</Typography>
                      <Box display="flex" gap={0.5} flexWrap="wrap" mt={0.5}>
                        {match.sharedInterests.map((interest) => (
                          <Chip key={interest} label={interest} color="primary" size="small" variant="outlined" />
                        ))}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="body1" color="text.secondary">No matching companions found. Make sure you enabled "Companion Matching" on this booking.</Typography>
        )
      ) : (
        <Typography variant="body1" color="text.secondary">Select one of your bookings to view matching companion profiles.</Typography>
      )}
    </Box>
  );
};

// 3. Saved Tours Tab
const SavedToursTab = () => {
  const { user } = useAuth();
  const saved = user?.savedTours || [];

  return (
    <Box>
      <Typography variant="h5" fontWeight={750} mb={3}>Saved Bookmarks</Typography>
      {saved.length > 0 ? (
        <Grid container spacing={3}>
          {saved.map((tour) => (
            <Grid item key={tour.id} xs={12} sm={6}>
              <Card sx={{ border: '1px solid #E2EBE5' }}>
                <img
                  src={tour.images[0] || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80'}
                  alt={tour.title}
                  style={{ width: '100%', height: 160, objectFit: 'cover' }}
                />
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={750} gutterBottom>{tour.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {tour.destinationCity} &bull; PKR {tour.price.toLocaleString()}
                  </Typography>
                  <Button variant="outlined" color="primary" size="small" sx={{ mt: 2 }} href={`/tour/${tour.id}`}>
                    View details
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="body2" color="text.secondary">Your bookmarks list is empty.</Typography>
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

  // Travel preferences
  const [interests, setInterests] = useState(user?.travelPreferences?.interests?.join(', ') || '');
  const [travelStyle, setTravelStyle] = useState(user?.travelPreferences?.travelStyle || 'GROUP');
  const [languages, setLanguages] = useState(user?.travelPreferences?.languages?.join(', ') || '');
  const [minBudget, setMinBudget] = useState(user?.travelPreferences?.budgetRange?.min || 0);
  const [maxBudget, setMaxBudget] = useState(user?.travelPreferences?.budgetRange?.max || 0);

  const [updateProfile] = useMutation(UPDATE_PROFILE_MUTATION);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);

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
                min: parseFloat(minBudget),
                max: parseFloat(maxBudget),
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
      alert(err.message);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h5" fontWeight={750}>Profile Settings</Typography>

      {success && <Alert severity="success">Profile updated successfully!</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4} textAlign="center">
          <ImageUpload
            initialImages={profilePicture ? [profilePicture] : []}
            onUploadSuccess={(url) => setProfilePicture(url)}
          />
        </Grid>

        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={3} label="Short Bio" value={bio} onChange={(e) => setBio(e.target.value)} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h5" fontWeight={750}>Travel Companion Matching Preferences</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Interests (comma separated)"
            placeholder="hiking, photography, camp fire"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            select
            label="Travel Style"
            value={travelStyle}
            onChange={(e) => setTravelStyle(e.target.value)}
          >
            {['SOLO', 'GROUP', 'FAMILY', 'COUPLE', 'ADVENTURE', 'LUXURY', 'BUDGET'].map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Languages Spoken (comma separated)"
            placeholder="English, Urdu, Punjabi"
            value={languages}
            onChange={(e) => setLanguages(e.target.value)}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <TextField
            fullWidth
            type="number"
            label="Min Budget (PKR)"
            value={minBudget}
            onChange={(e) => setMinBudget(e.target.value)}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <TextField
            fullWidth
            type="number"
            label="Max Budget (PKR)"
            value={maxBudget}
            onChange={(e) => setMaxBudget(e.target.value)}
          />
        </Grid>
      </Grid>

      <Button type="submit" variant="contained" color="primary" sx={{ width: 'fit-content', mt: 2 }}>
        Save Profile & Preferences
      </Button>
    </Box>
  );
};

// 5. Messages / Inbox Tab
const MessagesTab = () => {
  const { data: convsData, refetch: refetchConvs } = useQuery(MY_CONVERSATIONS_QUERY);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageText, setMessageText] = useState('');

  const { data: messagesData, refetch: refetchMessages } = useQuery(CONVERSATION_QUERY, {
    variables: { otherUserId: selectedUser?.id },
    skip: !selectedUser,
    pollInterval: 5000,
  });

  const [sendMessage] = useMutation(SEND_MESSAGE_MUTATION);

  const activeThread = messagesData?.conversation?.messages || [];
  const conversations = convsData?.myConversations || [];

  const handleSend = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedUser) return;
    try {
      await sendMessage({
        variables: {
          input: {
            recipientId: selectedUser.id,
            content: messageText.trim(),
          },
        },
      });
      setMessageText('');
      refetchMessages();
      refetchConvs();
    } catch (err) {
      alert(err.message);
    }
  };

  const getPartner = (c) => {
    const isSender = c.sender.id === localStorage.getItem('userId');
    return isSender ? c.recipient : c.sender;
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={750} mb={3}>Messages Inbox</Typography>
      <Grid container spacing={2}>
        {/* Inbox List */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ maxHeight: '60vh', overflowY: 'auto' }} variant="outlined">
            <List>
              {conversations.length > 0 ? (
                conversations.map((c) => {
                  const partner = c.sender; // simplify extraction
                  return (
                    <ListItem
                      button
                      key={c.id}
                      onClick={() => setSelectedUser(partner)}
                      selected={selectedUser?.id === partner.id}
                      sx={{ borderBottom: '1px solid #f0f0f0' }}
                    >
                      <Avatar src={partner.profilePicture} sx={{ mr: 2 }} />
                      <ListItemText primary={partner.name} secondary={c.content} />
                    </ListItem>
                  );
                })
              ) : (
                <Typography textAlign="center" py={4} color="text.secondary">No conversations yet</Typography>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Chat Thread */}
        <Grid item xs={12} md={8}>
          {selectedUser ? (
            <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2, height: '60vh' }} variant="outlined">
              <Box display="flex" alignItems="center" gap={2} mb={1}>
                <Avatar src={selectedUser.profilePicture} />
                <Typography variant="subtitle1" fontWeight={700}>{selectedUser.name}</Typography>
              </Box>
              <Divider />
              <Box sx={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column-reverse', gap: 1.5, px: 1 }}>
                {activeThread.map((msg) => {
                  const isMe = msg.sender.id !== selectedUser.id;
                  return (
                    <Box
                      key={msg.id}
                      alignSelf={isMe ? 'flex-end' : 'flex-start'}
                      bgcolor={isMe ? 'primary.main' : '#f0f0f0'}
                      color={isMe ? 'white' : '#333'}
                      px={2}
                      py={1}
                      borderRadius={3}
                      maxWidth="70%"
                    >
                      <Typography variant="body2">{msg.content}</Typography>
                    </Box>
                  );
                })}
              </Box>
              <Box component="form" onSubmit={handleSend} display="flex" gap={1} mt="auto">
                <TextField
                  fullWidth
                  placeholder="Type a message..."
                  size="small"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                />
                <Button type="submit" variant="contained" color="primary">Send</Button>
              </Box>
            </Paper>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center', height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }} variant="outlined">
              <Typography color="text.secondary">Select a contact to view the chat thread.</Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default TouristDashboard;
