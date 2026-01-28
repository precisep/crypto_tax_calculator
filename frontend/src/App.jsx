import React, { useState, useEffect, useRef } from 'react';
import { 
  Calculator, Upload, Download, FileSpreadsheet, 
  BarChart3, Wallet
} from 'lucide-react';
import './App.css';
import Logo from './components/Logo';
// Components
import InputTab from './components/tabs/InputTab';
import ResultsTab from './components/tabs/ResultsTab';
import BalancesTab from './components/tabs/BalancesTab';
import TaxTab from './components/tabs/TaxTab';
import Navbar from './components/Navbar'

// Hooks
import { useCalculate } from './hooks';

// Utils
import { parseCSV, parseExcel } from './utils/fileParsing';
import { validateTransactions } from './utils/validation';
import { exportToCSV } from './utils/export';
import { EXAMPLE_TRANSACTIONS } from './constants/exampleData';

// Main App Component
function App() {
  // API Hooks
  const { calculate, loading: calculateLoading, error: calculateError } = useCalculate();

  const [transactions, setTransactions] = useState([]);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [expandedAll, setExpandedAll] = useState(false);
  const [activeTab, setActiveTab] = useState('input');
  const [inputText, setInputText] = useState('');
  const [uploadMode, setUploadMode] = useState('json');
  const [showHelp, setShowHelp] = useState(false);
  const fileInputRef = useRef(null);

  const loading = calculateLoading;

  // Load example data on mount
  useEffect(() => {
    if (transactions.length === 0) {
      loadExample();
    }
  }, []);

  const loadExample = () => {
    setTransactions(EXAMPLE_TRANSACTIONS);
    setInputText(JSON.stringify(EXAMPLE_TRANSACTIONS, null, 2));
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

  const triggerFileInput = (mode) => {
    setUploadMode(mode);
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 0);
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
    setError('');
    const result = await calculate(transactions);
    
    if (result.success) {
      setResults(result.data);
      setActiveTab('results');
      setError('');
    } else {
      setError(result.error || calculateError || 'Calculation failed');
    }
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

  return (
    <div className="app">
      <Navbar />

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

        {activeTab === 'input' && (
          <InputTab
            showHelp={showHelp}
            setShowHelp={setShowHelp}
            uploadMode={uploadMode}
            setUploadMode={setUploadMode}
            triggerFileInput={triggerFileInput}
            fileInputRef={fileInputRef}
            handleFileUpload={handleFileUpload}
            loadExample={loadExample}
            loading={loading}
            transactions={transactions}
            inputText={inputText}
            setInputText={setInputText}
            handleParse={handleParse}
            addTransaction={addTransaction}
            updateTransaction={updateTransaction}
            removeTransaction={removeTransaction}
            handleCalculate={handleCalculate}
            error={error}
          />
        )}
        {activeTab === 'results' && results && (
          <ResultsTab
            results={results}
            expandedAll={expandedAll}
            toggleAllDetails={toggleAllDetails}
            toggleResultDetails={toggleResultDetails}
          />
        )}
        {activeTab === 'balances' && results && (
          <BalancesTab results={results} />
        )}
        {activeTab === 'tax' && results && (
          <TaxTab results={results} />
        )}
      </main>

    </div>
  );
}

export default App;
