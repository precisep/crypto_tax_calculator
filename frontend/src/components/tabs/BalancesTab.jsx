import React from 'react';
import { Wallet, Coins, Calendar } from 'lucide-react';
import { formatCurrency, formatNumber } from '../../utils/formatting';

const BalancesTab = ({ results }) => {
  if (!results) return null;

  return (
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
};

export default BalancesTab;
