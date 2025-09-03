import axios from 'axios';

const GEMINI_API_KEY = 'AIzaSyAzR6CUo_pOIkQBPm53P0ksOwi5WXlQMsw';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export const analyzeCloudReadiness = async (vmData, query = null) => {
  const prompt = query || `
    Analyze this VM infrastructure data for cloud migration readiness. Focus on:
    1. CPU utilization patterns and right-sizing opportunities
    2. Memory allocation vs usage efficiency
    3. Storage IOPS and throughput requirements
    4. Licensing optimization opportunities
    5. Cost optimization recommendations
    6. Migration complexity assessment
    7. Cloud SKU recommendations (AWS, Azure, GCP)
    
    Data: ${JSON.stringify(vmData.slice(0, 10))}
    
    Provide actionable insights for cloud migration strategy.
  `;

  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{ text: prompt }]
        }]
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to analyze data with AI');
  }
};

export const askGeminiQuestion = async (question, context) => {
  const prompt = `
    Context: VM Infrastructure Assessment Data
    ${JSON.stringify(context)}
    
    Question: ${question}
    
    Provide a detailed technical answer based on the infrastructure data.
  `;

  return analyzeCloudReadiness([], prompt);
};