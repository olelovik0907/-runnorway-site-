import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { Menu, X, LogOut, User, Moon, Sun, Globe, Trophy } from 'lucide-react';
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
    <header className="fixed top-0 left-0 w-full z-50 shadow-sm bg-teal-600">
      <div className="max-w-7xl mx-auto h-16 px-4 flex items-center justify-between">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onViewChange('explore');
          }}
          className="flex items-center gap-2 font-bold text-xl text-white"
        >
          <div className="bg-teal-800 p-1.5 rounded">
            <Trophy className="w-5 h-5 text-yellow-400" />
          </div>
          RunNorway
        </a>

        <nav className="hidden md:flex items-center gap-7 font-medium text-sm text-white">
          <button
            onClick={() => onViewChange('explore')}
            className="hover:text-white/80 transition-colors"
          >
            Utforsk
          </button>
          <button
            onClick={() => onViewChange('results')}
            className="hover:text-white/80 transition-colors"
          >
            Resultater
          </button>
          <button
            onClick={() => onViewChange('clubs')}
            className="hover:text-white/80 transition-colors"
          >
            Klubber
          </button>
          <button
            onClick={() => onViewChange('tools')}
            className="hover:text-white/80 transition-colors"
          >
            Verktøy
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
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5 text-white" />
            )}
          </button>

          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center space-x-1 p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Globe className="w-5 h-5 text-white" />
              <span className="text-sm font-medium text-white uppercase">
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
                className="rounded-full border border-white/30 px-4 py-2 font-semibold hover:bg-white/10 transition-colors text-white"
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
              Logg inn
            </button>
          )}
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 hover:bg-white/10 rounded-lg"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <Menu className="w-6 h-6 text-white" />
          )}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden pb-4 px-4 border-t border-white/20 bg-teal-600">
          <nav className="space-y-2 pt-2">
            <button
              onClick={() => {
                onViewChange('explore');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 rounded-lg font-semibold hover:bg-white/10 text-white"
            >
              Utforsk
            </button>
            <button
              onClick={() => {
                onViewChange('results');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 rounded-lg font-semibold hover:bg-white/10 text-white"
            >
              Resultater
            </button>
            <button
              onClick={() => {
                onViewChange('clubs');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 rounded-lg font-semibold hover:bg-white/10 text-white"
            >
              Klubber
            </button>
            <button
              onClick={() => {
                onViewChange('tools');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 rounded-lg font-semibold hover:bg-white/10 text-white"
            >
              Verktøy
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
