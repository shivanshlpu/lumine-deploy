import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { LanguageProvider } from './context/LanguageContext';

// Pages
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import SlotBooking from './pages/SlotBooking';
import MyVisits from './pages/MyVisits';
import Support from './pages/Support';
import AdminNotices from './pages/AdminNotices';
import AdminDashboard from './pages/AdminDashboard';
import AdminHeatmap from './pages/AdminHeatmap';

import AdminLaneControl from './pages/AdminLaneControl';
import GuardDashboard from './pages/GuardDashboard';
import CounterDashboard from './pages/CounterDashboard';
import ParkingDashboard from './pages/ParkingDashboard';
import Registration from './components/Registration';

function App() {
  return (
    <Router>
      <LanguageProvider>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/register" element={<Registration />} />

            {/* Devotee Dashboard Routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/slot-booking" element={<SlotBooking />} />
            <Route path="/dashboard/my-visits" element={<MyVisits />} />
            <Route path="/dashboard/support" element={<Support />} />
            <Route path="/dashboard/admin-notices" element={<AdminNotices />} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/heatmap" element={<AdminHeatmap />} />

            <Route path="/admin/lane" element={<AdminLaneControl />} />

            {/* Staff Routes */}
            <Route path="/guard/dashboard" element={<GuardDashboard />} />
            <Route path="/counter/dashboard" element={<CounterDashboard />} />
            <Route path="/parking/dashboard" element={<ParkingDashboard />} />

            {/* Legacy/Redirect Routes */}
            <Route path="/index.html" element={<Navigate to="/" replace />} />
            <Route path="/dashboard.html" element={<Navigate to="/dashboard" replace />} />
            <Route path="/bookslot.html" element={<Navigate to="/dashboard/slot-booking" replace />} />
            <Route path="/bookingslot.html" element={<Navigate to="/dashboard/slot-booking" replace />} />
            <Route path="/myvisit.html" element={<Navigate to="/dashboard/my-visits" replace />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </LanguageProvider>
    </Router>
  );
}

export default App;
