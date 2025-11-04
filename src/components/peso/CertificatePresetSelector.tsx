'use client';

import React from 'react';
import { LAYOUT_PRESETS, type LayoutPresetType } from '@/lib/certificates/layoutPresets';
import { Sparkles, Minimize2, AlignCenter, Maximize2, CheckCircle2 } from 'lucide-react';

interface CertificatePresetSelectorProps {
  selectedPreset: LayoutPresetType;
  onSelectPreset: (presetId: LayoutPresetType) => void;
}

/**
 * CertificatePresetSelector Component
 *
 * Allows PESO officers to choose predefined layout presets or auto-fit
 * instead of manually adjusting sliders.
 */
export default function CertificatePresetSelector({
  selectedPreset,
  onSelectPreset,
}: CertificatePresetSelectorProps) {
  const presets: Array<{
    id: LayoutPresetType;
    icon: React.ElementType;
    color: string;
    bgColor: string;
    borderColor: string;
  }> = [
    {
      id: 'auto',
      icon: Sparkles,
      color: 'text-teal-700',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-500',
    },
    {
      id: 'compact',
      icon: Minimize2,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-500',
    },
    {
      id: 'standard',
      icon: AlignCenter,
      color: 'text-gray-700',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-500',
    },
    {
      id: 'spacious',
      icon: Maximize2,
      color: 'text-purple-700',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-500',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Certificate Layout</h3>
        <p className="text-sm text-gray-600">
          Choose a preset to ensure proper formatting
        </p>
      </div>

      {/* Preset Buttons */}
      <div className="grid grid-cols-1 gap-3">
        {presets.map(({ id, icon: Icon, color, bgColor, borderColor }) => {
          const preset = LAYOUT_PRESETS[id];
          const isSelected = selectedPreset === id;

          return (
            <button
              key={id}
              onClick={() => onSelectPreset(id)}
              className={`relative text-left p-4 rounded-lg border-2 transition-all ${
                isSelected
                  ? `${borderColor} ${bgColor} shadow-md`
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{preset.name}</h4>
                    {id === 'auto' && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-teal-100 text-teal-700 rounded-full">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{preset.description}</p>
                </div>

                {/* Selected Indicator */}
                {isSelected && (
                  <div className="flex-shrink-0">
                    <CheckCircle2 className={`w-6 h-6 ${color}`} />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Info Note */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-xs text-blue-800">
          <strong>Tip:</strong> Use <strong>Auto-Fit</strong> to automatically adjust the layout
          based on content length. The preview updates in real-time as you select different presets.
        </p>
      </div>
    </div>
  );
}
