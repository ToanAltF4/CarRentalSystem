import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import CarDetailPage from './pages/CarDetailPage';
import VehicleListPage from './pages/VehicleListPage';
import BookingSuccessPage from './pages/BookingSuccessPage';
import MyBookingsPage from './pages/MyBookingsPage';

// Admin Pages
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
          <Route path="vehicles" element={<VehicleListPage />} />
          <Route path="vehicles/:id" element={<CarDetailPage />} />
          <Route path="booking-success" element={<BookingSuccessPage />} />
          <Route path="my-bookings" element={<MyBookingsPage />} />

          {/* Admin Routes */}
          <Route path="admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="admin/vehicles" element={<AdminVehicleList />} />
          <Route path="admin/vehicles/add" element={<AdminAddVehiclePage />} />
          <Route path="admin/vehicles/edit/:id" element={<AdminEditVehiclePage />} />
          <Route path="admin/bookings" element={<AdminBookingList />} />

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
