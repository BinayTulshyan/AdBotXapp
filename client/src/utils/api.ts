import axios from 'axios';

export async function apiRequest<T>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  url: string,
  data?: any
): Promise<T> {
  try {
    const response = await axios({
      method,
      url,
      data,
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'An error occurred');
    }
    throw error;
  }
} 