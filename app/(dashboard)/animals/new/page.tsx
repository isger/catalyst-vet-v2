'use client'

import { Heading, Subheading } from '@/components/ui/heading'
import { Divider } from '@/components/ui/divider'
import { Text } from '@/components/ui/text'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { TextArea } from '@/components/ui/text-area'
import { Label } from '@/components/ui/fieldset'
import React, { useState, useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createAnimalFromForm, checkForDuplicateAnimal, getAvailableOwners } from '@/server/actions/create-animal'
import type { ActionResult } from '@/server/actions/create-animal'
import { animalIntakeSchema, speciesOptions, genderOptions, getBreedSuggestions } from '@/lib/schemas/animal-intake'
import { ZodError } from 'zod'
import { PlusIcon, TrashIcon } from '@heroicons/react/16/solid'
import { useToast } from '@/hooks/use-toast'

interface DuplicateMatch {
  id: string
  name: string
  species: string
  breed: string | null
  owner_id: string
  owner_name: string
}

interface Owner {
  id: string
  name: string
  email: string
}

interface MedicalItem {
  name: string
  notes?: string
  severity?: 'Mild' | 'Moderate' | 'Severe'
  date_diagnosed?: string
}

export default function NewAnimalPage() {
  const { toast } = useToast()
  const [state, formAction, isPending] = useActionState(async (prevState: ActionResult | null, formData: FormData) => {
    return await createAnimalFromForm(formData)
  }, null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [duplicateMatches, setDuplicateMatches] = useState<DuplicateMatch[]>([])
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false)
  const [checkingDuplicates, setCheckingDuplicates] = useState(false)
  const [availableOwners, setAvailableOwners] = useState<Owner[]>([])
  const [selectedOwner, setSelectedOwner] = useState<string>('')
  const [selectedSpecies, setSelectedSpecies] = useState<string>('')
  const [breedSuggestions, setBreedSuggestions] = useState<string[]>([])
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg')
  const [allergies, setAllergies] = useState<MedicalItem[]>([])
  const [medicalConditions, setMedicalConditions] = useState<MedicalItem[]>([])
  const [medications, setMedications] = useState<MedicalItem[]>([])
  const router = useRouter()

  // Load available owners on component mount
  useEffect(() => {
    const loadOwners = async () => {
      try {
        const owners = await getAvailableOwners()
        setAvailableOwners(owners)
      } catch (error) {
        console.error('Error loading owners:', error)
        toast({
          title: 'Error',
          description: 'Failed to load available owners',
          variant: 'destructive',
        })
      }
    }
    loadOwners()
  }, [toast])

  // Update breed suggestions when species changes
  useEffect(() => {
    if (selectedSpecies) {
      setBreedSuggestions(getBreedSuggestions(selectedSpecies))
    } else {
      setBreedSuggestions([])
    }
  }, [selectedSpecies])

  // Function to check for duplicate animals
  const checkForDuplicates = async (name: string, ownerId: string) => {
    if (!name || !ownerId) return
    
    setCheckingDuplicates(true)
    setShowDuplicateWarning(false)
    setDuplicateMatches([])
    
    try {
      const result = await checkForDuplicateAnimal(name, ownerId)
      
      if (result.exists && result.matches) {
        setDuplicateMatches(result.matches)
        setShowDuplicateWarning(true)
      }
    } catch (error) {
      console.error('Error checking for duplicates:', error)
    } finally {
      setCheckingDuplicates(false)
    }
  }

  // Handle server state changes with toast notifications
  useEffect(() => {
    if (state?.error) {
      toast({
        title: 'Error',
        description: state.error,
        variant: 'destructive',
      })
    } else if (state?.success) {
      toast({
        title: 'Success',
        description: 'Animal created successfully!',
        variant: 'default',
      })
    }
  }, [state, toast])

  // Redirect on successful submission
  useEffect(() => {
    if (state?.success && state?.animalId) {
      router.push(`/animals?new=${state.animalId}`)
    }
  }, [state, router])

  // Medical items management functions
  const addMedicalItem = (type: 'allergies' | 'medicalConditions' | 'medications') => {
    const newItem: MedicalItem = { name: '', notes: '', severity: 'Mild' }
    
    if (type === 'allergies') {
      setAllergies([...allergies, newItem])
    } else if (type === 'medicalConditions') {
      setMedicalConditions([...medicalConditions, newItem])
    } else {
      setMedications([...medications, newItem])
    }
  }

  const removeMedicalItem = (type: 'allergies' | 'medicalConditions' | 'medications', index: number) => {
    if (type === 'allergies') {
      setAllergies(allergies.filter((_, i) => i !== index))
    } else if (type === 'medicalConditions') {
      setMedicalConditions(medicalConditions.filter((_, i) => i !== index))
    } else {
      setMedications(medications.filter((_, i) => i !== index))
    }
  }

  const updateMedicalItem = (type: 'allergies' | 'medicalConditions' | 'medications', index: number, field: keyof MedicalItem, value: string) => {
    if (type === 'allergies') {
      const updated = [...allergies]
      updated[index] = { ...updated[index], [field]: value }
      setAllergies(updated)
    } else if (type === 'medicalConditions') {
      const updated = [...medicalConditions]
      updated[index] = { ...updated[index], [field]: value }
      setMedicalConditions(updated)
    } else {
      const updated = [...medications]
      updated[index] = { ...updated[index], [field]: value }
      setMedications(updated)
    }
  }

  const handleSubmit = async (formData: FormData) => {
    // Clear previous errors
    setErrors({})
    
    // Add medical items to form data
    allergies.forEach((item, index) => {
      if (item.name) {
        formData.append(`allergies.${index}.name`, item.name)
        if (item.notes) formData.append(`allergies.${index}.notes`, item.notes)
        if (item.severity) formData.append(`allergies.${index}.severity`, item.severity)
        if (item.date_diagnosed) formData.append(`allergies.${index}.date_diagnosed`, item.date_diagnosed)
      }
    })
    
    medicalConditions.forEach((item, index) => {
      if (item.name) {
        formData.append(`medical_conditions.${index}.name`, item.name)
        if (item.notes) formData.append(`medical_conditions.${index}.notes`, item.notes)
        if (item.severity) formData.append(`medical_conditions.${index}.severity`, item.severity)
        if (item.date_diagnosed) formData.append(`medical_conditions.${index}.date_diagnosed`, item.date_diagnosed)
      }
    })
    
    medications.forEach((item, index) => {
      if (item.name) {
        formData.append(`medications.${index}.name`, item.name)
        if (item.notes) formData.append(`medications.${index}.notes`, item.notes)
        if (item.severity) formData.append(`medications.${index}.severity`, item.severity)
        if (item.date_diagnosed) formData.append(`medications.${index}.date_diagnosed`, item.date_diagnosed)
      }
    })
    
    // Convert weight to kg if needed
    const weightValue = formData.get('weight') as string
    if (weightValue && weightUnit === 'lbs') {
      const weightInKg = parseFloat(weightValue) / 2.20462
      formData.set('weight_kg', weightInKg.toString())
    } else if (weightValue) {
      formData.set('weight_kg', weightValue)
    }
    
    // Validate form data with Zod before submission
    try {
      const data = {
        name: formData.get('name') as string,
        species: formData.get('species') as string,
        breed: formData.get('breed') as string || undefined,
        color: formData.get('color') as string || undefined,
        gender: formData.get('gender') as string || undefined,
        date_of_birth: formData.get('date_of_birth') as string || undefined,
        weight_kg: formData.get('weight_kg') ? Number(formData.get('weight_kg')) : undefined,
        owner_id: formData.get('owner_id') as string,
        microchip_id: formData.get('microchip_id') as string || undefined,
        insurance_provider: formData.get('insurance_provider') as string || undefined,
        insurance_policy_number: formData.get('insurance_policy_number') as string || undefined,
        behavioral_notes: formData.get('behavioral_notes') as string || undefined,
        dietary_requirements: formData.get('dietary_requirements') as string || undefined,
        allergies: allergies.filter(item => item.name),
        medical_conditions: medicalConditions.filter(item => item.name),
        medications: medications.filter(item => item.name)
      }
      
      // Validate with Zod schema
      animalIntakeSchema.parse(data)
      
      // If validation passes, submit to server action
      return formAction(formData)
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const fieldErrors: Record<string, string> = {}
        error.issues.forEach((issue) => {
          const field = issue.path.join('.')
          fieldErrors[field] = issue.message
        })
        setErrors(fieldErrors)

        toast({
          title: 'Validation Error',
          description: 'The form could not be submitted. Please check the fields for errors.',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Unexpected Error',
          description: 'An unexpected error occurred. Please try again.',
          variant: 'destructive',
        })
      }
      return
    }
  }

  return (
    <form action={handleSubmit} className="mx-auto max-w-4xl">
      <Heading>Add Animal</Heading>
      <Divider className="my-10 mt-6" />

      {showDuplicateWarning && duplicateMatches.length > 0 && (
        <div className="mb-6 rounded-lg bg-yellow-50 border border-yellow-200 p-4">
          <Text className="text-yellow-800 font-medium mb-2">⚠️ Potential duplicate animals found:</Text>
          {duplicateMatches.map((match) => (
            <div key={match.id} className="text-yellow-700 text-sm mb-1">
              • {match.name} ({match.species}) - Owner: {match.owner_name}
            </div>
          ))}
          <Text className="text-yellow-700 text-sm mt-2">
            Please verify this is not a duplicate before continuing.
          </Text>
        </div>
      )}

      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Basic Information</Subheading>
          <Text>Essential details about the animal.</Text>
        </div>
        <div className="space-y-4">
          <div>
            <Input
              aria-label="Animal Name"
              label="Name"
              name="name"
              placeholder="e.g., Buddy, Whiskers"
              onBlur={(e) => {
                const name = e.target.value
                if (name && selectedOwner) {
                  checkForDuplicates(name, selectedOwner)
                }
              }}
            />
            {errors.name && <Text className="text-red-600 text-sm mt-1">{errors.name}</Text>}
            {checkingDuplicates && (
              <Text className="text-blue-600 text-sm mt-1">Checking for existing animals...</Text>
            )}
          </div>
          
          <div>
            <Label htmlFor="species">Species</Label>
            <Select name="species" value={selectedSpecies} onChange={(e) => setSelectedSpecies(e.target.value)}>
              <option value="">Select species</option>
              {speciesOptions.map((species) => (
                <option key={species} value={species}>
                  {species}
                </option>
              ))}
            </Select>
            {errors.species && <Text className="text-red-600 text-sm mt-1">{errors.species}</Text>}
          </div>
          
          <div>
            <Label htmlFor="breed">Breed</Label>
            <Select name="breed">
              <option value="">Select breed (optional)</option>
              {breedSuggestions.map((breed) => (
                <option key={breed} value={breed}>
                  {breed}
                </option>
              ))}
            </Select>
            {errors.breed && <Text className="text-red-600 text-sm mt-1">{errors.breed}</Text>}
          </div>
          
          <div>
            <Input
              aria-label="Color"
              label="Color"
              name="color"
              placeholder="e.g., Brown, Black and White"
            />
            {errors.color && <Text className="text-red-600 text-sm mt-1">{errors.color}</Text>}
          </div>
          
          <div>
            <Label htmlFor="gender">Gender</Label>
            <Select name="gender">
              <option value="">Select gender</option>
              {genderOptions.map((gender) => (
                <option key={gender} value={gender}>
                  {gender}
                </option>
              ))}
            </Select>
            {errors.gender && <Text className="text-red-600 text-sm mt-1">{errors.gender}</Text>}
          </div>
          
          <div>
            <Input
              type="date"
              aria-label="Date of Birth"
              label="Date of Birth"
              name="date_of_birth"
            />
            {errors.date_of_birth && <Text className="text-red-600 text-sm mt-1">{errors.date_of_birth}</Text>}
          </div>
          
          <div>
            <Label htmlFor="weight">Weight</Label>
            <div className="flex space-x-2">
              <Input
                type="number"
                name="weight"
                placeholder="0.0"
                step="0.1"
                min="0"
                className="flex-1"
              />
              <Select value={weightUnit} onChange={(e) => setWeightUnit(e.target.value as 'kg' | 'lbs')}>
                <option value="kg">kg</option>
                <option value="lbs">lbs</option>
              </Select>
            </div>
            {errors.weight_kg && <Text className="text-red-600 text-sm mt-1">{errors.weight_kg}</Text>}
          </div>
          
          <div>
            <Label htmlFor="owner_id">Owner</Label>
            <Select 
              name="owner_id" 
              value={selectedOwner} 
              onChange={(e) => {
                setSelectedOwner(e.target.value)
                const nameField = document.querySelector('input[name="name"]') as HTMLInputElement
                if (nameField?.value) {
                  checkForDuplicates(nameField.value, e.target.value)
                }
              }}
            >
              <option value="">Select owner</option>
              {availableOwners.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.name} ({owner.email})
                </option>
              ))}
            </Select>
            {errors.owner_id && <Text className="text-red-600 text-sm mt-1">{errors.owner_id}</Text>}
          </div>
        </div>
      </section>

      <Divider className="my-10" soft />

      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Medical Information</Subheading>
          <Text>Health-related information including allergies, conditions, and medications.</Text>
        </div>
        <div className="space-y-6">
          {/* Allergies */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Allergies</Label>
              <Button
                type="button"
                onClick={() => addMedicalItem('allergies')}
                outline
                className="flex items-center gap-2"
              >
                <PlusIcon className="h-4 w-4" />
                Add Allergy
              </Button>
            </div>
            {allergies.map((allergy, index) => (
              <div key={index} className="border rounded-lg p-4 mb-2">
                <div className="flex items-center justify-between mb-2">
                  <Text className="font-medium">Allergy {index + 1}</Text>
                  <Button
                    type="button"
                    onClick={() => removeMedicalItem('allergies', index)}
                    outline
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Allergy name"
                    value={allergy.name}
                    onChange={(e) => updateMedicalItem('allergies', index, 'name', e.target.value)}
                  />
                  <Select
                    value={allergy.severity}
                    onChange={(e) => updateMedicalItem('allergies', index, 'severity', e.target.value)}
                  >
                    <option value="">Severity</option>
                    <option value="Mild">Mild</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Severe">Severe</option>
                  </Select>
                </div>
                <Input
                  placeholder="Notes (optional)"
                  value={allergy.notes}
                  onChange={(e) => updateMedicalItem('allergies', index, 'notes', e.target.value)}
                  className="mt-2"
                />
              </div>
            ))}
          </div>

          {/* Medical Conditions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Medical Conditions</Label>
              <Button
                type="button"
                onClick={() => addMedicalItem('medicalConditions')}
                outline
                className="flex items-center gap-2"
              >
                <PlusIcon className="h-4 w-4" />
                Add Condition
              </Button>
            </div>
            {medicalConditions.map((condition, index) => (
              <div key={index} className="border rounded-lg p-4 mb-2">
                <div className="flex items-center justify-between mb-2">
                  <Text className="font-medium">Condition {index + 1}</Text>
                  <Button
                    type="button"
                    onClick={() => removeMedicalItem('medicalConditions', index)}
                    outline
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Condition name"
                    value={condition.name}
                    onChange={(e) => updateMedicalItem('medicalConditions', index, 'name', e.target.value)}
                  />
                  <Input
                    type="date"
                    placeholder="Date diagnosed"
                    value={condition.date_diagnosed}
                    onChange={(e) => updateMedicalItem('medicalConditions', index, 'date_diagnosed', e.target.value)}
                  />
                </div>
                <Input
                  placeholder="Notes (optional)"
                  value={condition.notes}
                  onChange={(e) => updateMedicalItem('medicalConditions', index, 'notes', e.target.value)}
                  className="mt-2"
                />
              </div>
            ))}
          </div>

          {/* Medications */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Medications</Label>
              <Button
                type="button"
                onClick={() => addMedicalItem('medications')}
                outline
                className="flex items-center gap-2"
              >
                <PlusIcon className="h-4 w-4" />
                Add Medication
              </Button>
            </div>
            {medications.map((medication, index) => (
              <div key={index} className="border rounded-lg p-4 mb-2">
                <div className="flex items-center justify-between mb-2">
                  <Text className="font-medium">Medication {index + 1}</Text>
                  <Button
                    type="button"
                    onClick={() => removeMedicalItem('medications', index)}
                    outline
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
                <Input
                  placeholder="Medication name"
                  value={medication.name}
                  onChange={(e) => updateMedicalItem('medications', index, 'name', e.target.value)}
                />
                <Input
                  placeholder="Dosage and instructions (optional)"
                  value={medication.notes}
                  onChange={(e) => updateMedicalItem('medications', index, 'notes', e.target.value)}
                  className="mt-2"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <Divider className="my-10" soft />

      <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-1">
          <Subheading>Additional Information</Subheading>
          <Text>Insurance details and other important notes.</Text>
        </div>
        <div className="space-y-4">
          <div>
            <Input
              aria-label="Microchip ID"
              label="Microchip ID"
              name="microchip_id"
              placeholder="e.g., 123456789012345"
            />
            {errors.microchip_id && <Text className="text-red-600 text-sm mt-1">{errors.microchip_id}</Text>}
          </div>
          
          <div>
            <Input
              aria-label="Insurance Provider"
              label="Insurance Provider"
              name="insurance_provider"
              placeholder="e.g., VPI, Petplan"
            />
            {errors.insurance_provider && <Text className="text-red-600 text-sm mt-1">{errors.insurance_provider}</Text>}
          </div>
          
          <div>
            <Input
              aria-label="Insurance Policy Number"
              label="Insurance Policy Number"
              name="insurance_policy_number"
              placeholder="Policy number"
            />
            {errors.insurance_policy_number && <Text className="text-red-600 text-sm mt-1">{errors.insurance_policy_number}</Text>}
          </div>
          
          <div>
            <TextArea
              name="behavioral_notes"
              id="behavioral_notes"
              rows={4}
              maxLength={1000}
              showCharCount={true}
              placeholder="Any behavioral notes, temperament, or special handling instructions..."
            />
            {errors.behavioral_notes && <Text className="text-red-600 text-sm mt-1">{errors.behavioral_notes}</Text>}
          </div>
          
          <div>
            <TextArea
              name="dietary_requirements"
              id="dietary_requirements"
              rows={4}
              maxLength={1000}
              showCharCount={true}
              placeholder="Special dietary requirements, food allergies, or feeding instructions..."
            />
            {errors.dietary_requirements && <Text className="text-red-600 text-sm mt-1">{errors.dietary_requirements}</Text>}
          </div>
        </div>
      </section>

      <Divider className="my-10" soft />

      <section className="flex justify-end gap-4">
        <Button type="button" outline disabled={isPending} onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Creating Animal...' : 'Create Animal'}
        </Button>
      </section>
    </form>
  )
}