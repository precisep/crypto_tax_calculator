import React from 'react';
import { 
  Calculator, ChevronDown, ChevronUp, Download, TrendingUp, 
  TrendingDown, BarChart3, Calendar, Wallet, Clock
} from 'lucide-react';
import { formatCurrency, formatNumber } from '../../utils/formatting';
import { exportToCSV } from '../../utils/export';
import { getTransactionDetails, renderStepByStepMath } from '../../utils/resultsHelpers';

const ResultsTab = ({
  results,
  expandedAll,
  toggleAllDetails,
  toggleResultDetails
}) => {
  if (!results) return null;

  return (
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
              onClick={() => exportToCSV(results)}
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
};

export default ResultsTab;
