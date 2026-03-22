import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { getDefaultRouteByRole } from './auth/session';

// Landing pages
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import FeaturesPage from './pages/FeaturesPage';
import PricingPage from './pages/PricingPage';
import BlogPage from './pages/BlogPage';
import ContactPage from './pages/ContactPage';

// Auth pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import VerifyOTP from './pages/VerifyOTP';
import PendingApproval from './pages/PendingApproval';

// Donor portal
import DonorDashboard from './pages/donor/DonorDashboard';
import DonorDonations from './pages/donor/DonorDonations';
import DonorHealthCheck from './pages/donor/DonorHealthCheck';
import DonorSchedule from './pages/donor/DonorSchedule';
import DonorFindBank from './pages/donor/DonorFindBank';
import DonorProfile from './pages/donor/DonorProfile';

// Hospital portal
import HospitalDashboard from './pages/hospital/HospitalDashboard';
import HospitalRequests from './pages/hospital/HospitalRequests';
import HospitalPatients from './pages/hospital/HospitalPatients';
import HospitalPayments from './pages/hospital/HospitalPayments';
import HospitalBloodBanks from './pages/hospital/HospitalBloodBanks';
import HospitalProfile from './pages/hospital/HospitalProfile';

// Blood Bank portal
import BloodBankDashboard from './pages/bloodbank/BloodBankDashboard';
import BloodBankInventory from './pages/bloodbank/BloodBankInventory';
import BloodBankDonations from './pages/bloodbank/BloodBankDonations';
import BloodBankDonors from './pages/bloodbank/BloodBankDonors';
import BloodBankHealthChecks from './pages/bloodbank/BloodBankHealthChecks';
import BloodBankRequests from './pages/bloodbank/BloodBankRequests';
import BloodBankIssues from './pages/bloodbank/BloodBankIssues';
import BloodBankPayments from './pages/bloodbank/BloodBankPayments';
import BloodBankProfile from './pages/bloodbank/BloodBankProfile';

// Admin portal
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminApprovals from './pages/admin/AdminApprovals';
import AdminDonors from './pages/admin/AdminDonors';
import AdminHospitals from './pages/admin/AdminHospitals';
import AdminBloodBanks from './pages/admin/AdminBloodBanks';
import AdminInventory from './pages/admin/AdminInventory';
import AdminRequests from './pages/admin/AdminRequests';
import AdminDonations from './pages/admin/AdminDonations';
import AdminHealthChecks from './pages/admin/AdminHealthChecks';
import AdminIssues from './pages/admin/AdminIssues';
import AdminPayments from './pages/admin/AdminPayments';
import AdminUsers from './pages/admin/AdminUsers';
import AdminReports from './pages/admin/AdminReports';
import AdminAudit from './pages/admin/AdminAudit';
import AdminSettings from './pages/admin/AdminSettings';

function ProtectedRoute({ roles, children }) {
    const { isAuthenticated, loading, user } = useAuth();

    if (loading) return null;

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (roles?.length && !roles.includes(user?.role)) {
        return <Navigate to={getDefaultRouteByRole(user?.role)} replace />;
    }

    return children;
}

function PublicOnlyRoute({ children }) {
    const { isAuthenticated, loading, user } = useAuth();
    if (loading) return null;
    if (isAuthenticated) {
        return <Navigate to={getDefaultRouteByRole(user?.role)} replace />;
    }
    return children;
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Landing */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/features" element={<FeaturesPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/contact" element={<ContactPage />} />

                {/* Auth */}
                <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
                <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/verify-otp" element={<VerifyOTP />} />
                <Route path="/pending-approval" element={<PendingApproval />} />

                {/* Donor Portal */}
                <Route path="/donor/dashboard" element={<ProtectedRoute roles={['donor']}><DonorDashboard /></ProtectedRoute>} />
                <Route path="/donor/donations" element={<ProtectedRoute roles={['donor']}><DonorDonations /></ProtectedRoute>} />
                <Route path="/donor/health-check" element={<ProtectedRoute roles={['donor']}><DonorHealthCheck /></ProtectedRoute>} />
                <Route path="/donor/schedule" element={<ProtectedRoute roles={['donor']}><DonorSchedule /></ProtectedRoute>} />
                <Route path="/donor/find-bank" element={<ProtectedRoute roles={['donor']}><DonorFindBank /></ProtectedRoute>} />
                <Route path="/donor/profile" element={<ProtectedRoute roles={['donor']}><DonorProfile /></ProtectedRoute>} />
                <Route path="/donor/notifications" element={<ProtectedRoute roles={['donor']}><DonorDashboard /></ProtectedRoute>} />

                {/* Hospital Portal */}
                <Route path="/hospital/dashboard" element={<ProtectedRoute roles={['hospital']}><HospitalDashboard /></ProtectedRoute>} />
                <Route path="/hospital/requests" element={<ProtectedRoute roles={['hospital']}><HospitalRequests /></ProtectedRoute>} />
                <Route path="/hospital/patients" element={<ProtectedRoute roles={['hospital']}><HospitalPatients /></ProtectedRoute>} />
                <Route path="/hospital/payments" element={<ProtectedRoute roles={['hospital']}><HospitalPayments /></ProtectedRoute>} />
                <Route path="/hospital/blood-banks" element={<ProtectedRoute roles={['hospital']}><HospitalBloodBanks /></ProtectedRoute>} />
                <Route path="/hospital/profile" element={<ProtectedRoute roles={['hospital']}><HospitalProfile /></ProtectedRoute>} />
                <Route path="/hospital/notifications" element={<ProtectedRoute roles={['hospital']}><HospitalDashboard /></ProtectedRoute>} />

                {/* Blood Bank Portal */}
                <Route path="/bloodbank/dashboard" element={<ProtectedRoute roles={['blood_bank']}><BloodBankDashboard /></ProtectedRoute>} />
                <Route path="/bloodbank/inventory" element={<ProtectedRoute roles={['blood_bank']}><BloodBankInventory /></ProtectedRoute>} />
                <Route path="/bloodbank/donations" element={<ProtectedRoute roles={['blood_bank']}><BloodBankDonations /></ProtectedRoute>} />
                <Route path="/bloodbank/donors" element={<ProtectedRoute roles={['blood_bank']}><BloodBankDonors /></ProtectedRoute>} />
                <Route path="/bloodbank/health-checks" element={<ProtectedRoute roles={['blood_bank']}><BloodBankHealthChecks /></ProtectedRoute>} />
                <Route path="/bloodbank/requests" element={<ProtectedRoute roles={['blood_bank']}><BloodBankRequests /></ProtectedRoute>} />
                <Route path="/bloodbank/issues" element={<ProtectedRoute roles={['blood_bank']}><BloodBankIssues /></ProtectedRoute>} />
                <Route path="/bloodbank/payments" element={<ProtectedRoute roles={['blood_bank']}><BloodBankPayments /></ProtectedRoute>} />
                <Route path="/bloodbank/profile" element={<ProtectedRoute roles={['blood_bank']}><BloodBankProfile /></ProtectedRoute>} />
                <Route path="/bloodbank/notifications" element={<ProtectedRoute roles={['blood_bank']}><BloodBankDashboard /></ProtectedRoute>} />

                {/* Admin Portal */}
                <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/notifications" element={<ProtectedRoute roles={['admin']}><AdminNotifications /></ProtectedRoute>} />
                <Route path="/admin/approvals" element={<ProtectedRoute roles={['admin']}><AdminApprovals /></ProtectedRoute>} />
                <Route path="/admin/donors" element={<ProtectedRoute roles={['admin']}><AdminDonors /></ProtectedRoute>} />
                <Route path="/admin/hospitals" element={<ProtectedRoute roles={['admin']}><AdminHospitals /></ProtectedRoute>} />
                <Route path="/admin/blood-banks" element={<ProtectedRoute roles={['admin']}><AdminBloodBanks /></ProtectedRoute>} />
                <Route path="/admin/inventory" element={<ProtectedRoute roles={['admin']}><AdminInventory /></ProtectedRoute>} />
                <Route path="/admin/requests" element={<ProtectedRoute roles={['admin']}><AdminRequests /></ProtectedRoute>} />
                <Route path="/admin/donations" element={<ProtectedRoute roles={['admin']}><AdminDonations /></ProtectedRoute>} />
                <Route path="/admin/health-checks" element={<ProtectedRoute roles={['admin']}><AdminHealthChecks /></ProtectedRoute>} />
                <Route path="/admin/issues" element={<ProtectedRoute roles={['admin']}><AdminIssues /></ProtectedRoute>} />
                <Route path="/admin/payments" element={<ProtectedRoute roles={['admin']}><AdminPayments /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
                <Route path="/admin/reports" element={<ProtectedRoute roles={['admin']}><AdminReports /></ProtectedRoute>} />
                <Route path="/admin/audit" element={<ProtectedRoute roles={['admin']}><AdminAudit /></ProtectedRoute>} />
                <Route path="/admin/settings" element={<ProtectedRoute roles={['admin']}><AdminSettings /></ProtectedRoute>} />
            </Routes>
        </BrowserRouter>
    );
}
