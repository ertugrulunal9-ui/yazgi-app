export const calculateChecksum = (data: string): string => {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
};

export const validateChecksum = (data: string, expectedChecksum: string): boolean => {
  const actualChecksum = calculateChecksum(data);
  return actualChecksum === expectedChecksum;
};

export const generateChecksum = (obj: any): string => {
  const jsonString = JSON.stringify(obj, Object.keys(obj).sort());
  return calculateChecksum(jsonString);
};
