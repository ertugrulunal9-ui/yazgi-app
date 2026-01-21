export const formatPlaytime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}dk`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}s ${mins}dk` : `${hours}s`;
};

export const formatLastPlayed = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 30) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  } else if (days > 0) {
    return `${days} gün önce`;
  } else if (hours > 0) {
    return `${hours} saat önce`;
  } else if (minutes > 0) {
    return `${minutes} dk önce`;
  } else {
    return 'Az önce';
  }
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Copy to clipboard failed:', error);
    return false;
  }
};

export const readFromClipboard = async (): Promise<string | null> => {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      return await navigator.clipboard.readText();
    }
    return null;
  } catch (error) {
    console.error('Read from clipboard failed:', error);
    return null;
  }
};

export const generateQRCode = (data: string): string => {
  const encoded = encodeURIComponent(data);
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encoded}`;
};

export const downloadFile = (filename: string, content: string): void => {
  try {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download file failed:', error);
  }
};

export const readFile = (): Promise<string | null> => {
  return new Promise((resolve) => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      input.onchange = (e: Event) => {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];
        if (!file) {
          resolve(null);
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve(event.target?.result as string || null);
        };
        reader.onerror = () => resolve(null);
        reader.readAsText(file);
      };
      
      input.click();
    } catch (error) {
      console.error('Read file failed:', error);
      resolve(null);
    }
  });
};

export const getStorageInfo = async (storage: any): Promise<{ used: number; total: number; percentage: number }> => {
  try {
    const allKeys = await storage.getAllKeys();
    let totalSize = 0;
    
    for (const key of allKeys) {
      const value = await storage.getItem(key);
      if (value) {
        totalSize += new Blob([value]).size;
      }
    }
    
    const maxStorage = 10 * 1024 * 1024;
    const percentage = (totalSize / maxStorage) * 100;
    
    return {
      used: totalSize,
      total: maxStorage,
      percentage: Math.min(percentage, 100),
    };
  } catch (error) {
    console.error('Get storage info failed:', error);
    return { used: 0, total: 0, percentage: 0 };
  }
};
