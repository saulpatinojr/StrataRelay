import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const getAssessment = async (universalData, pricingOptions = null) => {
  try {
    const payload = {
      data: {
        fileType: universalData.fileType,
        rawSheets: universalData.rawSheets
      },
      customer_id: 'DEMO', // Default for demo
      doc_code: '01' // Default for demo
    };
    
    if (pricingOptions) {
      payload.pricing_options = pricingOptions;
    }
    
    const response = await axios.post(`${API_URL}/analyze`, payload);
    return response.data;
  } catch (error) {
    console.error('Error getting assessment:', error);
    throw error;
  }
};
