import React from 'react';
import { 
  HelpCircle, Calculator, Upload, Download, FileText, FileJson, 
  FileSpreadsheet, FileSpreadsheet as ExcelIcon, Copy, Plus, Trash2, 
  Calendar, Coins, Wallet, Lock
} from 'lucide-react';
import { downloadCSVTemplate } from '../../utils/export';
import { validateTransactions } from '../../utils/validation';

const InputTab = ({
  showHelp,
  setShowHelp,
  uploadMode,
  setUploadMode,
  triggerFileInput,
  fileInputRef,
  handleFileUpload,
  loadExample,
  loading,
  transactions,
  inputText,
  setInputText,
  handleParse,
  addTransaction,
  updateTransaction,
  removeTransaction,
  handleCalculate,
  error
}) => {
  return (
    <div className="tab-content">
      <div className="card">
        <div className="card-header">
          <div className="card-content">
            <div className="card-header-content">
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
                Upload your crypto transaction data to calculate SARS-compliant tax liability
              </p>
              {error && (
                <div className="error-message">
                  <strong>Error:</strong> {error}
                </div>
              )}
            </div>
            <div className="calculator">
              <button 
               className="calculator-btn btn-primary btn-lg"
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
                      <Calculator size={15} />
                      Calculate
                    </>
                  )}
              </button>
            </div>
          </div>
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
            <p><strong>Click</strong> calculate to process {transactions.length} transactions using SARS FIFO method</p>
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept={uploadMode === 'json' ? '.json' : uploadMode === 'csv' ? '.csv' : '.xlsx,.xls'}
          style={{ display: 'none' }}
        />


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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InputTab;
