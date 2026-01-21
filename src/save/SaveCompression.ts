import { SaveSlotData, CompressedSaveData, SAVE_VERSION } from './SaveSlot';
import { calculateChecksum } from '../utils/checksum';

const compress = (data: string): string => {
  try {
    if (typeof btoa !== 'undefined') {
      const encoded = encodeURIComponent(data);
      return btoa(encoded);
    }
    return data;
  } catch (error) {
    console.error('Compression failed:', error);
    return data;
  }
};

const decompress = (data: string): string => {
  try {
    if (typeof atob !== 'undefined') {
      const decoded = atob(data);
      return decodeURIComponent(decoded);
    }
    return data;
  } catch (error) {
    console.error('Decompression failed:', error);
    return data;
  }
};

export const compressSaveData = (saveData: SaveSlotData): CompressedSaveData => {
  const jsonString = JSON.stringify(saveData);
  const compressed = compress(jsonString);
  const checksum = calculateChecksum(jsonString);
  
  return {
    compressed,
    checksum,
    version: SAVE_VERSION,
  };
};

export const decompressSaveData = (compressedData: CompressedSaveData): SaveSlotData | null => {
  try {
    const decompressed = decompress(compressedData.compressed);
    const checksum = calculateChecksum(decompressed);
    
    if (checksum !== compressedData.checksum) {
      console.error('Checksum mismatch - data may be corrupted');
      return null;
    }
    
    const saveData = JSON.parse(decompressed) as SaveSlotData;
    return saveData;
  } catch (error) {
    console.error('Decompression failed:', error);
    return null;
  }
};

export const estimateCompressedSize = (saveData: SaveSlotData): { original: number; compressed: number; ratio: number } => {
  const jsonString = JSON.stringify(saveData);
  const compressed = compress(jsonString);
  
  const original = new Blob([jsonString]).size;
  const compressedSize = new Blob([compressed]).size;
  const ratio = compressedSize / original;
  
  return { original, compressed: compressedSize, ratio };
};
