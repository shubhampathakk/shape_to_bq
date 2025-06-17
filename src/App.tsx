
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/contexts/AuthContext';
import HomePage from '@/pages/HomePage';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

function App() {
  return (
    <QueryClientProvider client={queryClient} data-id="3acdz3ars" data-path="src/App.tsx">
      <TooltipProvider data-id="9q74mms7r" data-path="src/App.tsx">
        <AuthProvider data-id="gawmiuvzf" data-path="src/App.tsx">
          <Router data-id="h9465ui0r" data-path="src/App.tsx">
            <div className="App" data-id="r8r5y9s23" data-path="src/App.tsx">
              <Routes data-id="umsr9d95q" data-path="src/App.tsx">
                <Route path="/" element={<HomePage data-id="7rdmcfrr3" data-path="src/App.tsx" />} data-id="7r0c9tyzu" data-path="src/App.tsx" />
                <Route path="*" element={<NotFound data-id="6yu9ig6e3" data-path="src/App.tsx" />} data-id="a171mj1mf" data-path="src/App.tsx" />
              </Routes>
              <Toaster data-id="3f6dxrznn" data-path="src/App.tsx" />
            </div>
          </Router>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>);

}

export default App;