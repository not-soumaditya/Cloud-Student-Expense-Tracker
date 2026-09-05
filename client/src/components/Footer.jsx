import React from 'react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-950/60 backdrop-blur-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
        <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
          Made by <span className="font-semibold text-slate-900 dark:text-white">Soumaditya Mukherjee</span> circa 2026 AD
        </p>
      </div>
    </footer>
  );
}
