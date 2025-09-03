// Comprehensive region mapping with closest datacenter logic
export const REGIONS = [
  // US East
  { value: 'us-east-1', label: 'US East (N. Virginia)', aws: 'us-east-1', azure: 'eastus', gcp: 'us-east1' },
  { value: 'us-east-2', label: 'US East (Ohio)', aws: 'us-east-2', azure: 'eastus2', gcp: 'us-east4' },
  
  // US West
  { value: 'us-west-1', label: 'US West (N. California)', aws: 'us-west-1', azure: 'westus', gcp: 'us-west2' },
  { value: 'us-west-2', label: 'US West (Oregon)', aws: 'us-west-2', azure: 'westus2', gcp: 'us-west1' },
  
  // US Central
  { value: 'us-central', label: 'US Central', aws: 'us-east-1', azure: 'centralus', gcp: 'us-central1' },
  { value: 'us-south', label: 'US South', aws: 'us-east-1', azure: 'southcentralus', gcp: 'us-central1' },
  
  // Canada
  { value: 'ca-central', label: 'Canada Central', aws: 'ca-central-1', azure: 'canadacentral', gcp: 'northamerica-northeast1' },
  
  // Europe
  { value: 'eu-west', label: 'Europe West', aws: 'eu-west-1', azure: 'westeurope', gcp: 'europe-west1' },
  { value: 'eu-central', label: 'Europe Central', aws: 'eu-central-1', azure: 'northeurope', gcp: 'europe-west3' },
  { value: 'eu-north', label: 'Europe North', aws: 'eu-north-1', azure: 'northeurope', gcp: 'europe-north1' },
  
  // Asia Pacific
  { value: 'ap-southeast', label: 'Asia Pacific Southeast', aws: 'ap-southeast-1', azure: 'southeastasia', gcp: 'asia-southeast1' },
  { value: 'ap-northeast', label: 'Asia Pacific Northeast', aws: 'ap-northeast-1', azure: 'japaneast', gcp: 'asia-northeast1' },
  { value: 'ap-south', label: 'Asia Pacific South', aws: 'ap-south-1', azure: 'centralindia', gcp: 'asia-south1' }
];

export const getRegionByValue = (value) => REGIONS.find(r => r.value === value);
export const getRegionLabel = (provider, regionCode) => {
  const region = REGIONS.find(r => r[provider] === regionCode);
  return region ? region.label : regionCode;
};