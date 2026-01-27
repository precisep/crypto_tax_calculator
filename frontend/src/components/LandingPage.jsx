import React from 'react';
import { 
  Calculator, FileSpreadsheet, DollarSign, Shield, PieChart, 
  Smartphone, CheckCircle, Mail, UserPlus, LogIn, Zap
} from 'lucide-react';

const LandingPage = ({ onLogin, onRegister, onGuest, onGoogleLogin }) => {
  return (
    <div className="landing-page">
      <div className="landing-content">
        <div className="landing-hero">
          <div className="hero-header">
            <div className="hero-logo">
              <Calculator size={48} />
              <div className="hero-title">
                <h1>TaxTim Crypto Tax Calculator</h1>
                <p className="hero-subtitle">SARS-Compliant FIFO Calculations for South Africa</p>
              </div>
            </div>
          </div>
          
          <div className="hero-features">
            <div className="feature">
              <CheckCircle size={24} />
              <div>
                <h4>SARS Compliant</h4>
                <p>Official FIFO method with R40,000 annual exclusion</p>
              </div>
            </div>
            <div className="feature">
              <FileSpreadsheet size={24} />
              <div>
                <h4>Easy Upload</h4>
                <p>Upload from Excel, CSV or JSON from any exchange</p>
              </div>
            </div>
            <div className="feature">
              <DollarSign size={24} />
              <div>
                <h4>Accurate Calculations</h4>
                <p>Precise capital gains and tax liability calculations</p>
              </div>
            </div>
            <div className="feature">
              <Shield size={24} />
              <div>
                <h4>Secure & Private</h4>
                <p>Your data is encrypted and never shared</p>
              </div>
            </div>
            <div className="feature">
              <PieChart size={24} />
              <div>
                <h4>Detailed Reports</h4>
                <p>Export comprehensive tax reports for SARS</p>
              </div>
            </div>
            <div className="feature">
              <Smartphone size={24} />
              <div>
                <h4>Mobile Friendly</h4>
                <p>Works perfectly on all devices</p>
              </div>
            </div>
          </div>

          <div className="hero-cta">
            <h2>Calculate Your Crypto Taxes in Minutes</h2>
            <p>Join thousands of South Africans who trust TaxTim for their crypto tax calculations</p>
            
            <div className="cta-buttons">
              <button className="btn btn-primary btn-lg" onClick={onGoogleLogin}>
                <Shield size={20} />
                Sign in with Google
              </button>
              <button className="btn btn-secondary btn-lg" onClick={onLogin}>
                <Mail size={20} />
                Sign in with Email
              </button>
              <button className="btn btn-outline btn-lg" onClick={onGuest}>
                <Calculator size={20} />
                Try as Guest
              </button>
            </div>
          </div>

          <div className="hero-testimonials">
            <div className="testimonial">
              <p>"Saved me hours of manual calculations. The FIFO method made easy!"</p>
              <span>- Crypto Investor</span>
            </div>
            <div className="testimonial">
              <p>"Perfect for SARS compliance. The tax reports are exactly what I need."</p>
              <span>- Tax Consultant</span>
            </div>
          </div>
        </div>
        
        <div className="landing-auth">
          <div className="auth-card">
            <div className="auth-header">
              <Zap size={32} className="auth-icon" />
              <h3>Get Started in Seconds</h3>
              <p>Choose how you'd like to get started</p>
            </div>
            
            <button className="btn btn-google btn-lg" onClick={onGoogleLogin}>
              <Shield size={20} />
              Continue with Google
              <span className="btn-badge">Recommended</span>
            </button>
            
            <div className="auth-divider">
              <span>or continue with email</span>
            </div>
            
            <div className="auth-options">
              <button className="btn btn-primary btn-lg" onClick={onRegister}>
                <UserPlus size={20} />
                Create Free Account
              </button>
              
              <button className="btn btn-secondary btn-lg" onClick={onLogin}>
                <LogIn size={20} />
                Sign In to Existing Account
              </button>
              
              <button className="btn btn-outline btn-lg" onClick={onGuest}>
                <Calculator size={20} />
                Explore as Guest
                <span className="guest-note">No account required • Calculations won't be saved</span>
              </button>
            </div>
            
            <div className="auth-benefits">
              <h4>Why create an account?</h4>
              <ul>
                <li>✓ Save your calculations for future reference</li>
                <li>✓ Access your tax reports from any device</li>
                <li>✓ Secure encryption for your financial data</li>
                <li>✓ Get email support</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <div className="landing-footer">
        <p>© 2024 TaxTim Crypto Tax Calculator • SARS Compliant • Official TaxTim Partner</p>
        <p className="disclaimer">This tool provides estimates for informational purposes only. Consult a tax professional for official tax advice.</p>
      </div>
    </div>
  );
};

export default LandingPage;
