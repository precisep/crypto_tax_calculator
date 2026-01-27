import React from 'react';
import { Calendar } from 'lucide-react';
import { formatCurrency } from '../../utils/formatting';

const TaxTab = ({ results }) => {
  if (!results) return null;

  return (
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
};

export default TaxTab;
