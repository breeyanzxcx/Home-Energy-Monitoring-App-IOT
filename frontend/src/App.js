// app.js
import React, { useState, useEffect } from 'react';
import Signup from './components/Signup';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import Dashboard from './components/Dashboard';
import Appliance from './components/Appliance';
import Profile from './components/Profile';

function App() {
  const [page, setPage] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedPage = localStorage.getItem('currentPage') || 'dashboard';
    console.log('Initial: Token:', token, 'Saved Page:', savedPage);

    if (token) {
      console.log('Token found, setting isAuthenticated to true and page to', savedPage);
      setIsAuthenticated(true);
      if (['dashboard', 'appliance', 'profile'].includes(savedPage)) {
        setPage(savedPage);
      } else {
        console.log('Invalid savedPage for authenticated user, defaulting to dashboard');
        setPage('dashboard');
        localStorage.setItem('currentPage', 'dashboard');
      }
    } else {
      console.log('No token, ensuring login page');
      setIsAuthenticated(false); // Explicitly ensure false
      setPage('login');
      localStorage.setItem('currentPage', 'login');
    }
  }, []);

  useEffect(() => {
    console.log('State updated: isAuthenticated:', isAuthenticated, 'Page:', page);
  }, [isAuthenticated, page]);

  const handleSwitch = (p) => {
    console.log('Switching to page:', p);
    setPage(p);
    localStorage.setItem('currentPage', p);
  };

  const handleLogout = () => {
    console.log('Logging out');
    localStorage.clear(); // Clear all localStorage to ensure no stale data
    setIsAuthenticated(false);
    setPage('login');
    console.log('After logout: Token:', localStorage.getItem('token'), 'Current Page:', localStorage.getItem('currentPage'));
  };

  // Prevent rendering invalid state
  if (isAuthenticated && !['dashboard', 'appliance', 'profile'].includes(page)) {
    console.error('Invalid state: isAuthenticated is true but page is', page);
    setIsAuthenticated(false);
    setPage('login');
    localStorage.setItem('currentPage', 'login');
    localStorage.removeItem('token');
    return <div>Redirecting to login...</div>;
  }

  return (
    <div className="text-center min-h-screen">
      {!isAuthenticated ? (
        <>
          {page === 'signup' && <Signup onSwitch={handleSwitch} />}
          {page === 'login' && (
            <Login
              onSwitch={(newPage) => {
                console.log('Login onSwitch:', newPage);
                if (newPage === 'dashboard') {
                  setIsAuthenticated(true);
                }
                handleSwitch(newPage);
              }}
            />
          )}
          {page === 'forgot' && <ForgotPassword onSwitch={handleSwitch} />}
        </>
      ) : (
        <>
          {page === 'dashboard' && <Dashboard onSwitch={handleSwitch} onLogout={handleLogout} />}
          {page === 'appliance' && <Appliance onSwitch={handleSwitch} onLogout={handleLogout} />}
          {page === 'profile' && <Profile onSwitch={handleSwitch} onLogout={handleLogout} />}
        </>
      )}
    </div>
  );
}

export default App;