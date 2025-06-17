
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginPage from '@/components/auth/LoginPage';
import Header from '@/components/layout/Header';
import MainDashboard from '@/components/dashboard/MainDashboard';

const HomePage: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" data-id="5elwa7nf4" data-path="src/pages/HomePage.tsx">
        <div className="text-center" data-id="cnrxy4rhx" data-path="src/pages/HomePage.tsx">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" data-id="m0s103fhr" data-path="src/pages/HomePage.tsx"></div>
          <p className="text-gray-600" data-id="f58hisbz4" data-path="src/pages/HomePage.tsx">Loading...</p>
        </div>
      </div>);

  }

  if (!user) {
    return <LoginPage data-id="z1q2b4anm" data-path="src/pages/HomePage.tsx" />;
  }

  return (
    <div className="min-h-screen bg-gray-50" data-id="apsm3x7qn" data-path="src/pages/HomePage.tsx">
      <Header data-id="x3ofl1b5c" data-path="src/pages/HomePage.tsx" />
      <main data-id="r4yrxu5s4" data-path="src/pages/HomePage.tsx">
        <MainDashboard data-id="el4quy1qm" data-path="src/pages/HomePage.tsx" />
      </main>
    </div>);

};

export default HomePage;