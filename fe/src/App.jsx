import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import PrivateRoute from './components/PrivateRoute';

// Public Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyOtpPage from './pages/VerifyOtpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import CarDetailPage from './pages/CarDetailPage';
import VehicleListPage from './pages/VehicleListPage';
import BookingSuccessPage from './pages/BookingSuccessPage';
import VnpayReturnPage from './pages/VnpayReturnPage';
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
import AdminUserList from './pages/admin/AdminUserList';
import AdminRoleList from './pages/admin/AdminRoleList';

// Operator Pages
import OperatorRoute from './components/routes/OperatorRoute';
import OperatorDashboard from './pages/operator/OperatorDashboard';
import OperatorBookingList from './pages/operator/OperatorBookingList';
import OperatorLicenseReview from './pages/operator/OperatorLicenseReview';
import StaffSchedule from './pages/operator/StaffSchedule';

// Staff Pages
import StaffRoute from './components/routes/StaffRoute';
import StaffDashboard from './pages/staff/StaffDashboard';
import StaffInspection from './pages/staff/StaffInspection';

// Driver Pages
import DriverRoute from './components/routes/DriverRoute';
import DriverDashboard from './pages/driver/DriverDashboard';

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
            <Route path="verify-otp" element={<VerifyOtpPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />
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
            <Route path="payment/vnpay-return" element={<VnpayReturnPage />} />
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
            <Route
              path="admin/users"
              element={
                <PrivateRoute allowedRoles={['ADMIN', 'MANAGER']}>
                  <AdminUserList />
                </PrivateRoute>
              }
            />
            <Route
              path="admin/roles"
              element={
                <PrivateRoute allowedRoles={['ADMIN']}>
                  <AdminRoleList />
                </PrivateRoute>
              }
            />

            {/* Protected Staff Routes - TECHNICAL_STAFF, OPERATOR, MANAGER, ADMIN */}
            <Route path="staff" element={<StaffRoute />}>
              <Route index element={<StaffDashboard />} />
              <Route path="inspection/:bookingId" element={<StaffInspection />} />
            </Route>

            {/* Protected Operator Routes - OPERATOR, MANAGER, ADMIN */}
            <Route path="operator" element={<OperatorRoute />}>
              <Route index element={<OperatorDashboard />} />
              <Route path="dashboard" element={<OperatorDashboard />} />
              <Route path="bookings" element={<OperatorBookingList />} />
              <Route path="licenses" element={<OperatorLicenseReview />} />
              <Route path="staff-schedule" element={<StaffSchedule />} />
            </Route>

            {/* Protected Driver Routes - DRIVER, OPERATOR, MANAGER, ADMIN */}
            <Route path="driver" element={<DriverRoute />}>
              <Route index element={<DriverDashboard />} />
              <Route path="dashboard" element={<DriverDashboard />} />
            </Route>

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
