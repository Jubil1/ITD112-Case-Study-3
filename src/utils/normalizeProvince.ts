// Shared province name normalization with exception mapping for CSV ↔ GeoJSON joins

const NAME_MAP: Record<string, string> = {
  // NCR is split into districts in GeoJSON; keep as NCR for filtering/skipping in hooks
  NCR: "NCR",

  // Common variants and legacy spellings
  "CITY OF MANILA": "MANILA",
  "MANILA CITY": "MANILA",
  "NUEVA VISCAYA": "NUEVA VIZCAYA",
  "MT PROVINCE": "MOUNTAIN PROVINCE",
  "MT. PROVINCE": "MOUNTAIN PROVINCE",
  "NORTH COTABATO": "COTABATO",
  "COTABATO (NORTH COTABATO)": "COTABATO",
  "DAVAO (DEL SUR)": "DAVAO DEL SUR",
  "DAVAO (DEL NORTE)": "DAVAO DEL NORTE",
  "DAVAO ORIENTAL (EASTERN DAVAO)": "DAVAO ORIENTAL",
  "MISAMIS OCCIDENTAL (WESTERN MISAMIS)": "MISAMIS OCCIDENTAL",
  "MISAMIS ORIENTAL (EASTERN MISAMIS)": "MISAMIS ORIENTAL",
  "NORTH DAVAO": "DAVAO DEL NORTE",
  "SOUTH COTABATO (INCLUDING GENERAL SANTOS CITY)": "SOUTH COTABATO",
  "COMPOSTELA VALLEY": "DAVAO DE ORO",
  "SHARIFF KABUNSUAN": "MAGUINDANAO",
  "MAGUINDANAO DEL NORTE": "MAGUINDANAO",
  "MAGUINDANAO DEL SUR": "MAGUINDANAO",
};

export const normalizeProvinceName = (s: string) => {
  const base = (s || "")
    .toUpperCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9()\-\s]/g, "")
    .replace(/\bCITY OF\b/g, "")
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .replace(/[\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return NAME_MAP[base] || base;
};

export default normalizeProvinceName;
