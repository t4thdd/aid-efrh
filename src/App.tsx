import React, { useState } from 'react';
import * as Sentry from '@sentry/react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import { AlertsProvider } from './context/AlertsContext';
import MockLogin from './components/MockLogin';
import LandingPage from './components/LandingPage';
import AdminDashboard from './components/AdminDashboard';
import OrganizationsDashboard from './components/OrganizationsDashboard';
import FamiliesDashboard from './components/FamiliesDashboard';
import { ErrorConsole } from './components/ErrorConsole';
import { Bug } from 'lucide-react';

type PageType = 'landing' | 'admin' | 'organizations' | 'families';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('landing');
  const [showErrorConsole, setShowErrorConsole] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const handleNavigateTo = (page: string) => {
    setCurrentPage(page as PageType);
    setActiveTab('overview');
  };

  const handleNavigateBack = () => {
    setCurrentPage('landing');
    setActiveTab('overview');
  };

  return (
    <AuthProvider>
      <AlertsProvider>
        <ErrorBoundary componentName="App">
          <AppContent 
            currentPage={currentPage}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            handleNavigateTo={handleNavigateTo}
            handleNavigateBack={handleNavigateBack}
            showErrorConsole={showErrorConsole}
            setShowErrorConsole={setShowErrorConsole}
          />
        </ErrorBoundary>
      </AlertsProvider>
    </AuthProvider>
  );
}

interface AppContentProps {
  currentPage: PageType;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleNavigateTo: (page: string) => void;
  handleNavigateBack: () => void;
  showErrorConsole: boolean;
  setShowErrorConsole: (show: boolean) => void;
}

function AppContent({ 
  currentPage, 
  activeTab, 
  setActiveTab, 
  handleNavigateTo, 
  handleNavigateBack,
  showErrorConsole,
  setShowErrorConsole 
}: AppContentProps) {
  const { loggedInUser, login, logout } = useAuth();

  const handleLogin = (user: any) => {
    Sentry.setUser({
      id: user.id,
      username: user.name,
      email: user.email
    });
    login(user);
    
    if (user.roleId === 'admin' || user.associatedType === null) {
      handleNavigateTo('admin');
    } else if (user.associatedType === 'organization') {
      handleNavigateTo('organizations');
    } else if (user.associatedType === 'family') {
      handleNavigateTo('families');
    } else {
      handleNavigateTo('admin');
    }
  };

  const handleLogout = () => {
    Sentry.setUser(null);
    logout();
    handleNavigateTo('landing');
    setActiveTab('overview');
  };

  if (!loggedInUser && currentPage !== 'landing') {
    return (
      <ErrorBoundary componentName="MockLogin">
        <MockLogin onLogin={handleLogin} />
      </ErrorBoundary>
    );
  }

  return (
    <div className="min-h-screen">
      {currentPage === 'landing' && (
        <ErrorBoundary componentName="LandingPage">
          <LandingPage onNavigateTo={handleNavigateTo} />
        </ErrorBoundary>
      )}
      {currentPage === 'admin' && loggedInUser && (
        <ErrorBoundary componentName="AdminDashboard">
          <AdminDashboard 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </ErrorBoundary>
      )}
      {currentPage === 'organizations' && loggedInUser && (
        <ErrorBoundary componentName="OrganizationsDashboard">
          <OrganizationsDashboard onNavigateBack={handleNavigateBack} />
        </ErrorBoundary>
      )}
      {currentPage === 'families' && loggedInUser && (
        <ErrorBoundary componentName="FamiliesDashboard">
          <FamiliesDashboard onNavigateBack={handleNavigateBack} />
        </ErrorBoundary>
      )}
      
      {process.env.NODE_ENV === 'development' && (
        <>
          <button
            onClick={() => setShowErrorConsole(true)}
            className="fixed bottom-4 left-4 bg-red-600 text-white p-3 rounded-full border border-red-700 hover:bg-red-700 transition-colors z-40"
            title="فتح وحدة تحكم الأخطاء"
          >
            <Bug className="w-4 h-4" />
          </button>
          
          <ErrorConsole 
            isOpen={showErrorConsole} 
            onClose={() => setShowErrorConsole(false)} 
          />
        </>
      )}

      {loggedInUser && currentPage !== 'landing' && (
        <button
          onClick={handleLogout}
          className="fixed top-4 left-4 bg-gray-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors z-40 flex items-center border border-gray-700"
        >
          تسجيل الخروج
        </button>
      )}
    </div>
  );
}

export default App;