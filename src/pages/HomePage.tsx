
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginPage from '@/components/auth/LoginPage';
import Header from '@/components/layout/Header';
import MainDashboard from '@/components/dashboard/MainDashboard';

const HomePage: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" data-id="npqurycoa" data-path="src/pages/HomePage.tsx">
        <div className="text-center" data-id="n5b7tlfns" data-path="src/pages/HomePage.tsx">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" data-id="npvhbp01l" data-path="src/pages/HomePage.tsx"></div>
          <p className="text-gray-600" data-id="oaub3upj3" data-path="src/pages/HomePage.tsx">Loading...</p>
        </div>
      </div>);

  }

  if (!user) {
    return <LoginPage data-id="rzuir35tt" data-path="src/pages/HomePage.tsx" />;
  }

  return (
    <div className="min-h-screen bg-gray-50" data-id="1cnk72ja2" data-path="src/pages/HomePage.tsx">
      <Header data-id="me6z3lrye" data-path="src/pages/HomePage.tsx" />
      <main data-id="ydvl47xqb" data-path="src/pages/HomePage.tsx">
        <MainDashboard data-id="655l4a276" data-path="src/pages/HomePage.tsx" />
      </main>
    </div>);

};

export default HomePage;