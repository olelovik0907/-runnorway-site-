import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { AuthForm } from './components/Auth/AuthForm';
import { Header } from './components/Layout/Header';
import { Hero } from './components/Layout/Hero';
import { AboutSection } from './components/Layout/AboutSection';
import { ContactSection } from './components/Layout/ContactSection';
import { FAQSection } from './components/Layout/FAQSection';
import { Footer } from './components/Layout/Footer';
import { EventList } from './components/Events/EventList';
import { CalendarView } from './components/Events/CalendarView';
import { MapView } from './components/Events/MapView';
import { RecommendedEvents } from './components/Events/RecommendedEvents';
import { ToolsView } from './components/Tools/ToolsView';
import { MyRacesView } from './components/MyRaces/MyRacesView';
import { ProfileView } from './components/Profile/ProfileView';
import { ClubsView } from './components/Clubs/ClubsView';
import { ResultsView } from './components/Results/ResultsView';
import { ArticlesView } from './components/Articles/ArticlesView';
import { StatisticsView } from './components/Statistics/StatisticsView';
import { TrainingView } from './components/Training/TrainingView';
import { SportCategoriesView } from './components/Sports/SportCategoriesView';
import { BlogView } from './components/Blog/BlogView';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState('explore');
  const [showAuth, setShowAuth] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (showAuth) {
    return <AuthForm onClose={() => setShowAuth(false)} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'explore':
        return <EventList />;
      case 'calendar':
        return <CalendarView />;
      case 'map':
        return <MapView />;
      case 'clubs':
        return <ClubsView />;
      case 'results':
        return <ResultsView />;
      case 'articles':
        return <ArticlesView />;
      case 'statistics':
        return <StatisticsView />;
      case 'training':
        return <TrainingView />;
      case 'sports':
        return <SportCategoriesView />;
      case 'blog':
        return <BlogView />;
      case 'tools':
        return <ToolsView />;
      case 'myRaces':
        return <MyRacesView />;
      case 'profile':
        return <ProfileView />;
      default:
        return <EventList />;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors">
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        onAuthClick={() => setShowAuth(true)}
      />
      {currentView === 'explore' && <Hero />}
      {currentView === 'explore' && (
        <RecommendedEvents onEventClick={(id) => setSelectedEventId(id)} />
      )}
      {renderView()}
      {currentView === 'explore' && (
        <>
          <AboutSection />
          <ContactSection />
          <FAQSection />
        </>
      )}
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </AppProvider>
  );
}

export default App;
