import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router';
import { 
  Home, FileText, BarChart3, Package,
  User, Menu, X, LogOut, Target
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TryOutListPage from './pages/TryOutListPage';
import TryOutExamPage from './pages/TryOutExamPage';
import PembahasanPage from './pages/PembahasanPage';
import HasilPage from './pages/HasilPage';
import PaketPage from './pages/PaketPage';
import ProfilePage from './pages/ProfilePage';
import LockedStatePage from './pages/LockedStatePage';
import DraggableWA from '../app/components/DraggableWA';
import RankingPage from './pages/RankingPage';
import { mockUser } from './data/mockData';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminQuestions from './pages/admin/AdminQuestions';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSettings from './pages/admin/AdminSettings';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

// Public Route Component (redirect to dashboard if already logged in)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

// Package Protected Route - shows locked state if no package purchased
function PackageProtectedRoute({ children, feature }: { children: React.ReactNode; feature: string }) {
  const { user } = useAuth();
  
  if (!user?.hasPurchasedPackage) {
    return <LockedStatePage feature={feature} />;
  }
  return <>{children}</>;
}

// Admin-only Route Component
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

// Layout Component for Authenticated Pages
function AuthenticatedLayout({ 
  children
}: { 
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Menu items based on whether user has purchased a package
  const getMenuItems = () => {
    const allItems = [
      { icon: Home, label: 'Dashboard', path: '/dashboard', requiresPackage: true },
      { icon: FileText, label: 'Try Out', path: '/tryout', requiresPackage: true },
      { icon: BarChart3, label: 'Hasil', path: '/hasil', requiresPackage: true },
      { icon: Package, label: 'Paket', path: '/paket', requiresPackage: false },
      { icon: User, label: 'Profile', path: '/profile', requiresPackage: false }
    ];

    return allItems;
  };

  const menuItems = getMenuItems();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 fixed h-full z-30">
        <div className="p-6">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#3B82F6] flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-[#2563EB] to-[#3B82F6] bg-clip-text text-transparent">
              DINAS ACADEMY
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            const isLocked = item.requiresPackage && !user?.hasPurchasedPackage;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] text-white shadow-md'
                    : isLocked
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {isLocked && (
                  <div className="ml-auto">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 w-full transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Keluar</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        >
          <aside 
            className="w-64 bg-white h-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 flex justify-between items-center">
              <Link to="/dashboard" className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#3B82F6] flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-[#2563EB] to-[#3B82F6] bg-clip-text text-transparent">
                  DINAS ACADEMY
                </span>
              </Link>
              <button onClick={() => setIsSidebarOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="px-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                const isLocked = item.requiresPackage && !user?.hasPurchasedPackage;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] text-white shadow-md'
                        : isLocked
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                    {isLocked && (
                      <div className="ml-auto">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      </div>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-gray-200 mt-auto absolute bottom-0 w-full">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 w-full transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Keluar</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-2.5 sticky top-0 z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button 
                className="lg:hidden text-gray-600"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>
              {/* Page title area - empty, clean */}
            </div>

            <div className="flex items-center space-x-4">
              <Link to="/profile" className="flex items-center space-x-3 hover:bg-gray-100 rounded-xl px-3 py-2 transition-all">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2563EB] to-[#3B82F6] flex items-center justify-center text-white font-bold">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">
                    {user?.hasPurchasedPackage ? user?.packageType : 'Belum Berlangganan'}
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-3 lg:p-5">
          {children}
        </main>

        {/* WhatsApp Floating Button */}
        <DraggableWA />

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-30">
          <div className="flex justify-around items-center">
            {[
              { icon: Home, label: 'Home', path: '/dashboard', requiresPackage: true },
              { icon: FileText, label: 'Try Out', path: '/tryout', requiresPackage: true },
              { icon: BarChart3, label: 'Hasil', path: '/hasil', requiresPackage: true },
              { icon: User, label: 'Profile', path: '/profile', requiresPackage: false }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              const isLocked = item.requiresPackage && !user?.hasPurchasedPackage;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center space-y-1 ${
                    isActive ? 'text-[#2563EB]' : isLocked ? 'text-gray-300' : 'text-gray-500'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}

function AppContent() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/" 
        element={
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        } 
      />
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } 
      />
      <Route 
        path="/register" 
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        } 
      />

      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <PackageProtectedRoute feature="Dashboard">
                <DashboardPage />
              </PackageProtectedRoute>
            </AuthenticatedLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/tryout" 
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <PackageProtectedRoute feature="Try Out">
                <TryOutListPage />
              </PackageProtectedRoute>
            </AuthenticatedLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/tryout/:id/exam" 
        element={
          <ProtectedRoute>
            <PackageProtectedRoute feature="Try Out">
              <TryOutExamPage />
            </PackageProtectedRoute>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/tryout/:id/pembahasan" 
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <PackageProtectedRoute feature="Try Out">
                <PembahasanPage />
              </PackageProtectedRoute>
            </AuthenticatedLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/hasil" 
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <PackageProtectedRoute feature="Hasil & Analisis">
                <HasilPage />
              </PackageProtectedRoute>
            </AuthenticatedLayout>
          </ProtectedRoute>
        } 
      />
      
      {/* Always accessible routes (no package required) */}
      <Route 
        path="/paket" 
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <PaketPage />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <ProfilePage />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } 
      />

      <Route
        path="/tryout/:id/ranking"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <RankingPage />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
      <Route path="/admin/questions" element={<AdminRoute><AdminQuestions /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
      <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />

      {/* Catch all - redirect to dashboard if logged in, otherwise to landing */}
      <Route 
        path="*" 
        element={<Navigate to="/" replace />} 
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}