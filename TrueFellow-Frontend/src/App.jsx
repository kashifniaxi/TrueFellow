import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ApolloProvider } from '@apollo/client/react';
import { Box, Typography, Button, Container, CircularProgress } from '@mui/material';

import client from './graphql/client';
import theme from './theme/theme';
import { AuthProvider } from './context/AuthContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy loaded page chunks for performance optimization
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const TourDetails = lazy(() => import('./pages/TourDetails'));
const TouristDashboard = lazy(() => import('./pages/TouristDashboard'));
const OrganizerDashboard = lazy(() => import('./pages/OrganizerDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ApplyOrganizer = lazy(() => import('./pages/ApplyOrganizer'));

// Page loading skeleton fallback
const PageLoader = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '65vh' }}>
    <CircularProgress color="primary" />
  </Box>
);

// 404 NotFound Component
const NotFound = () => (
  <Container sx={{ py: 12, textAlign: 'center' }}>
    <Typography variant="h2" fontWeight={800} color="primary" gutterBottom>
      404
    </Typography>
    <Typography variant="h4" fontWeight={700} gutterBottom>
      Page Not Found
    </Typography>
    <Typography variant="body1" color="text.secondary" mb={4}>
      The page or tour package you are looking for does not exist or has been moved.
    </Typography>
    <Button component={Link} to="/" variant="contained" color="primary" size="large">
      Return to Home
    </Button>
  </Container>
);

function App() {
  return (
    <ApolloProvider client={client}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar />
              <Box component="main" sx={{ flexGrow: 1 }}>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/tour/:id" element={<TourDetails />} />

                    {/* Protected Tourist routes */}
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute allowedRoles={['TOURIST']}>
                          <TouristDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/apply-organizer"
                      element={
                        <ProtectedRoute allowedRoles={['TOURIST']}>
                          <ApplyOrganizer />
                        </ProtectedRoute>
                      }
                    />

                    {/* Protected Organizer routes */}
                    <Route
                      path="/organizer"
                      element={
                        <ProtectedRoute allowedRoles={['ORGANIZER']}>
                          <OrganizerDashboard />
                        </ProtectedRoute>
                      }
                    />

                    {/* Protected Admin routes */}
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                          <AdminDashboard />
                        </ProtectedRoute>
                      }
                    />

                    {/* Catch-all 404 */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </Box>
              <Footer />
            </Box>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ApolloProvider>
  );
}

export default App;
