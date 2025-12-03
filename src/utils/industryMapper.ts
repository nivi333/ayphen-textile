/**
 * Industry Mapper Utility
 * Maps between frontend display names and backend enum values
 */

export const INDUSTRY_DISPLAY_TO_ENUM: Record<string, string> = {
  'Textile Manufacturing': 'TEXTILE_MANUFACTURING',
  'Garment Production': 'GARMENT_PRODUCTION',
  'Knitting & Weaving': 'KNITTING_WEAVING',
  'Fabric Processing': 'FABRIC_PROCESSING',
  'Apparel Design': 'APPAREL_DESIGN',
  'Fashion Retail': 'FASHION_RETAIL',
  'Yarn Production': 'YARN_PRODUCTION',
  'Dyeing & Finishing': 'DYEING_FINISHING',
  'Home Textiles': 'HOME_TEXTILES',
  'Technical Textiles': 'TECHNICAL_TEXTILES',
};

export const INDUSTRY_ENUM_TO_DISPLAY: Record<string, string> = {
  'TEXTILE_MANUFACTURING': 'Textile Manufacturing',
  'GARMENT_PRODUCTION': 'Garment Production',
  'KNITTING_WEAVING': 'Knitting & Weaving',
  'FABRIC_PROCESSING': 'Fabric Processing',
  'APPAREL_DESIGN': 'Apparel Design',
  'FASHION_RETAIL': 'Fashion Retail',
  'YARN_PRODUCTION': 'Yarn Production',
  'DYEING_FINISHING': 'Dyeing & Finishing',
  'HOME_TEXTILES': 'Home Textiles',
  'TECHNICAL_TEXTILES': 'Technical Textiles',
};

/**
 * Convert frontend display name to backend enum value
 * Also handles if the value is already an enum value
 */
export function industryToEnum(displayName: string): string {
  // If it's already an enum value, return it
  if (INDUSTRY_ENUM_TO_DISPLAY[displayName]) {
    return displayName;
  }
  // Otherwise, convert from display name
  return INDUSTRY_DISPLAY_TO_ENUM[displayName] || 'TEXTILE_MANUFACTURING';
}

/**
 * Convert backend enum value to frontend display name
 */
export function industryToDisplay(enumValue: string): string {
  return INDUSTRY_ENUM_TO_DISPLAY[enumValue] || enumValue;
}
