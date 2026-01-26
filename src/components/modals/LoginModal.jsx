import React from 'react';
import { LogIn, Mail, Key, Shield, Calculator } from 'lucide-react';

const LoginModal = ({ 
  showLogin, 
  setShowLogin, 
  loginEmail, 
  setLoginEmail, 
  loginPassword, 
  setLoginPassword, 
  loginError, 
  handleLogin, 
  handleGoogleLogin, 
  loginAsGuest,
  setShowRegister 
}) => {
  if (!showLogin) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3><LogIn size={24} /> Sign In</h3>
          <button className="modal-close" onClick={() => setShowLogin(false)}>×</button>
        </div>
        
        <div className="modal-body">
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label><Mail size={16} /> Email Address</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            
            <div className="form-group">
              <label><Key size={16} /> Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            
            {loginError && (
              <div className="error-message">
                {loginError}
              </div>
            )}
            
            <button type="submit" className="btn btn-primary btn-block">
              <LogIn size={18} /> Sign In
            </button>
          </form>
          
          <div className="auth-divider">
            <span>OR</span>
          </div>
          
          <button 
            className="btn btn-google btn-block"
            onClick={handleGoogleLogin}
          >
            <Shield size={18} /> Sign in with Google
          </button>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <button 
            className="btn btn-outline btn-block"
            onClick={loginAsGuest}
          >
            <Calculator size={18} /> Continue as Guest
            <small className="guest-note">(Calculations won't be saved)</small>
          </button>
          
          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <button 
                className="auth-link" 
                onClick={() => {
                  setShowLogin(false);
                  setShowRegister(true);
                }}
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
