import React from 'react';
import { Card, CardMedia, CardContent, Typography, Box, Chip, Button } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { Link } from 'react-router-dom';

const TourCard = ({ tour }) => {
  const coverImage = tour.images?.length > 0
    ? tour.images[0]
    : 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80';

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: '0px 12px 24px rgba(11, 37, 24, 0.08)',
        },
      }}
    >
      {/* Price Tag Overlay */}
      <Box
        position="absolute"
        top={16}
        left={16}
        zIndex={2}
        bgcolor="primary.main"
        color="white"
        px={2}
        py={0.7}
        borderRadius={4}
        fontWeight={700}
        boxShadow="0px 4px 10px rgba(0,0,0,0.15)"
      >
        PKR {tour.price.toLocaleString()}
      </Box>

      <CardMedia
        component="img"
        height="220"
        image={coverImage}
        alt={tour.title}
        sx={{ filter: 'brightness(0.95)' }}
      />

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1.5, p: 3 }}>
        {/* Category & Duration Row */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Chip
            label={tour.category}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 600, fontSize: '0.75rem' }}
          />
          <Box display="flex" alignItems="center" gap={0.5} color="text.secondary">
            <AccessTimeIcon sx={{ fontSize: 16 }} />
            <Typography variant="caption" fontWeight={600}>
              {tour.duration} {tour.duration > 1 ? 'Days' : 'Day'}
            </Typography>
          </Box>
        </Box>

        {/* Title */}
        <Typography variant="h6" fontWeight={700} sx={{ lineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden', height: 52 }}>
          {tour.title}
        </Typography>

        {/* Departure & Destination info */}
        <Box display="flex" flexDirection="column" gap={0.8} mt={1}>
          <Box display="flex" alignItems="center" gap={0.8} color="text.secondary">
            <LocationOnIcon sx={{ fontSize: 18, color: 'primary.main' }} />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {tour.departureCity} &rarr; {tour.destinationCity}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={0.8} color="text.secondary">
            <CalendarTodayIcon sx={{ fontSize: 16 }} />
            <Typography variant="caption" sx={{ fontWeight: 500 }}>
              Starts: {new Date(tour.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </Typography>
          </Box>
        </Box>

        {/* Buttons / Actions */}
        <Box mt="auto" pt={2} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            {tour.availableSeats} seats left
          </Typography>
          <Button
            component={Link}
            to={`/tour/${tour.id}`}
            variant="contained"
            color="primary"
            size="small"
            sx={{ borderRadius: 4 }}
          >
            Explore
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TourCard;
