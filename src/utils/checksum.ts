export const calculateChecksum = (data: string): string => {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
};

export const validateChecksum = (data: string | object, expectedChecksum: string): boolean => {
  const actualChecksum = typeof data === 'string'
    ? calculateChecksum(data)
    : generateChecksum(data);
  return actualChecksum === expectedChecksum;
};

export const generateChecksum = (obj: unknown): string => {
  if (obj === null || obj === undefined) {
    return calculateChecksum(String(obj));
  }

  if (typeof obj !== 'object') {
    return calculateChecksum(String(obj));
  }

  const keySource = obj as Record<string, unknown>;
  const jsonString = JSON.stringify(keySource, Object.keys(keySource).sort());
  return calculateChecksum(jsonString);
};
