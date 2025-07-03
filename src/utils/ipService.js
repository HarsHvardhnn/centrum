import { apiCaller } from './axiosInstance';

export const checkIpAccess = async () => {
  try {
    const response = await apiCaller('GET', '/api/ip-restrictions/check-public');
    console.log('Raw IP check response:', response); // Debug log
    
    // If response itself is the data object
    if (response && typeof response.data.success === 'boolean') {
      if (!response.data.success) {
        throw new Error(response.message || 'Failed to check IP access');
      }
      return response.data;
    }
    
    // If response is already the data object
    if (response && typeof response.isAllowed === 'boolean') {
      return response;
    }

    throw new Error('Invalid response format from IP check');
  } catch (error) {
    console.error('IP check failed:', error);
    throw error;
  }
}; 