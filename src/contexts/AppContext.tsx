import React, { createContext, useContext, useState, useEffect } from 'react';

interface AppContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  language: 'no' | 'en';
  setLanguage: (lang: 'no' | 'en') => void;
  t: (key: string) => string;
}

const translations = {
  no: {
    explore: 'Utforsk',
    calendar: 'Kalender',
    map: 'Kart',
    tools: 'Verktøy',
    myRaces: 'Mine løp',
    profile: 'Profil',
    clubs: 'Klubber',
    results: 'Resultater',
    popular: 'Populære',
    search: 'Søk etter arrangement eller sted...',
    all: 'Alle',
    signIn: 'Logg inn',
    signOut: 'Logg ut',
    interested: 'Interessert',
    going: 'Skal',
    free: 'Gratis',
    viewDetails: 'Vis detaljer',
    noEvents: 'Ingen arrangementer funnet',
    runningEvents: 'Løpearrangementer i Norge',
    findYourRace: 'Finn ditt neste løp blant',
    events: 'arrangementer',
  },
  en: {
    explore: 'Explore',
    calendar: 'Calendar',
    map: 'Map',
    tools: 'Tools',
    myRaces: 'My Races',
    profile: 'Profile',
    clubs: 'Clubs',
    results: 'Results',
    popular: 'Popular',
    search: 'Search for events or location...',
    all: 'All',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    interested: 'Interested',
    going: 'Going',
    free: 'Free',
    viewDetails: 'View Details',
    noEvents: 'No events found',
    runningEvents: 'Running Events in Norway',
    findYourRace: 'Find your next race among',
    events: 'events',
  },
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  const [language, setLanguageState] = useState<'no' | 'en'>(() => {
    const saved = localStorage.getItem('language');
    return (saved as 'no' | 'en') || 'no';
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const setLanguage = (lang: 'no' | 'en') => setLanguageState(lang);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.no] || key;
  };

  return (
    <AppContext.Provider
      value={{
        darkMode,
        toggleDarkMode,
        language,
        setLanguage,
        t,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
