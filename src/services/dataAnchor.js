export const createDataAnchors = (dataSources) => {
  const anchors = new Map();
  
  dataSources.forEach(source => {
    const { code, data } = source;
    
    // Use universal VM data structure
    if (data.vms && Array.isArray(data.vms)) {
      data.vms.forEach(vm => {
        if (vm.name) {
          const key = vm.name.toLowerCase();
          if (!anchors.has(key)) {
            anchors.set(key, {
              vmName: vm.name,
              hostName: vm.host,
              datacenter: vm.datacenter,
              sources: {}
            });
          }
          anchors.get(key).sources[code] = vm;
        }
      });
    }
  });
  
  return anchors;
};

export const getCorrelatedMetrics = (vmKey, anchors, dataSources, activeSheets) => {
  const vmData = anchors.get(vmKey);
  if (!vmData) return null;
  
  const metrics = {
    basic: {},
    cpu: {},
    memory: {},
    disk: {},
    network: {}
  };
  
  activeSheets.forEach(sheetCode => {
    const source = dataSources.find(ds => ds.code === sheetCode);
    if (!source || !vmData.sources[sheetCode]) return;
    
    const vmInfo = vmData.sources[sheetCode];
    metrics.basic[sheetCode] = vmInfo;
    
    // Correlate additional metrics from same source
    if (source.data.vCPU) {
      const cpuData = source.data.vCPU.find(cpu => 
        cpu.VM && cpu.VM.toLowerCase() === vmKey
      );
      if (cpuData) metrics.cpu[sheetCode] = cpuData;
    }
    
    if (source.data.vMemory) {
      const memData = source.data.vMemory.find(mem => 
        mem.VM && mem.VM.toLowerCase() === vmKey
      );
      if (memData) metrics.memory[sheetCode] = memData;
    }
    
    if (source.data.vDisk) {
      const diskData = source.data.vDisk.filter(disk => 
        disk.VM && disk.VM.toLowerCase() === vmKey
      );
      if (diskData.length > 0) metrics.disk[sheetCode] = diskData;
    }
  });
  
  return metrics;
};

export const filterDataByActiveSheets = (dataSources, activeSheets) => {
  return dataSources.filter(source => activeSheets.includes(source.code));
};