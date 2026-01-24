import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CarDetailPage from './pages/CarDetailPage';
import VehicleListPage from './pages/VehicleListPage';
import BookingSuccessPage from './pages/BookingSuccessPage';

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
      <Routes>
        <Route path="/" element={<MainLayout />}>
          {/* Public Routes */}
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="vehicles" element={<VehicleListPage />} />
          <Route path="vehicles/:id" element={<CarDetailPage />} />

          {/* Protected Customer Routes */}
          <Route
            path="booking-success"
            element={
              <ProtectedRoute>
                <BookingSuccessPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="my-bookings"
            element={
              <ProtectedRoute>
                <MyBookingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="driver-license"
            element={
              <ProtectedRoute>
                <DriverLicenseUploadPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Routes - ADMIN and MANAGER only */}
          <Route
            path="admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/vehicles"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                <AdminVehicleList />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/vehicles/add"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                <AdminAddVehiclePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/vehicles/edit/:id"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                <AdminEditVehiclePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/bookings"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                <AdminBookingList />
              </ProtectedRoute>
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
    </BrowserRouter>
  );
}

export default App;
