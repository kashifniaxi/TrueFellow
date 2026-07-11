import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ApolloProvider } from '@apollo/client/react';

import client from './graphql/client';
import theme from './theme/theme';
import { AuthProvider } from './context/AuthContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import TourDetails from './pages/TourDetails';
import TouristDashboard from './pages/TouristDashboard';
import OrganizerDashboard from './pages/OrganizerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ApplyOrganizer from './pages/ApplyOrganizer';

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
                </Routes>
              </Box>
              <Footer />
            </Box>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ApolloProvider>
  );
}

// Quick inline Box wrapper for App since we use MUI elements
import { Box } from '@mui/material';

export default App;
