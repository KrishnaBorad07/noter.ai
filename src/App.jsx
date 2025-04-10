import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Navbar from './components/Navbar/Navbar.jsx';
import HeroSection from './components/HeroSection/HeroSection.jsx';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main>
            <HeroSection />
            <Routes>
              <Route path="/profile" element={<div>Profile Page</div>} />
              <Route path="/settings" element={<div>Settings Page</div>} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
