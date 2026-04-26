import { useState, useEffect } from 'react'
import { PlayersPage } from './pages'
import { ApiStatusNotification } from './components/common/ApiStatusNotification'
import './App.css'

function App() {
  const [showApiWarning, setShowApiWarning] = useState(false);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <ApiStatusNotification 
        show={showApiWarning} 
        onDismiss={() => setShowApiWarning(false)}
      />
      <PlayersPage />
    </div>
  )
}

export default App
