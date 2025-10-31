/**
 * Address formatting utilities for PDS data
 * Handles inconsistent field naming between database and type definitions
 */

/**
 * Formats an address object into a readable string
 * Handles both database field names (city, houseNo, subdivision)
 * and type definition names (cityMunicipality, houseBlockLotNo, subdivisionVillage)
 *
 * @param address - Address object with various possible field names
 * @returns Formatted address string or 'N/A' if no valid address
 */
export function formatAddress(address: any): string {
  if (!address || typeof address !== 'object') {
    return 'N/A';
  }

  // Handle both naming conventions by checking both possible field names
  const parts = [
    address.houseNo || address.houseBlockLotNo,
    address.street,
    address.subdivision || address.subdivisionVillage,
    address.barangay,
    address.city || address.cityMunicipality,
    address.province,
    address.zipCode,
  ];

  const formatted = parts.filter(Boolean).join(', ');
  return formatted || 'N/A';
}

/**
 * Formats permanent address with special handling for "same as residential"
 *
 * @param permanentAddress - Permanent address object
 * @param residentialAddress - Residential address object (for reference)
 * @returns Formatted permanent address string or special message
 */
export function formatPermanentAddress(
  permanentAddress: any,
  residentialAddress: any
): string {
  if (!permanentAddress || typeof permanentAddress !== 'object') {
    return 'N/A';
  }

  // Check if permanent address is same as residential
  if (permanentAddress.sameAsResidential) {
    return 'Same as Residential Address';
  }

  return formatAddress(permanentAddress);
}
