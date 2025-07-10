'use client'

import {Heading, Subheading} from '@/components/ui/heading'
import {Divider} from "@/components/ui/divider";
import {Text} from "@/components/ui/text";
import {Input} from "@/components/ui/input";
import {Address} from "@/app/(dashboard)/settings/address";
import {Checkbox, CheckboxField} from "@/components/ui/checkbox";
import {Label} from "@/components/ui/fieldset";
import {Button} from "@/components/ui/button";
import {TextArea} from "@/components/ui/text-area";
import {EmergencyContactForm} from "@/components/forms/emergency-contact-form";
import React, { useState, useActionState, useEffect } from "react";
import { useRouter } from 'next/navigation'
import { createCustomerFromForm, checkForDuplicateCustomer } from '@/server/actions/create-customer'
import type { ActionResult } from '@/server/actions/create-customer'
import { customerIntakeSchema } from '@/lib/schemas/customer-intake'
import { ZodError } from 'zod'
import { PlusIcon } from '@heroicons/react/16/solid'



import { useToast } from '@/hooks/use-toast'

interface EmergencyContact {
  name: string
  phone: string
  relationship: string
}

interface DuplicateMatch {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
}

export default function NewCustomerPage() {
  const { toast } = useToast()
  const [state, formAction, isPending] = useActionState(async (prevState: ActionResult | null, formData: FormData) => {
    return await createCustomerFromForm(formData)
  }, null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
    { name: '', phone: '', relationship: '' }
  ])
  const [duplicateMatches, setDuplicateMatches] = useState<DuplicateMatch[]>([])
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false)
  const [checkingDuplicates, setCheckingDuplicates] = useState(false)
  const router = useRouter()

  // Functions to manage emergency contacts
  const addEmergencyContact = () => {
    if (emergencyContacts.length < 5) {
      setEmergencyContacts([...emergencyContacts, { name: '', phone: '', relationship: '' }])
    }
  }

  const removeEmergencyContact = (index: number) => {
    if (emergencyContacts.length > 1) {
      setEmergencyContacts(emergencyContacts.filter((_, i) => i !== index))
    }
  }

  const updateEmergencyContact = (index: number, field: keyof EmergencyContact, value: string) => {
    const updated = [...emergencyContacts]
    updated[index] = { ...updated[index], [field]: value }
    setEmergencyContacts(updated)
  }

  // Function to check for duplicate customers
  const checkForDuplicates = async (email: string, phone: string) => {
    if (!email && !phone) return
    
    setCheckingDuplicates(true)
    setShowDuplicateWarning(false)
    setDuplicateMatches([])
    
    try {
      const result = await checkForDuplicateCustomer(email, phone)
      
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
        description: 'Customer created successfully!',
        variant: 'default',
      })
    }
  }, [state, toast])

  // Redirect on successful submission
  useEffect(() => {
    if (state?.success && state?.customerId) {
      router.push(`/customers?new=${state.customerId}`)
    }
  }, [state, router])

  const handleSubmit = async (formData: FormData) => {
    // Clear previous errors
    setErrors({})
    
    // Add emergency contacts to form data
    emergencyContacts.forEach((contact, index) => {
      if (contact.name || contact.phone || contact.relationship) {
        formData.append(`emergencyContacts.${index}.name`, contact.name)
        formData.append(`emergencyContacts.${index}.phone`, contact.phone)
        formData.append(`emergencyContacts.${index}.relationship`, contact.relationship)
      }
    })
    
    // Validate form data with Zod before submission
    try {
      const data = {
        first_name: formData.get('firstName') as string,
        last_name: formData.get('lastName') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        address: {
          street: formData.get('address') as string,
          city: formData.get('city') as string,
          state: formData.get('region') as string,
          zipCode: formData.get('postal_code') as string,
          country: formData.get('country') as string || 'US'
        },
        gdprConsent: formData.get('gdprConsent') === 'on',
        marketingConsent: false,
        additionalNotes: (formData.get('additionalNotes') as string) || undefined,
        emergencyContact: emergencyContacts.filter(contact => 
          contact.name || contact.phone || contact.relationship
        ).length > 0 ? emergencyContacts.filter(contact => 
          contact.name || contact.phone || contact.relationship
        )[0] : undefined
      }
      
      // Validate with Zod schema
      customerIntakeSchema.parse(data)
      
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
          <Heading>Add Customer</Heading>
          <Divider className="my-10 mt-6"/>


          {showDuplicateWarning && duplicateMatches.length > 0 && (
            <div className="mb-6 rounded-lg bg-yellow-50 border border-yellow-200 p-4">
              <Text className="text-yellow-800 font-medium mb-2">⚠️ Potential duplicate customers found:</Text>
              {duplicateMatches.map((match) => (
                <div key={match.id} className="text-yellow-700 text-sm mb-1">
                  • {match.first_name} {match.last_name} - {match.email} - {match.phone}
                </div>
              ))}
              <Text className="text-yellow-700 text-sm mt-2">
                Please verify this is not a duplicate before continuing.
              </Text>
            </div>
          )}

          <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
              <div className="space-y-1">
                  <Subheading>Customer Details</Subheading>
                  <Text>All customer data is GDPR compliant.</Text>
              </div>
              <div className="space-y-4">
                  <div>
                    <Input aria-label="First Name" label="First Name" name="firstName" placeholder="John"/>
                    {errors.firstName && <Text className="text-red-600 text-sm mt-1">{errors.firstName}</Text>}
                  </div>
                  <div>
                    <Input aria-label="Last Name" label="Last Name" name="lastName" placeholder="Doe"/>
                    {errors.lastName && <Text className="text-red-600 text-sm mt-1">{errors.lastName}</Text>}
                  </div>
                  <div>
                    <Input type="email" label="Email" aria-label="Customer Email" name="email"
                           placeholder="john.doe@example.com"
                           onBlur={(e) => {
                             const email = e.target.value
                             const phone = (document.querySelector('input[name="phone"]') as HTMLInputElement)?.value
                             if (email) checkForDuplicates(email, phone)
                           }}/>
                    {errors.email && <Text className="text-red-600 text-sm mt-1">{errors.email}</Text>}
                    {checkingDuplicates && (
                      <Text className="text-blue-600 text-sm mt-1">Checking for existing customers...</Text>
                    )}
                  </div>
                  <div>
                    <Input type="tel" label="Phone Number" aria-label="Customer Phone Number" name="phone"
                           placeholder="(555) 123-4567"
                           onBlur={(e) => {
                             const phone = e.target.value
                             const email = (document.querySelector('input[name="email"]') as HTMLInputElement)?.value
                             if (phone) checkForDuplicates(email, phone)
                           }}/>
                    {errors.phone && <Text className="text-red-600 text-sm mt-1">{errors.phone}</Text>}
                  </div>
              </div>
          </section>

          <Divider className="my-10" soft/>

          <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
              <div className="space-y-1">
                  <Subheading>Address</Subheading>
                  <Text>Customer&#39;s home address information.</Text>
              </div>
              <div>
                <Address/>
                {errors['address.street'] && <Text className="text-red-600 text-sm mt-1">{errors['address.street']}</Text>}
                {errors['address.city'] && <Text className="text-red-600 text-sm mt-1">{errors['address.city']}</Text>}
                {errors['address.state'] && <Text className="text-red-600 text-sm mt-1">{errors['address.state']}</Text>}
                {errors['address.zipCode'] && <Text className="text-red-600 text-sm mt-1">{errors['address.zipCode']}</Text>}
              </div>
          </section>

          <Divider className="my-10" soft/>

          <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
              <div className="space-y-1">
                  <Subheading>Emergency Contacts</Subheading>
                  <Text>Contact information for emergencies involving the customer or their pets.</Text>
                  <div className="mt-4">
                    <Button
                      type="button"
                      onClick={addEmergencyContact}
                      disabled={emergencyContacts.length >= 5}
                      outline
                      className="flex items-center gap-2 text-sm"
                    >
                      <PlusIcon className="h-4 w-4" />
                      Add Contact
                    </Button>
                    {emergencyContacts.length >= 5 && (
                      <Text className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                        Maximum 5 contacts allowed
                      </Text>
                    )}
                  </div>
              </div>
              <div className="space-y-4">
                {emergencyContacts.map((contact, index) => (
                  <EmergencyContactForm
                    key={index}
                    contact={contact}
                    index={index}
                    onUpdate={updateEmergencyContact}
                    onRemove={removeEmergencyContact}
                    canRemove={emergencyContacts.length > 1}
                    errors={errors}
                  />
                ))}
              </div>
          </section>

          <Divider className="my-10" soft/>

          <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
              <div className="space-y-1">
                  <Subheading>Additional Notes</Subheading>
                  <Text>Any additional information about the customer or special requirements.</Text>
              </div>
              <div>
                <TextArea
                  name="additionalNotes"
                  id="additionalNotes"
                  rows={4}
                  maxLength={500}
                  showCharCount={true}
                  placeholder="Enter any additional notes, special requirements, or important information about the customer..."
                />
                {errors.additionalNotes && <Text className="text-red-600 text-sm mt-1">{errors.additionalNotes}</Text>}
              </div>
          </section>

          <Divider className="my-10" soft/>

          <section className="grid gap-x-8 gap-y-6 sm:grid-cols-1">
              <div>
                <CheckboxField>
                    <Checkbox name="gdprConsent"/>
                    <Label>I consent to the processing of my personal data for veterinary care and related services. This
                        is required to provide medical care for your pets.</Label>
                </CheckboxField>
                {errors.gdprConsent && <Text className="text-red-600 text-sm mt-1">{errors.gdprConsent}</Text>}
              </div>
          </section>

          <Divider className="my-10" soft/>

          <section className="flex justify-end gap-4">
            <Button type="button" outline disabled={isPending} onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creating Customer...' : 'Create Customer'}
            </Button>
          </section>

      </form>
  )
}