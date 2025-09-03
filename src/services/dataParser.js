import * as XLSX from 'xlsx';

export const parseExcelFile = async (arrayBuffer) => {
  return XLSX.read(arrayBuffer, { type: 'array' });
};

export const parseRVToolsData = (workbook) => {
  const sheets = workbook.SheetNames;
  const parsedData = {};

  // Parse ALL RVTools sheets (27 tabs)
  const keySheets = sheets; // Parse every available sheet

  keySheets.forEach(sheetName => {
    if (sheets.includes(sheetName)) {
      const worksheet = workbook.Sheets[sheetName];
      parsedData[sheetName] = XLSX.utils.sheet_to_json(worksheet);
    }
  });

  return parsedData;
};

export const parseAzMigrateData = (workbook) => {
  const sheets = workbook.SheetNames;
  const parsedData = {};

  // Parse ALL Azure Migrate sheets
  const keySheets = sheets; // Parse every available sheet

  keySheets.forEach(sheetName => {
    if (sheets.includes(sheetName)) {
      const worksheet = workbook.Sheets[sheetName];
      parsedData[sheetName] = XLSX.utils.sheet_to_json(worksheet);
    }
  });

  return parsedData;
};

export const analyzeCloudReadiness = (rvData, azData = null) => {
  const analysis = {
    totalVMs: 0,
    compute: { totalCPU: 0, totalMemoryGB: 0, avgCPUUtil: 0 },
    storage: { totalStorageGB: 0, avgIOPS: 0 },
    network: { totalNICs: 0, bandwidth: 0 },
    licensing: { windowsVMs: 0, linuxVMs: 0, sqlServers: 0 },
    cloudReadiness: { ready: 0, needsWork: 0, complex: 0 },
    costEstimate: { aws: 0, azure: 0, gcp: 0 },
    recommendations: []
  };

  // Analyze RVTools vInfo data
  if (rvData.vInfo) {
    analysis.totalVMs = rvData.vInfo.length;
    
    rvData.vInfo.forEach(vm => {
      // Compute analysis
      analysis.compute.totalCPU += vm['CPUs'] || 0;
      analysis.compute.totalMemoryGB += (vm['Memory'] || 0) / 1024;
      
      // OS licensing
      const os = vm['OS'] || '';
      if (os.toLowerCase().includes('windows')) {
        analysis.licensing.windowsVMs++;
      } else if (os.toLowerCase().includes('linux')) {
        analysis.licensing.linuxVMs++;
      }
      
      // Cloud readiness assessment
      const cpu = vm['CPUs'] || 0;
      const memory = vm['Memory'] || 0;
      const powerState = vm['Powerstate'] || '';
      
      if (powerState === 'poweredOn' && cpu <= 8 && memory <= 32768) {
        analysis.cloudReadiness.ready++;
      } else if (cpu > 8 || memory > 32768) {
        analysis.cloudReadiness.complex++;
      } else {
        analysis.cloudReadiness.needsWork++;
      }
    });
  }

  // Analyze storage from vDisk
  if (rvData.vDisk) {
    rvData.vDisk.forEach(disk => {
      analysis.storage.totalStorageGB += (disk['Capacity MB'] || 0) / 1024;
    });
  }

  // Generate recommendations
  analysis.recommendations = generateRecommendations(analysis);
  
  return analysis;
};

const generateRecommendations = (analysis) => {
  const recommendations = [];
  
  if (analysis.cloudReadiness.complex > analysis.totalVMs * 0.3) {
    recommendations.push({
      type: 'warning',
      title: 'High Complexity VMs Detected',
      description: `${analysis.cloudReadiness.complex} VMs may require significant refactoring for cloud migration.`
    });
  }
  
  if (analysis.licensing.windowsVMs > 0) {
    recommendations.push({
      type: 'info',
      title: 'Windows Licensing Optimization',
      description: `Consider Azure Hybrid Benefit for ${analysis.licensing.windowsVMs} Windows VMs to reduce costs.`
    });
  }
  
  const avgCPUPerVM = analysis.compute.totalCPU / analysis.totalVMs;
  if (avgCPUPerVM < 2) {
    recommendations.push({
      type: 'success',
      title: 'Right-sizing Opportunity',
      description: 'Many VMs appear over-provisioned. Consider smaller cloud instances.'
    });
  }
  
  return recommendations;
};