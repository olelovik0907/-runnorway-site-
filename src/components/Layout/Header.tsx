import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { Menu, X, LogOut, User, Moon, Sun, Globe } from 'lucide-react';
import { GlobalSearch } from './GlobalSearch';

interface HeaderProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onAuthClick?: () => void;
}

export function Header({ currentView, onViewChange, onAuthClick }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { darkMode, toggleDarkMode, language, setLanguage, t } = useApp();

  return (
    <header className="fixed top-0 left-0 w-full bg-white dark:bg-slate-900 z-50 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto h-16 px-4 flex items-center justify-between">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onViewChange('explore');
          }}
          className="flex items-center gap-2 font-bold text-xl text-slate-900 dark:text-white"
        >
          <img src="/assets/logo-48.png" alt="RunNorway-logo" className="h-8 w-auto" />
          RunNorway
        </a>

        <nav className="hidden md:flex items-center gap-6 font-semibold text-slate-900 dark:text-white">
          <button
            onClick={() => onViewChange('explore')}
            className="hover:underline"
          >
            {t('explore')}
          </button>
          <button
            onClick={() => onViewChange('articles')}
            className="hover:underline"
          >
            {t('articles')}
          </button>
          <button
            onClick={() => onViewChange('statistics')}
            className="hover:underline"
          >
            {t('statistics')}
          </button>
          <button
            onClick={() => onViewChange('training')}
            className="hover:underline"
          >
            {t('training')}
          </button>
          <button
            onClick={() => onViewChange('sports')}
            className="hover:underline"
          >
            {t('sports')}
          </button>
          <button
            onClick={() => onViewChange('blog')}
            className="hover:underline"
          >
            {t('blog')}
          </button>
          <button
            onClick={() => onViewChange('results')}
            className="hover:underline"
          >
            {t('results')}
          </button>
          <button
            onClick={() => onViewChange('clubs')}
            className="hover:underline"
          >
            {t('clubs')}
          </button>
          <button
            onClick={() => onViewChange('tools')}
            className="hover:underline"
          >
            {t('tools')}
          </button>
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <GlobalSearch
            onSelectResult={(type, id) => {
              if (type === 'event') {
                onViewChange('explore');
              } else if (type === 'article') {
                onViewChange('articles');
              }
            }}
          />

          <button
            onClick={toggleDarkMode}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
            )}
          </button>

          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center space-x-1 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Globe className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300 uppercase">
                {language}
              </span>
            </button>
            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1">
                <button
                  onClick={() => {
                    setLanguage('no');
                    setLangMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Norsk
                </button>
                <button
                  onClick={() => {
                    setLanguage('en');
                    setLangMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  English
                </button>
              </div>
            )}
          </div>

          {user ? (
            <>
              <button
                onClick={() => onViewChange('profile')}
                className="rounded-full border border-slate-300 dark:border-slate-600 px-4 py-2 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-900 dark:text-white"
              >
                <User className="w-4 h-4 inline mr-1" />
                Profil
              </button>
              <button
                onClick={signOut}
                className="btn-brand"
              >
                {t('signOut')}
              </button>
            </>
          ) : (
            <button
              onClick={onAuthClick}
              className="btn-brand"
            >
              {t('signIn')}
            </button>
          )}
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6 dark:text-white" />
          ) : (
            <Menu className="w-6 h-6 dark:text-white" />
          )}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden pb-4 px-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
          <nav className="space-y-2 pt-2">
            <button
              onClick={() => {
                onViewChange('explore');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 rounded-lg font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white"
            >
              {t('explore')}
            </button>
            <button
              onClick={() => {
                onViewChange('articles');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 rounded-lg font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white"
            >
              {t('articles')}
            </button>
            <button
              onClick={() => {
                onViewChange('statistics');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 rounded-lg font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white"
            >
              {t('statistics')}
            </button>
            <button
              onClick={() => {
                onViewChange('training');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 rounded-lg font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white"
            >
              {t('training')}
            </button>
            <button
              onClick={() => {
                onViewChange('sports');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 rounded-lg font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white"
            >
              {t('sports')}
            </button>
            <button
              onClick={() => {
                onViewChange('blog');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 rounded-lg font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white"
            >
              {t('blog')}
            </button>
            <button
              onClick={() => {
                onViewChange('results');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 rounded-lg font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white"
            >
              {t('results')}
            </button>
            <button
              onClick={() => {
                onViewChange('clubs');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 rounded-lg font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white"
            >
              {t('clubs')}
            </button>
            <button
              onClick={() => {
                onViewChange('tools');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 rounded-lg font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white"
            >
              {t('tools')}
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
