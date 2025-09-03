import { create } from 'zustand';
import { getAssessment } from '../services/assessmentService';

// A single, centralized store for our application state.
// This is the "single source of truth" for the UI.
const useAssessmentStore = create((set, get) => ({
  // State
  assessmentData: null,
  parsedData: null,
  currentPage: 'landing',
  dataSources: [],
  activeSheets: [],
  isLoading: false,
  error: null,

  // Actions
  fetchAssessment: async (universalData, fileName = '') => {
    set({ isLoading: true, error: null });
    try {
      // 1. Call the backend service to get the rich assessment data
      const backendAssessment = await getAssessment(universalData);

      // 2. Create a new data source entry for the UI
      const displayName = fileName ? fileName.replace(/\.[^/.]+$/, '') : `Data Sheet`;
      const newSource = {
        code: fileName || 'new_data',
        name: displayName,
        data: universalData,
        vmCount: universalData.vmCount || 0
      };

      // 3. Update the state with the new data
      set(state => ({
        assessmentData: backendAssessment,
        parsedData: universalData,
        dataSources: [...state.dataSources, newSource],
        activeSheets: [...state.activeSheets, newSource.code],
        currentPage: 'assessment',
        isLoading: false,
      }));

    } catch (error) {
      console.error('Failed to get assessment from backend:', error);
      set({ isLoading: false, error: 'Failed to fetch assessment. Please try again.' });
    }
  },

  toggleSheet: (sheetCode) => {
    set(state => ({
      activeSheets: state.activeSheets.includes(sheetCode)
        ? state.activeSheets.filter(code => code !== sheetCode)
        : [...state.activeSheets, sheetCode]
    }));
  },

  restart: () => {
    set({
      assessmentData: null,
      parsedData: null,
      dataSources: [],
      activeSheets: [],
      currentPage: 'landing',
      isLoading: false,
      error: null,
    });
  },

  backToLanding: () => {
    set({ currentPage: 'landing' });
  },
}));

export default useAssessmentStore;
