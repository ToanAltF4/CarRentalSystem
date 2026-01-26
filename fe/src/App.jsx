import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import PrivateRoute from './components/PrivateRoute';

// Public Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CarDetailPage from './pages/CarDetailPage';
import VehicleListPage from './pages/VehicleListPage';
import BookingSuccessPage from './pages/BookingSuccessPage';
import PricingPage from './pages/PricingPage';
import CorporatePage from './pages/CorporatePage';
import AboutPage from './pages/AboutPage';

// Customer Pages (require auth)
import MyBookingsPage from './pages/MyBookingsPage';
import ProfilePage from './pages/ProfilePage';
import DriverLicenseUploadPage from './pages/DriverLicenseUploadPage';

// Admin Pages (require ADMIN or MANAGER role)
import AdminAddVehiclePage from './pages/admin/AdminAddVehiclePage';
import AdminEditVehiclePage from './pages/admin/AdminEditVehiclePage';
import AdminVehicleList from './pages/admin/AdminVehicleList';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminBookingList from './pages/admin/AdminBookingList';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            {/* Public Routes */}
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="vehicles" element={<VehicleListPage />} />
            <Route path="vehicles/:id" element={<CarDetailPage />} />
            <Route path="pricing" element={<PricingPage />} />
            <Route path="corporate" element={<CorporatePage />} />
            <Route path="about" element={<AboutPage />} />

            {/* Protected Customer Routes */}
            <Route
              path="booking-success"
              element={
                <PrivateRoute>
                  <BookingSuccessPage />
                </PrivateRoute>
              }
            />
            <Route
              path="my-bookings"
              element={
                <PrivateRoute>
                  <MyBookingsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="profile"
              element={
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              }
            />
            <Route
              path="driver-license"
              element={
                <PrivateRoute>
                  <DriverLicenseUploadPage />
                </PrivateRoute>
              }
            />

            {/* Protected Admin Routes - ADMIN and MANAGER only */}
            <Route
              path="admin"
              element={
                <PrivateRoute allowedRoles={['ADMIN', 'MANAGER']}>
                  <AdminDashboardPage />
                </PrivateRoute>
              }
            />
            <Route
              path="admin/dashboard"
              element={
                <PrivateRoute allowedRoles={['ADMIN', 'MANAGER']}>
                  <AdminDashboardPage />
                </PrivateRoute>
              }
            />
            <Route
              path="admin/vehicles"
              element={
                <PrivateRoute allowedRoles={['ADMIN', 'MANAGER']}>
                  <AdminVehicleList />
                </PrivateRoute>
              }
            />
            <Route
              path="admin/vehicles/add"
              element={
                <PrivateRoute allowedRoles={['ADMIN', 'MANAGER']}>
                  <AdminAddVehiclePage />
                </PrivateRoute>
              }
            />
            <Route
              path="admin/vehicles/edit/:id"
              element={
                <PrivateRoute allowedRoles={['ADMIN', 'MANAGER']}>
                  <AdminEditVehiclePage />
                </PrivateRoute>
              }
            />
            <Route
              path="admin/bookings"
              element={
                <PrivateRoute allowedRoles={['ADMIN', 'MANAGER']}>
                  <AdminBookingList />
                </PrivateRoute>
              }
            />

            {/* 404 Page */}
            <Route path="*" element={
              <div className="flex h-[50vh] items-center justify-center text-gray-500">
                404 - Page Not Found
              </div>
            } />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
