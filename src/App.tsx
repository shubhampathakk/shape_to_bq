
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
    <QueryClientProvider client={queryClient} data-id="rjwaq2cov" data-path="src/App.tsx">
      <TooltipProvider data-id="xshbs7h8m" data-path="src/App.tsx">
        <AuthProvider data-id="8344ifyue" data-path="src/App.tsx">
          <Router data-id="da8rzbidw" data-path="src/App.tsx">
            <div className="App" data-id="u2ydxbg3s" data-path="src/App.tsx">
              <Routes data-id="6u57qqz4u" data-path="src/App.tsx">
                <Route path="/" element={<HomePage data-id="qeihwgmm4" data-path="src/App.tsx" />} data-id="01agv65b4" data-path="src/App.tsx" />
                <Route path="*" element={<NotFound data-id="zkcb1w2rb" data-path="src/App.tsx" />} data-id="yfticaunr" data-path="src/App.tsx" />
              </Routes>
              <Toaster data-id="l92lnh9nu" data-path="src/App.tsx" />
            </div>
          </Router>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>);

}

export default App;