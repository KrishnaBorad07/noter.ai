import React, { useState } from 'react';
import './SignUpForm.css';
import googleIcon from '../../assets/google.webp';
import appleIcon from '../../assets/apple.png';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const SignUpForm = ({ onClose, onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    // Handle signup logic here
    console.log('Signup attempt with:', { email, password });
    // After successful signup, switch to login with the email
    onSwitchToLogin(email);
  };

  const handleClose = (e) => {
    e.stopPropagation();
    onClose();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="signup-form-container" onClick={handleClose}>
      <div className="signup-form" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={handleClose}>×</button>
        <h2>Create Account</h2>
        <p className="subtitle">Sign up to get started with Noter AI</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirm-password">Confirm Password</label>
            <div className="password-input">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={toggleConfirmPasswordVisibility}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          
          <button type="submit" className="form-signup-btn">Create Account</button>
        </form>
        
        <div className="divider">
          <span>or continue with</span>
        </div>
        
        <div className="social-signup">
          <button className="social-btn">
            <img src={googleIcon} alt="Google" />
            Sign up with Google
          </button>
          <button className="social-btn">
            <img src={appleIcon} alt="Apple" />
            Sign up with Apple
          </button>
        </div>
        
        <div className="login-link">
          Already have an account? <a href="#" onClick={(e) => {
            e.preventDefault();
            onSwitchToLogin();
          }}>Log in</a>
        </div>
      </div>
    </div>
  );
};

export default SignUpForm; 