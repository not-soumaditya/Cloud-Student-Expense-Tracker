import { Link, useLocation } from 'react-router-dom';
import { 
  HiHome, 
  HiCurrencyRupee, 
  HiChartPie, 
  HiCreditCard, 
  HiSun, 
  HiMoon, 
  HiComputerDesktop, 
  HiBanknotes 
} from 'react-icons/hi2';
import { useTheme } from './ThemeProvider';

const navItems = [
  { path: '/', label: 'Dashboard', icon: HiHome },
  { path: '/expenses', label: 'Expenses', icon: HiCurrencyRupee },
  { path: '/budgets', label: 'Budgets', icon: HiCreditCard },
  { path: '/reports', label: 'Reports', icon: HiChartPie },
];

function Navbar() {
  const location = useLocation();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'system') setTheme('light');
    else if (theme === 'light') setTheme('dark');
    else setTheme('system');
  };

  return (
    <nav className="bg-white/95 dark:bg-slate-950/90 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800/80 shadow-sm transition-colors duration-300">
      {/* Sleek violet gradient accent bar */}
      <div className="h-0.5 bg-gradient-to-r from-violet-600 via-indigo-500 to-fuchsia-500" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-violet-500/25 group-hover:scale-105 transition-transform duration-200">
                <HiBanknotes className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-300 dark:via-indigo-200 dark:to-white bg-clip-text text-transparent group-hover:from-violet-700 group-hover:to-indigo-700 dark:group-hover:from-violet-200 dark:group-hover:to-white transition-all">
                ExpenseTracker
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-violet-50 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 shadow-inner border border-violet-100 dark:border-violet-500/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-violet-600 dark:text-violet-400' : ''}`} />
                  <span className="hidden md:inline">{label}</span>
                </Link>
              );
            })}

            {/* Theme Toggle Button (Cycles: System -> Light -> Dark) */}
            <div className="pl-2 ml-1 border-l border-slate-200 dark:border-slate-800 flex items-center">
              <button
                onClick={toggleTheme}
                title={`Current theme: ${theme} (${resolvedTheme}). Click to switch.`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/60 shadow-sm transition-all duration-200"
              >
                {theme === 'system' ? (
                  <>
                    <HiComputerDesktop className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    <span className="hidden sm:inline capitalize">System</span>
                  </>
                ) : theme === 'dark' ? (
                  <>
                    <HiMoon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="hidden sm:inline">Dark</span>
                  </>
                ) : (
                  <>
                    <HiSun className="w-4 h-4 text-amber-500" />
                    <span className="hidden sm:inline">Light</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
