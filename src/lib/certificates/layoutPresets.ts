import type { CertificateLayoutParams } from '@/types/certificate.types';

/**
 * Certificate Layout Presets
 *
 * Predefined layout configurations to ensure content fits properly
 */

export type LayoutPresetType = 'auto' | 'compact' | 'standard' | 'spacious';

export interface LayoutPreset {
  id: LayoutPresetType;
  name: string;
  description: string;
  params: Required<CertificateLayoutParams>;
}

export const LAYOUT_PRESETS: Record<LayoutPresetType, LayoutPreset> = {
  auto: {
    id: 'auto',
    name: 'Auto-Fit',
    description: 'Automatically adjusts based on content length (Recommended)',
    params: {
      topMargin: 10,
      sectionSpacing: 8,
      titleFontSize: 28,
      nameFontSize: 20,
      bodyFontSize: 12,
      programFontSize: 16,
      signatureWidth: 35,
      signatureHeight: 10,
      signatureGap: 5,
    },
  },
  compact: {
    id: 'compact',
    name: 'Compact',
    description: 'Tight spacing, smaller fonts (for long content)',
    params: {
      topMargin: 5,
      sectionSpacing: 4,
      titleFontSize: 24,
      nameFontSize: 18,
      bodyFontSize: 11,
      programFontSize: 14,
      signatureWidth: 30,
      signatureHeight: 8,
      signatureGap: 2,
    },
  },
  standard: {
    id: 'standard',
    name: 'Standard',
    description: 'Balanced layout for most certificates',
    params: {
      topMargin: 10,
      sectionSpacing: 8,
      titleFontSize: 28,
      nameFontSize: 20,
      bodyFontSize: 12,
      programFontSize: 16,
      signatureWidth: 35,
      signatureHeight: 10,
      signatureGap: 5,
    },
  },
  spacious: {
    id: 'spacious',
    name: 'Spacious',
    description: 'Generous spacing, larger fonts (for short content)',
    params: {
      topMargin: 12,
      sectionSpacing: 10,
      titleFontSize: 32,
      nameFontSize: 24,
      bodyFontSize: 13,
      programFontSize: 18,
      signatureWidth: 40,
      signatureHeight: 12,
      signatureGap: 6,
    },
  },
};

/**
 * Auto-fit algorithm: Analyzes certificate content and selects optimal preset
 *
 * @param contentAnalysis - Analysis of certificate content lengths
 * @returns Optimal layout parameters
 */
export function calculateAutoFitLayout(contentAnalysis: {
  nameLength: number;
  programTitleLength: number;
  skillsCount: number;
  hasDuration: boolean;
  hasSkills: boolean;
}): Required<CertificateLayoutParams> {
  const { nameLength, programTitleLength, skillsCount } = contentAnalysis;

  // Calculate complexity score
  let complexityScore = 0;

  // Long name increases complexity
  if (nameLength > 25) complexityScore += 2;
  else if (nameLength > 15) complexityScore += 1;

  // Long program title increases complexity
  if (programTitleLength > 50) complexityScore += 3;
  else if (programTitleLength > 35) complexityScore += 2;
  else if (programTitleLength > 20) complexityScore += 1;

  // Many skills increase complexity
  if (skillsCount > 6) complexityScore += 2;
  else if (skillsCount > 3) complexityScore += 1;

  // Select preset based on complexity
  // Default to Compact for safety (ensures everything fits)
  if (complexityScore >= 3) {
    // Medium-high complexity: Use compact layout
    return LAYOUT_PRESETS.compact.params;
  } else if (complexityScore >= 1) {
    // Low-medium complexity: Use standard layout
    return LAYOUT_PRESETS.standard.params;
  } else {
    // Very low complexity: Use compact (safest default)
    // Avoid Spacious as it risks overflow
    return LAYOUT_PRESETS.compact.params;
  }
}

/**
 * Validate that content will fit within certificate bounds (A4 landscape: 297mm x 210mm)
 *
 * @param params - Layout parameters to validate
 * @returns Whether the layout is valid
 */
export function validateLayoutBounds(params: CertificateLayoutParams): boolean {
  const maxHeight = 210; // mm (A4 landscape height)
  const maxWidth = 297; // mm (A4 landscape width)

  // Estimate total height needed
  const topMargin = params.topMargin || 10;
  const sectionSpacing = params.sectionSpacing || 8;

  // Rough height calculation
  // Header: ~30mm
  // Title section: ~25mm
  // Body sections: ~120mm (varies by content)
  // Signature: ~30mm
  // Footer: ~10mm
  const estimatedHeight = topMargin + 30 + 25 + 120 + 30 + 10 + (sectionSpacing * 6);

  return estimatedHeight <= maxHeight;
}
