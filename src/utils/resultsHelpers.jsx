import React from 'react';
import { formatCurrency, formatNumber } from './formatting';

export const getTransactionDetails = (result) => {
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

export const renderStepByStepMath = (result) => {
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
              <strong>Holding Period:</strong> {typeof buy.holding_years === 'number' ? buy.holding_years.toFixed(1) : '0'} years
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
