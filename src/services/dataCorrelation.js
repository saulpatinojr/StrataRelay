export const correlateDataSources = (dataBatches) => {
  const correlatedData = {};
  const vmIndex = new Map();
  
  // Build VM index across all batches
  Object.entries(dataBatches).forEach(([batchCode, data]) => {
    if (data.vInfo) {
      data.vInfo.forEach(vm => {
        const vmName = vm.VM || vm['VM Name'] || vm.Name;
        const hostName = vm.Host || vm['Host Name'];
        const datacenter = vm.Datacenter || vm['Datacenter Name'];
        
        if (vmName) {
          const key = vmName.toLowerCase();
          if (!vmIndex.has(key)) {
            vmIndex.set(key, {
              vmName,
              hostName,
              datacenter,
              batches: {}
            });
          }
          vmIndex.get(key).batches[batchCode] = vm;
        }
      });
    }
    
    // Handle Azure Migrate data
    Object.keys(data).forEach(sheetName => {
      if (sheetName.toLowerCase().includes('server') || 
          sheetName.toLowerCase().includes('machine')) {
        data[sheetName].forEach(server => {
          const vmName = server['Server name'] || server['Machine name'] || server.Name;
          if (vmName) {
            const key = vmName.toLowerCase();
            if (!vmIndex.has(key)) {
              vmIndex.set(key, {
                vmName,
                batches: {}
              });
            }
            vmIndex.get(key).batches[batchCode] = server;
          }
        });
      }
    });
  });
  
  // Create correlated dataset
  vmIndex.forEach((vmData, vmKey) => {
    correlatedData[vmKey] = {
      ...vmData,
      correlatedMetrics: correlateVMMetrics(vmData.batches, dataBatches)
    };
  });
  
  return correlatedData;
};

const correlateVMMetrics = (vmBatches, allBatches) => {
  const metrics = {
    cpu: {},
    memory: {},
    disk: {},
    network: {},
    assessment: {}
  };
  
  Object.entries(vmBatches).forEach(([batchCode, vmData]) => {
    const batchData = allBatches[batchCode];
    
    // Correlate CPU data
    if (batchData.vCPU) {
      const cpuData = batchData.vCPU.find(cpu => 
        cpu.VM && cpu.VM.toLowerCase() === vmData.VM?.toLowerCase()
      );
      if (cpuData) metrics.cpu[batchCode] = cpuData;
    }
    
    // Correlate Memory data
    if (batchData.vMemory) {
      const memData = batchData.vMemory.find(mem => 
        mem.VM && mem.VM.toLowerCase() === vmData.VM?.toLowerCase()
      );
      if (memData) metrics.memory[batchCode] = memData;
    }
    
    // Correlate Disk data
    if (batchData.vDisk) {
      const diskData = batchData.vDisk.filter(disk => 
        disk.VM && disk.VM.toLowerCase() === vmData.VM?.toLowerCase()
      );
      if (diskData.length > 0) metrics.disk[batchCode] = diskData;
    }
  });
  
  return metrics;
};

export const filterByBatchCode = (correlatedData, batchCodes) => {
  const filtered = {};
  
  Object.entries(correlatedData).forEach(([vmKey, vmData]) => {
    const hasMatchingBatch = batchCodes.some(code => 
      vmData.batches[code]
    );
    
    if (hasMatchingBatch) {
      filtered[vmKey] = {
        ...vmData,
        batches: Object.fromEntries(
          Object.entries(vmData.batches).filter(([code]) => 
            batchCodes.includes(code)
          )
        )
      };
    }
  });
  
  return filtered;
};