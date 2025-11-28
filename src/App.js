import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Header from './components/Header';
import Footer from './components/Footer';
import AppLayout from './components/AppLayout';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ChitSchemeList from './pages/ChitSchemeList';
import JoinChitScheme from './pages/JoinChitScheme';
import MyChitsWithPay from './components/MyChitsWithPay';
import ContributionHistory from './components/ContributionHistory';
import ChitHistory from './pages/ChitHistory';
import JoinedChitSchemes from './pages/JoinedChitSchemes';
import NotFound from './pages/NotFound';

import AdminDashboard from './admin/AdminDashboard';
import CreateChitScheme from './admin/CreateChitScheme';
import ManageUsers from './admin/ManageUsers';
import ManageChits from './admin/ManageChits';
import Reports from './admin/Reports';
import AdminImageUpload from './components/AdminImageUpload';
import ProtectedRoute from './components/ProtectedRoute';
import PaymentPage from './components/PaymentPage';
import AdminJoinRequests from './admin/AdminJoinRequests';
import AdminUserDetail from './admin/AdminUserDetail';
import PaymentRedirect from './pages/PaymentRedirect';
import AdminPaymentApprovals from './admin/AdminPaymentApprovals';
import ChitDetails from './pages/ChitDetails';
import PublicChitSchemes from "./pages/PublicChitSchemes";

// import AdminWallets from './admin/AdminWallets';

const App = () => {
  return (
    <>
      <Header />

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/public-chits" element={<PublicChitSchemes />} />

        {/* Protected user routes */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/dashboard"
            element={
              <AppLayout>
                <Dashboard />
              </AppLayout>
            }
          />
          <Route
            path="/chits"
            element={
              <AppLayout>
                <ChitSchemeList />
              </AppLayout>
            }
          />
          <Route
            path="/join-chit/:id"
            element={
              <AppLayout>
                <JoinChitScheme />
              </AppLayout>
            }
          />
          <Route
            path="/my-chits"
            element={
              <AppLayout>
                <MyChitsWithPay />
              </AppLayout>
            }
          />
          <Route
            path="/contribution-history"
            element={
              <AppLayout>
                <ContributionHistory />
              </AppLayout>
            }
          />
          <Route
            path="/history"
            element={
              <AppLayout>
                <ChitHistory />
              </AppLayout>
            }
          />
          <Route
            path="/joined-schemes"
            element={
              <AppLayout>
                <JoinedChitSchemes />
              </AppLayout>
            }
          />
        </Route>
        <Route path="/payment" element={
          <AppLayout>
            <PaymentPage />
        </AppLayout>} />

        <Route path="/payments/redirect/:id" 
        element={
        <AppLayout>
          <PaymentRedirect />
          </AppLayout>
        } />

        

        {/* Admin routes */}
        <Route element={<ProtectedRoute adminOnly={true} />}>
          <Route path="/admin" element={<Reports />} />
          <Route path="/admin/create-chit" element={<CreateChitScheme />} />
          <Route path="/admin/manage-users" element={<ManageUsers />} />
          <Route path="/admin/manage-chits" element={<ManageChits />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="/admin/chits/:id" element={<ChitDetails />} />
           <Route path="/admin/manage-images" element={<AdminImageUpload />} />
           <Route path="/admin/AdminJoinRequests" element={<AdminJoinRequests />} />
        <Route path="/admin/users/:id" element={<AdminUserDetail />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/paymentsApprovals" element={<AdminPaymentApprovals />} />
        </Route>

        {/* 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />
    </>
  );
};

export default App;
