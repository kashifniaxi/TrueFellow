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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h4" fontWeight={800} mb={4}>Admin Control Board</Typography>

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
          <Tab label="System Stats" />
          <Tab label="Organizer Queue" />
          <Tab label="User Management" />
        </Tabs>

        <Box p={4} bgcolor="#fafafa" minHeight="50vh">
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
  const { data: dbData, loading: dbLoading } = useQuery(ADMIN_DASHBOARD_QUERY);
  const { data: statsData, loading: statsLoading } = useQuery(PLATFORM_STATS_QUERY);

  if (dbLoading || statsLoading) return <CircularProgress color="primary" />;

  const db = dbData?.adminDashboard || {};
  const stats = statsData?.platformStats || {};

  return (
    <Box>
      <Typography variant="h5" fontWeight={750} mb={3}>Platform Summary</Typography>
      
      <Grid container spacing={3} mb={5}>
        <Grid item xs={12} sm={4} md={2}>
          <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
            <Typography variant="caption" color="text.secondary">TOTAL USERS</Typography>
            <Typography variant="h4" fontWeight={750} mt={1}>{db.totalUsers || 0}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4} md={2}>
          <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
            <Typography variant="caption" color="text.secondary">ORGANIZERS</Typography>
            <Typography variant="h4" fontWeight={750} mt={1}>{db.totalOrganizers || 0}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4} md={2}>
          <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
            <Typography variant="caption" color="text.secondary">TOURISTS</Typography>
            <Typography variant="h4" fontWeight={750} mt={1}>{db.totalTourists || 0}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4} md={2}>
          <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
            <Typography variant="caption" color="text.secondary">PENDING APPS</Typography>
            <Typography variant="h4" fontWeight={750} mt={1} color="warning.main">{db.pendingOrganizerApplications || 0}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4} md={2}>
          <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
            <Typography variant="caption" color="text.secondary">TOTAL TOURS</Typography>
            <Typography variant="h4" fontWeight={750} mt={1}>{db.totalTours || 0}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4} md={2}>
          <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
            <Typography variant="caption" color="text.secondary">BOOKINGS</Typography>
            <Typography variant="h4" fontWeight={750} mt={1}>{db.totalBookings || 0}</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" fontWeight={750} mb={2}>Top Destinations</Typography>
          <Paper sx={{ p: 2, borderRadius: 3 }} variant="outlined">
            <List>
              {stats.topDestinations?.map((dest, i) => (
                <ListItem key={i} sx={{ borderBottom: i < stats.topDestinations.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                  <ListItemText primary={dest.destination} secondary={`${dest.bookings} Bookings placed`} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" fontWeight={750} mb={2}>Top Categories</Typography>
          <Paper sx={{ p: 2, borderRadius: 3 }} variant="outlined">
            <List>
              {stats.topCategories?.map((cat, i) => (
                <ListItem key={i} sx={{ borderBottom: i < stats.topCategories.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                  <ListItemText primary={cat.category} secondary={`${cat.count} Tours active`} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

// 2. Queue Tab (Organizer Applications Review)
const QueueTab = () => {
  const { data, loading, refetch } = useQuery(PENDING_APPLICATIONS_QUERY, { variables: { page: 1, limit: 10 } });
  const [approve] = useMutation(APPROVE_ORGANIZER_MUTATION);
  const [reject] = useMutation(REJECT_ORGANIZER_MUTATION);

  // Rejection Dialog states
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectUserId, setRejectUserId] = useState(null);
  const [reason, setReason] = useState('');

  if (loading) return <CircularProgress color="primary" />;

  const apps = data?.pendingApplications?.profiles || [];

  const handleApprove = async (userId) => {
    if (!window.confirm('Approve this user to list tours on the platform?')) return;
    try {
      await approve({ variables: { userId } });
      refetch();
    } catch (err) {
      alert(err.message);
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
      refetch();
      handleCloseReject();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={750} mb={3}>Pending Organizer Profiles</Typography>
      {apps.length > 0 ? (
        <Grid container spacing={3}>
          {apps.map((app) => (
            <Grid item key={app.id} xs={12}>
              <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #E2EBE5' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={8}>
                    <Typography variant="subtitle1" fontWeight={750}>{app.organizationName}</Typography>
                    <Typography variant="body2" color="text.secondary" mt={0.5}>
                      Applicant: {app.user?.name} | Email: {app.user?.email} | Phone: {app.phone}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mt={0.5}>
                      Bio: {app.bio || 'N/A'} | Website: {app.website || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4} display="flex" gap={1.5} alignItems="center" justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}>
                    <Button variant="contained" color="success" size="small" onClick={() => handleApprove(app.user.id)}>
                      Approve
                    </Button>
                    <Button variant="outlined" color="error" size="small" onClick={() => handleOpenReject(app.user.id)}>
                      Reject
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="body2" color="text.secondary">Queue is empty. No pending applications.</Typography>
      )}

      {/* Reject Reason Dialog */}
      <Dialog open={rejectOpen} onClose={handleCloseReject} fullWidth maxWidth="xs">
        <DialogTitle>Provide Rejection Reason</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            fullWidth
            label="Reason"
            placeholder="e.g. Missing valid registration documents"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReject}>Cancel</Button>
          <Button onClick={handleRejectSubmit} variant="contained" color="error">Reject Application</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// 3. Users Tab (Suspend / Activate)
const UsersTab = () => {
  const { data, loading, refetch } = useQuery(ALL_USERS_QUERY, { variables: { page: 1, limit: 30 } });
  const [suspend] = useMutation(SUSPEND_USER_MUTATION);
  const [activate] = useMutation(ACTIVATE_USER_MUTATION);

  const [suspendOpen, setSuspendOpen] = useState(false);
  const [suspendUserId, setSuspendUserId] = useState(null);
  const [reason, setReason] = useState('');

  if (loading) return <CircularProgress color="primary" />;

  const users = data?.allUsers?.users || [];

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
      refetch();
      handleCloseSuspend();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleActivate = async (userId) => {
    try {
      await activate({ variables: { userId } });
      refetch();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={750} mb={3}>User Access Controls</Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell fontWeight={700}>Name</TableCell>
              <TableCell fontWeight={700}>Email</TableCell>
              <TableCell fontWeight={700}>Role</TableCell>
              <TableCell fontWeight={700}>Status</TableCell>
              <TableCell fontWeight={700} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell><Chip label={user.role} size="small" /></TableCell>
                <TableCell>
                  <Chip
                    label={user.isActive ? 'Active' : 'Suspended'}
                    color={user.isActive ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  {user.isActive ? (
                    <Button variant="outlined" color="error" size="small" onClick={() => handleOpenSuspend(user.id)}>
                      Suspend
                    </Button>
                  ) : (
                    <Button variant="contained" color="success" size="small" onClick={() => handleActivate(user.id)}>
                      Activate
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Suspend Reason Dialog */}
      <Dialog open={suspendOpen} onClose={handleCloseSuspend} fullWidth maxWidth="xs">
        <DialogTitle>Reason for Suspension</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            fullWidth
            label="Reason"
            placeholder="e.g. Terms violations / booking abuse"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSuspend}>Cancel</Button>
          <Button onClick={handleSuspendSubmit} variant="contained" color="error">Confirm Suspension</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
