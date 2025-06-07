// Pre-generated album metadata to reduce API calls
// This file should be updated periodically with fresh data
export const staticAlbumMetadata: Record<string, { cover: string; title: string }> = {
  // 2025
  "vQzp7Xc": { cover: "placeholder", title: "Celeste Ring Photos" },
  "5kdNOK4": { cover: "placeholder", title: "New Brunswick Engagement Trip" },
  "OYJ7wZB": { cover: "placeholder", title: "Clutchkickers at Gus' Pub" },
  
  // 2024
  "EBr9bLr": { cover: "placeholder", title: "Winter Hike in Timberlea" },
  "rEhn9Cy": { cover: "placeholder", title: "Cape Breton" },
  "KqQ78cK": { cover: "placeholder", title: "McCabe Prints" },
  "Y8K8Kcx": { cover: "placeholder", title: "Halloween 2024 - Medusa" },
  "cveGVlY": { cover: "placeholder", title: "McCabe Halifax" },
  "2gyEQze": { cover: "placeholder", title: "Funchal and home" },
  "mv7KpmZ": { cover: "placeholder", title: "Pico to Pico" },
  "0iaGjgw": { cover: "placeholder", title: "Funchal" },
  "rTtaitn": { cover: "placeholder", title: "Vereda da Ponta de Sao Loureco" },
  "8NlMb6I": { cover: "placeholder", title: "Fanal Forest, Ilhous de Rib" },
  "Q5LA70U": { cover: "placeholder", title: "Calheta and Ponta del Sol" },
  "IniT3Ix": { cover: "placeholder", title: "Madeira - Funchal - Ponta del Sol" },
  "29blBGK": { cover: "placeholder", title: "Azores" },
  "xCgKbyn": { cover: "placeholder", title: "Assemble24 in Cancun" },
  "lhtbj19": { cover: "placeholder", title: "FGA Offsite and Hamilton trip" },
  
  // Note: This is a partial list for demonstration
  // In a real implementation, you'd either:
  // 1. Use a script to fetch all cover images once and store them here
  // 2. Gradually populate this as albums are accessed
  // 3. Use a fallback strategy that checks this first, then falls back to API
};

export const hasStaticMetadata = (albumId: string): boolean => {
  return albumId in staticAlbumMetadata;
};

export const getStaticMetadata = (albumId: string) => {
  return staticAlbumMetadata[albumId] || null;
};
