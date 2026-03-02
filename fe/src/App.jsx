import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import PrivateRoute from './components/PrivateRoute';
import OperatorRoute from './components/routes/OperatorRoute';
import StaffRoute from './components/routes/StaffRoute';
import DriverRoute from './components/routes/DriverRoute';

const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const VerifyOtpPage = lazy(() => import('./pages/VerifyOtpPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const CarDetailPage = lazy(() => import('./pages/CarDetailPage'));
const VehicleListPage = lazy(() => import('./pages/VehicleListPage'));
const BookingSuccessPage = lazy(() => import('./pages/BookingSuccessPage'));
const VnpayReturnPage = lazy(() => import('./pages/VnpayReturnPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const CorporatePage = lazy(() => import('./pages/CorporatePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));

const MyBookingsPage = lazy(() => import('./pages/MyBookingsPage'));
const BookingDetailPage = lazy(() => import('./pages/BookingDetailPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const DriverLicenseUploadPage = lazy(() => import('./pages/DriverLicenseUploadPage'));

const AdminAddVehiclePage = lazy(() => import('./pages/admin/AdminAddVehiclePage'));
const AdminEditVehiclePage = lazy(() => import('./pages/admin/AdminEditVehiclePage'));
const AdminVehicleList = lazy(() => import('./pages/admin/AdminVehicleList'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminBookingList = lazy(() => import('./pages/admin/AdminBookingList'));
const AdminUserList = lazy(() => import('./pages/admin/AdminUserList'));
const AdminRoleList = lazy(() => import('./pages/admin/AdminRoleList'));
const AdminCategoryList = lazy(() => import('./pages/admin/AdminCategoryList'));
const AdminAddCategoryPage = lazy(() => import('./pages/admin/AdminAddCategoryPage'));
const AdminEditCategoryPage = lazy(() => import('./pages/admin/AdminEditCategoryPage'));

const OperatorDashboard = lazy(() => import('./pages/operator/OperatorDashboard'));
const OperatorBookingList = lazy(() => import('./pages/operator/OperatorBookingList'));
const OperatorLicenseReview = lazy(() => import('./pages/operator/OperatorLicenseReview'));
const StaffSchedule = lazy(() => import('./pages/operator/StaffSchedule'));

const StaffDashboard = lazy(() => import('./pages/staff/StaffDashboard'));
const StaffInspection = lazy(() => import('./pages/staff/StaffInspection'));

const DriverDashboard = lazy(() => import('./pages/driver/DriverDashboard'));

const RouteFallback = () => (
  <div className="flex h-[50vh] items-center justify-center text-gray-500">
    Loading...
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<RouteFallback />}>
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
                path="my-bookings/:bookingCode"
                element={
                  <PrivateRoute>
                    <BookingDetailPage />
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
              <Route
                path="admin/categories"
                element={
                  <PrivateRoute allowedRoles={['ADMIN', 'MANAGER']}>
                    <AdminCategoryList />
                  </PrivateRoute>
                }
              />
              <Route
                path="admin/categories/add"
                element={
                  <PrivateRoute allowedRoles={['ADMIN', 'MANAGER']}>
                    <AdminAddCategoryPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="admin/categories/edit/:id"
                element={
                  <PrivateRoute allowedRoles={['ADMIN', 'MANAGER']}>
                    <AdminEditCategoryPage />
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
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
