import { tRuntime } from '../i18n/strings';

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
    return tRuntime('save.relativeTime.daysAgo', { count: days });
  } else if (hours > 0) {
    return tRuntime('save.relativeTime.hoursAgo', { count: hours });
  } else if (minutes > 0) {
    return tRuntime('save.relativeTime.minutesAgo', { count: minutes });
  } else {
    return tRuntime('save.relativeTime.justNow');
  }
};

const isWebClipboardAvailable = (): boolean => (
  typeof navigator !== 'undefined'
  && typeof navigator.clipboard !== 'undefined'
);

const isReactNativeRuntime = (): boolean => (
  typeof navigator !== 'undefined'
  && navigator.product === 'ReactNative'
);

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    const normalized = String(text ?? '');

    if (isWebClipboardAvailable()) {
      await navigator.clipboard.writeText(normalized);
      return true;
    }

    if (isReactNativeRuntime()) {
      try {
        const clipboard = await import('expo-clipboard');
        if (typeof clipboard.setStringAsync === 'function') {
          await clipboard.setStringAsync(normalized);
          return true;
        }
      } catch {
        // Native clipboard module is optional in test/web environments.
      }
    }

    return false;
  } catch (error) {
    console.error('Copy to clipboard failed:', error);
    return false;
  }
};

export const readFromClipboard = async (): Promise<string | null> => {
  try {
    if (isWebClipboardAvailable()) {
      return await navigator.clipboard.readText();
    }

    if (isReactNativeRuntime()) {
      try {
        const clipboard = await import('expo-clipboard');
        if (typeof clipboard.getStringAsync === 'function') {
          return await clipboard.getStringAsync();
        }
      } catch {
        // Native clipboard module is optional in test/web environments.
      }
    }

    return null;
  } catch (error) {
    console.error('Read from clipboard failed:', error);
    return null;
  }
};

export const generateQRCode = (data: string): string => {
  // QR rendering is local; this helper now just normalizes payload text.
  return typeof data === 'string' ? data : String(data ?? '');
};

export const downloadFile = (filename: string, content: string): void => {
  const run = async () => {
    const normalizedContent = String(content ?? '');
    const normalizedFilename = (filename && filename.trim().length > 0)
      ? filename.trim()
      : `yazgi_save_${Date.now()}.json`;

    const hasDocument = typeof document !== 'undefined';
    if (hasDocument) {
      const blob = new Blob([normalizedContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = normalizedFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return;
    }

    if (!isReactNativeRuntime()) {
      return;
    }

    const [{ File, Paths }, sharing] = await Promise.all([
      import('expo-file-system'),
      import('expo-sharing'),
    ]);

    const targetName = normalizedFilename.endsWith('.json')
      ? normalizedFilename
      : `${normalizedFilename}.json`;
    const file = new File(Paths.cache, targetName);
    if (file.exists) {
      file.delete();
    }
    file.create({ intermediates: true, overwrite: true });
    file.write(normalizedContent);

    const canShare = await sharing.isAvailableAsync();
    if (canShare) {
      await sharing.shareAsync(file.uri, {
        mimeType: 'application/json',
        UTI: 'public.json',
        dialogTitle: targetName,
      });
    }
  };

  void run().catch((error) => {
    console.error('Download file failed:', error);
  });
};

export const readFile = (): Promise<string | null> => {
  return new Promise((resolve) => {
    const run = async () => {
      const hasDocument = typeof document !== 'undefined';
      if (hasDocument) {
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
        return;
      }

      if (!isReactNativeRuntime()) {
        resolve(null);
        return;
      }

      const { File } = await import('expo-file-system');
      const picked = await File.pickFileAsync(undefined, 'application/json');
      const selected = Array.isArray(picked) ? picked[0] : picked;
      if (!selected) {
        resolve(null);
        return;
      }
      resolve(await selected.text());
    };

    void run().catch((error) => {
      console.error('Read file failed:', error);
      resolve(null);
    });
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
