export interface InciEntry {
  commonName: string;
  inciName: string;
  allergens?: string[];
}

export const INCI_DICTIONARY: InciEntry[] = [
  // Base Oils & Fats (Saponified Sodium Salts)
  { commonName: "Olive Oil", inciName: "Sodium Olivate" },
  { commonName: "Coconut Oil", inciName: "Sodium Cocoate" },
  { commonName: "Palm Oil", inciName: "Sodium Palmate" },
  { commonName: "Castor Oil", inciName: "Sodium Castorate" },
  { commonName: "Shea Butter", inciName: "Sodium Shea Butterate" },
  { commonName: "Sweet Almond Oil", inciName: "Sodium Sweet Almondate" },
  { commonName: "Sunflower Oil", inciName: "Sodium Sunflowerate" },
  { commonName: "Cocoa Butter", inciName: "Sodium Cocoa Butterate" },
  { commonName: "Avocado Oil", inciName: "Sodium Avocadoate" },
  { commonName: "Jojoba Oil", inciName: "Simmondsia Chinensis Seed Oil" },
  { commonName: "Argan Oil", inciName: "Argania Spinosa Kernel Oil" },

  // Liquids
  { commonName: "Water", inciName: "Aqua" },
  { commonName: "Distilled Water", inciName: "Aqua" },
  { commonName: "Distilled Water (or Oat Water)", inciName: "Aqua" },
  { commonName: "Oat Water", inciName: "Avena Sativa Kernel Extract" },
  { commonName: "Goat Milk", inciName: "Caprae Lac" },
  { commonName: "Coconut Milk", inciName: "Cocos Nucifera Fruit Extract" },
  { commonName: "Sodium Hydroxide", inciName: "Sodium Hydroxide" },
  { commonName: "Lye", inciName: "Sodium Hydroxide" },

  // Additives & Colorants & Botanicals
  { commonName: "Glycerin", inciName: "Glycerin" },
  { commonName: "Clycerin", inciName: "Glycerin" }, // Typo fallback
  { commonName: "Oatmeal", inciName: "Avena Sativa Kernel Flour" },
  { commonName: "Oats", inciName: "Avena Sativa Kernel Flour" },
  { commonName: "Colloidal Oatmeal", inciName: "Avena Sativa Kernel Flour" },
  { commonName: "Honey", inciName: "Mel" },
  { commonName: "Titanium Dioxide", inciName: "Titanium Dioxide (CI 77891)" },
  { commonName: "Sodium Lactate", inciName: "Sodium Lactate" },
  { commonName: "Kaolin Clay", inciName: "Kaolin" },
  { commonName: "Activated Charcoal", inciName: "Charcoal Powder" },
  { commonName: "Charcoal", inciName: "Charcoal Powder" },
  { commonName: "Salt", inciName: "Sodium Chloride" },
  { commonName: "Sea Salt", inciName: "Maris Sal" },
  { commonName: "Panthenol (B5)", inciName: "Panthenol" },
  { commonName: "Panthenol", inciName: "Panthenol" },
  { commonName: "Allantoin", inciName: "Allantoin" },
  { commonName: "Squalane", inciName: "Squalane" },
  { commonName: "Hyaluronic Acid", inciName: "Sodium Hyaluronate" },
  { commonName: "Zinc PCA", inciName: "Zinc PCA" },
  { commonName: "Salicylic Acid", inciName: "Salicylic Acid" },
  { commonName: "Niacinamide", inciName: "Niacinamide" },
  { commonName: "Aloe Vera Powder (200x)", inciName: "Aloe Barbadensis Leaf Juice Powder" },
  { commonName: "Aloe Vera Powder", inciName: "Aloe Barbadensis Leaf Juice Powder" },
  { commonName: "Essential Oils", inciName: "Parfum" },
  { commonName: "Phenoxyethanol & Ethylhexylglyceri", inciName: "Phenoxyethanol (and) Ethylhexylglycerin" },
  { commonName: "Phenoxyethanol & Ethylhexylglyc", inciName: "Phenoxyethanol (and) Ethylhexylglycerin" },
  { commonName: "Phenoxyethanol & Ethylhexylglycerin", inciName: "Phenoxyethanol (and) Ethylhexylglycerin" },

  // Syndet Surfactants & Co-Emulsifiers / Hardener Inputs
  { commonName: "Sodium Cocoyl Isethionate", inciName: "Sodium Cocoyl Isethionate" },
  { commonName: "SCI", inciName: "Sodium Cocoyl Isethionate" },
  { commonName: "Sodium Coco-Sulfate", inciName: "Sodium Coco-Sulfate" },
  { commonName: "SCS", inciName: "Sodium Coco-Sulfate" },
  { commonName: "Sodium Lauryl Sulfoacetate", inciName: "Sodium Lauryl Sulfoacetate" },
  { commonName: "SLSa", inciName: "Sodium Lauryl Sulfoacetate" },
  { commonName: "Cocamidopropyl Betaine", inciName: "Cocamidopropyl Betaine" },
  { commonName: "CAPB", inciName: "Cocamidopropyl Betaine" },
  { commonName: "Coco Glucoside", inciName: "Coco-Glucoside" },
  { commonName: "Decyl Glucoside", inciName: "Decyl Glucoside" },
  { commonName: "Lauryl Glucoside", inciName: "Lauryl Glucoside" },
  { commonName: "Stearic Acid", inciName: "Stearic Acid" },
  { commonName: "Cetyl Alcohol", inciName: "Cetyl Alcohol" },
  { commonName: "Cetearyl Alcohol", inciName: "Cetearyl Alcohol" },
  { commonName: "BTMS-50", inciName: "Behentrimonium Methosulfate (and) Cetyl Alcohol (and) Butylene Glycol" },
  { commonName: "Behentrimonium Methosulfate", inciName: "Behentrimonium Methosulfate (and) Cetearyl Alcohol" },
  { commonName: "BTMS-25", inciName: "Behentrimonium Methosulfate (and) Cetearyl Alcohol" },
  { commonName: "Polyquaternium-7", inciName: "Polyquaternium-7" },
  { commonName: "Disodium Laureth Sulfosuccinate", inciName: "Disodium Laureth Sulfosuccinate" },
  { commonName: "Sodium C14-16 Olefin Sulfonate", inciName: "Sodium C14-16 Olefin Sulfonate" },

  // Essential Oils (with EU/FDA declarable fragrance allergens)
  {
    commonName: "Lavender Essential Oil",
    inciName: "Lavandula Angustifolia Oil",
    allergens: ["Linalool", "Limonene"],
  },
  {
    commonName: "Lavender Oil",
    inciName: "Lavandula Angustifolia Oil",
    allergens: ["Linalool", "Limonene"],
  },
  {
    commonName: "Tea Tree Essential Oil",
    inciName: "Melaleuca Alternifolia Leaf Oil",
    allergens: ["Limonene"],
  },
  {
    commonName: "Tea Tree Oil",
    inciName: "Melaleuca Alternifolia Leaf Oil",
    allergens: ["Limonene"],
  },
  {
    commonName: "Peppermint Essential Oil",
    inciName: "Mentha Piperita Oil",
    allergens: ["Limonene", "Linalool"],
  },
  {
    commonName: "Peppermint Oil",
    inciName: "Mentha Piperita Oil",
    allergens: ["Limonene", "Linalool"],
  },
  {
    commonName: "Sweet Orange Essential Oil",
    inciName: "Citrus Aurantium Dulcis Peel Oil",
    allergens: ["Limonene", "Linalool", "Citral"],
  },
  {
    commonName: "Orange Oil",
    inciName: "Citrus Aurantium Dulcis Peel Oil",
    allergens: ["Limonene", "Linalool", "Citral"],
  },
  {
    commonName: "Eucalyptus Essential Oil",
    inciName: "Eucalyptus Globulus Leaf Oil",
    allergens: ["Limonene"],
  },
  {
    commonName: "Eucalyptus Oil",
    inciName: "Eucalyptus Globulus Leaf Oil",
    allergens: ["Limonene"],
  },
  {
    commonName: "Lemon Essential Oil",
    inciName: "Citrus Limon Peel Oil",
    allergens: ["Limonene", "Citral", "Linalool"],
  },
  {
    commonName: "Lemon Oil",
    inciName: "Citrus Limon Peel Oil",
    allergens: ["Limonene", "Citral", "Linalool"],
  },
  {
    commonName: "Lemongrass Essential Oil",
    inciName: "Cymbopogon Flexuosus Oil",
    allergens: ["Citral", "Geraniol", "Limonene", "Linalool"],
  },
  {
    commonName: "Lemongrass Oil",
    inciName: "Cymbopogon Flexuosus Oil",
    allergens: ["Citral", "Geraniol", "Limonene", "Linalool"],
  },
  {
    commonName: "Rosemary Essential Oil",
    inciName: "Rosmarinus Officinalis Leaf Oil",
    allergens: ["Limonene", "Linalool"],
  },
  {
    commonName: "Rosemary Oil",
    inciName: "Rosmarinus Officinalis Leaf Oil",
    allergens: ["Limonene", "Linalool"],
  },
  {
    commonName: "Patchouli Essential Oil",
    inciName: "Pogostemon Cablin Leaf Oil",
    allergens: ["Limonene"],
  },
  {
    commonName: "Patchouli Oil",
    inciName: "Pogostemon Cablin Leaf Oil",
    allergens: ["Limonene"],
  },
  {
    commonName: "Frankincense Essential Oil",
    inciName: "Boswellia Carterii Oil",
    allergens: ["Limonene"],
  },
  {
    commonName: "Frankincense Oil",
    inciName: "Boswellia Carterii Oil",
    allergens: ["Limonene"],
  },
  {
    commonName: "Ylang Ylang Essential Oil",
    inciName: "Cananga Odorata Flower Oil",
    allergens: ["Benzyl Salicylate", "Geraniol", "Linalool", "Farnesol", "Benzyl Benzoate"],
  },
];

/**
 * Fuzzy matches an ingredient name against the local INCI dictionary.
 * Searches for substring overlap, token overlap, or exact matches (case-insensitive).
 */
export function lookupInci(name: string): InciEntry | null {
  if (!name || name.trim() === "") return null;

  const normalizedInput = name.toLowerCase().trim();

  // 1. Direct match check
  const exactMatch = INCI_DICTIONARY.find(
    (entry) => entry.commonName.toLowerCase() === normalizedInput || entry.inciName.toLowerCase() === normalizedInput
  );
  if (exactMatch) return exactMatch;

  // 2. Simple word boundaries / contains check
  const substringMatch = INCI_DICTIONARY.find(
    (entry) =>
      normalizedInput.includes(entry.commonName.toLowerCase()) ||
      entry.commonName.toLowerCase().includes(normalizedInput)
  );
  if (substringMatch) return substringMatch;

  // 3. Fallback: split words and search for major common term matches
  const inputWords = normalizedInput.split(/\s+/).filter((w) => w.length > 2);
  for (const word of inputWords) {
    if (word === "essential" || word === "oil" || word === "butter" || word === "clay") continue;
    const match = INCI_DICTIONARY.find((entry) => entry.commonName.toLowerCase().includes(word));
    if (match) return match;
  }

  return null;
}
