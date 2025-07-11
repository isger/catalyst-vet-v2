import { z } from 'zod'

// Species common in veterinary practices
export const speciesOptions = [
  'Dog',
  'Cat',
  'Rabbit',
  'Bird',
  'Fish',
  'Reptile',
  'Hamster',
  'Guinea Pig',
  'Horse',
  'Ferret',
  'Other'
] as const

export const speciesSchema = z.enum(speciesOptions)

// Gender options
export const genderOptions = [
  'Male',
  'Female',
  'Male (Neutered)',
  'Female (Spayed)',
  'Unknown'
] as const

export const genderSchema = z.enum(genderOptions)

// Medical condition/allergy/medication item schema
export const medicalItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  notes: z.string().optional(),
  severity: z.enum(['Mild', 'Moderate', 'Severe']).optional(),
  date_diagnosed: z.string().optional()
})

// Insurance information schema
export const insuranceSchema = z.object({
  provider: z.string().min(1, 'Insurance provider is required'),
  policy_number: z.string().min(1, 'Policy number is required'),
  coverage_details: z.string().optional()
}).optional()

// Main animal intake form schema
export const animalIntakeSchema = z.object({
  // Basic Information
  name: z.string()
    .min(1, 'Animal name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s\-\'\.0-9]+$/, 'Name can only contain letters, numbers, spaces, hyphens, and apostrophes'),
  
  species: speciesSchema,
  
  breed: z.string()
    .max(50, 'Breed must not exceed 50 characters')
    .optional(),
  
  color: z.string()
    .max(50, 'Color must not exceed 50 characters')
    .optional(),
  
  gender: genderSchema.optional(),
  
  date_of_birth: z.string()
    .refine((date) => {
      if (!date) return true // Optional field
      const parsed = new Date(date)
      const now = new Date()
      return parsed <= now
    }, 'Date of birth cannot be in the future')
    .optional(),
  
  weight_kg: z.number()
    .min(0.1, 'Weight must be greater than 0')
    .max(1000, 'Weight must be less than 1000 kg')
    .optional(),
  
  // Owner Information
  owner_id: z.string()
    .min(1, 'Owner is required'),
  
  // Medical Information
  allergies: z.array(medicalItemSchema)
    .default([]),
  
  medical_conditions: z.array(medicalItemSchema)
    .default([]),
  
  medications: z.array(medicalItemSchema)
    .default([]),
  
  // Additional Information
  microchip_id: z.string()
    .max(50, 'Microchip ID must not exceed 50 characters')
    .optional(),
  
  insurance_provider: z.string()
    .max(100, 'Insurance provider must not exceed 100 characters')
    .optional(),
  
  insurance_policy_number: z.string()
    .max(100, 'Insurance policy number must not exceed 100 characters')
    .optional(),
  
  behavioral_notes: z.string()
    .max(1000, 'Behavioral notes must not exceed 1000 characters')
    .optional(),
  
  dietary_requirements: z.string()
    .max(1000, 'Dietary requirements must not exceed 1000 characters')
    .optional(),
})

// Type inference for TypeScript
export type AnimalIntakeData = z.infer<typeof animalIntakeSchema>
export type MedicalItem = z.infer<typeof medicalItemSchema>
export type InsuranceData = z.infer<typeof insuranceSchema>

// Form step schemas for multi-step validation
export const basicInfoSchema = animalIntakeSchema.pick({
  name: true,
  species: true,
  breed: true,
  color: true,
  gender: true,
  date_of_birth: true,
  weight_kg: true,
  owner_id: true
})

export const medicalInfoSchema = animalIntakeSchema.pick({
  allergies: true,
  medical_conditions: true,
  medications: true,
  microchip_id: true
})

export const insuranceNotesSchema = animalIntakeSchema.pick({
  insurance_provider: true,
  insurance_policy_number: true,
  behavioral_notes: true,
  dietary_requirements: true
})

export type BasicInfoData = z.infer<typeof basicInfoSchema>
export type MedicalInfoData = z.infer<typeof medicalInfoSchema>
export type InsuranceNotesData = z.infer<typeof insuranceNotesSchema>

// Default values for form initialization
export const defaultAnimalIntake: Partial<AnimalIntakeData> = {
  allergies: [],
  medical_conditions: [],
  medications: [],
  species: 'Dog',
  gender: 'Unknown'
}

// Helper function to calculate age from date of birth
export const calculateAge = (dateOfBirth: string): string => {
  if (!dateOfBirth) return 'Unknown'
  
  const birth = new Date(dateOfBirth)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - birth.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 30) {
    return `${diffDays} days`
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `${months} month${months > 1 ? 's' : ''}`
  } else {
    const years = Math.floor(diffDays / 365)
    const remainingMonths = Math.floor((diffDays % 365) / 30)
    if (remainingMonths === 0) {
      return `${years} year${years > 1 ? 's' : ''}`
    }
    return `${years} year${years > 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`
  }
}

// Helper function to convert weight between kg and lbs
export const convertWeight = (weight: number, toUnit: 'kg' | 'lbs'): number => {
  if (toUnit === 'lbs') {
    return Math.round(weight * 2.20462 * 100) / 100
  } else {
    return Math.round(weight / 2.20462 * 100) / 100
  }
}

// Helper function to format weight display
export const formatWeight = (weightKg: number | null, unit: 'kg' | 'lbs' = 'kg'): string => {
  if (!weightKg) return 'Unknown'
  
  if (unit === 'lbs') {
    return `${convertWeight(weightKg, 'lbs')} lbs`
  }
  return `${weightKg} kg`
}

// Helper function to validate microchip ID format
export const validateMicrochipId = (chipId: string): boolean => {
  if (!chipId) return true // Optional field
  
  // Common microchip formats: 9, 10, or 15 digits
  const patterns = [
    /^\d{9}$/, // 9 digits
    /^\d{10}$/, // 10 digits
    /^\d{15}$/, // 15 digits (ISO standard)
  ]
  
  return patterns.some(pattern => pattern.test(chipId))
}

// Helper function to get breed suggestions based on species
export const getBreedSuggestions = (species: string): string[] => {
  const breedMap: Record<string, string[]> = {
    Dog: ['Labrador', 'Golden Retriever', 'German Shepherd', 'Bulldog', 'Beagle', 'Poodle', 'Rottweiler', 'Yorkshire Terrier', 'Mixed Breed'],
    Cat: ['Domestic Shorthair', 'Domestic Longhair', 'Persian', 'Maine Coon', 'Siamese', 'Ragdoll', 'British Shorthair', 'Russian Blue', 'Mixed Breed'],
    Rabbit: ['Holland Lop', 'Netherland Dwarf', 'Lionhead', 'Angora', 'Rex', 'Dutch', 'Flemish Giant', 'Mixed Breed'],
    Bird: ['Parakeet', 'Cockatiel', 'Canary', 'Finch', 'Lovebird', 'Conure', 'Macaw', 'Cockatoo'],
    Horse: ['Thoroughbred', 'Quarter Horse', 'Arabian', 'Paint', 'Appaloosa', 'Friesian', 'Clydesdale', 'Mixed Breed'],
    Fish: ['Goldfish', 'Betta', 'Guppy', 'Tetra', 'Angelfish', 'Cichlid', 'Catfish', 'Koi'],
    Reptile: ['Ball Python', 'Bearded Dragon', 'Leopard Gecko', 'Iguana', 'Turtle', 'Tortoise', 'Chameleon', 'Snake'],
    'Guinea Pig': ['American', 'Peruvian', 'Abyssinian', 'Silkie', 'Texel', 'Skinny Pig', 'Mixed Breed'],
    Hamster: ['Syrian', 'Dwarf', 'Roborovski', 'Chinese', 'Winter White', 'Campbell\'s'],
    Ferret: ['Domestic Ferret', 'Angora Ferret', 'Sable', 'Albino', 'Silver', 'Chocolate']
  }
  
  return breedMap[species] || []
}