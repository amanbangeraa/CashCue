import { TrendingUp, TrendingDown, Wallet, PiggyBank, Calculator, DollarSign, LogOut } from 'lucide-react';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';

interface NavbarProps {
  currentPage: 'dashboard' | 'portfolio' | 'tax-analysis' | 'expenses' | 'budget' | 'income';
  onNavigate: (page: 'dashboard' | 'portfolio' | 'tax-analysis' | 'expenses' | 'budget' | 'income') => void;
}

export function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: TrendingUp },
    { id: 'income' as const, label: 'Income', icon: DollarSign },
    { id: 'expenses' as const, label: 'Expenses', icon: PiggyBank },
    { id: 'budget' as const, label: 'Budget', icon: Calculator },
    { id: 'portfolio' as const, label: 'Portfolio', icon: Wallet },
    { id: 'tax-analysis' as const, label: 'Tax Analysis', icon: TrendingDown },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('User logged out');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                TaxSaver Portfolio
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`
                    flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors
                    ${isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </button>
              );
            })}
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 ml-4 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

