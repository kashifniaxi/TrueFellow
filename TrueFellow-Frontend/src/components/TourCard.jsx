import React, { memo } from 'react';
import { Card, CardMedia, CardContent, Typography, Box, Chip, Button } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { Link } from 'react-router-dom';
import { getImageUrl, DEFAULT_TOUR_COVER } from '../utils/imageUrl';

const TourCard = ({ tour }) => {
  const coverImage = getImageUrl(tour.images?.[0], DEFAULT_TOUR_COVER);

  const seatsLeft = tour.availableSeats ?? (tour.capacity - (tour.bookingsCount || 0));
  const isSoldOut = seatsLeft <= 0;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'TBD';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? 'TBD' : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <Card
      className="animate-fade-in img-zoom-container"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        borderRadius: 4,
        overflow: 'hidden',
        border: '1px solid #E4EDE6',
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease, border-color 0.3s ease',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: '0px 16px 36px rgba(8, 28, 21, 0.1)',
          borderColor: '#B5CCBA',
        },
      }}
    >
      {/* Top Floating Badge Container */}
      <Box
        sx={{
          position: 'absolute',
          top: 14,
          left: 14,
          zIndex: 2,
          background: 'linear-gradient(135deg, rgba(45, 106, 79, 0.95) 0%, rgba(27, 67, 50, 0.95) 100%)',
          backdropFilter: 'blur(8px)',
          color: '#ffffff',
          px: 1.8,
          py: 0.6,
          borderRadius: 3,
          fontWeight: 750,
          fontSize: '0.85rem',
          letterSpacing: '0.02em',
          boxShadow: '0px 4px 14px rgba(8, 28, 21, 0.25)',
        }}
      >
        PKR {tour.price ? tour.price.toLocaleString() : 0}
      </Box>

      {/* Top Right: Category or Sold Out badge */}
      <Box sx={{ position: 'absolute', top: 14, right: 14, zIndex: 2, display: 'flex', gap: 1 }}>
        {isSoldOut ? (
          <Box
            sx={{
              backgroundColor: '#E63946',
              color: 'white',
              px: 1.5,
              py: 0.5,
              borderRadius: 3,
              fontWeight: 750,
              fontSize: '0.72rem',
              letterSpacing: '0.03em',
              boxShadow: '0px 4px 12px rgba(230, 57, 70, 0.35)',
            }}
          >
            SOLD OUT
          </Box>
        ) : (
          <Box
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(8px)',
              color: '#081C15',
              px: 1.4,
              py: 0.5,
              borderRadius: 3,
              fontWeight: 700,
              fontSize: '0.72rem',
              boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid rgba(255,255,255,0.6)',
            }}
          >
            {tour.category}
          </Box>
        )}
      </Box>

      {/* Image with fallback and smooth hover scale */}
      <Box sx={{ position: 'relative', height: 210, overflow: 'hidden', bgcolor: '#eef3ef' }}>
        <CardMedia
          component="img"
          height="210"
          image={coverImage}
          alt={tour.title}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = DEFAULT_TOUR_COVER;
          }}
          sx={{
            objectFit: 'cover',
            width: '100%',
            height: '100%',
          }}
        />
      </Box>

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1.5, p: 2.8 }}>
        {/* Organizer & Duration Row */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
            <VerifiedUserIcon sx={{ fontSize: 15, color: 'primary.main' }} />
            <Typography variant="caption" fontWeight={650} color="primary.main" noWrap sx={{ maxWidth: 150 }}>
              {tour.organizer?.name || 'Verified Guide'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
            <AccessTimeIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
            <Typography variant="caption" fontWeight={600} color="text.secondary">
              {tour.duration} {tour.duration > 1 ? 'Days' : 'Day'}
            </Typography>
          </Box>
        </Box>

        {/* Title */}
        <Typography
          variant="h6"
          fontWeight={750}
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            height: 50,
            lineHeight: 1.3,
            color: '#081C15',
            '&:hover': { color: 'primary.main' },
            transition: 'color 0.2s ease',
          }}
        >
          {tour.title}
        </Typography>

        {/* Departure & Destination info */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, mt: 0.2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: 'text.secondary' }}>
            <LocationOnIcon sx={{ fontSize: 17, color: 'primary.main', flexShrink: 0 }} />
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1B382B' }} noWrap>
              {tour.departureCity} &rarr; {tour.destinationCity}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: 'text.secondary' }}>
            <CalendarTodayIcon sx={{ fontSize: 15, color: 'text.secondary', flexShrink: 0 }} />
            <Typography variant="caption" sx={{ fontWeight: 500, color: 'text.secondary' }}>
              Departs: {formatDate(tour.startDate)}
            </Typography>
          </Box>
        </Box>

        {/* Seats & CTA Action */}
        <Box sx={{ mt: 'auto', pt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F0F4F1' }}>
          <Chip
            label={isSoldOut ? 'Sold Out' : `${seatsLeft} seats left`}
            size="small"
            color={isSoldOut ? 'error' : seatsLeft < 3 ? 'warning' : 'default'}
            sx={{
              fontSize: '0.74rem',
              fontWeight: 650,
              height: 24,
              backgroundColor: isSoldOut ? '#FCEBEB' : seatsLeft < 3 ? '#FDF2E9' : '#EDF4EE',
              color: isSoldOut ? '#C5221F' : seatsLeft < 3 ? '#B76E00' : '#2D6A4F',
              border: 'none',
            }}
          />
          <Button
            component={Link}
            to={`/tour/${tour.id}`}
            variant="contained"
            color={isSoldOut ? 'secondary' : 'primary'}
            size="small"
            endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
            sx={{
              borderRadius: 3,
              px: 2,
              py: 0.6,
              fontSize: '0.82rem',
              fontWeight: 650,
            }}
          >
            Explore
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default memo(TourCard);
