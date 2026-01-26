import { useState } from 'react';
import { API_BASE_URL, getAuthHeaders, handleApiResponse } from '../config/api';

export const useLoadCalculation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadCalculation = async (id, token) => {
    if (!token) {
      setError('Authentication required');
      return { success: false, message: 'Authentication required' };
    }

    if (!id) {
      setError('Calculation ID is required');
      return { success: false, message: 'Calculation ID is required' };
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/calculations/${id}`, {
        headers: getAuthHeaders(token),
      });

      const data = await handleApiResponse(response);

      if (data.success) {
        const calc = data.calculation;
        
        // Format results if they exist
        let formattedResults = null;
        if (calc.results) {
          const resultsWithDetails = calc.results.results?.map(r => ({
            ...r,
            showDetails: false,
            matched_buys: r.matched_buys || []
          })) || [];

          formattedResults = {
            ...calc.results,
            results: resultsWithDetails,
            taxParameters: calc.results.tax_parameters || {
              annual_exclusion: 40000,
              short_term_rate: 18,
              long_term_rate: 10,
              long_term_threshold_years: 3
            }
          };
        }

        return {
          success: true,
          calculation: {
            ...calc,
            results: formattedResults
          }
        };
      } else {
        throw new Error(data.message || 'Failed to load calculation');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to load calculation';
      setError(errorMessage);
      console.error('Load calculation error:', err);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { loadCalculation, loading, error };
};
