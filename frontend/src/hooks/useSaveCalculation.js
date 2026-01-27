import { useState } from 'react';
import { API_BASE_URL, getAuthHeaders, handleApiResponse } from '../config/api';

export const useSaveCalculation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const saveCalculation = async (transactions, name, token) => {
    if (!token) {
      setError('Authentication required');
      return { success: false, message: 'Authentication required' };
    }

    if (!transactions || transactions.length === 0) {
      setError('No transactions to save');
      return { success: false, message: 'No transactions to save' };
    }

    setLoading(true);
    setError(null);

    try {
      const calculationName = name?.trim() || `Calculation ${new Date().toLocaleDateString()}`;

      const response = await fetch(`${API_BASE_URL}/save-transactions`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ transactions, name: calculationName }),
      });

      const data = await handleApiResponse(response);
      return data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to save calculation';
      setError(errorMessage);
      console.error('Save error:', err);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { saveCalculation, loading, error };
};
