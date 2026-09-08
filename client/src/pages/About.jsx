import React from 'react';
import {
  HiCloud,
  HiServerStack,
  HiCircleStack,
  HiArrowLongRight
} from 'react-icons/hi2';

export default function About() {
  const cloudSections = [
    {
      title: 'Frontend',
      provider: 'Vercel',
      role: 'User Interface Delivery',
      tech: 'React, Javascript, Vite, HTML/CSS',
      icon: HiCloud,
      color: 'from-violet-500 to-indigo-600',
      badge: 'Edge CDN',
      details: [
        'Single page application deployed on Vercel edge network for quick asset loading.',
        'Continuous deployment automatically builds and publishes code pushed to the repository.',
        'Client-side navigation handled by React Router with single-page rewrite rules.',
      ]
    },
    {
      title: 'Backend',
      provider: 'Render',
      role: 'Application API Service',
      tech: 'Node.js, Express.js',
      icon: HiServerStack,
      color: 'from-indigo-500 to-cyan-600',
      badge: 'PaaS',
      details: [
        'RESTful service running on Render with 15 endpoints covering expenses, categories, budgets, and analytics.',
        'Secured with CORS controls, environment-based configuration, and automated HTTPS certificate provisioning.',
        'Handles request validation, data processing, and asynchronous database queries.',
      ]
    },
    {
      title: 'Database',
      provider: 'Supabase',
      role: 'Relational Data Storage',
      tech: 'PostgreSQL, Connection Pooling',
      icon: HiCircleStack,
      color: 'from-emerald-500 to-teal-600',
      badge: 'DBaaS',
      details: [
        'Managed PostgreSQL instance storing user expenses, budget allocations, and custom category data.',
        'Foreign key constraints maintain referential integrity between categories, expenses, and budgets.',
        'Indexes on date, category, and month fields ensure responsive queries.',
      ]
    }
  ];

  const metadata = [
    { label: 'University', value: 'Vellore Institute of Technology, Chennai' },
    { label: 'Course', value: 'BACSE344: Cloud Infrastructure and Architecture' },
    { label: 'Built by', value: 'Soumaditya Mukherjee (25BCE1118)' },
    { label: 'Year', value: '2026' },
  ];

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Intro Section */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-100 dark:border-slate-800/80 p-8 sm:p-10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-violet-500/10 dark:bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          About this Project
        </h1>

        <p className="mt-4 text-slate-600 dark:text-slate-300 leading-relaxed text-base sm:text-lg">
          This cloud-based expense tracking platform was built for the Cloud Infrastructure and Architecture course (BACSE344) at VIT Chennai. It demonstrates the implementation of a multi-cloud system by separating the client interface, API server, and relational database across independent cloud platforms. The application allows students to track daily spending, define monthly category budgets, and analyze spending patterns through visual reports.
        </p>

        {/* Project Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-8 border-t border-slate-100 dark:border-slate-800/80">
          {metadata.map((item, index) => (
            <div key={index} className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {item.label}
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-200 mt-0.5">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Architecture Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            System Architecture
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Separation of concerns across three specialized cloud providers
          </p>
        </div>

        {/* Visual Architecture Diagram */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-100 dark:border-slate-800/80 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0">
            {/* Frontend Box */}
            <div className="flex flex-col items-center text-center px-4 py-5 rounded-2xl border-2 border-violet-200 dark:border-violet-800/60 bg-violet-50/80 dark:bg-violet-950/30 w-full md:w-56">
              <HiCloud className="w-8 h-8 text-violet-500 mb-2" />
              <span className="text-sm font-bold text-slate-900 dark:text-white">Frontend</span>
              <span className="text-xs text-violet-600 dark:text-violet-400 font-semibold">Vercel</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">React SPA on Edge CDN</span>
            </div>

            {/* Arrow */}
            <div className="flex flex-col md:flex-row items-center gap-1 py-2 md:px-3">
              <HiArrowLongRight className="w-8 h-8 text-slate-300 dark:text-slate-600 hidden md:block" />
              <HiArrowLongRight className="w-8 h-8 text-slate-300 dark:text-slate-600 rotate-90 md:hidden" />
              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">HTTPS / JSON</span>
            </div>

            {/* Backend Box */}
            <div className="flex flex-col items-center text-center px-4 py-5 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/80 dark:bg-indigo-950/30 w-full md:w-56">
              <HiServerStack className="w-8 h-8 text-indigo-500 mb-2" />
              <span className="text-sm font-bold text-slate-900 dark:text-white">Backend</span>
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">Render</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Express.js REST API</span>
            </div>

            {/* Arrow */}
            <div className="flex flex-col md:flex-row items-center gap-1 py-2 md:px-3">
              <HiArrowLongRight className="w-8 h-8 text-slate-300 dark:text-slate-600 hidden md:block" />
              <HiArrowLongRight className="w-8 h-8 text-slate-300 dark:text-slate-600 rotate-90 md:hidden" />
              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">SQL / TCP</span>
            </div>

            {/* Database Box */}
            <div className="flex flex-col items-center text-center px-4 py-5 rounded-2xl border-2 border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/80 dark:bg-emerald-950/30 w-full md:w-56">
              <HiCircleStack className="w-8 h-8 text-emerald-500 mb-2" />
              <span className="text-sm font-bold text-slate-900 dark:text-white">Database</span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Supabase</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">PostgreSQL Database</span>
            </div>
          </div>
        </div>

        {/* Deep Dive Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cloudSections.map((section, idx) => (
            <div
              key={idx}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-100 dark:border-slate-800/80 p-6 shadow-sm hover:shadow-md transition-all flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${section.color} flex items-center justify-center text-white shadow-md`}>
                  <section.icon className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {section.badge}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {section.title}
              </h3>
              <div className="text-xs font-semibold text-violet-600 dark:text-violet-400 mb-2">
                {section.provider}: {section.role}
              </div>
              <p className="text-xs font-mono text-slate-400 dark:text-slate-500 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                {section.tech}
              </p>

              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400 flex-1">
                {section.details.map((detail, dIdx) => (
                  <li key={dIdx} className="flex items-start gap-2">
                    <span className="text-violet-500 mt-0.5 shrink-0">•</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
