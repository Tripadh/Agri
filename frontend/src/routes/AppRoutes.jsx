import { Route, Routes } from 'react-router-dom';
import AdminRoute from './AdminRoute';
import Dashboard from '../pages/Dashboard';
import Crops from '../pages/Crops';
import Resources from '../pages/Resources';
import Activities from '../pages/Activities';
import Profile from '../pages/Profile';
import AdminDashboard from '../pages/AdminDashboard';
import AdminResources from '../pages/AdminResources';
import AdminActivities from '../pages/AdminActivities';
import AdminWeatherHistory from '../pages/AdminWeatherHistory';
import ManageUsers from '../pages/ManageUsers';
import ManageCrops from '../pages/ManageCrops';
import Home from '../pages/Home';
import Login from '../pages/Login';
import AdminLogin from '../pages/AdminLogin';
import NotFound from '../pages/NotFound';
import Register from '../pages/Register';
import Weather from '../pages/Weather';
import SearchPage from '../pages/SearchPage';
import EditProfile from '../pages/EditProfile';
import ChangePassword from '../pages/ChangePassword';
import Notifications from '../pages/Notifications';
import ProtectedRoute from './ProtectedRoute';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/crops"
        element={
          <ProtectedRoute>
            <Crops />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resources"
        element={
          <ProtectedRoute>
            <Resources />
          </ProtectedRoute>
        }
      />
      <Route
        path="/activities"
        element={
          <ProtectedRoute>
            <Activities />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/edit"
        element={
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/change-password"
        element={
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <ManageUsers />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/crops"
        element={
          <AdminRoute>
            <ManageCrops />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/resources"
        element={
          <AdminRoute>
            <AdminResources />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/activities"
        element={
          <AdminRoute>
            <AdminActivities />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/weather-history"
        element={
          <AdminRoute>
            <AdminWeatherHistory />
          </AdminRoute>
        }
      />
      <Route
        path="/weather"
        element={
          <ProtectedRoute>
            <Weather />
          </ProtectedRoute>
        }
      />
      <Route
        path="/search"
        element={
          <ProtectedRoute>
            <SearchPage />
          </ProtectedRoute>
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
