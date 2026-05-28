import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './features/auth/pages/LoginPage';
import AdminDashboard from './features/dashboard/admin/pages/AdminDashboard';
import StaffDashboard from './features/dashboard/staff/pages/StaffDashboard';
import TbiManagerDashboard from './features/dashboard/tbi_manager/pages/TbiManagerDashboard';
import { routes } from './routes';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={routes.auth} replace />} />
        <Route path={routes.auth} element={<LoginPage />} />
        <Route path={routes.adminDashboard} element={<AdminDashboard />} />
        <Route path={routes.staffDashboard} element={<StaffDashboard />} />
        <Route path={routes.tbiManagerDashboard} element={<TbiManagerDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
