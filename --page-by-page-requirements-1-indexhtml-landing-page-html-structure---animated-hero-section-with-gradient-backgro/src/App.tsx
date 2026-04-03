import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import CompanyRegister from './pages/CompanyRegister';
import CompanyLogin from './pages/CompanyLogin';
import CompanyDashboard from './pages/CompanyDashboard';
import UserLogin from './pages/UserLogin';
import UserSearch from './pages/UserSearch';
import './index.css';

// Protected route for company dashboard
function ProtectedCompanyRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, isCompany, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!currentUser || !isCompany) {
    return <Navigate to="/company/login" replace />;
  }
  
  return <>{children}</>;
}

// Protected route for user search
function ProtectedUserRoute({ children }: { children: React.ReactNode }) {
  const { isUserLoggedIn } = useAuth();
  
  if (!isUserLoggedIn()) {
    return <Navigate to="/user/login" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/company/register" element={<CompanyRegister />} />
          <Route path="/company/login" element={<CompanyLogin />} />
          <Route 
            path="/company/dashboard" 
            element={
              <ProtectedCompanyRoute>
                <CompanyDashboard />
              </ProtectedCompanyRoute>
            } 
          />
          <Route path="/user/login" element={<UserLogin />} />
          <Route 
            path="/user/search" 
            element={
              <ProtectedUserRoute>
                <UserSearch />
              </ProtectedUserRoute>
            } 
          />
          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
