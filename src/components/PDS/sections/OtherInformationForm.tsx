'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { OtherInformation } from '@/types/pds.types';
import { otherInformationSchema } from '@/lib/pds/validation';
import { FormField } from '../FormField';
import { ArrayFieldSection } from '../ArrayFieldSection';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, X, Trash2, CheckCircle } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';

interface OtherInformationFormProps {
  data?: OtherInformation;
  onChange: (data: OtherInformation) => void;
}

export const OtherInformationForm: React.FC<OtherInformationFormProps> = ({
  data,
  onChange,
}) => {
  const signatureRef = useRef<SignatureCanvas>(null);
  const [newSkill, setNewSkill] = useState('');
  const [newRecognition, setNewRecognition] = useState('');
  const [newMembership, setNewMembership] = useState('');
  const [signatureUploadStatus, setSignatureUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [signatureError, setSignatureError] = useState<string | null>(null);

  const {
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<OtherInformation>({
    resolver: zodResolver(otherInformationSchema),
    defaultValues: data || {
      skills: [],
      recognitions: [],
      memberships: [],
      references: [],
      declaration: {
        agreed: false,
        dateAccomplished: '',
      },
    },
    mode: 'onBlur',
  });

  const { fields: referenceFields, append: appendReference, remove: removeReference } = useFieldArray({
    control,
    name: 'references',
  });

  const watchedData = watch();
  const watchSkills = watch('skills') || [];
  const watchRecognitions = watch('recognitions') || [];
  const watchMemberships = watch('memberships') || [];

  // Sync form fields with data prop changes (e.g., when loading test data)
  useEffect(() => {
    if (data) {
      reset(data);
      // Load signature if exists after resetting
      if (data.declaration?.signatureData && signatureRef.current) {
        signatureRef.current.fromDataURL(data.declaration.signatureData);
      }
    }
  }, [data, reset]);

  // Load signature if exists
  useEffect(() => {
    if (data?.declaration?.signatureData && signatureRef.current) {
      signatureRef.current.fromDataURL(data.declaration.signatureData);
    }
  }, [data?.declaration?.signatureData]);

  // Update parent component when form changes
  // Use JSON.stringify to prevent infinite loop (object comparison by value, not reference)
  const watchedDataString = JSON.stringify(watchedData);
  useEffect(() => {
    onChange(watchedData);
  }, [watchedDataString]);

  // Handle signature - Upload to Supabase Storage
  const handleSignatureEnd = async () => {
    if (!signatureRef.current) return;

    try {
      setSignatureUploadStatus('uploading');
      setSignatureError(null);

      // Convert canvas to Blob
      const canvas = signatureRef.current.getCanvas();
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, 'image/png', 0.95);
      });

      // Create FormData and upload
      const formData = new FormData();
      formData.append('signature', blob, 'signature.png');

      const response = await fetch('/api/pds/signature', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to upload signature');
      }

      // Store the signature URL and timestamp
      setValue('declaration.signatureUrl', result.data.filePath);
      setValue('declaration.signatureUploadedAt', result.data.uploadedAt);

      // Keep legacy Base64 for backward compatibility (optional)
      const signatureData = signatureRef.current.toDataURL();
      setValue('declaration.signatureData', signatureData);

      setSignatureUploadStatus('success');

      // Reset to idle after 3 seconds
      setTimeout(() => {
        setSignatureUploadStatus('idle');
      }, 3000);

    } catch (error: any) {
      console.error('Signature upload error:', error);
      setSignatureError(error.message || 'Failed to upload signature');
      setSignatureUploadStatus('error');
    }
  };

  const clearSignature = async () => {
    if (!signatureRef.current) return;

    try {
      // Clear the canvas
      signatureRef.current.clear();

      // Delete from storage if exists
      if (data?.declaration?.signatureUrl) {
        await fetch('/api/pds/signature', {
          method: 'DELETE',
        });
      }

      // Clear form values
      setValue('declaration.signatureData', undefined);
      setValue('declaration.signatureUrl', undefined);
      setValue('declaration.signatureUploadedAt', undefined);

      setSignatureUploadStatus('idle');
      setSignatureError(null);

    } catch (error: any) {
      console.error('Failed to delete signature:', error);
      // Don't show error, just clear the canvas anyway
      setValue('declaration.signatureData', undefined);
      setValue('declaration.signatureUrl', undefined);
      setValue('declaration.signatureUploadedAt', undefined);
    }
  };

  // Handle skills
  const addSkill = () => {
    if (newSkill.trim()) {
      setValue('skills', [...watchSkills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    const updated = watchSkills.filter((_, i) => i !== index);
    setValue('skills', updated);
  };

  // Handle recognitions
  const addRecognition = () => {
    if (newRecognition.trim()) {
      setValue('recognitions', [...watchRecognitions, newRecognition.trim()]);
      setNewRecognition('');
    }
  };

  const removeRecognition = (index: number) => {
    const updated = watchRecognitions.filter((_, i) => i !== index);
    setValue('recognitions', updated);
  };

  // Handle memberships
  const addMembership = () => {
    if (newMembership.trim()) {
      setValue('memberships', [...watchMemberships, newMembership.trim()]);
      setNewMembership('');
    }
  };

  const removeMembership = (index: number) => {
    const updated = watchMemberships.filter((_, i) => i !== index);
    setValue('memberships', updated);
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-1">Section VIII: Other Information</h3>
        <p className="text-sm text-gray-600">Provide additional information, skills, references, and sign the declaration.</p>
      </div>

      {/* Special Skills & Hobbies */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900 text-lg border-b border-gray-200 pb-2">
          Special Skills and Hobbies <span className="text-red-500">*</span>
        </h4>

        {/* Add Skill Input */}
        <div className="flex gap-2">
          <Input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            placeholder="Type a skill and press Enter or click Add"
            className="flex-1"
          />
          <Button type="button" variant="secondary" size="sm" icon={Plus} onClick={addSkill}>
            Add
          </Button>
        </div>

        {/* Skills List */}
        {watchSkills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {watchSkills.map((skill, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-[#22A555]/10 text-[#22A555] px-3 py-1.5 rounded-lg"
              >
                <span className="text-sm font-medium">{skill}</span>
                <button
                  type="button"
                  onClick={() => removeSkill(index)}
                  className="text-[#22A555] hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        {errors.skills && (
          <p className="text-xs text-red-600">{errors.skills.message}</p>
        )}
      </div>

      {/* Non-Academic Distinctions / Recognition */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900 text-lg border-b border-gray-200 pb-2">
          Non-Academic Distinctions / Recognition
        </h4>

        <div className="flex gap-2">
          <Input
            type="text"
            value={newRecognition}
            onChange={(e) => setNewRecognition(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRecognition())}
            placeholder="Type a recognition and press Enter or click Add"
            className="flex-1"
          />
          <Button type="button" variant="secondary" size="sm" icon={Plus} onClick={addRecognition}>
            Add
          </Button>
        </div>

        {watchRecognitions.length > 0 && (
          <ul className="space-y-2">
            {watchRecognitions.map((recognition, index) => (
              <li key={index} className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg">
                <span className="text-sm">{recognition}</span>
                <button
                  type="button"
                  onClick={() => removeRecognition(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Membership in Association/Organization */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900 text-lg border-b border-gray-200 pb-2">
          Membership in Association/Organization
        </h4>

        <div className="flex gap-2">
          <Input
            type="text"
            value={newMembership}
            onChange={(e) => setNewMembership(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMembership())}
            placeholder="Type a membership and press Enter or click Add"
            className="flex-1"
          />
          <Button type="button" variant="secondary" size="sm" icon={Plus} onClick={addMembership}>
            Add
          </Button>
        </div>

        {watchMemberships.length > 0 && (
          <ul className="space-y-2">
            {watchMemberships.map((membership, index) => (
              <li key={index} className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg">
                <span className="text-sm">{membership}</span>
                <button
                  type="button"
                  onClick={() => removeMembership(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* References */}
      <ArrayFieldSection
        title="References"
        description="Provide at least 3 persons not related by consanguinity or affinity to you"
        items={referenceFields}
        onAdd={() => appendReference({ name: '', address: '', telephoneNo: '' })}
        onRemove={removeReference}
        addButtonLabel="Add Reference"
        minItems={3}
        maxItems={5}
        emptyMessage="You must provide at least 3 references."
        renderItem={(field, index) => (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Controller
              name={`references.${index}.name`}
              control={control}
              render={({ field }) => (
                <FormField
                  label="Full Name"
                  name={`references.${index}.name`}
                  value={field.value || ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.references?.[index]?.name?.message}
                  required
                />
              )}
            />
            <Controller
              name={`references.${index}.address`}
              control={control}
              render={({ field }) => (
                <FormField
                  label="Address"
                  name={`references.${index}.address`}
                  value={field.value || ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.references?.[index]?.address?.message}
                  required
                />
              )}
            />
            <Controller
              name={`references.${index}.telephoneNo`}
              control={control}
              render={({ field }) => (
                <FormField
                  label="Telephone No."
                  name={`references.${index}.telephoneNo`}
                  type="tel"
                  value={field.value || ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.references?.[index]?.telephoneNo?.message}
                  required
                />
              )}
            />
          </div>
        )}
      />

      {/* Government Issued ID */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900 text-lg border-b border-gray-200 pb-2">
          Government Issued ID
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Controller
            name="governmentIssuedId.type"
            control={control}
            render={({ field }) => (
              <FormField
                label="ID Type"
                name="governmentIssuedId.type"
                value={field.value || ''}
                onChange={field.onChange}
                placeholder="e.g., Driver's License, Passport"
              />
            )}
          />
          <Controller
            name="governmentIssuedId.idNumber"
            control={control}
            render={({ field }) => (
              <FormField
                label="ID Number"
                name="governmentIssuedId.idNumber"
                value={field.value || ''}
                onChange={field.onChange}
                placeholder="ID Number"
              />
            )}
          />
          <Controller
            name="governmentIssuedId.dateIssued"
            control={control}
            render={({ field }) => (
              <FormField
                label="Date Issued"
                name="governmentIssuedId.dateIssued"
                type="date"
                value={field.value || ''}
                onChange={field.onChange}
              />
            )}
          />
        </div>
      </div>

      {/* Declaration & Signature */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900 text-lg border-b border-gray-200 pb-2">
          Declaration <span className="text-red-500">*</span>
        </h4>

        {/* Declaration Text */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-700 leading-relaxed">
            I declare under oath that this Personal Data Sheet has been accomplished by me, and is a true,
            correct and complete statement pursuant to the provisions of pertinent laws, rules and regulations
            of the Republic of the Philippines. I authorize the agency head/authorized representative to verify/validate
            the contents stated herein. I agree that any misrepresentation made in this document and its attachments
            shall cause the filing of administrative/criminal case/s against me.
          </p>
        </div>

        {/* Agreement Checkbox */}
        <Controller
          name="declaration.agreed"
          control={control}
          render={({ field }) => (
            <div className="space-y-1.5">
              <label className="flex items-start gap-2">
                <Input
                  type="checkbox"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="w-4 h-4 mt-0.5 text-[#22A555] border-gray-300 rounded focus:ring-[#22A555]"
                />
                <span className="text-sm font-medium text-gray-700">
                  I agree to the above declaration <span className="text-red-500">*</span>
                </span>
              </label>
              {errors.declaration?.agreed && (
                <p className="text-xs text-red-600">{errors.declaration.agreed.message}</p>
              )}
            </div>
          )}
        />

        {/* Signature Canvas */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Signature <span className="text-red-500">*</span>
          </label>
          <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
            <SignatureCanvas
              ref={signatureRef}
              canvasProps={{
                className: 'w-full h-40',
                style: { width: '100%', height: '160px' },
              }}
              onEnd={handleSignatureEnd}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-500">Sign above using your mouse or touchscreen</p>
              {signatureUploadStatus === 'uploading' && (
                <span className="text-xs text-blue-600 flex items-center gap-1">
                  <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </span>
              )}
              {signatureUploadStatus === 'success' && (
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Saved
                </span>
              )}
              {signatureUploadStatus === 'error' && signatureError && (
                <span className="text-xs text-red-600" title={signatureError}>
                  Upload failed
                </span>
              )}
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={clearSignature}
            >
              Clear Signature
            </Button>
          </div>
        </div>

        {/* Date Accomplished */}
        <Controller
          name="declaration.dateAccomplished"
          control={control}
          render={({ field }) => (
            <FormField
              label="Date Accomplished"
              name="declaration.dateAccomplished"
              type="date"
              value={field.value || ''}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.declaration?.dateAccomplished?.message}
              required
            />
          )}
        />
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Important:</strong> You must provide at least one skill and three references.
          The declaration checkbox and signature are required before submitting.
        </p>
      </div>
    </div>
  );
};
