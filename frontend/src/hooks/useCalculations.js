import { useState } from 'react';
import { API_BASE_URL, getAuthHeaders, handleApiResponse } from '../config/api';

export const useCalculations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [calculations, setCalculations] = useState([]);

  const fetchCalculations = async (token) => {
    if (!token) {
      setError('Authentication required');
      return { success: false, message: 'Authentication required' };
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/calculations`, {
        headers: getAuthHeaders(token),
      });

      const data = await handleApiResponse(response);
      
      if (data.success) {
        setCalculations(data.calculations || []);
        return { success: true, calculations: data.calculations || [] };
      } else {
        throw new Error(data.message || 'Failed to load calculations');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to load calculations';
      setError(errorMessage);
      console.error('Fetch calculations error:', err);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { fetchCalculations, calculations, loading, error };
};
