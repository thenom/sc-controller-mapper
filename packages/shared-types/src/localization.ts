/**
 * Localization types extracted from Star Citizen global.ini
 */

export interface LocalizationRecord {
  key: string;
  value: string;
}

export interface LocalizationDictionary {
  [normalizedKey: string]: string;
}

export interface LocalizedActionMetadata {
  label: string;
  description: string;
  category?: string;
}
