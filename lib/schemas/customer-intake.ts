import { z } from 'zod'

// Address schema for structured address data
export const addressSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State or region is required').max(10, 'State or region must be between 2 and 10 characters'),
  zipCode: z.string().min(5, 'ZIP code must be at least 5 characters'),
  country: z.string().default('US')
})

// Phone number validation (flexible format)
export const phoneSchema = z.string()
  .min(10, 'Phone number must be at least 10 digits')
  .regex(/^[\d\s\-\(\)\+\.]+$/, 'Invalid phone number format')
  .transform((val) => val.replace(/\D/g, '')) // Remove non-digits for storage
  .refine((val) => val.length >= 10, 'Phone number must be at least 10 digits')

// Email validation with common domain suggestions
export const emailSchema = z.string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .toLowerCase()

// Title/prefix options
export const titleOptions = [
  'Mr.',
  'Mrs.',
  'Ms.',
  'Dr.',
  'Prof.',
  'Rev.',
] as const

export const titleSchema = z.enum(titleOptions).optional()

// Main customer intake form schema
export const customerIntakeSchema = z.object({
  // Personal Information
  title: titleSchema,
  first_name: z.string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s\-\'\.]+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes'),
  
  last_name: z.string()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s\-\'\.]+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes'),
  
  // Contact Information
  email: emailSchema,
  phone: phoneSchema,
  
  // Address Information
  address: addressSchema,
  
  // Practice Preferences
  preferredPractice: z.string().optional(),
  
  // GDPR and Legal
  gdprConsent: z.boolean()
    .refine((val) => val === true, 'You must consent to data processing to proceed'),
  
  // Additional Information
  additionalNotes: z.string()
    .max(500, 'Additional notes must not exceed 500 characters')
    .optional(),
  
  // Marketing preferences (optional)
  marketingConsent: z.boolean().default(false),
  
  // Emergency contact (optional but recommended)
  emergencyContact: z.object({
    name: z.string().max(100, 'Emergency contact name must not exceed 100 characters').optional(),
    phone: z.string().optional(),
    relationship: z.string().max(50, 'Relationship must not exceed 50 characters').optional()
  }).optional(),
})

// Type inference for TypeScript
export type CustomerIntakeData = z.infer<typeof customerIntakeSchema>
export type AddressData = z.infer<typeof addressSchema>

// Form step schemas for multi-step validation
export const personalInfoSchema = customerIntakeSchema.pick({
  title: true,
  first_name: true,
  last_name: true,
  email: true,
  phone: true
})

export const addressPreferencesSchema = customerIntakeSchema.pick({
  address: true,
  preferredPractice: true,
  emergencyContact: true
})

export const consentNotesSchema = customerIntakeSchema.pick({
  gdprConsent: true,
  marketingConsent: true,
  additionalNotes: true
})

export type PersonalInfoData = z.infer<typeof personalInfoSchema>
export type AddressPreferencesData = z.infer<typeof addressPreferencesSchema>
export type ConsentNotesData = z.infer<typeof consentNotesSchema>

// Default values for form initialization
export const defaultCustomerIntake = {
  gdprConsent: false,
  marketingConsent: false,
  address: {
    country: 'US',
    street: '',
    city: '',
    state: '',
    zipCode: ''
  }
} as const

// Helper function to format phone number for display
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`
  }
  return phone
}

// Helper function to validate and suggest email domains
export const getEmailSuggestion = (email: string): string | null => {
  const commonDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com']
  const emailParts = email.split('@')
  
  if (emailParts.length !== 2) return null
  
  const [username, domain] = emailParts
  const suggestion = commonDomains.find(d => 
    d.toLowerCase().includes(domain.toLowerCase()) && d !== domain.toLowerCase()
  )
  
  return suggestion ? `${username}@${suggestion}` : null
}