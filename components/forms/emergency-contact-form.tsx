'use client'

import { Input } from '@/components/ui/input'
import { Text } from '@/components/ui/text'
import { Button } from '@/components/ui/button'
import { XMarkIcon } from '@heroicons/react/16/solid'

interface EmergencyContact {
  name: string
  phone: string
  relationship: string
}

interface EmergencyContactFormProps {
  contact: EmergencyContact
  index: number
  onUpdate: (index: number, field: keyof EmergencyContact, value: string) => void
  onRemove: (index: number) => void
  canRemove: boolean
  errors?: Record<string, string>
}

export function EmergencyContactForm({
  contact,
  index,
  onUpdate,
  onRemove,
  canRemove,
  errors = {}
}: EmergencyContactFormProps) {
  const fieldPrefix = `emergencyContacts.${index}`

  return (
    <div className="relative space-y-4 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4">
      {/* Header with contact number and remove button */}
      <div className="flex items-center justify-between">
        <Text className="font-medium text-zinc-950 dark:text-white">
          Emergency Contact {index + 1}
        </Text>
        {canRemove && (
          <Button
            type="button"
            onClick={() => onRemove(index)}
            className="p-1 text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400"
            aria-label={`Remove emergency contact ${index + 1}`}
          >
            <XMarkIcon className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Contact Name */}
      <div>
        <Input
          aria-label={`Emergency Contact ${index + 1} Name`}
          label="Contact Name"
          name={`${fieldPrefix}.name`}
          value={contact.name}
          onChange={(e) => onUpdate(index, 'name', e.target.value)}
          placeholder="Jane Doe"
        />
        {errors[`${fieldPrefix}.name`] && (
          <Text className="text-red-600 dark:text-red-400 text-sm mt-1">
            {errors[`${fieldPrefix}.name`]}
          </Text>
        )}
      </div>

      {/* Contact Phone */}
      <div>
        <Input
          type="tel"
          label="Contact Phone"
          aria-label={`Emergency Contact ${index + 1} Phone`}
          name={`${fieldPrefix}.phone`}
          value={contact.phone}
          onChange={(e) => onUpdate(index, 'phone', e.target.value)}
          placeholder="(555) 987-6543"
        />
        {errors[`${fieldPrefix}.phone`] && (
          <Text className="text-red-600 dark:text-red-400 text-sm mt-1">
            {errors[`${fieldPrefix}.phone`]}
          </Text>
        )}
      </div>

      {/* Relationship */}
      <div>
        <Input
          aria-label={`Emergency Contact ${index + 1} Relationship`}
          label="Relationship"
          name={`${fieldPrefix}.relationship`}
          value={contact.relationship}
          onChange={(e) => onUpdate(index, 'relationship', e.target.value)}
          placeholder="Spouse, Parent, Sibling, Friend, etc."
        />
        {errors[`${fieldPrefix}.relationship`] && (
          <Text className="text-red-600 dark:text-red-400 text-sm mt-1">
            {errors[`${fieldPrefix}.relationship`]}
          </Text>
        )}
      </div>
    </div>
  )
}