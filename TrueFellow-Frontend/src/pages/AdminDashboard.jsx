import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  ADMIN_DASHBOARD_QUERY,
  PLATFORM_STATS_QUERY,
  PENDING_APPLICATIONS_QUERY,
  APPROVE_ORGANIZER_MUTATION,
  REJECT_ORGANIZER_MUTATION,
  ALL_USERS_QUERY,
  SUSPEND_USER_MUTATION,
  ACTIVATE_USER_MUTATION,
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
  TextField,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  List,
  ListItem,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  MenuItem,
  Pagination,
  Snackbar,
  Alert,
} from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle';
import PeopleIcon from '@mui/icons-material/People';
import TourIcon from '@mui/icons-material/Tour';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import BusinessIcon from '@mui/icons-material/Business';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LanguageIcon from '@mui/icons-material/Language';
import PersonIcon from '@mui/icons-material/Person';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PlaceIcon from '@mui/icons-material/Place';
import CategoryIcon from '@mui/icons-material/Category';
import FilterListIcon from '@mui/icons-material/FilterList';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Admin Header Banner */}
      <Box
        sx={{
          p: 3.5,
          borderRadius: 4,
          background: 'linear-gradient(135deg, rgba(45, 106, 79, 0.08) 0%, rgba(8, 28, 21, 0.05) 100%)',
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
              background: 'linear-gradient(135deg, #081C15 0%, #1B4332 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 4px 14px rgba(8, 28, 21, 0.25)',
            }}
          >
            <AdminPanelSettingsIcon sx={{ fontSize: 32 }} />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <Typography variant="h4" fontWeight={800} color="#081C15">
                Admin Control Board
              </Typography>
              <Chip
                label="SYSTEM SUPERADMIN"
                size="small"
                color="secondary"
                sx={{ height: 22, fontWeight: 700, fontSize: '0.68rem' }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
              Monitor system analytics, review incoming organizer applications, and manage platform users.
            </Typography>
          </Box>
        </Box>
      </Box>

      <Paper sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid #E4EDE6', boxShadow: '0 4px 24px rgba(8, 28, 21, 0.05)' }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: '1px solid #E4EDE6', px: 2, pt: 1, bgcolor: '#FFFFFF' }}
        >
          <Tab icon={<AnalyticsIcon />} iconPosition="start" label="Platform Analytics" />
          <Tab icon={<VerifiedUserIcon />} iconPosition="start" label="Organizer Verification Queue" />
          <Tab icon={<SupervisedUserCircleIcon />} iconPosition="start" label="User Access Controls" />
        </Tabs>

        <Box p={{ xs: 2.5, md: 4 }} bgcolor="#F8FAF7" minHeight="55vh">
          {activeTab === 0 && <StatsTab />}
          {activeTab === 1 && <QueueTab />}
          {activeTab === 2 && <UsersTab />}
        </Box>
      </Paper>
    </Container>
  );
};

// ─── TABS ────────────────────────────────────────────────────────────────────

// 1. Stats Tab
const StatsTab = () => {
  const { data: dbData, loading: dbLoading } = useQuery(ADMIN_DASHBOARD_QUERY, { fetchPolicy: 'cache-and-network' });
  const { data: statsData } = useQuery(PLATFORM_STATS_QUERY, { fetchPolicy: 'cache-and-network' });

  if (dbLoading && !dbData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  const db = dbData?.adminDashboard || {};
  const stats = statsData?.platformStats || {};

  const kpiCards = [
    {
      label: 'Total Registered Users',
      value: db.totalUsers || 0,
      icon: <PeopleIcon sx={{ fontSize: 26 }} />,
      color: '#2D6A4F',
      bg: 'rgba(45, 106, 79, 0.1)',
      border: 'rgba(45, 106, 79, 0.2)',
    },
    {
      label: 'Verified Organizers',
      value: db.totalOrganizers || 0,
      icon: <VerifiedUserIcon sx={{ fontSize: 26 }} />,
      color: '#1B4332',
      bg: 'rgba(27, 67, 50, 0.1)',
      border: 'rgba(27, 67, 50, 0.2)',
    },
    {
      label: 'Active Tourists',
      value: db.totalTourists || 0,
      icon: <SupervisedUserCircleIcon sx={{ fontSize: 26 }} />,
      color: '#52B788',
      bg: 'rgba(82, 183, 136, 0.15)',
      border: 'rgba(82, 183, 136, 0.28)',
    },
    {
      label: 'Pending Organizer Apps',
      value: db.pendingOrganizerApplications || 0,
      icon: <AssignmentIcon sx={{ fontSize: 26 }} />,
      color: '#D97706',
      bg: 'rgba(217, 119, 6, 0.12)',
      border: 'rgba(217, 119, 6, 0.25)',
    },
    {
      label: 'Active Tour Packages',
      value: db.totalTours || 0,
      icon: <TourIcon sx={{ fontSize: 26 }} />,
      color: '#2563EB',
      bg: 'rgba(37, 99, 235, 0.1)',
      border: 'rgba(37, 99, 235, 0.2)',
    },
    {
      label: 'Total Tour Bookings',
      value: db.totalBookings || 0,
      icon: <CheckCircleIcon sx={{ fontSize: 26 }} />,
      color: '#059669',
      bg: 'rgba(5, 150, 105, 0.1)',
      border: 'rgba(5, 150, 105, 0.2)',
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h5" fontWeight={750} color="#081C15">
          Platform Summary & Live Activity
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
          High-level operational stats and booking trends across TrueFellow Pakistan.
        </Typography>
      </Box>

      {/* Metric Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4.5 }}>
        {kpiCards.map((card, idx) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idx}>
            <Paper
              sx={{
                p: 2.5,
                borderRadius: 3.5,
                border: '1px solid #E4EDE6',
                bgcolor: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                gap: 2.2,
                boxShadow: '0 2px 10px rgba(8, 28, 21, 0.03)',
                transition: 'all 0.2s ease',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 18px rgba(8, 28, 21, 0.06)' },
              }}
            >
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: 3,
                  bgcolor: card.bg,
                  color: card.color,
                  border: `1px solid ${card.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {card.icon}
              </Box>
              <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 750,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontSize: '0.72rem',
                    display: 'block',
                    mb: 0.4,
                  }}
                >
                  {card.label}
                </Typography>
                <Typography variant="h4" fontWeight={800} color="#081C15" sx={{ lineHeight: 1.1 }}>
                  {card.value}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Top Destinations & Categories Breakdown */}
      <Grid container spacing={3.5}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, borderRadius: 3.5, border: '1px solid #E4EDE6', bgcolor: '#FFFFFF', boxShadow: '0 2px 10px rgba(8, 28, 21, 0.03)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 2 }}>
              <PlaceIcon color="primary" />
              <Typography variant="h6" fontWeight={750} color="#081C15">
                Top Booked Destinations
              </Typography>
            </Box>
            {stats.topDestinations?.length > 0 ? (
              <List sx={{ py: 0 }}>
                {stats.topDestinations.map((dest, i) => (
                  <ListItem
                    key={i}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: i < stats.topDestinations.length - 1 ? '1px solid #F0F4F1' : 'none',
                      py: 1.8,
                      px: 1.5,
                      borderRadius: 2,
                      transition: 'background-color 0.15s ease',
                      '&:hover': { bgcolor: '#F8FAF7' },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8 }}>
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          bgcolor: 'rgba(45, 106, 79, 0.1)',
                          color: 'primary.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.78rem',
                          flexShrink: 0,
                        }}
                      >
                        {i + 1}
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={750} color="#081C15">
                          {dest.destination}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Northern Route &bull; Verified Package
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={`${dest.bookings || 0} Bookings`}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 700, borderRadius: 2 }}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No destination booking statistics recorded yet.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, borderRadius: 3.5, border: '1px solid #E4EDE6', bgcolor: '#FFFFFF', boxShadow: '0 2px 10px rgba(8, 28, 21, 0.03)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 2 }}>
              <CategoryIcon color="primary" />
              <Typography variant="h6" fontWeight={750} color="#081C15">
                Active Tour Categories
              </Typography>
            </Box>
            {stats.topCategories?.length > 0 ? (
              <List sx={{ py: 0 }}>
                {stats.topCategories.map((cat, i) => (
                  <ListItem
                    key={i}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: i < stats.topCategories.length - 1 ? '1px solid #F0F4F1' : 'none',
                      py: 1.8,
                      px: 1.5,
                      borderRadius: 2,
                      transition: 'background-color 0.15s ease',
                      '&:hover': { bgcolor: '#F8FAF7' },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8 }}>
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: 1.5,
                          bgcolor: 'rgba(45, 106, 79, 0.1)',
                          color: 'primary.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <CategoryIcon sx={{ fontSize: 16 }} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={750} color="#081C15">
                          {cat.category}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Trip Category &bull; Published Departures
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={`${cat.count || 0} Tours`}
                      size="small"
                      color="primary"
                      sx={{ fontWeight: 700, borderRadius: 2 }}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No tour category statistics recorded yet.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

// 2. Queue Tab (Organizer Applications)
const QueueTab = () => {
  const [page, setPage] = useState(1);
  const { data, loading, refetch } = useQuery(PENDING_APPLICATIONS_QUERY, {
    variables: { page, limit: 10 },
    fetchPolicy: 'network-only',
  });
  const [approve] = useMutation(APPROVE_ORGANIZER_MUTATION, {
    refetchQueries: [{ query: ADMIN_DASHBOARD_QUERY }, { query: PLATFORM_STATS_QUERY }],
  });
  const [reject] = useMutation(REJECT_ORGANIZER_MUTATION, {
    refetchQueries: [{ query: ADMIN_DASHBOARD_QUERY }, { query: PLATFORM_STATS_QUERY }],
  });

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectUserId, setRejectUserId] = useState(null);
  const [reason, setReason] = useState('');
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  const apps = data?.pendingApplications?.profiles || [];
  const totalPages = data?.pendingApplications?.totalPages || 1;

  const handleApprove = async (userId) => {
    try {
      await approve({ variables: { userId } });
      setToast({ open: true, message: 'Organizer application approved successfully!', severity: 'success' });
      refetch();
    } catch (err) {
      setToast({ open: true, message: err.message, severity: 'error' });
    }
  };

  const handleOpenReject = (userId) => {
    setRejectUserId(userId);
    setRejectOpen(true);
  };

  const handleCloseReject = () => {
    setRejectOpen(false);
    setRejectUserId(null);
    setReason('');
  };

  const handleRejectSubmit = async () => {
    try {
      await reject({ variables: { userId: rejectUserId, reason } });
      setToast({ open: true, message: 'Organizer application rejected.', severity: 'info' });
      refetch();
      handleCloseReject();
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
          Organizer Verification Queue
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Review business registration requests, verify credentials, and grant organizer privileges.
        </Typography>
      </Box>

      {apps.length > 0 ? (
        <>
          <Grid container spacing={3}>
            {apps.map((app) => (
              <Grid size={{ xs: 12 }} key={app.id}>
                <Paper
                  sx={{
                    p: { xs: 2.5, md: 3.5 },
                    borderRadius: 3.5,
                    border: '1px solid #E4EDE6',
                    bgcolor: '#FFFFFF',
                    boxShadow: '0 2px 12px rgba(8, 28, 21, 0.04)',
                  }}
                >
                  {/* Card Top: Org Name, Status and Date */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.6 }}>
                      <Box
                        sx={{
                          width: 46,
                          height: 46,
                          borderRadius: 2.5,
                          bgcolor: 'rgba(45, 106, 79, 0.1)',
                          color: 'primary.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <BusinessIcon sx={{ fontSize: 26 }} />
                      </Box>
                      <Box>
                        <Typography variant="h6" fontWeight={800} color="#081C15" sx={{ lineHeight: 1.25 }}>
                          {app.organizationName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Organizer Verification Request &bull; {app.createdAt ? new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Pending Review'}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={app.status}
                      size="small"
                      color="warning"
                      sx={{ fontWeight: 750, height: 26, fontSize: '0.72rem', borderRadius: 2, px: 0.6 }}
                    />
                  </Box>

                  {/* Metadata Row */}
                  <Grid container spacing={2} sx={{ mb: 2.5, bgcolor: '#FAFCF9', p: 2, borderRadius: 2.5, border: '1px solid #EBF1EC' }}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                        <PersonIcon sx={{ fontSize: 20, color: 'text.secondary', flexShrink: 0 }} />
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 650, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Applicant
                          </Typography>
                          <Typography variant="body2" fontWeight={750} color="#081C15" noWrap>
                            {app.user?.name || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                        <EmailIcon sx={{ fontSize: 20, color: 'text.secondary', flexShrink: 0 }} />
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 650, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Email Address
                          </Typography>
                          <Typography variant="body2" fontWeight={750} color="#081C15" noWrap>
                            {app.user?.email || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                        <PhoneIcon sx={{ fontSize: 20, color: 'text.secondary', flexShrink: 0 }} />
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 650, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Phone Contact
                          </Typography>
                          <Typography variant="body2" fontWeight={750} color="#081C15" noWrap>
                            {app.phone || 'Not provided'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Bio Statement */}
                  <Box sx={{ bgcolor: '#FFFFFF', p: 2, borderRadius: 2.5, border: '1px solid #E8EFEA', mb: 2.5 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        fontWeight: 750,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontSize: '0.7rem',
                        display: 'block',
                        mb: 0.5,
                      }}
                    >
                      Applicant Experience & Background
                    </Typography>
                    <Typography variant="body2" color="#081C15" sx={{ lineHeight: 1.65, fontStyle: app.bio ? 'normal' : 'italic' }}>
                      {app.bio ? `"${app.bio}"` : 'No additional bio statement or operational details provided.'}
                    </Typography>
                  </Box>

                  {/* Footer with Website & Aligned Action Buttons */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      pt: 2,
                      borderTop: '1px solid #F0F4F1',
                      flexWrap: 'wrap',
                      gap: 1.5,
                    }}
                  >
                    <Box>
                      {app.website ? (
                        <Button
                          component="a"
                          href={app.website}
                          target="_blank"
                          rel="noreferrer"
                          size="small"
                          startIcon={<LanguageIcon />}
                          sx={{ textTransform: 'none', color: 'primary.main', fontWeight: 650 }}
                        >
                          {app.website}
                        </Button>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          No company website provided
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => handleApprove(app.user.id)}
                        sx={{ borderRadius: 2.5, fontWeight: 750, px: 2.8, py: 0.8 }}
                      >
                        Approve Application
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<CancelIcon />}
                        onClick={() => handleOpenReject(app.user.id)}
                        sx={{ borderRadius: 2.5, fontWeight: 750, px: 2.2, py: 0.8 }}
                      >
                        Reject
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, newPage) => setPage(newPage)}
                color="primary"
                shape="rounded"
              />
            </Box>
          )}
        </>
      ) : (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3.5, border: '1px solid #E4EDE6', bgcolor: '#FFFFFF' }}>
          <VerifiedUserIcon sx={{ fontSize: 48, color: 'primary.light', opacity: 0.4, mb: 1.5 }} />
          <Typography variant="h6" fontWeight={750} color="#081C15" gutterBottom>
            Application Queue is Clear
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No pending organizer verification requests at this moment.
          </Typography>
        </Paper>
      )}

      {/* Reject Reason Dialog */}
      <Dialog open={rejectOpen} onClose={handleCloseReject} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 750 }}>Reject Organizer Application</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Rejection Reason"
            placeholder="e.g. Incomplete business documentation or invalid contact information..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={handleCloseReject}>Cancel</Button>
          <Button onClick={handleRejectSubmit} variant="contained" color="error" sx={{ fontWeight: 700 }}>
            Confirm Rejection
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// 3. Users Tab (User Access Controls)
const UsersTab = () => {
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, loading, refetch } = useQuery(ALL_USERS_QUERY, {
    variables: {
      page,
      limit: 15,
      role: roleFilter || undefined,
      isActive: statusFilter === '' ? undefined : statusFilter === 'active',
    },
    fetchPolicy: 'network-only',
  });

  const [suspend] = useMutation(SUSPEND_USER_MUTATION, {
    refetchQueries: [{ query: ADMIN_DASHBOARD_QUERY }, { query: PLATFORM_STATS_QUERY }],
  });
  const [activate] = useMutation(ACTIVATE_USER_MUTATION, {
    refetchQueries: [{ query: ADMIN_DASHBOARD_QUERY }, { query: PLATFORM_STATS_QUERY }],
  });

  const [suspendOpen, setSuspendOpen] = useState(false);
  const [suspendUserId, setSuspendUserId] = useState(null);
  const [reason, setReason] = useState('');
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });

  if (loading && !data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  const users = data?.allUsers?.users || [];
  const totalPages = data?.allUsers?.totalPages || 1;

  const handleOpenSuspend = (userId) => {
    setSuspendUserId(userId);
    setSuspendOpen(true);
  };

  const handleCloseSuspend = () => {
    setSuspendOpen(false);
    setSuspendUserId(null);
    setReason('');
  };

  const handleSuspendSubmit = async () => {
    try {
      await suspend({ variables: { userId: suspendUserId, reason } });
      setToast({ open: true, message: 'User suspended successfully.', severity: 'warning' });
      refetch();
      handleCloseSuspend();
    } catch (err) {
      setToast({ open: true, message: err.message, severity: 'error' });
    }
  };

  const handleActivate = async (userId) => {
    try {
      await activate({ variables: { userId } });
      setToast({ open: true, message: 'User reactivated successfully.', severity: 'success' });
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

      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={750} color="#081C15">
          User Access & Account Permissions
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
          Inspect registered accounts, view assigned platform roles, and manage active account status.
        </Typography>
      </Box>

      {/* Filter Toolbar */}
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          border: '1px solid #E4EDE6',
          bgcolor: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterListIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
          <Typography variant="subtitle2" fontWeight={750} color="#081C15">
            Filter Accounts
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ({users.length} shown on this page)
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <TextField
            select
            size="small"
            label="Role"
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">All Roles</MenuItem>
            <MenuItem value="TOURIST">Tourist</MenuItem>
            <MenuItem value="ORGANIZER">Organizer</MenuItem>
            <MenuItem value="ADMIN">Admin</MenuItem>
          </TextField>

          <TextField
            select
            size="small"
            label="Account Status"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="active">Active Accounts</MenuItem>
            <MenuItem value="suspended">Suspended Accounts</MenuItem>
          </TextField>
        </Box>
      </Paper>

      {/* Accounts Table */}
      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3.5, border: '1px solid #E4EDE6', overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#F8FAF7' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 750, color: '#081C15', py: 2, width: '25%' }}>Account Name</TableCell>
              <TableCell sx={{ fontWeight: 750, color: '#081C15', py: 2, width: '28%' }}>Email Address</TableCell>
              <TableCell sx={{ fontWeight: 750, color: '#081C15', py: 2, width: '18%' }}>Platform Role</TableCell>
              <TableCell sx={{ fontWeight: 750, color: '#081C15', py: 2, width: '15%' }}>Account Status</TableCell>
              <TableCell sx={{ fontWeight: 750, color: '#081C15', py: 2, width: '14%', textAlign: 'right', pr: 3 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length > 0 ? (
              users.map((u) => (
                <TableRow key={u.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell sx={{ py: 1.8, verticalAlign: 'middle' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar
                        sx={{
                          width: 34,
                          height: 34,
                          bgcolor: u.role === 'ADMIN' ? '#081C15' : u.role === 'ORGANIZER' ? '#2D6A4F' : '#52B788',
                          fontSize: '0.82rem',
                          fontWeight: 750,
                        }}
                      >
                        {u.name?.charAt(0)?.toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={750} color="#081C15" sx={{ lineHeight: 1.3 }}>
                          {u.name}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ py: 1.8, verticalAlign: 'middle' }}>
                    <Typography variant="body2" color="text.secondary">
                      {u.email}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 1.8, verticalAlign: 'middle' }}>
                    <Chip
                      icon={
                        u.role === 'ADMIN' ? (
                          <AdminPanelSettingsIcon sx={{ fontSize: '15px !important' }} />
                        ) : u.role === 'ORGANIZER' ? (
                          <StorefrontIcon sx={{ fontSize: '15px !important' }} />
                        ) : (
                          <PersonIcon sx={{ fontSize: '15px !important' }} />
                        )
                      }
                      label={u.role}
                      size="small"
                      variant="outlined"
                      color={u.role === 'ADMIN' ? 'secondary' : u.role === 'ORGANIZER' ? 'primary' : 'default'}
                      sx={{ height: 26, fontSize: '0.72rem', fontWeight: 750, borderRadius: 1.8 }}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 1.8, verticalAlign: 'middle' }}>
                    <Chip
                      label={u.isActive ? 'Active' : 'Suspended'}
                      color={u.isActive ? 'success' : 'error'}
                      size="small"
                      sx={{ height: 26, fontSize: '0.72rem', fontWeight: 750, borderRadius: 1.8 }}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 1.8, verticalAlign: 'middle', textAlign: 'right', pr: 3 }}>
                    {u.role !== 'ADMIN' && (
                      u.isActive ? (
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleOpenSuspend(u.id)}
                          sx={{ borderRadius: 2, fontWeight: 700, minWidth: 84 }}
                        >
                          Suspend
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={() => handleActivate(u.id)}
                          sx={{ borderRadius: 2, fontWeight: 750, minWidth: 84 }}
                        >
                          Activate
                        </Button>
                      )
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                  No accounts match the selected filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3.5 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}

      {/* Suspend Reason Dialog */}
      <Dialog open={suspendOpen} onClose={handleCloseSuspend} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 750 }}>Reason for Suspension</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Suspension Reason"
            placeholder="e.g. Terms violation, booking abuse, or non-compliance"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={handleCloseSuspend}>Cancel</Button>
          <Button onClick={handleSuspendSubmit} variant="contained" color="error" sx={{ fontWeight: 700 }}>
            Confirm Suspension
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
