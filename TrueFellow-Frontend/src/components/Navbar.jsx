import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation } from '@apollo/client/react';
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
  ListItem,
  ListItemText,
  Paper,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ChatIcon from '@mui/icons-material/Chat';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import {
  MY_NOTIFICATIONS_QUERY,
  MARK_NOTIFICATION_READ_MUTATION,
  MARK_ALL_NOTIFICATIONS_READ_MUTATION,
  ME_QUERY,
} from '../graphql/operations';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorElProfile, setAnchorElProfile] = useState(null);
  const [anchorElNotifications, setAnchorElNotifications] = useState(null);

  // Notifications query
  const { data: notifData, refetch: refetchNotifs } = useQuery(MY_NOTIFICATIONS_QUERY, {
    variables: { page: 1, limit: 5, unreadOnly: true },
    skip: !user,
    pollInterval: 10000, // Poll notifications every 10s
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
        navigate(user.role === 'TOURIST' ? '/dashboard' : user.role === 'ORGANIZER' ? '/organizer' : '/admin');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogoutClick = () => {
    handleProfileMenuClose();
    logout();
    navigate('/');
  };

  const getDashboardRoute = () => {
    if (user?.role === 'ADMIN') return '/admin';
    if (user?.role === 'ORGANIZER') return '/organizer';
    return '/dashboard';
  };

  return (
    <AppBar position="sticky" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Brand Logo */}
        <Typography
          variant="h5"
          component={Link}
          to="/"
          sx={{
            fontWeight: 800,
            textDecoration: 'none',
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          True<span style={{ color: '#0B2518' }}>Fellow</span>
        </Typography>

        {/* Action Buttons & Profile */}
        <Box display="flex" alignItems="center" gap={1.5}>
          {user ? (
            <>
              {/* Messages shortcut */}
              <IconButton onClick={() => navigate(getDashboardRoute())} color="inherit">
                <ChatIcon color="secondary" />
              </IconButton>

              {/* Notifications Trigger */}
              <IconButton onClick={handleNotificationsOpen} color="inherit">
                <Badge badgeContent={notifData?.myNotifications?.unreadCount || 0} color="error">
                  <NotificationsIcon color="secondary" />
                </Badge>
              </IconButton>

              {/* Notifications Dropdown Menu */}
              <Menu
                anchorEl={anchorElNotifications}
                open={Boolean(anchorElNotifications)}
                onClose={handleNotificationsClose}
                PaperProps={{
                  sx: { width: 340, maxHeight: 400, mt: 1.5, borderRadius: 3 },
                }}
              >
                <Box px={2} py={1} display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle2" fontWeight={700}>
                    Notifications
                  </Typography>
                  {notifData?.myNotifications?.unreadCount > 0 && (
                    <Button size="small" onClick={handleMarkAllRead}>
                      Mark all read
                    </Button>
                  )}
                </Box>
                <Divider />
                <List sx={{ py: 0 }}>
                  {notifData?.myNotifications?.notifications?.length > 0 ? (
                    notifData.myNotifications.notifications.map((notif) => (
                      <ListItem
                        button
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        sx={{
                          borderBottom: '1px solid #f0f0f0',
                          backgroundColor: notif.isRead ? 'transparent' : 'rgba(74, 122, 55, 0.05)',
                        }}
                      >
                        <ListItemText
                          primary={notif.title}
                          secondary={notif.message}
                          primaryTypographyProps={{ variant: 'body2', fontWeight: notif.isRead ? 500 : 700 }}
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
                      </ListItem>
                    ))
                  ) : (
                    <Box py={4} textAlign="center">
                      <Typography variant="body2" color="text.secondary">
                        No new notifications
                      </Typography>
                    </Box>
                  )}
                </List>
              </Menu>

              {/* Profile Avatar & Menu */}
              <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0 }}>
                <Avatar
                  src={user.profilePicture}
                  alt={user.name}
                  sx={{ width: 40, height: 40, border: '2px solid #4A7A37' }}
                >
                  {user.name.charAt(0)}
                </Avatar>
              </IconButton>

              <Menu
                anchorEl={anchorElProfile}
                open={Boolean(anchorElProfile)}
                onClose={handleProfileMenuClose}
                PaperProps={{
                  sx: { width: 220, mt: 1.5, borderRadius: 3 },
                }}
              >
                <Box px={2} py={1.5}>
                  <Typography variant="body1" fontWeight={700}>
                    {user.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.role}
                  </Typography>
                </Box>
                <Divider />
                <MenuItem onClick={() => { handleProfileMenuClose(); navigate(getDashboardRoute()); }}>
                  Dashboard
                </MenuItem>
                {user.role === 'TOURIST' && (
                  <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/apply-organizer'); }}>
                    Apply as Organizer
                  </MenuItem>
                )}
                <Divider />
                <MenuItem onClick={handleLogoutClick} sx={{ color: 'error.main' }}>
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button component={Link} to="/login" variant="text" color="secondary">
                Login
              </Button>
              <Button component={Link} to="/register" variant="contained" color="primary">
                Sign Up
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
