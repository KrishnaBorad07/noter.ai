import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import LoginForm from '../LoginForm/LoginForm.jsx';
import SignUpForm from '../SignUpForm/SignUpForm.jsx';
import logo from '../../assets/logo.png';
import { useAuth } from '../../context/AuthContext.jsx';
import { FaUserCircle } from 'react-icons/fa';

const Navbar = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  const handleLoginClick = () => {
    setShowLogin(true);
    setShowSignUp(false);
  };

  const handleSignUpClick = () => {
    setShowSignUp(true);
    setShowLogin(false);
  };

  const handleCloseLogin = () => {
    setShowLogin(false);
  };

  const handleCloseSignUp = () => {
    setShowSignUp(false);
  };

  const handleSwitchToSignUp = () => {
    setShowLogin(false);
    setShowSignUp(true);
  };

  const handleSwitchToLogin = () => {
    setShowSignUp(false);
    setShowLogin(true);
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="logo">
          <img src={logo} alt="Noter AI Logo" />
        </Link>
      </div>
      
      <div className="navbar-center">
        <ul className="nav-links">
          <li><Link to="/" onClick={() => window.scrollTo(0, 0)}>Home</Link></li>
          <li><a href="#history">History</a></li>
          <li><a href="#pricing">Pricing</a></li>
          <li><a href="#feedback">Feedback</a></li>
        </ul>
      </div>
      
      <div className="navbar-right">
        {!isAuthenticated ? (
          <>
            <button className="login-btn" onClick={handleLoginClick}>Log In</button>
            <button className="signup-btn" onClick={handleSignUpClick}>Sign Up</button>
          </>
        ) : (
          <div className="profile-section">
            <div className="profile-icon" onClick={() => setShowProfileMenu(!showProfileMenu)}>
              <FaUserCircle size={24} />
              {user?.name && <span className="user-name">{user.name}</span>}
            </div>
            {showProfileMenu && (
              <div className="profile-menu">
                <Link to="/profile" onClick={() => setShowProfileMenu(false)}>Profile</Link>
                <Link to="/settings" onClick={() => setShowProfileMenu(false)}>Settings</Link>
                <button onClick={() => {
                  setShowProfileMenu(false);
                  setTimeout(() => {
                    logout();
                  }, 100);
                }}>Logout</button>
              </div>
            )}
          </div>
        )}
      </div>

      {showLogin && (
        <LoginForm 
          onClose={handleCloseLogin} 
          onSwitchToSignUp={handleSwitchToSignUp}
        />
      )}

      {showSignUp && (
        <SignUpForm 
          onClose={handleCloseSignUp} 
          onSwitchToLogin={handleSwitchToLogin}
        />
      )}
    </nav>
  );
};

export default Navbar;
