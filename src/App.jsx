import React, { useState, useEffect, useRef } from 'react';
import { 
  Calculator, Upload, Download, ChevronDown, ChevronUp, Plus, 
  Trash2, Copy, FileText, FileSpreadsheet, FileJson, HelpCircle, 
  Calendar, TrendingUp, TrendingDown, Wallet, Coins, Clock, 
  BarChart3, User, LogOut, Save, FolderOpen, LogIn, UserPlus, 
  Shield, Key, Mail, Lock, FileSpreadsheet as ExcelIcon, 
  CheckCircle, DollarSign, PieChart, Smartphone, Zap
} from 'lucide-react';
import * as XLSX from 'xlsx';
import './App.css';
import { useAuth } from './AuthContext';

// Landing Page Component
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

// Main App Component
function App() {
  const { 
    user, 
    token, 
    loading: authLoading, 
    login, 
    register, 
    googleLogin, 
    logout, 
    saveTransactions, 
    getCalculations, 
    loadCalculation 
  } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedAll, setExpandedAll] = useState(false);
  const [activeTab, setActiveTab] = useState('input');
  const [inputText, setInputText] = useState('');
  const [uploadMode, setUploadMode] = useState('json');
  const [showHelp, setShowHelp] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showCalculations, setShowCalculations] = useState(false);
  const [calculationsList, setCalculationsList] = useState([]);
  const [saveName, setSaveName] = useState('');
  const [isGuest, setIsGuest] = useState(false);
  const fileInputRef = useRef(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerError, setRegisterError] = useState('');

  // Check for OAuth callback
  useEffect(() => {
    const handleOAuthCallback = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const tokenParam = urlParams.get('token');
      const userParam = urlParams.get('user');
      
      if (tokenParam && userParam) {
        try {
          const userData = JSON.parse(decodeURIComponent(userParam));
          
          // Store in localStorage
          localStorage.setItem('token', tokenParam);
          
          // Clear URL parameters
          window.history.replaceState({}, document.title, window.location.pathname);
          
          // Reload the page to trigger auth context update
          window.location.reload();
        } catch (error) {
          console.error('Error parsing OAuth callback:', error);
        }
      }
    };

    handleOAuthCallback();
  }, []);

  // Load example data for guest users
  useEffect(() => {
    if (isGuest && transactions.length === 0) {
      loadExample();
    }
  }, [isGuest]);

  const loadExample = () => {
    const example = [
      {
        coin: 'BTC',
        type: 'buy',
        amount: 0.5,
        price: 400000,
        date: '2023-03-15',
        wallet: 'Luno',
        fee: 0.001,
        fee_coin: 'BTC',
        description: 'Initial Bitcoin purchase'
      },
      {
        coin: 'ETH',
        type: 'buy',
        amount: 3.2,
        price: 25000,
        date: '2023-04-10',
        wallet: 'Binance',
        fee: 0.0005,
        fee_coin: 'BNB',
        description: 'Ethereum investment'
      },
      {
        coin: 'BTC',
        type: 'sell',
        amount: 0.4,
        price: 720000,
        date: '2024-01-20',
        wallet: 'Luno',
        fee: 0.0006,
        fee_coin: 'BTC',
        description: 'Partial Bitcoin sale'
      },
      {
        coin: 'ETH',
        type: 'trade',
        amount: 1.0,
        price: 28000,
        date: '2023-10-05',
        wallet: 'Binance',
        from_coin: 'ETH',
        to_coin: 'MATIC',
        fee: 0.001,
        fee_coin: 'BNB',
        description: 'Traded ETH for MATIC'
      },
      {
        coin: 'BTC',
        type: 'transfer',
        amount: 0.2,
        price: 0,
        date: '2023-09-10',
        wallet: 'Luno',
        from_wallet: 'Luno',
        to_wallet: 'Hardware Wallet',
        fee: 0.0003,
        fee_coin: 'BTC',
        description: 'Moved to cold storage'
      }
    ];
    setTransactions(example);
    setInputText(JSON.stringify(example, null, 2));
    setUploadMode('json');
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setError('');
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        let parsedData = [];
        
        if (uploadMode === 'json') {
          const text = e.target.result;
          parsedData = JSON.parse(text);
          if (!Array.isArray(parsedData)) {
            throw new Error('JSON must be an array of transactions');
          }
          setInputText(text);
          
        } else if (uploadMode === 'csv') {
          const csvText = e.target.result;
          parsedData = parseCSV(csvText);
          setInputText(JSON.stringify(parsedData, null, 2));
          
        } else if (uploadMode === 'excel') {
          const data = new Uint8Array(e.target.result);
          parsedData = parseExcel(data);
          setInputText(JSON.stringify(parsedData, null, 2));
        }

        const validatedData = validateTransactions(parsedData);
        setTransactions(validatedData);
        
      } catch (err) {
        setError(`Error parsing ${uploadMode.toUpperCase()} file: ${err.message}`);
        console.error('Parse error:', err);
      }
    };

    reader.onerror = () => {
      setError('Error reading file');
    };

    if (uploadMode === 'excel') {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  };

  // Parse CSV file
  const parseCSV = (csvText) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) throw new Error('CSV file must have header row and at least one data row');
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    return lines.slice(1).map((line, index) => {
      const values = parseCSVLine(line);
      const transaction = {};
      
      headers.forEach((header, idx) => {
        if (values[idx] !== undefined) {
          const value = values[idx].trim();
          
          if (['amount', 'price', 'fee'].includes(header)) {
            transaction[header] = parseFloat(value) || 0;
          } else if (header === 'date') {
            transaction[header] = formatDate(value);
          } else {
            transaction[header] = value;
          }
        }
      });
      
      normalizeTransactionFields(transaction);
      return transaction;
    });
  };

  const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current);
    return result;
  };

  // Parse Excel file
  const parseExcel = (data) => {
    const workbook = XLSX.read(data, { type: 'array' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
    
    return jsonData.map(row => {
      const transaction = {};
      
      Object.entries(row).forEach(([key, value]) => {
        const normalizedKey = key.trim().toLowerCase();
        
        if (normalizedKey.includes('date')) {
          transaction['date'] = formatDate(value);
        } else if (normalizedKey.includes('coin') || normalizedKey.includes('crypto') || normalizedKey.includes('asset')) {
          transaction['coin'] = String(value).toUpperCase().trim();
        } else if (normalizedKey.includes('type') || normalizedKey.includes('action')) {
          transaction['type'] = String(value).toLowerCase().trim();
        } else if (normalizedKey.includes('amount') || normalizedKey.includes('quantity')) {
          transaction['amount'] = parseFloat(value) || 0;
        } else if (normalizedKey.includes('price') || normalizedKey.includes('rate') || normalizedKey.includes('cost')) {
          transaction['price'] = parseFloat(value) || 0;
        } else if (normalizedKey.includes('wallet') || normalizedKey.includes('exchange') || normalizedKey.includes('platform')) {
          transaction['wallet'] = String(value).trim();
        } else if (normalizedKey.includes('from_coin') || normalizedKey.includes('source_coin')) {
          transaction['from_coin'] = String(value).toUpperCase().trim();
        } else if (normalizedKey.includes('to_coin') || normalizedKey.includes('target_coin')) {
          transaction['to_coin'] = String(value).toUpperCase().trim();
        } else if (normalizedKey.includes('from_wallet') || normalizedKey.includes('source_wallet')) {
          transaction['from_wallet'] = String(value).trim();
        } else if (normalizedKey.includes('to_wallet') || normalizedKey.includes('target_wallet')) {
          transaction['to_wallet'] = String(value).trim();
        } else if (normalizedKey.includes('fee')) {
          transaction['fee'] = parseFloat(value) || 0;
        } else if (normalizedKey.includes('fee_coin')) {
          transaction['fee_coin'] = String(value).toUpperCase().trim();
        } else if (normalizedKey.includes('description') || normalizedKey.includes('notes')) {
          transaction['description'] = String(value).trim();
        }
      });
      
      normalizeTransactionFields(transaction);
      return transaction;
    });
  };

  const normalizeTransactionFields = (transaction) => {
    if (transaction['type']) {
      transaction['type'] = transaction['type'].toLowerCase();
    }
    if (transaction['crypto'] && !transaction['coin']) {
      transaction['coin'] = transaction['crypto'];
      delete transaction['crypto'];
    }
    if (transaction['exchange'] && !transaction['wallet']) {
      transaction['wallet'] = transaction['exchange'];
      delete transaction['exchange'];
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return new Date().toISOString().split('T')[0];
    
    try {
      if (typeof dateString === 'number') {
        const excelEpoch = new Date(1899, 11, 30);
        const date = new Date(excelEpoch.getTime() + dateString * 24 * 60 * 60 * 1000);
        return date.toISOString().split('T')[0];
      }
      
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
      
      const parts = String(dateString).split(/[/-]/);
      if (parts.length === 3) {
        const [a, b, c] = parts.map(p => parseInt(p, 10));
        const date1 = new Date(c, b - 1, a);
        const date2 = new Date(c, a - 1, b);
        
        if (!isNaN(date1.getTime())) return date1.toISOString().split('T')[0];
        if (!isNaN(date2.getTime())) return date2.toISOString().split('T')[0];
      }
      
      return new Date().toISOString().split('T')[0];
    } catch (err) {
      return new Date().toISOString().split('T')[0];
    }
  };

  const validateTransactions = (data) => {
    if (!Array.isArray(data)) {
      throw new Error('Data must be an array');
    }
    
    return data.map((tx, index) => {
      const validated = { ...tx };
      
      if (!validated.type) validated.type = 'buy';
      if (!validated.coin) validated.coin = 'BTC';
      if (!validated.amount) validated.amount = 0;
      if (!validated.price) validated.price = 0;
      if (!validated.date) validated.date = new Date().toISOString().split('T')[0];
      if (!validated.wallet) validated.wallet = 'default';
      
      validated.type = String(validated.type).toLowerCase();
      validated.coin = String(validated.coin).toUpperCase();
      validated.amount = parseFloat(validated.amount) || 0;
      validated.price = parseFloat(validated.price) || 0;
      
      return validated;
    });
  };

  const triggerFileInput = (mode) => {
    setUploadMode(mode);
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 0);
  };

  const downloadCSVTemplate = () => {
    const headers = ['date', 'coin', 'type', 'amount', 'price', 'wallet', 'from_coin', 'to_coin', 'from_wallet', 'to_wallet', 'fee', 'fee_coin', 'description'];
    const example = [
      {
        date: '2023-03-15',
        coin: 'BTC',
        type: 'buy',
        amount: 0.5,
        price: 400000,
        wallet: 'Luno',
        from_coin: '',
        to_coin: '',
        from_wallet: '',
        to_wallet: '',
        fee: 0.001,
        fee_coin: 'BTC',
        description: 'Initial Bitcoin purchase'
      },
      {
        date: '2024-01-20',
        coin: 'BTC',
        type: 'sell',
        amount: 0.4,
        price: 720000,
        wallet: 'Luno',
        from_coin: '',
        to_coin: '',
        from_wallet: '',
        to_wallet: '',
        fee: 0.0006,
        fee_coin: 'BTC',
        description: 'Partial Bitcoin sale'
      }
    ];
    
    const csv = [
      headers.join(','),
      ...example.map(row => headers.map(h => row[h] || '').join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'taxtim-crypto-template.csv';
    a.click();
  };

  const handleParse = () => {
    try {
      const parsed = JSON.parse(inputText);
      if (!Array.isArray(parsed)) throw new Error('Input must be an array');
      const validated = validateTransactions(parsed);
      setTransactions(validated);
      setError('');
    } catch (err) {
      setError('Invalid JSON format');
    }
  };

  const handleCalculate = async () => {
    if (transactions.length === 0) {
      setError('No transactions to calculate');
      return;
    }
  
    setLoading(true);
    setError('');
  
    try {
      const url = `http://localhost:8000/api/calculate-public`;
      
      const cleanTransactions = transactions.map(tx => {
        let date = tx.date;
        try {
          const d = new Date(date);
          if (!isNaN(d.getTime())) {
            date = d.toISOString().split('T')[0];
          } else {
            date = new Date().toISOString().split('T')[0];
          }
        } catch {
          date = new Date().toISOString().split('T')[0];
        }

        return {
          type: tx.type,
          amount: parseFloat(tx.amount),
          price: parseFloat(tx.price),
          date: date,
          coin: tx.coin,
          wallet: tx.wallet || 'default',
          ...(tx.from_coin && { from_coin: tx.from_coin }),
          ...(tx.to_coin && { to_coin: tx.to_coin }),
          ...(tx.from_wallet && { from_wallet: tx.from_wallet }),
          ...(tx.to_wallet && { to_wallet: tx.to_wallet }),
        };
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactions: cleanTransactions }),
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`Invalid JSON response from server: ${responseText.substring(0, 100)}...`);
      }
      
      if (!response.ok) {
        throw new Error(data.error || `Calculation failed with status ${response.status}`);
      }

      if (data.success) {
        const resultsWithDetails = data.data.results.map(result => ({
          ...result,
          showDetails: false,
          matched_buys: result.matched_buys || []
        }));
        
        setResults({
          ...data.data,
          results: resultsWithDetails,
          taxParameters: data.tax_parameters || {
            annual_exclusion: 40000,
            short_term_rate: 18,
            long_term_rate: 10,
            long_term_threshold_years: 3
          }
        });
        setActiveTab('results');
        setError('');
      } else {
        throw new Error(data.error || 'Invalid response format');
      }
    } catch (err) {
      console.error('Calculation error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      setShowLogin(true);
      return;
    }

    if (transactions.length === 0) {
      setError('No transactions to save');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const name = saveName.trim() || `Calculation ${new Date().toLocaleDateString()}`;
      const result = await saveTransactions(transactions, name);
      
      if (result.success) {
        alert(`Calculation saved as "${name}"`);
        setSaveName('');
        
        const calculationsResult = await getCalculations();
        if (calculationsResult.success) {
          setCalculationsList(calculationsResult.calculations);
        }
      } else {
        setError(result.message || 'Failed to save calculation');
      }
    } catch (err) {
      setError('Failed to save calculation');
      console.error('Save error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadCalculations = async () => {
    if (!user) {
      setShowLogin(true);
      return;
    }

    const result = await getCalculations();
    
    if (result.success) {
      setCalculationsList(result.calculations);
      setShowCalculations(true);
    } else {
      setError(result.message);
    }
  };

  const handleLoadCalculation = async (id) => {
    const result = await loadCalculation(id);
    
    if (result.success) {
      const calc = result.calculation;
      setTransactions(calc.transactions);
      setInputText(JSON.stringify(calc.transactions, null, 2));
      
      if (calc.results) {
        const resultsWithDetails = calc.results.results?.map(r => ({
          ...r,
          showDetails: false,
          matched_buys: r.matched_buys || []
        })) || [];
        
        setResults({
          ...calc.results,
          results: resultsWithDetails,
          taxParameters: calc.results.tax_parameters || {
            annual_exclusion: 40000,
            short_term_rate: 18,
            long_term_rate: 10,
            long_term_threshold_years: 3
          }
        });
        setActiveTab('results');
      } else {
        setResults(null);
      }
      
      setShowCalculations(false);
      alert(`Loaded calculation "${calc.name}"`);
    } else {
      setError(result.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    
    const result = await login(loginEmail, loginPassword);
    
    if (result.success) {
      setIsGuest(false);
      setShowLogin(false);
      setLoginEmail('');
      setLoginPassword('');
    } else {
      setLoginError(result.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError('');
    
    if (registerPassword !== registerConfirmPassword) {
      setRegisterError('Passwords do not match');
      return;
    }
    
    if (registerPassword.length < 8) {
      setRegisterError('Password must be at least 8 characters');
      return;
    }
    
    const result = await register(registerName, registerEmail, registerPassword);
    
    if (result.success) {
      setIsGuest(false);
      setShowRegister(false);
      setRegisterName('');
      setRegisterEmail('');
      setRegisterPassword('');
      setRegisterConfirmPassword('');
    } else {
      setRegisterError(result.message);
    }
  };

  const handleGoogleLogin = () => {
    // Just redirect to the Google OAuth endpoint
    window.location.href = 'http://localhost:8000/api/auth/google';
  };

  const loginAsGuest = () => {
    setIsGuest(true);
    setShowLogin(false);
    setShowRegister(false);
  };

  const addTransaction = () => {
    const newTx = {
      coin: 'BTC',
      type: 'buy',
      amount: 0,
      price: 0,
      date: new Date().toISOString().split('T')[0],
      wallet: 'default',
      description: 'New transaction'
    };
    const updated = [...transactions, newTx];
    setTransactions(updated);
    setInputText(JSON.stringify(updated, null, 2));
  };

  const updateTransaction = (index, field, value) => {
    const updated = [...transactions];
    
    if (field === 'date') {
      const d = new Date(value);
      updated[index].date = !isNaN(d.getTime()) 
        ? d.toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
    } else if (field === 'type' && value === 'trade') {
      updated[index].from_coin = updated[index].coin || 'BTC';
      updated[index].to_coin = 'ETH';
    } else if (field === 'type' && value === 'transfer') {
      updated[index].from_wallet = updated[index].wallet || 'default';
      updated[index].to_wallet = 'hardware';
    } else {
      updated[index][field] = field === 'coin' ? value.toUpperCase() : value;
    }
    
    setTransactions(updated);
    setInputText(JSON.stringify(updated, null, 2));
  };

  const removeTransaction = (index) => {
    const updated = transactions.filter((_, i) => i !== index);
    setTransactions(updated);
    setInputText(JSON.stringify(updated, null, 2));
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return 'R 0.00';
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatNumber = (num, decimals = 8) => {
    if (num === undefined || num === null) return '0';
    const number = parseFloat(num);
    if (isNaN(number)) return '0';
    
    if (number === 0) return '0';
    if (Math.abs(number) < 0.000001) {
      return number.toExponential(decimals - 1);
    }
    return number.toFixed(decimals).replace(/\.?0+$/, '');
  };

  const toggleResultDetails = (index) => {
    if (!results || !results.results) return;
    
    const updatedResults = [...results.results];
    updatedResults[index].showDetails = !updatedResults[index].showDetails;
    setResults({
      ...results,
      results: updatedResults
    });
  };

  const toggleAllDetails = () => {
    if (!results || !results.results) return;
    
    const updatedResults = results.results.map(result => ({
      ...result,
      showDetails: !expandedAll
    }));
    
    setResults({
      ...results,
      results: updatedResults
    });
    setExpandedAll(!expandedAll);
  };

  const exportToCSV = () => {
    if (!results || !results.results) return;
    
    const headers = ['Transaction ID', 'Type', 'Date', 'Coin', 'Amount', 'Price (R)', 'Cost Basis (R)', 'Proceeds (R)', 'Capital Gain/Loss (R)', 'Tax Year', 'Tax Rate (%)', 'Tax Amount (R)'];
    const rows = results.results.flatMap(result => {
      if (result.matched_buys && result.matched_buys.length > 0) {
        return result.matched_buys.map(buy => [
          result.transaction_id || '',
          result.type || '',
          result.date || '',
          result.coin || result.from_coin || '',
          buy.amount_sold || 0,
          buy.buy_price || 0,
          buy.cost || 0,
          buy.proceeds || 0,
          buy.gain || 0,
          result.tax_year || '',
          buy.tax_rate || '',
          buy.tax_amount || 0
        ]);
      }
      return [[
        result.transaction_id || '',
        result.type || '',
        result.date || '',
        result.coin || result.from_coin || '',
        result.amount || 0,
        result.price || 0,
        '',
        '',
        result.capital_gain || 0,
        result.tax_year || '',
        '',
        ''
      ]];
    });
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taxtim-crypto-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getTransactionDetails = (result) => {
    switch (result.type) {
      case 'BUY':
        return `Bought ${formatNumber(result.amount)} ${result.coin}`;
      case 'SELL':
        return `Sold ${formatNumber(result.amount)} ${result.coin}`;
      case 'TRADE':
        return `Traded ${formatNumber(result.amount)} ${result.from_coin} for ${formatNumber(result.received_amount || 0)} ${result.to_coin}`;
      case 'TRANSFER':
        return `Transferred ${formatNumber(result.amount)} ${result.coin}`;
      default:
        return '';
    }
  };

  const renderStepByStepMath = (result) => {
    if (!result.matched_buys || result.matched_buys.length === 0) return null;
    
    return (
      <div className="step-by-step">
        <h4>Step-by-Step Calculation:</h4>
        {result.matched_buys.map((buy, index) => (
          <div key={index} className="calculation-step">
            <div className="step-number">Step {index + 1}</div>
            <div className="step-details">
              <p>
                <strong>Cost Basis:</strong> {formatNumber(buy.amount_sold)} × {formatCurrency(buy.buy_price)} = {formatCurrency(buy.cost)}
              </p>
              <p>
                <strong>Proceeds:</strong> {formatNumber(buy.amount_sold)} × {formatCurrency(result.price)} = {formatCurrency(buy.proceeds)}
              </p>
              <p>
                <strong>Capital Gain:</strong> {formatCurrency(buy.proceeds)} - {formatCurrency(buy.cost)} = {formatCurrency(buy.gain)}
              </p>
              <p>
                <strong>Holding Period:</strong> {buy.holding_years?.toFixed(1) || '0'} years
                {buy.is_long_term && ' (Long-term ≥ 3 years)'}
              </p>
              <p>
                <strong>Tax Rate:</strong> {buy.is_long_term ? '10% (Long-term)' : '18% (Short-term)'}
              </p>
              <p>
                <strong>Tax Amount:</strong> {formatCurrency(buy.gain)} × {buy.tax_rate}% = {formatCurrency(buy.tax_amount)}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderLoginModal = () => (
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

  const renderRegisterModal = () => (
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

  const renderCalculationsModal = () => (
    <div className="modal-overlay">
      <div className="modal modal-wide">
        <div className="modal-header">
          <h3><FolderOpen size={24} /> Saved Calculations</h3>
          <button className="modal-close" onClick={() => setShowCalculations(false)}>×</button>
        </div>
        
        <div className="modal-body">
          {calculationsList.length === 0 ? (
            <div className="empty-state">
              <FolderOpen size={48} />
              <h4>No saved calculations</h4>
              <p>Save your first calculation to see it here</p>
            </div>
          ) : (
            <div className="calculations-list">
              {calculationsList.map((calc) => (
                <div key={calc.id} className="calculation-item">
                  <div className="calculation-info">
                    <h4>{calc.name}</h4>
                    <p>{calc.transaction_count || 0} transactions • {new Date(calc.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="calculation-actions">
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => handleLoadCalculation(calc.id)}
                    >
                      Load
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderInputTab = () => (
    <div className="tab-content">
      <div className="card">
        <div className="card-header">
          <div className="header-with-help">
            <h2>Upload Your Crypto Transactions</h2>
            <button 
              className="btn-icon help" 
              onClick={() => setShowHelp(!showHelp)}
              title="Show help"
            >
              <HelpCircle size={20} />
            </button>
          </div>
          <p className="card-subtitle">
            {user ? (
              <span className="secure-badge">
                <Shield size={16} /> Signed in as {user.name}
              </span>
            ) : isGuest ? (
              <span className="guest-badge">
                <Calculator size={16} /> Guest Mode - Calculations won't be saved
              </span>
            ) : null}
          </p>
        </div>
        
        {showHelp && (
          <div className="help-section">
            <h3><HelpCircle size={18} /> How to Use This Calculator</h3>
            <div className="help-content">
              <div className="help-item">
                <h4>📊 Supported File Formats</h4>
                <ul>
                  <li><strong>Excel:</strong> Upload .xlsx or .xls files from exchanges like Luno, Binance, VALR</li>
                  <li><strong>CSV:</strong> Export transaction history as CSV from your exchange</li>
                  <li><strong>JSON:</strong> Advanced users can paste JSON directly</li>
                </ul>
              </div>
              <div className="help-item">
                <h4>📈 How It Works</h4>
                <ul>
                  <li><strong>FIFO Method:</strong> SARS requires First-In-First-Out accounting</li>
                  <li><strong>Base Cost:</strong> We track your original purchase prices</li>
                  <li><strong>Capital Gains:</strong> Calculated when you sell, trade, or dispose of crypto</li>
                  <li><strong>Tax Year:</strong> South African tax year runs 1 March - 28 February</li>
                </ul>
              </div>
              <div className="help-item">
                <h4>💰 SARS Tax Rates</h4>
                <ul>
                  <li><strong>Short-term (&lt;3 years):</strong> 18% inclusion rate</li>
                  <li><strong>Long-term (≥3 years):</strong> 10% inclusion rate</li>
                  <li><strong>Annual Exclusion:</strong> R40,000 per tax year</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* User Actions */}
        <div className="user-actions">
          {user ? (
            <div className="user-info">
              <div className="user-profile">
                <User size={20} />
                <div>
                  <div className="user-name">{user.name}</div>
                  <div className="user-status">{user.email}</div>
                </div>
              </div>
              <div className="user-buttons">
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={handleLoadCalculations}
                >
                  <FolderOpen size={16} />
                  Saved
                </button>
                <button 
                  className="btn btn-danger btn-sm"
                  onClick={logout}
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          ) : isGuest ? (
            <div className="auth-actions">
              <button 
                className="btn btn-primary"
                onClick={() => setShowLogin(true)}
              >
                <LogIn size={16} />
                Sign In
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setShowRegister(true)}
              >
                <UserPlus size={16} />
                Sign Up
              </button>
              <div className="guest-info">
                <Calculator size={14} />
                <span>Guest Mode - Calculations won't be saved</span>
              </div>
            </div>
          ) : null}
        </div>

        {/* Upload Section */}
        <div className="upload-section">
          <div className="upload-modes">
            <button 
              className={`upload-mode-btn ${uploadMode === 'excel' ? 'active' : ''}`}
              onClick={() => triggerFileInput('excel')}
            >
              <ExcelIcon size={18} />
              Excel Upload
              <span className="mode-badge">Recommended</span>
            </button>
            <button 
              className={`upload-mode-btn ${uploadMode === 'csv' ? 'active' : ''}`}
              onClick={() => triggerFileInput('csv')}
            >
              <FileText size={18} />
              CSV Upload
            </button>
            <button 
              className={`upload-mode-btn ${uploadMode === 'json' ? 'active' : ''}`}
              onClick={() => setUploadMode('json')}
            >
              <FileJson size={18} />
              JSON Editor
            </button>
          </div>
          
          <div className="upload-actions">
            <button 
              className="btn btn-secondary"
              onClick={() => triggerFileInput(uploadMode)}
            >
              <Upload size={18} />
              Upload {uploadMode === 'excel' ? 'Excel File' : uploadMode === 'csv' ? 'CSV File' : 'JSON File'}
            </button>
            
            <button 
              className="btn btn-secondary"
              onClick={downloadCSVTemplate}
            >
              <Download size={18} />
              Download Template
            </button>
            
            <button className="btn btn-secondary" onClick={loadExample}>
              Load Example Data
            </button>
          </div>
          
          <div className="upload-info">
            <p><strong>Required Columns:</strong> date, coin, type (buy/sell/trade/transfer), amount, price (ZAR), wallet</p>
            <p><strong>Download</strong> your transaction history from your exchange and upload it here</p>
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept={uploadMode === 'json' ? '.json' : uploadMode === 'csv' ? '.csv' : '.xlsx,.xls'}
          style={{ display: 'none' }}
        />

        {/* Save Section */}
        {user && (
          <div className="save-section">
            <div className="save-controls">
              <input
                type="text"
                className="save-input"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Calculation name (optional)"
              />
              <button 
                className="btn btn-primary"
                onClick={handleSave}
                disabled={transactions.length === 0 || loading}
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Calculation
                  </>
                )}
              </button>
            </div>
            <p className="save-note">Your calculations are securely stored and can be accessed anytime</p>
          </div>
        )}

        {/* JSON Editor */}
        <div className="input-section">
          <div className="input-header">
            <h3>Transaction Data ({transactions.length} transactions loaded)</h3>
            <div className="input-header-actions">
              <button className="btn btn-secondary btn-sm" onClick={handleParse}>
                Parse JSON
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => navigator.clipboard.writeText(inputText)}>
                <Copy size={16} />
                Copy
              </button>
            </div>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder='Paste your transaction data here in JSON format...'
            rows={12}
            className="json-input"
          />
        </div>

        {/* Transaction Table */}
        <div className="table-container">
          <div className="table-header">
            <div>
              <h3>Transaction Preview</h3>
              <p className="table-subtitle">Review and edit your transactions before calculation</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={addTransaction}>
              <Plus size={16} />
              Add Transaction
            </button>
          </div>
          
          {transactions.length === 0 ? (
            <div className="empty-state">
              <FileSpreadsheet size={48} />
              <h4>No transactions loaded</h4>
              <p>Upload a file from your exchange or use the example data</p>
            </div>
          ) : (
            <>
              <div className="table-wrapper">
                <table className="transaction-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th><Calendar size={14} /> Date</th>
                      <th><Coins size={14} /> Coin</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Price (R)</th>
                      <th><Wallet size={14} /> Wallet</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx, index) => (
                      <tr key={index}>
                        <td className="row-number">{index + 1}</td>
                        <td>
                          <input
                            type="date"
                            value={tx.date}
                            onChange={(e) => updateTransaction(index, 'date', e.target.value)}
                            className="table-input"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={tx.coin}
                            onChange={(e) => updateTransaction(index, 'coin', e.target.value)}
                            className="table-input"
                            placeholder="BTC"
                          />
                        </td>
                        <td>
                          <select
                            value={tx.type}
                            onChange={(e) => updateTransaction(index, 'type', e.target.value)}
                            className="table-select"
                          >
                            <option value="buy">BUY</option>
                            <option value="sell">SELL</option>
                            <option value="trade">TRADE</option>
                            <option value="transfer">TRANSFER</option>
                          </select>
                        </td>
                        <td>
                          <input
                            type="number"
                            step="0.00000001"
                            value={tx.amount}
                            onChange={(e) => updateTransaction(index, 'amount', parseFloat(e.target.value))}
                            className="table-input"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            step="0.01"
                            value={tx.price}
                            onChange={(e) => updateTransaction(index, 'price', parseFloat(e.target.value))}
                            className="table-input"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={tx.wallet || 'default'}
                            onChange={(e) => updateTransaction(index, 'wallet', e.target.value)}
                            className="table-input"
                          />
                        </td>
                        <td>
                          <button 
                            className="btn-icon danger" 
                            onClick={() => removeTransaction(index)}
                            title="Remove"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="calculate-section">
                <div className="calculate-info">
                  <Calculator size={20} />
                  <div>
                    <h4>Ready to Calculate</h4>
                    <p>Click below to process {transactions.length} transactions using SARS FIFO method</p>
                    {!user && (
                      <p className="auth-prompt">
                        <Lock size={14} /> <strong>Note:</strong> Sign in to save your calculations for future reference
                      </p>
                    )}
                  </div>
                </div>
                <button 
                  className="btn btn-primary btn-lg" 
                  onClick={handleCalculate}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner"></div>
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Calculator size={20} />
                      Calculate SARS Tax Liability
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>
    </div>
  );

  const renderResultsTab = () => (
    <div className="tab-content">
      <div className="card">
        <div className="results-header">
          <div>
            <h2>Tax Calculation Results</h2>
            <p className="results-subtitle">SARS FIFO calculations for your crypto transactions</p>
          </div>
          <div className="results-actions">
            <button 
              className="btn btn-secondary"
              onClick={toggleAllDetails}
            >
              {expandedAll ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              {expandedAll ? 'Collapse All' : 'Expand All'}
            </button>
            <button 
              className="btn btn-primary" 
              onClick={exportToCSV}
            >
              <Download size={18} />
              Export Full Report
            </button>
          </div>
        </div>

        <div className="results-summary">
          <div className="summary-card primary">
            <div className="summary-icon">
              <TrendingUp size={24} />
            </div>
            <div>
              <div className="summary-label">Total Capital Gain</div>
              <div className="summary-value">
                {formatCurrency(results.totalCapitalGain || 0)}
              </div>
            </div>
          </div>
          <div className="summary-card warning">
            <div className="summary-icon">
              <Calculator size={24} />
            </div>
            <div>
              <div className="summary-label">Total Tax Due</div>
              <div className="summary-value">
                {formatCurrency(results.totalTax || 0)}
              </div>
            </div>
          </div>
          <div className="summary-card info">
            <div className="summary-icon">
              <BarChart3 size={24} />
            </div>
            <div>
              <div className="summary-label">Transactions</div>
              <div className="summary-value">
                {results.summary?.transactions_processed || results.transactions?.length || 0}
              </div>
            </div>
          </div>
          <div className="summary-card success">
            <div className="summary-icon">
              <Calendar size={24} />
            </div>
            <div>
              <div className="summary-label">Tax Years</div>
              <div className="summary-value">
                {results.yearlySummary?.length || 0}
              </div>
            </div>
          </div>
        </div>

        <div className="fifo-explanation">
          <h3><Calculator size={20} /> How SARS FIFO Works</h3>
          <p>SARS requires <strong>First-In-First-Out (FIFO)</strong> accounting for crypto. When you sell, we match the sale with your oldest purchases first. This determines your cost basis and capital gain.</p>
        </div>

        <div className="results-list">
          <h3>Transaction-by-Transaction Breakdown</h3>
          {results.results && results.results.length > 0 ? (
            results.results.map((result, index) => (
              <div key={index} className="result-item">
                <div className="result-header" onClick={() => toggleResultDetails(index)}>
                  <div className="result-main">
                    <div className="result-type-badge">
                      <span className={`type-icon ${result.type.toLowerCase()}`}>
                        {result.type === 'BUY' ? '+' : result.type === 'SELL' ? '-' : result.type === 'TRADE' ? '↔' : '⇄'}
                      </span>
                      <span className="result-type">{result.type}</span>
                    </div>
                    <div className="result-info">
                      <div className="result-date">
                        <Calendar size={14} /> {result.date}
                      </div>
                      <div className="result-description">
                        {getTransactionDetails(result)}
                      </div>
                      {result.wallet && (
                        <div className="result-wallet">
                          <Wallet size={14} /> {result.wallet}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="result-gain">
                    {result.capital_gain !== undefined && (
                      <>
                        <span className={`gain ${result.capital_gain >= 0 ? 'positive' : 'negative'}`}>
                          {result.capital_gain >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                          {formatCurrency(result.capital_gain)}
                        </span>
                        <div className="tax-year">
                          Tax Year: {result.tax_year || 'N/A'}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                {(expandedAll || result.showDetails) && result.matched_buys && result.matched_buys.length > 0 && (
                  <div className="result-expanded">
                    {renderStepByStepMath(result)}
                    
                    <h4>FIFO Matched Buys:</h4>
                    <table className="details-table">
                      <thead>
                        <tr>
                          <th>Buy Date</th>
                          <th>Buy Price</th>
                          <th>Amount Sold</th>
                          <th>Cost Basis</th>
                          <th>Proceeds</th>
                          <th>Gain/Loss</th>
                          <th>Holding Period</th>
                          <th>Tax Rate</th>
                          <th>Tax Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.matched_buys.map((buy, buyIndex) => (
                          <tr key={buyIndex}>
                            <td>{buy.buy_date}</td>
                            <td>{formatCurrency(buy.buy_price)}</td>
                            <td>{formatNumber(buy.amount_sold, 8)}</td>
                            <td>{formatCurrency(buy.cost)}</td>
                            <td>{formatCurrency(buy.proceeds)}</td>
                            <td className={buy.gain >= 0 ? 'positive' : 'negative'}>
                              {formatCurrency(buy.gain)}
                            </td>
                            <td>
                              <div className="holding-period">
                                <Clock size={14} />
                                {buy.holding_years >= 0 ? `${buy.holding_years.toFixed(1)} years` : '-'}
                                {buy.is_long_term && <span className="long-term-badge">Long-term</span>}
                              </div>
                            </td>
                            <td>
                              <span className={`tax-rate ${buy.is_long_term ? 'long-term' : 'short-term'}`}>
                                {buy.tax_rate ? `${buy.tax_rate}%` : '-'}
                              </span>
                            </td>
                            <td>{buy.tax_amount ? formatCurrency(buy.tax_amount) : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan="3"><strong>Total:</strong></td>
                          <td><strong>{formatCurrency(result.matched_buys.reduce((sum, buy) => sum + (buy.cost || 0), 0))}</strong></td>
                          <td><strong>{formatCurrency(result.matched_buys.reduce((sum, buy) => sum + (buy.proceeds || 0), 0))}</strong></td>
                          <td><strong className={result.capital_gain >= 0 ? 'positive' : 'negative'}>
                            {formatCurrency(result.capital_gain)}
                          </strong></td>
                          <td colSpan="3"></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="empty-state">
              <Calculator size={48} />
              <h4>No results to display</h4>
              <p>Run a calculation to see results here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderBalancesTab = () => (
    <div className="tab-content">
      <div className="card">
        <div className="balances-header">
          <h2>Crypto Balances Over Time</h2>
          <p className="balances-subtitle">Track how your holdings and base cost change with each transaction</p>
        </div>
        
        <div className="balances-grid">
          {results.balances && results.balances.length > 0 ? (
            results.balances.map((balance, index) => (
              <div key={index} className="balance-card">
                <div className="balance-header">
                  <div className="balance-coin">
                    <div className="coin-icon">{balance.coin.substring(0, 2)}</div>
                    <div>
                      <h3>{balance.coin}</h3>
                      <span className="balance-wallet">{balance.wallet}</span>
                    </div>
                  </div>
                  <div className="balance-total">
                    <div className="balance-amount">
                      {formatNumber(balance.total_amount, 8)} {balance.coin}
                    </div>
                    <div className="balance-value">
                      {formatCurrency(balance.base_cost)}
                    </div>
                  </div>
                </div>
                
                <div className="balance-stats">
                  <div className="balance-stat">
                    <span>Average Cost:</span>
                    <strong>{balance.total_amount > 0 ? formatCurrency(balance.base_cost / balance.total_amount) : 'R 0.00'}</strong>
                  </div>
                  <div className="balance-stat">
                    <span>Current Lots:</span>
                    <strong>{balance.lots?.length || 0}</strong>
                  </div>
                </div>
                
                {balance.lots && balance.lots.length > 0 && (
                  <div className="balance-breakdown">
                    <h4>Cost Basis Breakdown (FIFO Order):</h4>
                    {balance.lots.map((lot, lotIndex) => (
                      <div key={lotIndex} className="lot-item">
                        <div className="lot-amount">
                          <Coins size={14} />
                          {formatNumber(lot.amount, 8)} {balance.coin}
                        </div>
                        <div className="lot-details">
                          <span className="lot-price">@ {formatCurrency(lot.price)}</span>
                          <span className="lot-date">
                            <Calendar size={12} /> {lot.date}
                          </span>
                          <span className="lot-value">
                            Value: {formatCurrency(lot.amount * lot.price)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="empty-state">
              <Wallet size={48} />
              <h4>No balances remaining</h4>
              <p>All crypto has been sold or transferred</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderTaxTab = () => (
    <div className="tab-content">
      <div className="card">
        <div className="tax-header">
          <h2>Tax Year Summary</h2>
          <p className="tax-subtitle">SARS tax year runs from 1 March to 28/29 February</p>
        </div>
        
        <div className="tax-summary">
          {results.yearlySummary && results.yearlySummary.length > 0 ? (
            results.yearlySummary.map((year) => (
              <div key={year.year} className="year-card">
                <div className="year-header">
                  <div>
                    <h3>Tax Year {year.year}</h3>
                    <span className="year-period">1 March {parseInt(year.year)-1} - 28 Feb {year.year}</span>
                  </div>
                  <div className="year-tax">
                    <span className="tax-label">Tax Due:</span>
                    <span className="tax-amount">{formatCurrency(year.total_tax)}</span>
                  </div>
                </div>
                <div className="year-details">
                  <div className="year-row">
                    <span>Total Capital Gains:</span>
                    <strong className={year.total_gains >= 0 ? 'positive' : 'negative'}>
                      {formatCurrency(year.total_gains)}
                    </strong>
                  </div>
                  <div className="year-row">
                    <span>Annual Exclusion:</span>
                    <strong>- {formatCurrency(results.taxParameters?.annual_exclusion || 40000)}</strong>
                  </div>
                  <div className="year-row highlight">
                    <span>Taxable Gain:</span>
                    <strong>{formatCurrency(Math.max(0, year.total_gains - (results.taxParameters?.annual_exclusion || 40000)))}</strong>
                  </div>
                  <div className="year-row">
                    <span>Average Tax Rate:</span>
                    <strong>{year.total_gains > 0 ? `${((year.total_tax / year.total_gains) * 100).toFixed(1)}%` : '0%'}</strong>
                  </div>
                  <div className="year-row">
                    <span>Taxable Transactions:</span>
                    <strong>{year.transactions}</strong>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <Calendar size={48} />
              <h4>No tax year data</h4>
              <p>Run a calculation with sell transactions to see tax year summaries</p>
            </div>
          )}
        </div>
        
        <div className="tax-total">
          <div className="tax-total-content">
            <h3>Total Tax Liability</h3>
            <div className="tax-total-amount">
              {formatCurrency(results.totalTax || 0)}
            </div>
            <p className="tax-total-note">
              This is your estimated total tax due across all tax years
            </p>
          </div>
        </div>
        
        {results.taxParameters && (
          <div className="tax-parameters">
            <h3>SARS Tax Parameters Applied</h3>
            <div className="parameters-grid">
              <div className="parameter">
                <span>Annual Exclusion</span>
                <div className="parameter-value">
                  <strong>{formatCurrency(results.taxParameters.annual_exclusion)}</strong>
                  <span className="parameter-desc">Per tax year</span>
                </div>
              </div>
              <div className="parameter">
                <span>Short-term Rate</span>
                <div className="parameter-value">
                  <strong>{results.taxParameters.short_term_rate}%</strong>
                  <span className="parameter-desc">Assets held &lt;3 years</span>
                </div>
              </div>
              <div className="parameter">
                <span>Long-term Rate</span>
                <div className="parameter-value">
                  <strong>{results.taxParameters.long_term_rate}%</strong>
                  <span className="parameter-desc">Assets held ≥3 years</span>
                </div>
              </div>
              <div className="parameter">
                <span>Long-term Threshold</span>
                <div className="parameter-value">
                  <strong>{results.taxParameters.long_term_threshold_years} years</strong>
                  <span className="parameter-desc">SARS requirement</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="tax-notes">
          <h3>Important Tax Notes</h3>
          <ul>
            <li>This calculation uses the <strong>SARS-required FIFO method</strong></li>
            <li>Annual exclusion of R40,000 is applied per tax year</li>
            <li>Long-term holdings (≥3 years) receive preferential tax treatment</li>
            <li>Consult a tax professional for your final tax return</li>
            <li>Keep all transaction records for 5 years as per SARS requirements</li>
          </ul>
        </div>
      </div>
    </div>
  );

  // Loading state
  if (authLoading) {
    return (
      <div className="app-loading">
        <div className="spinner large"></div>
        <p>Loading TaxTim Crypto Calculator...</p>
      </div>
    );
  }

  // Show landing page if not logged in and not in guest mode
  if (!user && !isGuest) {
    return (
      <LandingPage 
        onLogin={() => setShowLogin(true)}
        onRegister={() => setShowRegister(true)}
        onGuest={loginAsGuest}
        onGoogleLogin={handleGoogleLogin}
      />
    );
  }

  // Main app for logged-in users or guests
  return (
    <div className="app">
      {showLogin && renderLoginModal()}
      {showRegister && renderRegisterModal()}
      {showCalculations && renderCalculationsModal()}

      <header className="header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">
              <Calculator size={36} />
              <div className="taxtim-badge">TaxTim</div>
            </div>
            <div>
              <h1>Crypto Tax Calculator</h1>
              <p className="subtitle">SARS FIFO Calculations for South African Taxpayers</p>
            </div>
          </div>
          <div className="header-actions">
            {user ? (
              <div className="user-info">
                <div className="user-profile">
                  <User size={18} />
                  <span className="user-name">{user.name}</span>
                </div>
                <button 
                  className="btn btn-secondary btn-sm" 
                  onClick={handleLoadCalculations}
                >
                  <FolderOpen size={16} />
                  Saved
                </button>
                <button className="btn btn-secondary btn-sm" onClick={logout}>
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            ) : isGuest ? (
              <div className="auth-actions">
                <button 
                  className="btn btn-primary btn-sm" 
                  onClick={() => setShowLogin(true)}
                >
                  <LogIn size={16} />
                  Sign In
                </button>
                <span className="guest-badge">
                  <Calculator size={14} /> Guest Mode
                </span>
              </div>
            ) : null}
            <button className="btn btn-secondary btn-sm" onClick={loadExample}>
              <FileSpreadsheet size={16} />
              Load Example
            </button>
            <button 
              className="btn btn-primary btn-sm" 
              onClick={exportToCSV}
              disabled={!results}
            >
              <Download size={16} />
              Export Report
            </button>
          </div>
        </div>
        <div className="header-banner">
          <div className="banner-content">
            <strong>SARS Compliant</strong> • 
            <strong>FIFO Method</strong> • 
            <strong>R40,000 Annual Exclusion</strong> • 
            <strong>Official TaxTim Partner</strong>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'input' ? 'active' : ''}`}
            onClick={() => setActiveTab('input')}
          >
            <Upload size={16} />
            Upload Data
          </button>
          <button 
            className={`tab ${activeTab === 'results' ? 'active' : ''}`}
            onClick={() => setActiveTab('results')}
            disabled={!results}
          >
            <Calculator size={16} />
            Results
          </button>
          <button 
            className={`tab ${activeTab === 'balances' ? 'active' : ''}`}
            onClick={() => setActiveTab('balances')}
            disabled={!results}
          >
            <Wallet size={16} />
            Balances
          </button>
          <button 
            className={`tab ${activeTab === 'tax' ? 'active' : ''}`}
            onClick={() => setActiveTab('tax')}
            disabled={!results}
          >
            <BarChart3 size={16} />
            Tax Summary
          </button>
        </div>

        {activeTab === 'input' && renderInputTab()}
        {activeTab === 'results' && results && renderResultsTab()}
        {activeTab === 'balances' && results && renderBalancesTab()}
        {activeTab === 'tax' && results && renderTaxTab()}
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-left">
            <div className="footer-logo">
              <Calculator size={24} />
              <div>
                <p className="footer-title">TaxTim Crypto Tax Calculator</p>
                <p className="footer-tagline">Official SARS FIFO Calculations</p>
              </div>
            </div>
            <p className="footer-disclaimer">
              This tool provides estimates for informational purposes only. 
              Consult a tax professional for official tax advice. Calculations use 
              SARS-required FIFO method with R40,000 annual exclusion.
            </p>
          </div>
          <div className="footer-right">
            <div className="footer-partner">
              <div className="partner-badge">
                <strong>TAXTIM</strong>
                <span>Official Partner</span>
              </div>
              <p>Developed for South African taxpayers</p>
            </div>
            <p className="footer-copyright">
              © 2024 TaxTim Crypto Tax Calculator. All rights reserved.
            </p>
            <p className="footer-version">
              Version 1.0 • SARS Compliant • FIFO Method
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;