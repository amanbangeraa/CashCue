import { TrendingUp, Wallet, PiggyBank, Calculator, DollarSign, LogOut } from 'lucide-react';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';

interface NavbarProps {
  currentPage: 'dashboard' | 'portfolio' | 'expenses' | 'budget' | 'income';
  onNavigate: (page: 'dashboard' | 'portfolio' | 'expenses' | 'budget' | 'income') => void;
}

export function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: TrendingUp },
    { id: 'income' as const, label: 'Income', icon: DollarSign },
    { id: 'expenses' as const, label: 'Expenses', icon: PiggyBank },
    { id: 'budget' as const, label: 'Budget', icon: Calculator },
    { id: 'portfolio' as const, label: 'Portfolio', icon: Wallet },
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
    <nav className="bg-[#111827] rounded-xl border border-[#1f2937]">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-emerald-200/90 font-semibold">CashCue</div>
            <div className="text-lg font-bold text-white">Wealth Control</div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all
                  ${isActive
                    ? 'bg-emerald-500 text-white'
                    : 'text-slate-300 hover:bg-[#1f2937]'
                  }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-emerald-200'}`} />
                {item.label}
              </button>
            );
          })}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold text-red-300 hover:bg-red-500/10 transition-all ml-2"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

