import { useState } from 'react';
import { API_BASE_URL, handleApiResponse } from '../config/api';

export const useCalculate = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculate = async (transactions) => {
    if (!transactions || transactions.length === 0) {
      setError('No transactions to calculate');
      return { success: false, error: 'No transactions to calculate' };
    }

    setLoading(true);
    setError(null);

    try {
      // Clean and format transactions
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

      const response = await fetch(`${API_BASE_URL}/calculate-public`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactions: cleanTransactions }),
      });

      const data = await handleApiResponse(response);

      if (data.success) {
        // Format results with details
        const resultsWithDetails = data.data.results.map(result => ({
          ...result,
          showDetails: false,
          matched_buys: result.matched_buys || []
        }));

        const formattedResults = {
          ...data.data,
          results: resultsWithDetails,
          taxParameters: data.tax_parameters || {
            annual_exclusion: 40000,
            short_term_rate: 18,
            long_term_rate: 10,
            long_term_threshold_years: 3
          }
        };

        return { success: true, data: formattedResults };
      } else {
        throw new Error(data.error || 'Invalid response format');
      }
    } catch (err) {
      const errorMessage = err.message || 'Calculation failed';
      setError(errorMessage);
      console.error('Calculation error:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { calculate, loading, error };
};
