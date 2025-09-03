import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getAssessment } from '../services/assessmentService';

// A single, centralized store for our application state.
// This is the "single source of truth" for the UI.
const useAssessmentStore = create(
  persist(
    (set, get) => ({
  // State
  assessmentData: null,
  parsedData: null,
  currentPage: 'landing',
  dataSources: [],
  activeSheets: [],
  isLoading: false,
  error: null,

  // Actions
  fetchAssessment: async (universalData, fileName = '', pricingOptions = null) => {
    set({ isLoading: true, error: null });
    try {
      // 1. Call the backend service to get the rich assessment data
      const backendAssessment = await getAssessment(universalData, pricingOptions);

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
    }),
    {
      name: 'assessment-storage',
      partialize: (state) => ({
        currentPage: state.currentPage,
        dataSources: state.dataSources.map(ds => ({ code: ds.code, name: ds.name, vmCount: ds.vmCount })),
        activeSheets: state.activeSheets
      })
    }
  )
);

export default useAssessmentStore;
