import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import { 
  HomePage, 
  PlayersPage, 
  PlayerProfilePage,
  EventsPage, 
  EventDetailPage,
  ResultsPage, 
  MatchDetailPage,
  RankingsPage, 
  HeadToHeadPage,
  HistoricalPage, 
  SearchPage,
  UpcomingPage
} from './pages'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { ApiStatusNotification } from './components/common/ApiStatusNotification'
import './App.css'

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

function AppContent() {
  const navigate = useNavigate();
  const [showApiWarning, setShowApiWarning] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Listen for console warnings about API issues
    const originalWarn = console.warn;
    console.warn = (...args) => {
      if (args[0]?.includes?.('Snooker API returned 403') || args[0]?.includes?.('Snooker API returned 401')) {
        setShowApiWarning(true);
      }
      originalWarn(...args);
    };

    return () => {
      console.warn = originalWarn;
    };
  }, []);

  const handleSearch = (term: string) => {
    // Navigate to search page with query parameter using React Router
    if (term.trim()) {
      navigate(`/search?q=${encodeURIComponent(term.trim())}`);
    }
  };

  const handleMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ApiStatusNotification 
        show={showApiWarning} 
        onDismiss={() => setShowApiWarning(false)}
      />
      
      <Header 
        onSearch={handleSearch}
        onMenuToggle={handleMenuToggle}
        isMobileMenuOpen={isMobileMenuOpen}
      />
      
      <main className="flex-1">
        <Routes>
          {/* Home Route */}
          <Route path="/" element={<HomePage />} />
          
          {/* Player Routes */}
          <Route path="/players" element={<PlayersPage />} />
          <Route path="/players/:playerId" element={<PlayerProfilePage />} />
          
          {/* Event Routes */}
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:eventId" element={<EventDetailPage />} />
          
          {/* Match Routes */}
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/matches/:matchId" element={<MatchDetailPage />} />
          
          {/* Rankings Route */}
          <Route path="/rankings" element={<RankingsPage />} />
          
          {/* Upcoming Matches Route */}
          <Route path="/upcoming" element={<UpcomingPage />} />
          
          {/* Head-to-Head Route */}
          <Route path="/head-to-head" element={<HeadToHeadPage />} />
          <Route path="/h2h" element={<HeadToHeadPage />} />
          
          {/* Historical Data Route */}
          <Route path="/historical" element={<HistoricalPage />} />
          
          {/* Search Route */}
          <Route path="/search" element={<SearchPage />} />
          
          {/* Additional routes for footer links */}
          <Route path="/watchlist" element={<HomePage />} /> {/* Redirect to home for now */}
          <Route path="/api-docs" element={<HomePage />} /> {/* Redirect to home for now */}
          <Route path="/about" element={<HomePage />} /> {/* Redirect to home for now */}
          <Route path="/contact" element={<HomePage />} /> {/* Redirect to home for now */}
          <Route path="/privacy" element={<HomePage />} /> {/* Redirect to home for now */}
          <Route path="/terms" element={<HomePage />} /> {/* Redirect to home for now */}
          <Route path="/cookies" element={<HomePage />} /> {/* Redirect to home for now */}
          
          {/* Catch-all route - redirect to home */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>
      
      <Footer />
    </div>
  );
}

export default App
