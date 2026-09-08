import { Link, useLocation } from 'react-router-dom';
import { 
  HiHome, 
  HiCurrencyRupee, 
  HiChartPie, 
  HiCreditCard, 
  HiSun, 
  HiMoon, 
  HiBanknotes,
  HiInformationCircle
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
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="bg-white/95 dark:bg-slate-950/90 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800/80 shadow-sm transition-colors duration-300">
      <div className="h-0.5 bg-gradient-to-r from-violet-600 via-indigo-500 to-fuchsia-500" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo + About */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-violet-500/25 group-hover:scale-105 transition-transform duration-200">
                <HiBanknotes className="w-5 h-5" />
              </div>
              <span className="hidden sm:inline text-lg font-bold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-300 dark:via-indigo-200 dark:to-white bg-clip-text text-transparent group-hover:from-violet-700 group-hover:to-indigo-700 dark:group-hover:from-violet-200 dark:group-hover:to-white transition-all">
                ExpenseTracker
              </span>
            </Link>

            <Link
              to="/about"
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 ${
                location.pathname === '/about'
                  ? 'bg-violet-100 dark:bg-violet-500/25 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-500/40 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 bg-slate-100/80 dark:bg-slate-800/60 hover:bg-slate-200/80 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60'
              }`}
              title="About this Project"
            >
              <HiInformationCircle className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <span>About</span>
            </Link>
          </div>

          {/* Nav Items + Theme Toggle */}
          <div className="flex items-center space-x-0.5 sm:space-x-1.5">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
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

            {/* About icon on mobile */}
            <Link
              to="/about"
              className={`sm:hidden flex items-center p-2 rounded-xl transition-all duration-200 ${
                location.pathname === '/about'
                  ? 'bg-violet-50 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <HiInformationCircle className="w-4 h-4" />
            </Link>

            {/* Theme Toggle: simple Light / Dark */}
            <div className="pl-1.5 sm:pl-2 ml-0.5 sm:ml-1 border-l border-slate-200 dark:border-slate-800 flex items-center">
              <button
                onClick={toggleTheme}
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/60 shadow-sm transition-all duration-200"
              >
                {theme === 'dark' ? (
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
