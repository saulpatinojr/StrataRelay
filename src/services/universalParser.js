import * as XLSX from 'xlsx';

export const detectFileType = (workbook) => {
  const sheets = workbook.SheetNames;
  
  // RVTools detection - has specific sheet names
  if (sheets.includes('vInfo') || sheets.includes('vCPU') || sheets.includes('vMemory')) {
    return 'rvtools';
  }
  
  // Azure Migrate detection - check for typical sheet patterns
  const hasAzMigrateSheets = sheets.some(sheet => 
    sheet.toLowerCase().includes('server') ||
    sheet.toLowerCase().includes('machine') ||
    sheet.toLowerCase().includes('assessment')
  );
  
  if (hasAzMigrateSheets) {
    return 'azmigrate';
  }
  
  return 'unknown';
};

export const extractVMData = (workbook, fileType) => {
  const vmData = [];
  
  if (fileType === 'rvtools') {
    // Extract from vInfo sheet
    if (workbook.Sheets.vInfo) {
      const vInfoData = XLSX.utils.sheet_to_json(workbook.Sheets.vInfo);
      vInfoData.forEach(vm => {
        if (vm.VM) {
          vmData.push({
            name: vm.VM,
            host: vm.Host,
            datacenter: vm.Datacenter,
            cpu: vm.CPUs,
            memory: vm.Memory,
            os: vm.OS,
            powerState: vm.Powerstate,
            sourceType: 'rvtools'
          });
        }
      });
    }
  } else if (fileType === 'azmigrate') {
    // Extract from any sheet with VM data
    workbook.SheetNames.forEach(sheetName => {
      const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      
      sheetData.forEach(row => {
        // Try multiple possible VM name fields
        const vmName = row['Server name'] || 
                      row['Machine name'] || 
                      row['Display name'] ||
                      row.Name ||
                      row.ServerName ||
                      row.MachineName;
        
        if (vmName) {
          vmData.push({
            name: vmName,
            host: row['Host name'] || row.Host,
            datacenter: row['Datacenter'] || row.Location,
            cpu: row.Cores || row['CPU cores'] || row.vCPUs,
            memory: row['Memory in MB'] || row['RAM (MB)'] || row.Memory,
            os: row['Operating system'] || row.OS,
            sourceType: 'azmigrate',
            sheetName: sheetName
          });
        }
      });
    });
  }
  
  return vmData;
};

export const createUniversalDataStructure = (workbook, fileType, fileName) => {
  const vmData = extractVMData(workbook, fileType);
  
  // Create universal structure
  const universalData = {
    fileType,
    fileName,
    vmCount: vmData.length,
    vms: vmData,
    rawSheets: {}
  };
  
  // Store all raw sheet data
  workbook.SheetNames.forEach(sheetName => {
    universalData.rawSheets[sheetName] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
  });
  
  return universalData;
};