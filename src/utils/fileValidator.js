export const validateFileName = (fileName) => {
  const rvToolsPattern = /^rvtools_export_[A-Za-z]{4}_\d{2}\.xlsx$/;
  const azMigratePattern = /^azmigrate_export_[A-Za-z]{4}_\d{2}\.xlsx$/;
  
  if (rvToolsPattern.test(fileName)) {
    return { isValid: true, type: 'rvtools' };
  }
  
  if (azMigratePattern.test(fileName)) {
    return { isValid: true, type: 'azmigrate' };
  }
  
  return { 
    isValid: false, 
    error: 'Invalid file format. Please use:\n• rvtools_export_[4letters]_[2digits].xlsx\n• azmigrate_export_[4letters]_[2digits].xlsx' 
  };
};