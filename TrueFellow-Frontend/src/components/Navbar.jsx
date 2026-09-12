import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation } from '@apollo/client/react';
import { getImageUrl, DEFAULT_AVATAR } from '../utils/imageUrl';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Drawer,
  Chip,
  Tooltip,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ChatIcon from '@mui/icons-material/Chat';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ExploreIcon from '@mui/icons-material/Explore';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import LogoutIcon from '@mui/icons-material/Logout';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CircleIcon from '@mui/icons-material/Circle';
import TerrainIcon from '@mui/icons-material/Terrain';

import {
  MY_NOTIFICATIONS_QUERY,
  MARK_NOTIFICATION_READ_MUTATION,
  MARK_ALL_NOTIFICATIONS_READ_MUTATION,
} from '../graphql/operations';

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorElProfile, setAnchorElProfile] = useState(null);
  const [anchorElNotifications, setAnchorElNotifications] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Notifications query
  const { data: notifData, refetch: refetchNotifs } = useQuery(MY_NOTIFICATIONS_QUERY, {
    variables: { page: 1, limit: 5, unreadOnly: true },
    skip: !user,
    pollInterval: 10000,
  });

  const [markRead] = useMutation(MARK_NOTIFICATION_READ_MUTATION);
  const [markAllRead] = useMutation(MARK_ALL_NOTIFICATIONS_READ_MUTATION);

  const handleProfileMenuOpen = (e) => setAnchorElProfile(e.currentTarget);
  const handleProfileMenuClose = () => setAnchorElProfile(null);

  const handleNotificationsOpen = (e) => {
    setAnchorElNotifications(e.currentTarget);
    refetchNotifs();
  };
  const handleNotificationsClose = () => setAnchorElNotifications(null);

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      refetchNotifs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (notif) => {
    try {
      await markRead({ variables: { notificationId: notif.id } });
      refetchNotifs();
      handleNotificationsClose();
      if (notif.metadata?.tourId) {
        navigate(`/tour/${notif.metadata.tourId}`);
      } else {
        navigate(user?.role === 'TOURIST' ? '/dashboard' : user?.role === 'ORGANIZER' ? '/organizer' : user?.role === 'ADMIN' ? '/admin' : '/');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogoutClick = () => {
    handleProfileMenuClose();
    setMobileOpen(false);
    logout();
    navigate('/');
  };

  const getDashboardRoute = () => {
    if (user?.role === 'ADMIN') return '/admin';
    if (user?.role === 'ORGANIZER') return '/organizer';
    return '/dashboard';
  };

  const isCurrentRoute = (path) => location.pathname === path;

  return (
    <AppBar position="sticky" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 4 }, py: 0.5 }}>
        {/* Brand Logo with Mountain Icon */}
        <Box
          component={Link}
          to="/"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.2,
            textDecoration: 'none',
          }}
        >
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2.5,
              background: 'linear-gradient(135deg, #2D6A4F 0%, #1B4332 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 4px 12px rgba(45, 106, 79, 0.3)',
            }}
          >
            <TerrainIcon sx={{ fontSize: 22 }} />
          </Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            True<Box component="span" sx={{ color: 'secondary.main' }}>Fellow</Box>
          </Typography>
        </Box>

        {/* Desktop Navigation Links */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
          <Button
            component={Link}
            to="/"
            startIcon={<ExploreIcon sx={{ fontSize: 18 }} />}
            sx={{
              fontWeight: isCurrentRoute('/') ? 700 : 500,
              color: isCurrentRoute('/') ? 'primary.main' : 'text.secondary',
              backgroundColor: isCurrentRoute('/') ? 'rgba(45, 106, 79, 0.08)' : 'transparent',
              borderRadius: 3,
              px: 2,
              '&:hover': {
                backgroundColor: 'rgba(45, 106, 79, 0.08)',
                color: 'primary.main',
              },
            }}
          >
            Explore Tours
          </Button>

          {user && (
            <Button
              component={Link}
              to={getDashboardRoute()}
              startIcon={<DashboardIcon sx={{ fontSize: 18 }} />}
              sx={{
                fontWeight: isCurrentRoute(getDashboardRoute()) ? 700 : 500,
                color: isCurrentRoute(getDashboardRoute()) ? 'primary.main' : 'text.secondary',
                backgroundColor: isCurrentRoute(getDashboardRoute()) ? 'rgba(45, 106, 79, 0.08)' : 'transparent',
                borderRadius: 3,
                px: 2,
                '&:hover': {
                  backgroundColor: 'rgba(45, 106, 79, 0.08)',
                  color: 'primary.main',
                },
              }}
            >
              Dashboard
            </Button>
          )}
        </Box>

        {/* Action Buttons & Profile (Desktop) */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1.5 }}>
          {user ? (
            <>
              {/* Messages shortcut */}
              <Tooltip title="Messages" arrow>
                <IconButton
                  onClick={() => navigate(`${getDashboardRoute()}?tab=messages`)}
                  sx={{
                    bgcolor: 'rgba(45, 106, 79, 0.05)',
                    '&:hover': { bgcolor: 'rgba(45, 106, 79, 0.12)' },
                  }}
                >
                  <ChatIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                </IconButton>
              </Tooltip>

              {/* Notifications Trigger */}
              <Tooltip title="Notifications" arrow>
                <IconButton
                  onClick={handleNotificationsOpen}
                  sx={{
                    bgcolor: 'rgba(45, 106, 79, 0.05)',
                    '&:hover': { bgcolor: 'rgba(45, 106, 79, 0.12)' },
                  }}
                >
                  <Badge
                    badgeContent={notifData?.myNotifications?.unreadCount || 0}
                    color="error"
                    sx={{
                      '& .MuiBadge-badge': {
                        fontSize: '0.7rem',
                        height: 18,
                        minWidth: 18,
                      },
                    }}
                  >
                    <NotificationsIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                  </Badge>
                </IconButton>
              </Tooltip>

              {/* Notifications Dropdown Menu */}
              <Menu
                anchorEl={anchorElNotifications}
                open={Boolean(anchorElNotifications)}
                onClose={handleNotificationsClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                  sx: {
                    width: 360,
                    maxHeight: 440,
                    mt: 1.5,
                    borderRadius: 3,
                    border: '1px solid #E4EDE6',
                    boxShadow: '0 12px 36px rgba(8, 28, 21, 0.12)',
                  },
                }}
              >
                <Box sx={{ px: 2.5, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1" fontWeight={750}>
                      Notifications
                    </Typography>
                    {notifData?.myNotifications?.unreadCount > 0 && (
                      <Chip
                        label={`${notifData.myNotifications.unreadCount} new`}
                        size="small"
                        color="primary"
                        sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700 }}
                      />
                    )}
                  </Box>
                  {notifData?.myNotifications?.unreadCount > 0 && (
                    <Button
                      size="small"
                      startIcon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                      onClick={handleMarkAllRead}
                      sx={{ fontSize: '0.75rem', p: '2px 8px' }}
                    >
                      Mark all read
                    </Button>
                  )}
                </Box>
                <Divider />
                <List sx={{ py: 0, maxHeight: 340, overflowY: 'auto' }}>
                  {notifData?.myNotifications?.notifications?.length > 0 ? (
                    notifData.myNotifications.notifications.map((notif) => (
                      <ListItemButton
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        sx={{
                          py: 1.5,
                          px: 2.5,
                          borderBottom: '1px solid #F0F4F1',
                          backgroundColor: notif.isRead ? 'transparent' : 'rgba(45, 106, 79, 0.04)',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 1.5,
                        }}
                      >
                        {!notif.isRead && (
                          <CircleIcon
                            sx={{
                              fontSize: 8,
                              color: 'primary.main',
                              mt: 0.8,
                              flexShrink: 0,
                            }}
                          />
                        )}
                        <ListItemText
                          primary={notif.title}
                          secondary={
                            <Box component="span" sx={{ display: 'flex', flexDirection: 'column', gap: 0.3, mt: 0.3 }}>
                              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.82rem' }}>
                                {notif.message}
                              </Typography>
                              {notif.createdAt && (
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                  {formatTimeAgo(notif.createdAt)}
                                </Typography>
                              )}
                            </Box>
                          }
                          primaryTypographyProps={{
                            variant: 'subtitle2',
                            fontWeight: notif.isRead ? 600 : 750,
                            color: 'text.primary',
                          }}
                        />
                      </ListItemButton>
                    ))
                  ) : (
                    <Box sx={{ py: 5, textAlign: 'center' }}>
                      <NotificationsIcon sx={{ fontSize: 40, color: 'text.secondary', opacity: 0.3, mb: 1 }} />
                      <Typography variant="body2" fontWeight={600} color="text.secondary">
                        You're all caught up!
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        No unread notifications at this time.
                      </Typography>
                    </Box>
                  )}
                </List>
              </Menu>

              {/* Profile Avatar & Menu */}
              <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0.5 }}>
                <Avatar
                  src={getImageUrl(user.profilePicture, DEFAULT_AVATAR)}
                  alt={user.name}
                  sx={{
                    width: 40,
                    height: 40,
                    border: '2px solid #2D6A4F',
                    boxShadow: '0 2px 8px rgba(45, 106, 79, 0.2)',
                  }}
                >
                  {user.name?.charAt(0)}
                </Avatar>
              </IconButton>

              <Menu
                anchorEl={anchorElProfile}
                open={Boolean(anchorElProfile)}
                onClose={handleProfileMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                  sx: {
                    width: 240,
                    mt: 1.5,
                    borderRadius: 3,
                    border: '1px solid #E4EDE6',
                    boxShadow: '0 12px 36px rgba(8, 28, 21, 0.12)',
                  },
                }}
              >
                <Box px={2.5} py={2}>
                  <Typography variant="subtitle1" fontWeight={750} noWrap>
                    {user.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" noWrap mb={0.8}>
                    {user.email}
                  </Typography>
                  <Chip
                    label={user.role}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700 }}
                  />
                </Box>
                <Divider />
                <MenuItem
                  onClick={() => { handleProfileMenuClose(); navigate(getDashboardRoute()); }}
                  sx={{ py: 1.2, gap: 1.5 }}
                >
                  <DashboardIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  Dashboard
                </MenuItem>
                {user.role === 'TOURIST' && (
                  <MenuItem
                    onClick={() => { handleProfileMenuClose(); navigate('/apply-organizer'); }}
                    sx={{ py: 1.2, gap: 1.5 }}
                  >
                    <AssignmentIndIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    Apply as Organizer
                  </MenuItem>
                )}
                <Divider />
                <MenuItem onClick={handleLogoutClick} sx={{ color: 'error.main', py: 1.2, gap: 1.5 }}>
                  <LogoutIcon sx={{ fontSize: 18 }} />
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Button
                component={Link}
                to="/login"
                variant="text"
                color="secondary"
                sx={{ fontWeight: 600 }}
              >
                Login
              </Button>
              <Button
                component={Link}
                to="/register"
                variant="contained"
                color="primary"
                sx={{
                  fontWeight: 600,
                  boxShadow: '0 4px 14px rgba(45, 106, 79, 0.3)',
                }}
              >
                Sign Up
              </Button>
            </Box>
          )}
        </Box>

        {/* Mobile Hamburger Menu & Notifications Toggle */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1 }}>
          {user && (
            <IconButton onClick={handleNotificationsOpen} color="inherit" size="small">
              <Badge badgeContent={notifData?.myNotifications?.unreadCount || 0} color="error">
                <NotificationsIcon sx={{ color: 'secondary.main' }} />
              </Badge>
            </IconButton>
          )}
          <IconButton
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{
              bgcolor: 'rgba(45, 106, 79, 0.08)',
              '&:hover': { bgcolor: 'rgba(45, 106, 79, 0.15)' },
            }}
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
        </Box>
      </Toolbar>

      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{
          sx: {
            width: 290,
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            backgroundColor: '#FAFCF9',
          },
        }}
      >
        {user ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8, pb: 1.5 }}>
            <Avatar
              src={getImageUrl(user.profilePicture, DEFAULT_AVATAR)}
              alt={user.name}
              sx={{ width: 48, height: 48, border: '2px solid #2D6A4F' }}
            />
            <Box>
              <Typography variant="subtitle1" fontWeight={750} noWrap>
                {user.name}
              </Typography>
              <Chip
                label={user.role}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700, mt: 0.3 }}
              />
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TerrainIcon color="primary" sx={{ fontSize: 28 }} />
            <Typography variant="h6" fontWeight={800} color="primary">
              TrueFellow
            </Typography>
          </Box>
        )}
        <Divider />
        <Button
          component={Link}
          to="/"
          onClick={() => setMobileOpen(false)}
          fullWidth
          startIcon={<ExploreIcon />}
          variant={isCurrentRoute('/') ? 'contained' : 'text'}
          color="primary"
          sx={{ justifyContent: 'flex-start', py: 1 }}
        >
          Explore Tours
        </Button>
        {user ? (
          <>
            <Button
              onClick={() => { setMobileOpen(false); navigate(getDashboardRoute()); }}
              fullWidth
              startIcon={<DashboardIcon />}
              variant={isCurrentRoute(getDashboardRoute()) ? 'contained' : 'text'}
              color="primary"
              sx={{ justifyContent: 'flex-start', py: 1 }}
            >
              Dashboard
            </Button>
            <Button
              onClick={() => { setMobileOpen(false); navigate(`${getDashboardRoute()}?tab=messages`); }}
              fullWidth
              startIcon={<ChatIcon />}
              variant="text"
              sx={{ justifyContent: 'flex-start', py: 1 }}
            >
              Messages
            </Button>
            {user.role === 'TOURIST' && (
              <Button
                onClick={() => { setMobileOpen(false); navigate('/apply-organizer'); }}
                fullWidth
                startIcon={<AssignmentIndIcon />}
                variant="text"
                sx={{ justifyContent: 'flex-start', py: 1 }}
              >
                Apply as Organizer
              </Button>
            )}
            <Divider sx={{ my: 1 }} />
            <Button
              onClick={handleLogoutClick}
              fullWidth
              color="error"
              variant="outlined"
              startIcon={<LogoutIcon />}
              sx={{ mt: 'auto' }}
            >
              Logout
            </Button>
          </>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2 }}>
            <Button
              component={Link}
              to="/login"
              onClick={() => setMobileOpen(false)}
              fullWidth
              variant="outlined"
              color="secondary"
              sx={{ py: 1 }}
            >
              Login
            </Button>
            <Button
              component={Link}
              to="/register"
              onClick={() => setMobileOpen(false)}
              fullWidth
              variant="contained"
              color="primary"
              sx={{ py: 1 }}
            >
              Sign Up
            </Button>
          </Box>
        )}
      </Drawer>
    </AppBar>
  );
};

export default Navbar;
