
import React, { lazy, Suspense } from 'react';
import HomePage from './pages/HomePage';
import { useStore } from './store';

const EditorPage = lazy(() => import('./pages/EditorPage'));

const LoadingSpinner = () => (
  <div className="absolute inset-0 bg-[#1E1E1E] flex flex-col items-center justify-center z-50">
    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
    <p className="text-white mt-4">Loading Editor...</p>
  </div>
);

const App: React.FC = () => {
  const currentPage = useStore((state) => state.currentPage);

  return (
    <div className="bg-[#1E1E1E] min-h-screen text-gray-200">
      {currentPage === 'Home' && <HomePage />}
      {currentPage === 'Editor' && (
        <Suspense fallback={<LoadingSpinner />}>
          <EditorPage />
        </Suspense>
      )}
    </div>
  );
};

export default App;
