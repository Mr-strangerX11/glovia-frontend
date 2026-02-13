// Nepal Administrative Divisions Data
export const provinces = [
  'Koshi Province',
  'Madhesh Province',
  'Bagmati Province',
  'Gandaki Province',
  'Lumbini Province',
  'Karnali Province',
  'Sudurpashchim Province'
];

export const districtsByProvince: Record<string, string[]> = {
  'Koshi Province': ['Bhojpur', 'Dhankuta', 'Ilam', 'Jhapa', 'Khotang', 'Morang', 'Okhaldhunga', 'Panchthar', 'Sankhuwasabha', 'Solukhumbu', 'Sunsari', 'Taplejung', 'Terhathum', 'Udayapur'],
  'Madhesh Province': ['Bara', 'Dhanusha', 'Mahottari', 'Parsa', 'Rautahat', 'Saptari', 'Sarlahi', 'Siraha'],
  'Bagmati Province': ['Bhaktapur', 'Chitwan', 'Dhading', 'Dolakha', 'Kathmandu', 'Kavrepalanchok', 'Lalitpur', 'Makwanpur', 'Nuwakot', 'Ramechhap', 'Rasuwa', 'Sindhuli', 'Sindhupalchok'],
  'Gandaki Province': ['Baglung', 'Gorkha', 'Kaski', 'Lamjung', 'Manang', 'Mustang', 'Myagdi', 'Nawalpur', 'Parbat', 'Syangja', 'Tanahun'],
  'Lumbini Province': ['Arghakhanchi', 'Banke', 'Bardiya', 'Dang', 'Gulmi', 'Kapilvastu', 'Parasi', 'Palpa', 'Pyuthan', 'Rolpa', 'Rukum East', 'Rupandehi'],
  'Karnali Province': ['Dailekh', 'Dolpa', 'Humla', 'Jajarkot', 'Jumla', 'Kalikot', 'Mugu', 'Rukum West', 'Salyan', 'Surkhet'],
  'Sudurpashchim Province': ['Achham', 'Baitadi', 'Bajhang', 'Bajura', 'Dadeldhura', 'Darchula', 'Doti', 'Kailali', 'Kanchanpur']
};

// Major municipalities for Kathmandu Valley (expand as needed)
export const municipalitiesByDistrict: Record<string, string[]> = {
  'Kathmandu': [
    'Kathmandu Metropolitan City',
    'Budhanilkantha Municipality',
    'Chandragiri Municipality',
    'Dakshinkali Municipality',
    'Gokarneshwar Municipality',
    'Kageshwari Manohara Municipality',
    'Kirtipur Municipality',
    'Nagarjun Municipality',
    'Shankarapur Municipality',
    'Tarakeshwar Municipality',
    'Tokha Municipality'
  ],
  'Lalitpur': [
    'Lalitpur Metropolitan City',
    'Godawari Municipality',
    'Mahalaxmi Municipality',
    'Bagmati Rural Municipality',
    'Konjyosom Rural Municipality'
  ],
  'Bhaktapur': [
    'Bhaktapur Municipality',
    'Changunarayan Municipality',
    'Madhyapur Thimi Municipality',
    'Suryabinayak Municipality'
  ],
  'Chitwan': [
    'Bharatpur Metropolitan City',
    'Kalika Municipality',
    'Khairahani Municipality',
    'Madi Municipality',
    'Rapti Municipality',
    'Ratnanagar Municipality'
  ],
  'Morang': [
    'Biratnagar Metropolitan City',
    'Belbari Municipality',
    'Letang Municipality',
    'Pathari-Sanischare Municipality',
    'Rangeli Municipality',
    'Ratuwamai Municipality',
    'Sundar Haraicha Municipality',
    'Sundarpur Municipality',
    'Urlabari Municipality'
  ],
  'Rupandehi': [
    'Butwal Sub-Metropolitan City',
    'Devdaha Municipality',
    'Lumbini Sanskritik Municipality',
    'Sainamaina Municipality',
    'Siddharthanagar Municipality',
    'Tilottama Municipality'
  ],
  'Kaski': [
    'Pokhara Metropolitan City',
    'Annapurna Rural Municipality',
    'Madi Rural Municipality',
    'Machhapuchchhre Rural Municipality',
    'Rupa Rural Municipality'
  ]
};

// Ward numbers typically range from 1-33 for municipalities
export const getWardNumbers = (max: number = 33): number[] => {
  return Array.from({ length: max }, (_, i) => i + 1);
};

// Helper function to get districts for a province
export function getDistrictsForProvince(province: string): string[] {
  return districtsByProvince[province] || [];
}

// Helper function to get municipalities for a district
export function getMunicipalitiesForDistrict(district: string): string[] {
  return municipalitiesByDistrict[district] || ['Other'];
}
