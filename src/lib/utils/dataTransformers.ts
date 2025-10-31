/**
 * Data transformation utilities for handling inconsistent data types
 * from Supabase JSONB fields
 */

/**
 * Ensures a value is an array, converting strings and objects to arrays
 * @param value - The value to convert to an array
 * @returns An array representation of the value
 */
export function ensureArray(value: any): any[] {
  // Already an array
  if (Array.isArray(value)) {
    return value;
  }

  // Null or undefined
  if (value === null || value === undefined) {
    return [];
  }

  // String (comma-separated values)
  if (typeof value === 'string') {
    // Handle empty strings
    if (value.trim() === '') {
      return [];
    }
    // Split by comma and clean up
    return value
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
  }

  // Object (convert values to array)
  if (typeof value === 'object') {
    const values = Object.values(value);
    // Filter out empty values
    return values.filter(v => v !== null && v !== undefined && v !== '');
  }

  // Single value (wrap in array)
  return [value];
}

/**
 * Ensures a value is a string
 * @param value - The value to convert to a string
 * @param defaultValue - Default value if conversion fails
 * @returns A string representation of the value
 */
export function ensureString(value: any, defaultValue: string = 'N/A'): string {
  if (value === null || value === undefined) {
    return defaultValue;
  }

  if (typeof value === 'string') {
    return value.trim() || defaultValue;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.join(', ') || defaultValue;
  }

  if (typeof value === 'object') {
    // Try to extract meaningful string from object
    if ('name' in value) return String(value.name);
    if ('title' in value) return String(value.title);
    if ('value' in value) return String(value.value);
    return JSON.stringify(value);
  }

  return defaultValue;
}

/**
 * Ensures a value is a number
 * @param value - The value to convert to a number
 * @param defaultValue - Default value if conversion fails
 * @returns A numeric representation of the value
 */
export function ensureNumber(value: any, defaultValue: number = 0): number {
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  return defaultValue;
}

/**
 * Safely access nested object properties
 * @param obj - The object to access
 * @param path - Dot-separated path to the property
 * @param defaultValue - Default value if property doesn't exist
 * @returns The property value or default
 */
export function safeGet(obj: any, path: string, defaultValue: any = null): any {
  try {
    const keys = path.split('.');
    let result = obj;

    for (const key of keys) {
      if (result === null || result === undefined) {
        return defaultValue;
      }
      result = result[key];
    }

    return result === undefined ? defaultValue : result;
  } catch (error) {
    return defaultValue;
  }
}

/**
 * Format an address object or string into a readable string
 * @param address - Address object or string
 * @returns Formatted address string
 */
export function formatAddress(address: any): string {
  if (!address) {
    return 'N/A';
  }

  if (typeof address === 'string') {
    return address.trim() || 'N/A';
  }

  if (typeof address === 'object') {
    const parts = [
      address.houseBlockLotNo,
      address.street,
      address.subdivisionVillage,
      address.barangay,
      address.cityMunicipality,
      address.province,
      address.zipCode
    ].filter(part => part && String(part).trim() !== '');

    return parts.length > 0 ? parts.join(', ') : 'N/A';
  }

  return 'N/A';
}

/**
 * Format a date string or object into a readable date
 * @param date - Date string, Date object, or date object
 * @param format - Format type ('short' | 'long')
 * @returns Formatted date string
 */
export function formatDate(date: any, format: 'short' | 'long' = 'short'): string {
  if (!date) {
    return 'N/A';
  }

  try {
    // Handle date objects with month/day/year properties
    if (typeof date === 'object' && !Array.isArray(date) && !(date instanceof Date)) {
      const { month, day, year } = date;
      if (month && day && year) {
        return `${month}/${day}/${year}`;
      }
    }

    // Handle Date objects and date strings
    const dateObj = date instanceof Date ? date : new Date(date);

    if (isNaN(dateObj.getTime())) {
      return String(date);
    }

    if (format === 'long') {
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }

    return dateObj.toLocaleDateString('en-US');
  } catch (error) {
    return String(date);
  }
}

/**
 * Ensure a boolean value
 * @param value - The value to convert to boolean
 * @param defaultValue - Default value if conversion fails
 * @returns Boolean representation of the value
 */
export function ensureBoolean(value: any, defaultValue: boolean = false): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const lower = value.toLowerCase().trim();
    if (lower === 'true' || lower === 'yes' || lower === '1') return true;
    if (lower === 'false' || lower === 'no' || lower === '0') return false;
  }

  if (typeof value === 'number') {
    return value !== 0;
  }

  return defaultValue;
}
