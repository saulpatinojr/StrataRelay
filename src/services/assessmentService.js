import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export const getAssessment = async (parsedData) => {
  try {
    const response = await axios.post(`${API_URL}/analyze`, parsedData);
    return response.data;
  } catch (error) {
    console.error('Error getting assessment:', error);
    throw error;
  }
};
