import { Link, useLocation } from 'react-router-dom';
import { HiHome, HiCurrencyRupee, HiChartPie, HiCreditCard } from 'react-icons/hi2';

const navItems = [
  { path: '/', label: 'Dashboard', icon: HiHome },
  { path: '/expenses', label: 'Expenses', icon: HiCurrencyRupee },
  { path: '/budgets', label: 'Budgets', icon: HiCreditCard },
  { path: '/reports', label: 'Reports', icon: HiChartPie },
];

function Navbar() {
  const location = useLocation();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
              💰 ExpenseTracker
            </Link>
          </div>
          <div className="flex items-center space-x-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === path
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
