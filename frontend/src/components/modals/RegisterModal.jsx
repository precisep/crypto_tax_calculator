import React from 'react';
import { UserPlus, User, Mail, Lock, Shield, Calculator } from 'lucide-react';

const RegisterModal = ({ 
  showRegister, 
  setShowRegister, 
  registerName, 
  setRegisterName, 
  registerEmail, 
  setRegisterEmail, 
  registerPassword, 
  setRegisterPassword, 
  registerConfirmPassword, 
  setRegisterConfirmPassword, 
  registerError, 
  handleRegister, 
  handleGoogleLogin, 
  loginAsGuest,
  setShowLogin 
}) => {
  if (!showRegister) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3><UserPlus size={24} /> Create Account</h3>
          <button className="modal-close" onClick={() => setShowRegister(false)}>×</button>
        </div>
        
        <div className="modal-body">
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label><User size={16} /> Full Name</label>
              <input
                type="text"
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
            
            <div className="form-group">
              <label><Mail size={16} /> Email Address</label>
              <input
                type="email"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            
            <div className="form-group">
              <label><Lock size={16} /> Password</label>
              <input
                type="password"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <small>Minimum 8 characters</small>
            </div>
            
            <div className="form-group">
              <label><Lock size={16} /> Confirm Password</label>
              <input
                type="password"
                value={registerConfirmPassword}
                onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            
            {registerError && (
              <div className="error-message">
                {registerError}
              </div>
            )}
            
            <button type="submit" className="btn btn-primary btn-block">
              <UserPlus size={18} /> Create Account
            </button>
          </form>
          
          <div className="auth-divider">
            <span>OR</span>
          </div>
          
          <button 
            className="btn btn-google btn-block"
            onClick={handleGoogleLogin}
          >
            <Shield size={18} /> Sign up with Google
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
              Already have an account?{' '}
              <button 
                className="auth-link" 
                onClick={() => {
                  setShowRegister(false);
                  setShowLogin(true);
                }}
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;
