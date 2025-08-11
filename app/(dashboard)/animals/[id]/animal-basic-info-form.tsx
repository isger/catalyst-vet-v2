'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Link } from '@/components/ui/link'
import { updateAnimal, type AnimalFormData } from '@/server/actions/animals'
import { toast } from 'sonner'
import { UserCircleIcon, CreditCardIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/20/solid'
import {PhoneIcon} from "@heroicons/react/16/solid";
import { AnimalActivityClient } from '@/components/features/comments/animal-activity-client'

interface AnimalBasicInfoFormProps {
  animal: {
    id: string
    name: string
    species: string
    breed?: string | null
    color?: string | null
    gender?: string | null
    date_of_birth?: string | null
    weight_kg?: number | null
    microchip_id?: string | null
    insurance_provider?: string | null
    insurance_policy_number?: string | null
    behavioral_notes?: string | null
    dietary_requirements?: string | null
    created_at: string
    updated_at: string
    owner: {
      id: string
      first_name: string
      last_name: string
      email: string
      phone?: string
    }
  }
}

const SPECIES_OPTIONS = [
  'Dog',
  'Cat',
  'Bird',
  'Rabbit',
  'Fish',
  'Reptile',
  'Horse',
  'Hamster',
  'Guinea Pig',
  'Ferret',
  'Other'
]

const GENDER_OPTIONS = [
  'Male',
  'Female',
  'Neutered Male',
  'Spayed Female',
  'Unknown'
]

export function AnimalBasicInfoForm({ animal }: AnimalBasicInfoFormProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<AnimalFormData>({
    name: animal.name,
    species: animal.species,
    breed: animal.breed || '',
    color: animal.color || '',
    gender: animal.gender || '',
    date_of_birth: animal.date_of_birth || '',
    weight_kg: animal.weight_kg || undefined,
    microchip_id: animal.microchip_id || '',
    insurance_provider: animal.insurance_provider || '',
    insurance_policy_number: animal.insurance_policy_number || '',
    behavioral_notes: animal.behavioral_notes || '',
    dietary_requirements: animal.dietary_requirements || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await updateAnimal(animal.id, formData)
      toast.success('Animal information updated successfully')
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating animal:', error)
      toast.error('Failed to update animal information')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: animal.name,
      species: animal.species,
      breed: animal.breed || '',
      color: animal.color || '',
      gender: animal.gender || '',
      date_of_birth: animal.date_of_birth || '',
      weight_kg: animal.weight_kg || undefined,
      microchip_id: animal.microchip_id || '',
      insurance_provider: animal.insurance_provider || '',
      insurance_policy_number: animal.insurance_policy_number || '',
      behavioral_notes: animal.behavioral_notes || '',
      dietary_requirements: animal.dietary_requirements || '',
    })
    setIsEditing(false)
  }

  return (
    <div className="grid grid-cols-1 grid-rows-1 items-start gap-x-8 gap-y-8 lg:grid-cols-3">
      {/* Owner & Summary Info Sidebar */}
      <div className="lg:col-start-3 lg:row-end-1">
        <h2 className="sr-only">Summary</h2>
        <div className="rounded-lg bg-gray-50 dark:bg-zinc-900/50 shadow-xs outline-1 -outline-offset-1 outline-gray-900/5 dark:outline-white/10 border border-gray-200 dark:border-zinc-700">
          <dl className="flex flex-wrap">
            <div className="flex-auto pt-6 pl-6">
              <dt className="text-sm/6 font-semibold text-gray-900 dark:text-white">Owner</dt>
              <dd className="mt-1 text-base font-semibold text-gray-900 dark:text-white">
                <Link href={`/customers/${animal.owner.id}`} className="text-indigo-600 hover:underline dark:text-indigo-400">
                  {animal.owner.first_name} {animal.owner.last_name}
                </Link>
              </dd>
            </div>
            <div className="flex-none self-end px-6 pt-4">
              <dt className="sr-only">Species</dt>
              <dd className="rounded-md bg-blue-50 dark:bg-blue-900/50 px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-300 ring-1 ring-blue-600/20 dark:ring-blue-400/20 ring-inset">
                Insured
              </dd>
            </div>
            <div className="mt-6 flex w-full flex-none gap-x-4 border-t border-gray-900/5 dark:border-white/10 px-6 pt-6">
              <dt className="flex-none">
                <span className="sr-only">Email</span>
                <UserCircleIcon className="h-6 w-5 text-gray-400 dark:text-gray-500" />
              </dt>
              <dd className="text-sm/6 font-medium text-gray-900 dark:text-white">{animal.owner.email}</dd>
            </div>
            {animal.owner.phone && (
              <div className="mt-4 flex w-full flex-none gap-x-4 px-6">
                <dt className="flex-none">
                  <span className="sr-only">Phone</span>
                  <PhoneIcon className="h-6 w-5 text-gray-400 dark:text-gray-500" />
                </dt>
                <dd className="text-sm/6 text-gray-500 dark:text-gray-400">{animal.owner.phone}</dd>
              </div>
            )}
            {formData.microchip_id && (
              <div className="mt-4 flex w-full flex-none gap-x-4 px-6">
                <dt className="flex-none">
                  <span className="sr-only">Last Visit</span>
                  <CreditCardIcon className="h-6 w-5 text-gray-400 dark:text-gray-500" />
                </dt>
                <dd className="text-sm/6 text-gray-500 dark:text-gray-400 font-mono">{formData.microchip_id}</dd>
              </div>
            )}
          </dl>
          <div className="mt-6 border-t border-gray-900/5 dark:border-white/10 px-6 py-6">
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 text-sm/6 font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"
            >
              <ChatBubbleLeftRightIcon className="h-4 w-4" />
              Send message <span aria-hidden="true">&rarr;</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="-mx-4 p-6 shadow-xs ring-1 ring-gray-900/5 dark:ring-white/10 sm:mx-0 sm:rounded-lg lg:col-span-2 lg:row-span-2 lg:row-end-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Animal Information</h2>
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="text-sm/6 font-semibold text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300"
            >
              Edit <span aria-hidden="true">&rarr;</span>
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="text-sm/6 font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="animal-info-form"
                disabled={isSubmitting}
                className="ml-3 text-sm/6 font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"
              >
                {isSubmitting ? 'Saving...' : 'Save changes'} <span aria-hidden="true">&rarr;</span>
              </button>
            </div>
          )}
        </div>
        
        <form id="animal-info-form" onSubmit={handleSubmit} className="mt-6">
          {/* Basic Information Grid */}
          <dl className="grid grid-cols-1 text-sm/6 sm:grid-cols-2 gap-x-6 gap-y-6">
            {/* Name */}
            <div>
              <dt className="font-semibold text-gray-900 dark:text-white">Full Name *</dt>
              <dd className="mt-2">
                <Input
                  name="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  readOnly={!isEditing}
                  className={!isEditing ? 'bg-gray-50 dark:bg-zinc-900/50 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-gray-400' : ''}
                />
              </dd>
            </div>

            {/* Species */}
            <div>
              <dt className="font-semibold text-gray-900 dark:text-white">Species *</dt>
              <dd className="mt-2">
                <Select
                  name="species"
                  value={formData.species}
                  onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-gray-50 dark:bg-zinc-900/50 border-gray-200 dark:border-zinc-700' : ''}
                >
                  {SPECIES_OPTIONS.map((species) => (
                    <option key={species} value={species}>
                      {species}
                    </option>
                  ))}
                </Select>
              </dd>
            </div>

            {/* Breed */}
            <div>
              <dt className="font-semibold text-gray-900 dark:text-white">Breed</dt>
              <dd className="mt-2">
                <Input
                  name="breed"
                  value={formData.breed}
                  onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                  readOnly={!isEditing}
                  className={!isEditing ? 'bg-gray-50 dark:bg-zinc-900/50 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-gray-400' : ''}
                  placeholder={!isEditing && !formData.breed ? 'Unknown' : (isEditing ? 'Enter breed' : '')}
                />
              </dd>
            </div>

            {/* Color */}
            <div>
              <dt className="font-semibold text-gray-900 dark:text-white">Color</dt>
              <dd className="mt-2">
                <Input
                  name="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  readOnly={!isEditing}
                  className={!isEditing ? 'bg-gray-50 dark:bg-zinc-900/50 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-gray-400' : ''}
                  placeholder={!isEditing && !formData.color ? 'Not specified' : (isEditing ? 'Enter color' : '')}
                />
              </dd>
            </div>

            {/* Gender */}
            <div>
              <dt className="font-semibold text-gray-900 dark:text-white">Gender</dt>
              <dd className="mt-2">
                <Select
                  name="gender"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-gray-50 dark:bg-zinc-900/50 border-gray-200 dark:border-zinc-700' : ''}
                >
                  <option value="">Unknown</option>
                  {GENDER_OPTIONS.map((gender) => (
                    <option key={gender} value={gender}>
                      {gender}
                    </option>
                  ))}
                </Select>
              </dd>
            </div>

            {/* Date of Birth */}
            <div>
              <dt className="font-semibold text-gray-900 dark:text-white">Date of Birth</dt>
              <dd className="mt-2">
                <Input
                  name="date_of_birth"
                  type={isEditing ? "date" : "text"}
                  value={isEditing ? formData.date_of_birth : (formData.date_of_birth ? new Date(formData.date_of_birth).toLocaleDateString('en-US') : 'Unknown')}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  readOnly={!isEditing}
                  className={!isEditing ? 'bg-gray-50 dark:bg-zinc-900/50 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-gray-400' : ''}
                />
              </dd>
            </div>

            {/* Weight */}
            <div>
              <dt className="font-semibold text-gray-900 dark:text-white">Weight</dt>
              <dd className="mt-2">
                <Input
                  name="weight_kg"
                  type={isEditing ? "number" : "text"}
                  step="0.1"
                  min="0"
                  value={isEditing ? (formData.weight_kg || '') : (formData.weight_kg ? `${formData.weight_kg} kg` : 'Not recorded')}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    weight_kg: e.target.value ? parseFloat(e.target.value) : undefined 
                  })}
                  readOnly={!isEditing}
                  className={!isEditing ? 'bg-gray-50 dark:bg-zinc-900/50 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-gray-400' : ''}
                  placeholder={isEditing ? 'Weight in kg' : ''}
                />
              </dd>
            </div>

            {/* Microchip ID */}
            <div>
              <dt className="font-semibold text-gray-900 dark:text-white">Microchip ID</dt>
              <dd className="mt-2">
                <Input
                  name="microchip_id"
                  value={formData.microchip_id}
                  onChange={(e) => setFormData({ ...formData, microchip_id: e.target.value })}
                  readOnly={!isEditing}
                  className={`font-mono ${!isEditing ? 'bg-gray-50 dark:bg-zinc-900/50 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-gray-400' : ''}`}
                  placeholder={!isEditing && !formData.microchip_id ? 'Not set' : (isEditing ? 'Enter microchip ID' : '')}
                />
              </dd>
            </div>
          </dl>

          {/* Insurance Section */}
          <div className="mt-12">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Insurance Information</h3>
            <dl className="mt-6 grid grid-cols-1 text-sm/6 sm:grid-cols-2 gap-x-6 gap-y-6">
              <div>
                <dt className="font-semibold text-gray-900 dark:text-white">Insurance Provider</dt>
                <dd className="mt-2">
                  <Input
                    name="insurance_provider"
                    value={formData.insurance_provider}
                    onChange={(e) => setFormData({ ...formData, insurance_provider: e.target.value })}
                    readOnly={!isEditing}
                    className={!isEditing ? 'bg-gray-50 dark:bg-zinc-900/50 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-gray-400' : ''}
                    placeholder={!isEditing && !formData.insurance_provider ? 'None' : (isEditing ? 'Enter provider name' : '')}
                  />
                </dd>
              </div>

              <div>
                <dt className="font-semibold text-gray-900 dark:text-white">Policy Number</dt>
                <dd className="mt-2">
                  <Input
                    name="insurance_policy_number"
                    value={formData.insurance_policy_number}
                    onChange={(e) => setFormData({ ...formData, insurance_policy_number: e.target.value })}
                    readOnly={!isEditing}
                    className={`font-mono ${!isEditing ? 'bg-gray-50 dark:bg-zinc-900/50 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-gray-400' : ''}`}
                    placeholder={!isEditing && !formData.insurance_policy_number ? 'None' : (isEditing ? 'Enter policy number' : '')}
                  />
                </dd>
              </div>
            </dl>
          </div>

          {/* Notes Section */}
          <div className="mt-12">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Additional Notes</h3>
            <dl className="mt-6 grid grid-cols-1 text-sm/6 gap-y-6">
              <div>
                <dt className="font-semibold text-gray-900 dark:text-white">Behavioral Notes</dt>
                <dd className="mt-2">
                  <Textarea
                    name="behavioral_notes"
                    rows={3}
                    value={formData.behavioral_notes}
                    onChange={(e) => setFormData({ ...formData, behavioral_notes: e.target.value })}
                    readOnly={!isEditing}
                    className={!isEditing ? 'bg-gray-50 dark:bg-zinc-900/50 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-gray-400' : ''}
                    placeholder={isEditing ? "Any behavioral notes, temperament, or special handling instructions..." : (!formData.behavioral_notes ? 'None recorded' : '')}
                  />
                </dd>
              </div>

              <div>
                <dt className="font-semibold text-gray-900 dark:text-white">Dietary Requirements</dt>
                <dd className="mt-2">
                  <Textarea
                    name="dietary_requirements"
                    rows={3}
                    value={formData.dietary_requirements}
                    onChange={(e) => setFormData({ ...formData, dietary_requirements: e.target.value })}
                    readOnly={!isEditing}
                    className={!isEditing ? 'bg-gray-50 dark:bg-zinc-900/50 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-gray-400' : ''}
                    placeholder={isEditing ? "Special dietary needs, food allergies, or feeding instructions..." : (!formData.dietary_requirements ? 'None recorded' : '')}
                  />
                </dd>
              </div>
            </dl>
          </div>

          {/* Metadata Section */}
          <div className="mt-12 pt-6 border-t border-gray-200 dark:border-zinc-700">
            <dl className="grid grid-cols-1 text-sm/6 sm:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <dt className="font-semibold text-gray-900 dark:text-white">Record Created</dt>
                <dd className="mt-1 text-gray-500 dark:text-gray-400">
                  {new Date(animal.created_at).toLocaleDateString('en-US')}
                </dd>
              </div>
              
              <div>
                <dt className="font-semibold text-gray-900 dark:text-white">Last Updated</dt>
                <dd className="mt-1 text-gray-500 dark:text-gray-400">
                  {new Date(animal.updated_at).toLocaleDateString('en-US')}
                </dd>
              </div>
            </dl>
          </div>
        </form>
      </div>

      {/* Activity Feed */}
      <div className="lg:col-start-3">
        <h2 className="text-sm/6 font-semibold text-gray-900 dark:text-white">Activity & Comments</h2>
        <div className="mt-6">
          <AnimalActivityClient animalId={animal.id} />
        </div>
      </div>

    </div>
  )
}