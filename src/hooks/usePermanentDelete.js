import { useState } from 'react';
import { apiCaller } from '../utils/axiosInstance';

export const usePermanentDelete = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteRecord = async (endpoint, id, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      let url = `/api/permanent-delete/${endpoint}`;
      
      if (id) {
        url += `/${id}`;
      } else if (options.query) {
        url += options.query;
      }

      // For bulk delete by IDs, we need to send body
      const requestConfig = {
        method: "DELETE",
        url: url
      };

      // If options.body is provided (for bulk delete by IDs), include it
      if (options.body) {
        requestConfig.data = options.body;
      }

      const response = await apiCaller("DELETE", url, options.body || undefined);

      if (response.data && !response.data.success) {
        throw new Error(response.data.message || 'Delete failed');
      }

      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Delete failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const bulkDeleteByIds = async (endpoint, ids) => {
    setLoading(true);
    setError(null);

    try {
      const url = `/api/permanent-delete/${endpoint}/bulk`;
      const response = await apiCaller("DELETE", url, { ids });

      if (response.data && !response.data.success) {
        throw new Error(response.data.message || 'Bulk delete failed');
      }

      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Bulk delete failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiCaller("GET", "/api/permanent-delete/stats");
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch stats';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { deleteRecord, bulkDeleteByIds, getStats, loading, error };
};


