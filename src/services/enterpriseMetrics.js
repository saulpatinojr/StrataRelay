export const calculateAdvancedMetrics = (dataSources, activeSheets) => {
  const metrics = {
    // Financial Analysis
    costOptimization: {
      currentSpend: 0,
      projectedSavings: 0,
      rightsizingOpportunities: 0,
      reservedInstanceSavings: 0
    },
    
    // Risk Assessment
    riskAnalysis: {
      securityRisks: [],
      complianceGaps: [],
      performanceRisks: [],
      businessContinuityRisks: []
    },
    
    // Migration Complexity
    migrationComplexity: {
      simple: 0,
      moderate: 0,
      complex: 0,
      blockers: 0
    },
    
    // Performance Analytics
    performance: {
      cpuUtilization: { avg: 0, peak: 0, trend: [] },
      memoryUtilization: { avg: 0, peak: 0, trend: [] },
      storageIOPS: { avg: 0, peak: 0, trend: [] },
      networkThroughput: { avg: 0, peak: 0, trend: [] }
    },
    
    // Cloud Readiness Score
    readinessScore: {
      overall: 0,
      compute: 0,
      storage: 0,
      network: 0,
      security: 0,
      governance: 0
    },
    
    // Sustainability Metrics
    sustainability: {
      carbonFootprint: 0,
      energyEfficiency: 0,
      greenCloudScore: 0
    }
  };

  // Process each active data source
  const activeData = dataSources.filter(ds => activeSheets.includes(ds.code));
  
  activeData.forEach(source => {
    if (source.data.vms) {
      source.data.vms.forEach(vm => {
        // Calculate cost optimization
        const currentCost = estimateCurrentCost(vm);
        const optimizedCost = calculateOptimizedCost(vm);
        metrics.costOptimization.currentSpend += currentCost;
        metrics.costOptimization.projectedSavings += (currentCost - optimizedCost);
        
        // Assess migration complexity
        const complexity = assessMigrationComplexity(vm);
        metrics.migrationComplexity[complexity]++;
        
        // Calculate readiness scores
        const readiness = calculateReadinessScore(vm);
        Object.keys(readiness).forEach(key => {
          metrics.readinessScore[key] += readiness[key];
        });
        
        // Performance analysis
        analyzePerformance(vm, metrics.performance);
        
        // Risk assessment
        assessRisks(vm, metrics.riskAnalysis);
        
        // Sustainability metrics
        calculateSustainability(vm, metrics.sustainability);
      });
    }
  });

  // Normalize scores
  const vmCount = activeData.reduce((sum, ds) => sum + ds.vmCount, 0);
  if (vmCount > 0) {
    Object.keys(metrics.readinessScore).forEach(key => {
      metrics.readinessScore[key] = Math.round(metrics.readinessScore[key] / vmCount);
    });
  }

  return metrics;
};

const estimateCurrentCost = (vm) => {
  const cpu = vm.cpu || 2;
  const memory = (vm.memory || 4096) / 1024; // Convert to GB
  return (cpu * 50) + (memory * 10); // Simplified cost model
};

const calculateOptimizedCost = (vm) => {
  const cpu = Math.max(1, Math.ceil((vm.cpu || 2) * 0.7)); // Right-size CPU
  const memory = Math.max(1, Math.ceil(((vm.memory || 4096) / 1024) * 0.8)); // Right-size memory
  return (cpu * 45) + (memory * 9); // Optimized pricing
};

const assessMigrationComplexity = (vm) => {
  const os = (vm.os || '').toLowerCase();
  const cpu = vm.cpu || 2;
  const memory = (vm.memory || 4096) / 1024;
  
  if (os.includes('windows') && os.includes('2003')) return 'blockers';
  if (cpu > 16 || memory > 64) return 'complex';
  if (os.includes('linux') && cpu <= 4) return 'simple';
  return 'moderate';
};

const calculateReadinessScore = (vm) => {
  const os = (vm.os || '').toLowerCase();
  const cpu = vm.cpu || 2;
  const memory = (vm.memory || 4096) / 1024;
  
  return {
    overall: os.includes('linux') ? 85 : 75,
    compute: cpu <= 8 ? 90 : 60,
    storage: 80,
    network: 85,
    security: os.includes('windows') ? 70 : 85,
    governance: 75
  };
};

const analyzePerformance = (vm, performance) => {
  // Simulate performance data
  performance.cpuUtilization.avg += Math.random() * 60 + 20;
  performance.memoryUtilization.avg += Math.random() * 70 + 15;
  performance.storageIOPS.avg += Math.random() * 1000 + 500;
  performance.networkThroughput.avg += Math.random() * 100 + 50;
};

const assessRisks = (vm, risks) => {
  const os = (vm.os || '').toLowerCase();
  
  if (os.includes('2003') || os.includes('2008')) {
    risks.securityRisks.push(`${vm.name}: End-of-life OS detected`);
  }
  
  if ((vm.cpu || 2) > 16) {
    risks.performanceRisks.push(`${vm.name}: High CPU count may impact migration`);
  }
};

const calculateSustainability = (vm, sustainability) => {
  const cpu = vm.cpu || 2;
  const memory = (vm.memory || 4096) / 1024;
  
  // Estimate carbon footprint (simplified)
  sustainability.carbonFootprint += (cpu * 0.5) + (memory * 0.2);
  sustainability.energyEfficiency += cpu <= 4 ? 10 : 5;
};