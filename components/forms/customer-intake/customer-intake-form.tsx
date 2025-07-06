'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { 
  customerIntakeSchema, 
  type CustomerIntakeData, 
  defaultCustomerIntake,
  titleOptions,
  formatPhoneNumber
} from '@/lib/schemas/customer-intake'
import { createCustomer } from '@/server/actions/create-customer'
import { FormField, Input, Select, Textarea, Checkbox } from './form-field'
import { toast } from 'sonner'

interface CustomerIntakeFormProps {
  onSuccess?: (customerId: string) => void
  onCancel?: () => void
  className?: string
}

export function CustomerIntakeForm({ 
  onSuccess, 
  onCancel, 
  className 
}: CustomerIntakeFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showEmergencyContact, setShowEmergencyContact] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue
  } = useForm<CustomerIntakeData>({
    resolver: zodResolver(customerIntakeSchema),
    defaultValues: defaultCustomerIntake,
    mode: 'onBlur'
  })

  // Watch phone field for formatting
  const phoneValue = watch('phone')
  
  React.useEffect(() => {
    if (phoneValue && phoneValue.length >= 10) {
      const formatted = formatPhoneNumber(phoneValue)
      if (formatted !== phoneValue) {
        setValue('phone', formatted)
      }
    }
  }, [phoneValue, setValue])

  const onSubmit = async (data: CustomerIntakeData) => {
    setIsSubmitting(true)
    
    try {
      const result = await createCustomer(data)
      
      if (result.success && result.customerId) {
        toast.success('Customer created successfully!', {
          description: `${data.firstName} ${data.lastName} has been added to your practice.`
        })
        
        if (onSuccess) {
          onSuccess(result.customerId)
        } else {
          router.push('/customers')
        }
      } else {
        toast.error('Failed to create customer', {
          description: result.error || 'Please try again.'
        })
      }
    } catch (error) {
      console.error('Form submission error:', error)
      toast.error('An unexpected error occurred', {
        description: 'Please try again later.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={className}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Personal Information Section */}
        <div className="shadow rounded-lg p-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium">
              Personal Information
            </h3>
            <p className="mt-1 text-sm">
              Basic contact information for the pet owner.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FormField
              label="Title"
              id="title"
              error={errors.title?.message}
            >
              <Select {...register('title')} error={!!errors.title}>
                <option value="">Select title</option>
                {titleOptions.map((title) => (
                  <option key={title} value={title}>
                    {title}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField
              label="First Name"
              id="firstName"
              required
              error={errors.firstName?.message}
            >
              <Input
                {...register('firstName')}
                type="text"
                error={!!errors.firstName}
                placeholder="John"
              />
            </FormField>

            <FormField
              label="Last Name"
              id="lastName"
              required
              error={errors.lastName?.message}
            >
              <Input
                {...register('lastName')}
                type="text"
                error={!!errors.lastName}
                placeholder="Doe"
              />
            </FormField>

            <FormField
              label="Email Address"
              id="email"
              required
              error={errors.email?.message}
              helpText="We'll use this for appointment confirmations and updates"
              className="sm:col-span-2"
            >
              <Input
                {...register('email')}
                type="email"
                error={!!errors.email}
                placeholder="john.doe@example.com"
              />
            </FormField>

            <FormField
              label="Phone Number"
              id="phone"
              required
              error={errors.phone?.message}
              helpText="Primary contact number"
            >
              <Input
                {...register('phone')}
                type="tel"
                error={!!errors.phone}
                placeholder="(555) 123-4567"
              />
            </FormField>
          </div>
        </div>

        {/* Address Information Section */}
        <div className="shadow rounded-lg p-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium">
              Address Information
            </h3>
            <p className="mt-1 text-sm">
              Where can we reach you if needed?
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <FormField
              label="Street Address"
              id="address.street"
              required
              error={errors.address?.street?.message}
              className="sm:col-span-2 lg:col-span-3"
            >
              <Input
                {...register('address.street')}
                type="text"
                error={!!errors.address?.street}
                placeholder="123 Main Street"
              />
            </FormField>

            <FormField
              label="City"
              id="address.city"
              required
              error={errors.address?.city?.message}
            >
              <Input
                {...register('address.city')}
                type="text"
                error={!!errors.address?.city}
                placeholder="Springfield"
              />
            </FormField>

            <FormField
              label="State"
              id="address.state"
              required
              error={errors.address?.state?.message}
            >
              <Input
                {...register('address.state')}
                type="text"
                error={!!errors.address?.state}
                placeholder="CA"
                maxLength={2}
              />
            </FormField>

            <FormField
              label="ZIP Code"
              id="address.zipCode"
              required
              error={errors.address?.zipCode?.message}
            >
              <Input
                {...register('address.zipCode')}
                type="text"
                error={!!errors.address?.zipCode}
                placeholder="12345"
              />
            </FormField>

            <FormField
              label="Country"
              id="address.country"
              error={errors.address?.country?.message}
            >
              <Select {...register('address.country')} error={!!errors.address?.country}>
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="UK">United Kingdom</option>
              </Select>
            </FormField>
          </div>
        </div>

        {/* Emergency Contact Section */}
        <div className="shadow rounded-lg p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">
                  Emergency Contact
                </h3>
                <p className="mt-1 text-sm">
                  Optional but recommended for emergency situations.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowEmergencyContact(!showEmergencyContact)}
                className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                {showEmergencyContact ? 'Hide' : 'Add Emergency Contact'}
              </button>
            </div>
          </div>

          {showEmergencyContact && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <FormField
                label="Contact Name"
                id="emergencyContact.name"
                error={errors.emergencyContact?.name?.message}
              >
                <Input
                  {...register('emergencyContact.name')}
                  type="text"
                  error={!!errors.emergencyContact?.name}
                  placeholder="Jane Doe"
                />
              </FormField>

              <FormField
                label="Phone Number"
                id="emergencyContact.phone"
                error={errors.emergencyContact?.phone?.message}
              >
                <Input
                  {...register('emergencyContact.phone')}
                  type="tel"
                  error={!!errors.emergencyContact?.phone}
                  placeholder="(555) 123-4567"
                />
              </FormField>

              <FormField
                label="Relationship"
                id="emergencyContact.relationship"
                error={errors.emergencyContact?.relationship?.message}
              >
                <Input
                  {...register('emergencyContact.relationship')}
                  type="text"
                  error={!!errors.emergencyContact?.relationship}
                  placeholder="Spouse, Parent, etc."
                />
              </FormField>
            </div>
          )}
        </div>

        {/* Consent and Additional Notes Section */}
        <div className="shadow rounded-lg p-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium">
              Consent & Additional Information
            </h3>
            <p className="mt-1 text-sm">
              Legal requirements and any special notes.
            </p>
          </div>

          <div className="space-y-6">
            <Checkbox
              {...register('gdprConsent')}
              id="gdprConsent"
              label="Data Processing Consent"
              description="I consent to the processing of my personal data for veterinary care and related services. This is required to provide medical care for your pets."
              error={errors.gdprConsent?.message}
            />

            <Checkbox
              {...register('marketingConsent')}
              id="marketingConsent"
              label="Marketing Communications"
              description="I would like to receive updates about services, promotions, and pet care tips via email. You can unsubscribe at any time."
            />

            <FormField
              label="Additional Notes"
              id="additionalNotes"
              error={errors.additionalNotes?.message}
              helpText="Any special instructions, preferences, or information we should know about"
            >
              <Textarea
                {...register('additionalNotes')}
                rows={4}
                error={!!errors.additionalNotes}
                placeholder="Special instructions, pet behavioral notes, accessibility needs, etc."
              />
            </FormField>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || !isValid}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating Customer...' : 'Create Customer'}
          </button>
        </div>
      </form>
    </div>
  )
}