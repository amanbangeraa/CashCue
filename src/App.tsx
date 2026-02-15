import { useState, useEffect } from 'react';
import { auth } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { PortfolioProvider } from './context/PortfolioContext';
import { ExpenseProvider } from './context/ExpenseContext';
import { BudgetProvider } from './context/BudgetContext';
import { IncomeProvider } from './context/IncomeContext';
import { Layout } from './components/shared/Layout';
import { Navbar } from './components/shared/Navbar';
import { Dashboard } from './pages/Dashboard';
import { PortfolioPage } from './pages/PortfolioPage';
import { TaxAnalysisPage } from './pages/TaxAnalysisPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { BudgetPage } from './pages/BudgetPage';
import { IncomePage } from './pages/IncomePage';
import { LoginForm } from './components/auth/LoginForm';

type PageType = 'dashboard' | 'portfolio' | 'tax-analysis' | 'expenses' | 'budget' | 'income';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Setting up Firebase auth listener...');
    console.log('Auth object:', auth);
    
    try {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        console.log('Auth state changed:', user ? 'User logged in' : 'No user');
        console.log('User object:', user);
        console.log('Setting loading to false');
        setUser(user);
        setLoading(false);
      }, (error) => {
        console.error('Auth error:', error);
        setError(error.message);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error('Failed to set up auth listener:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  }, []);

  if (loading) {
    console.log('Rendering: Loading state');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.log('Rendering: Error state -', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Firebase Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('Rendering: Login form (no user)');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoginForm onSuccess={() => {}} />
      </div>
    );
  }

  console.log('Rendering: Main app (user logged in)');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={(page) => setCurrentPage(page)} />;
      case 'portfolio':
        return <PortfolioPage />;
      case 'tax-analysis':
        return <TaxAnalysisPage />;
      case 'expenses':
        return <ExpensesPage />;
      case 'budget':
        return <BudgetPage />;
      case 'income':
        return <IncomePage />;
      default:
        return <Dashboard onNavigate={(page) => setCurrentPage(page)} />;
    }
  };

  return (
    <PortfolioProvider>
      <ExpenseProvider>
        <IncomeProvider>
          <BudgetProvider>
            <Layout>
              <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />
              <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {renderPage()}
              </main>
            </Layout>
          </BudgetProvider>
        </IncomeProvider>
      </ExpenseProvider>
    </PortfolioProvider>
  );
}

export default App;
