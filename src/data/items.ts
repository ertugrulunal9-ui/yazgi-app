import { Item } from '../types';

export const ITEMS: Item[] = [
  // --- ARAÇ GEREÇLER (PERMANENT) ---
  {
    id: 'item_guitar',
    name: 'Akustik Gitar',
    price: 250, // Reduced from 500
    description: 'Müzik pratiği yapmak için şart. Ruhunu notalarla besle.',
    type: 'PERMANENT',
    requiredForAction: 'music'
  },
  {
    id: 'item_pc_basic',
    name: 'Ofis Bilgisayarı',
    price: 400, // Reduced from 2000
    description: 'Temel kodlama öğrenmek ve ödev yapmak için gerekli.',
    type: 'PERMANENT',
    requiredForAction: 'coding_basic'
  },
  {
    id: 'item_pc_gaming',
    name: 'Canavar PC',
    price: 1200, // Reduced from 5000
    description: 'Yüksek performanslı oyun ve tasarım için. Kodlama verimini artırır.',
    type: 'PERMANENT',
    requiredForAction: 'coding_advanced'
  },
  {
    id: 'item_running_shoes',
    name: 'Koşu Ayakkabısı',
    price: 150, // Reduced from 300
    description: 'Parkta koşmak için gerekli. Ayak sağlığın önemli.',
    type: 'PERMANENT',
    requiredForAction: 'running'
  },

  // --- TÜKETİLEBİLİRLER (CONSUMABLE) ---
  {
    id: 'item_energy_drink',
    name: 'Enerji İçeceği',
    price: 15, // Reduced from 50
    description: 'Kafein patlaması! Enerjiyi fulle ama sağlığı biraz bozar.',
    type: 'CONSUMABLE',
    effect: { energy: 40, health: -2 }
  },
  {
    id: 'item_book_scifi',
    name: 'Bilim Kurgu Romanı',
    price: 30, // Reduced from 100
    description: 'Hayal gücünü genişlet. Zeka ve Yaratıcılık katar.',
    type: 'CONSUMABLE',
    effect: { intelligence: 5 } // Yaratıcılık statı olmadığı için Zeka veriyoruz
  },
  {
    id: 'item_coffee',
    name: 'Filtre Kahve',
    price: 15, // Reduced from 30
    description: 'Uykunu açar. Az miktar enerji verir.',
    type: 'CONSUMABLE',
    effect: { energy: 15 }
  }
];

export const getItem = (itemId: string): Item | undefined => {
  return ITEMS.find(item => item.id === itemId);
};
