import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SignupPage from './pages/SignupPage';
import SignInPage from './pages/SignInPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage'; 
import VerifyOtpPage from './pages/verifyotp'; 
import ResetPassword from './pages/ResetPassword'; 
import UserDashboard from './pages/user/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import GovernmentOfficialDashboard from './pages/GovernmentOfficialDashboard';
import OwnershipTransfer from './pages/OwnershipTransfer';
import VehicleRegistry from './pages/VehicleRegistry';
import AuditLogs from './pages/AuditLogs';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import UserVehicleRegister from './pages/UserVehicleRegister';
import UserOwnershipTransfer from './pages/UserOwnershipTransfer';
import UserMyVehicles from './pages/UserMyVehicles';
import UserTransferTo from './pages/UserTransferTo';
import ContactForm from './components/ChatForm';
import RedesignedUnauthorizedPage from './pages/UnAuthorised';
import LoadingPage from './pages/Loading';
import LearnMorePage from './pages/LearnMore';
import EditProfile from './pages/EditProfile';
import UserChangePassword from './pages/UserChangePassword';
import EditGovernmentOfficialProfile from './pages/EditGovernmentOfficialProfile';
import ChangePasswordGovernmentOfficial from './pages/ChangePasswordGovernmentOfficial ';
import UploadVehicleDocument from './pages/DocumentUpload';
import DocumentUpload from './pages/DocumentUpload';
import PendingRegistrations from './pages/PendingRegistrations';
import InspectionOfficerDashboard from './pages/InspectionOfficerDashboard';
import InspectionOfficerRequests from './pages/InspectionOfficerRequests';
import VehicleDetails from './pages/VehicleDetails';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes >
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verifyotp" element={<VerifyOtpPage />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/chat" element={<ContactForm />} />
          <Route path="/unauthorized" element={<RedesignedUnauthorizedPage />} />
          <Route path="/loading" element={<LoadingPage />} />
          <Route path="/learn" element={<LearnMorePage />} />

          {/* User Dashboard Routes (restricted to role="user") */}
          <Route
            path="/user-dashboard"
            element={
              <PrivateRoute role="user">
                <UserDashboard />
              </PrivateRoute>
            }
          />

           <Route
            path="/document-upload"
            element={
              <PrivateRoute role="user">
                <DocumentUpload />
              </PrivateRoute>
            }
          />
         
          
          <Route
          path="/edit-profile"
          element={
            <PrivateRoute role="user">
              <EditProfile/>
            </PrivateRoute>
          }
          />
           <Route
          path="/change-password"
          element={
            <PrivateRoute role="user">
              <UserChangePassword/>
            </PrivateRoute>
          }
          />


          <Route
            path="/user-vehicle-register"
            element={
              <PrivateRoute role="user">
                <UserVehicleRegister />
              </PrivateRoute>
            }
          />
          <Route
            path="/user-ownership-transfer"
            element={
              <PrivateRoute role="user">
                <UserOwnershipTransfer />
              </PrivateRoute>
            }
          />
          <Route
            path="/user-my-vehicles"
            element={
              <PrivateRoute role="user">
                <UserMyVehicles />
              </PrivateRoute>
            }
          />
          <Route
            path="/user-transfer-to/:vehicleId"
            element={
              <PrivateRoute role="user">
                <UserTransferTo />
              </PrivateRoute>
            }
          />

          {/* Admin Dashboard Routes (restricted to role="admin") */}
          <Route
            path="/inspector-dashboard"
            element={
              <PrivateRoute role="InspectionOfficer">
                < InspectionOfficerDashboard />
              </PrivateRoute>
            }
          />
            <Route
            path="/inspect-request"
            element={
              <PrivateRoute role="InspectionOfficer">
                < InspectionOfficerRequests />
              </PrivateRoute>
            }
          />

          <Route
            path="/vehicle-details/:vehicleId"
            element={
              <PrivateRoute role="InspectionOfficer">
                <VehicleDetails/>
              </PrivateRoute>
            }
          />
         
          {/* Government Official Routes (restricted to role="government official") */}
          <Route
            path="/government-official-dashboard"
            element={
              <PrivateRoute role="government official">
                <GovernmentOfficialDashboard />
              </PrivateRoute>
            }
            //hello ji
          />
          <Route
            path="/pending-registrations"
            element={
              <PrivateRoute role="government official">
          <PendingRegistrations/>
              </PrivateRoute>
            }
          />
           <Route
            path="/govt-change-password"
            element={
              <PrivateRoute role="government official">
                <  ChangePasswordGovernmentOfficial />
              </PrivateRoute>
            }
          />
        
          <Route
            path="/edit-govt"
            element={
              <PrivateRoute role="government official">
                <EditGovernmentOfficialProfile />
              </PrivateRoute>
            }
          />
         
          <Route
            path="/ownership-transfers"
            element={
              <PrivateRoute role="government official">
                <OwnershipTransfer />
              </PrivateRoute>
            }
          />
          <Route
            path="/vehicle-registry"
            element={
              <PrivateRoute role="government official">
                <VehicleRegistry />
              </PrivateRoute>
            }
          />
          <Route
            path="/audit-logs"
            element={
              <PrivateRoute role="government official">
                <AuditLogs />
              </PrivateRoute>
            }
          />
      

          {/* Fallback Route */}
          <Route path="*" element={<RedesignedUnauthorizedPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;