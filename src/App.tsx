import { useState } from 'react';
import { PortfolioProvider } from './context/PortfolioContext';
import { ExpenseProvider } from './context/ExpenseContext';
import { Layout } from './components/shared/Layout';
import { Navbar } from './components/shared/Navbar';
import { Dashboard } from './pages/Dashboard';
import { PortfolioPage } from './pages/PortfolioPage';
import { TaxAnalysisPage } from './pages/TaxAnalysisPage';
import { ExpensesPage } from './pages/ExpensesPage';

type PageType = 'dashboard' | 'portfolio' | 'tax-analysis' | 'expenses';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');

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
      default:
        return <Dashboard onNavigate={(page) => setCurrentPage(page)} />;
    }
  };

  return (
    <PortfolioProvider>
      <ExpenseProvider>
        <Layout>
          <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {renderPage()}
          </main>
        </Layout>
      </ExpenseProvider>
    </PortfolioProvider>
  );
}

export default App;
