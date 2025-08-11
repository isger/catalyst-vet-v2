'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Link } from '@/components/ui/link'
import { updateCustomer, type UpdateCustomerData } from '@/server/actions/customers'
import { toast } from 'sonner'
import { EnvelopeIcon, PhoneIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/20/solid'
import { HomeIcon } from '@heroicons/react/16/solid'
import { HeartIcon } from '@heroicons/react/24/outline'
import type { CustomerWithPets } from '@/server/queries/customers'

interface CustomerBasicInfoFormProps {
  customer: CustomerWithPets
}

export function CustomerBasicInfoForm({ customer }: CustomerBasicInfoFormProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<UpdateCustomerData>({
    first_name: customer.first_name,
    last_name: customer.last_name,
    email: customer.email,
    phone: customer.phone || '',
    address: customer.address ? {
      street: customer.address.street || '',
      city: customer.address.city || '',
      state: customer.address.state || '',
      zip: customer.address.zip || '',
      country: customer.address.country || '',
    } : undefined,
    additional_notes: customer.additional_notes || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const result = await updateCustomer(customer.id, formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Customer information updated successfully')
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Error updating customer:', error)
      toast.error('Failed to update customer information')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      first_name: customer.first_name,
      last_name: customer.last_name,
      email: customer.email,
      phone: customer.phone || '',
      address: customer.address ? {
        street: customer.address.street || '',
        city: customer.address.city || '',
        state: customer.address.state || '',
        zip: customer.address.zip || '',
        country: customer.address.country || '',
      } : undefined,
      additional_notes: customer.additional_notes || '',
    })
    setIsEditing(false)
  }

  const customerSince = new Date(customer.created_at).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  return (
    <div className="grid grid-cols-1 grid-rows-1 items-start gap-x-8 gap-y-8 lg:grid-cols-3">
      {/* Summary Info Sidebar */}
      <div className="lg:col-start-3 lg:row-end-1">
        <h2 className="sr-only">Summary</h2>
        <div className="rounded-lg bg-gray-50 dark:bg-zinc-900/50 shadow-xs outline-1 -outline-offset-1 outline-gray-900/5 dark:outline-white/10 border border-gray-200 dark:border-zinc-700">
          <dl className="flex flex-wrap">
            <div className="flex-auto pt-6 pl-6">
              <dt className="text-sm/6 font-semibold text-gray-900 dark:text-white">Customer</dt>
              <dd className="mt-1 text-base font-semibold text-gray-900 dark:text-white">
                {formData.first_name} {formData.last_name}
              </dd>
            </div>
            <div className="flex-none self-end px-6 pt-4">
              <dt className="sr-only">Pets</dt>
              <dd className="rounded-md bg-green-50 dark:bg-green-900/50 px-2 py-1 text-xs font-medium text-green-600 dark:text-green-300 ring-1 ring-green-600/20 dark:ring-green-400/20 ring-inset">
                {customer.animals.length} pet{customer.animals.length !== 1 ? 's' : ''}
              </dd>
            </div>
            <div className="mt-6 flex w-full flex-none gap-x-4 border-t border-gray-900/5 dark:border-white/10 px-6 pt-6">
              <dt className="flex-none">
                <span className="sr-only">Email</span>
                <EnvelopeIcon className="h-6 w-5 text-gray-400 dark:text-gray-500" />
              </dt>
              <dd className="text-sm/6 font-medium text-gray-900 dark:text-white">{formData.email}</dd>
            </div>
            {formData.phone && (
              <div className="mt-4 flex w-full flex-none gap-x-4 px-6">
                <dt className="flex-none">
                  <span className="sr-only">Phone</span>
                  <PhoneIcon className="h-6 w-5 text-gray-400 dark:text-gray-500" />
                </dt>
                <dd className="text-sm/6 text-gray-500 dark:text-gray-400">{formData.phone}</dd>
              </div>
            )}
            {formData.address && (
              <div className="mt-4 flex w-full flex-none gap-x-4 px-6">
                <dt className="flex-none">
                  <span className="sr-only">Address</span>
                  <HomeIcon className="h-6 w-5 text-gray-400 dark:text-gray-500" />
                </dt>
                <dd className="text-sm/6 text-gray-500 dark:text-gray-400">
                  {formData.address.city}, {formData.address.state}
                </dd>
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
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Customer Information</h2>
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
                form="customer-info-form"
                disabled={isSubmitting}
                className="ml-3 text-sm/6 font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"
              >
                {isSubmitting ? 'Saving...' : 'Save changes'} <span aria-hidden="true">&rarr;</span>
              </button>
            </div>
          )}
        </div>
        
        <form id="customer-info-form" onSubmit={handleSubmit} className="mt-6">
          {/* Basic Information Grid */}
          <dl className="grid grid-cols-1 text-sm/6 sm:grid-cols-2 gap-x-6 gap-y-6">
            {/* First Name */}
            <div>
              <dt className="font-semibold text-gray-900 dark:text-white">First Name *</dt>
              <dd className="mt-2">
                <Input
                  name="first_name"
                  required
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  readOnly={!isEditing}
                  className={!isEditing ? 'bg-gray-50 dark:bg-zinc-900/50 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-gray-400' : ''}
                />
              </dd>
            </div>

            {/* Last Name */}
            <div>
              <dt className="font-semibold text-gray-900 dark:text-white">Last Name *</dt>
              <dd className="mt-2">
                <Input
                  name="last_name"
                  required
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  readOnly={!isEditing}
                  className={!isEditing ? 'bg-gray-50 dark:bg-zinc-900/50 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-gray-400' : ''}
                />
              </dd>
            </div>

            {/* Email */}
            <div>
              <dt className="font-semibold text-gray-900 dark:text-white">Email Address *</dt>
              <dd className="mt-2">
                <Input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  readOnly={!isEditing}
                  className={!isEditing ? 'bg-gray-50 dark:bg-zinc-900/50 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-gray-400' : ''}
                />
              </dd>
            </div>

            {/* Phone */}
            <div>
              <dt className="font-semibold text-gray-900 dark:text-white">Phone Number *</dt>
              <dd className="mt-2">
                <Input
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  readOnly={!isEditing}
                  className={!isEditing ? 'bg-gray-50 dark:bg-zinc-900/50 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-gray-400' : ''}
                  placeholder={!isEditing && !formData.phone ? 'Not provided' : (isEditing ? 'Enter phone number' : '')}
                />
              </dd>
            </div>
          </dl>

          {/* Address Section */}
          <div className="mt-12">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Address Information</h3>
            <dl className="mt-6 grid grid-cols-1 text-sm/6 gap-x-6 gap-y-6">
              <div className="sm:col-span-2">
                <dt className="font-semibold text-gray-900 dark:text-white">Street Address</dt>
                <dd className="mt-2">
                  <Input
                    name="address.street"
                    value={formData.address?.street || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      address: { 
                        ...formData.address,
                        street: e.target.value,
                        city: formData.address?.city || '',
                        state: formData.address?.state || '',
                        zip: formData.address?.zip || '',
                        country: formData.address?.country || '',
                      } 
                    })}
                    readOnly={!isEditing}
                    className={!isEditing ? 'bg-gray-50 dark:bg-zinc-900/50 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-gray-400' : ''}
                    placeholder={!isEditing && !formData.address?.street ? 'Not provided' : (isEditing ? 'Enter street address' : '')}
                  />
                </dd>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-6">
                <div>
                  <dt className="font-semibold text-gray-900 dark:text-white">City</dt>
                  <dd className="mt-2">
                    <Input
                      name="address.city"
                      value={formData.address?.city || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        address: { 
                          ...formData.address,
                          street: formData.address?.street || '',
                          city: e.target.value,
                          state: formData.address?.state || '',
                          zip: formData.address?.zip || '',
                          country: formData.address?.country || '',
                        } 
                      })}
                      readOnly={!isEditing}
                      className={!isEditing ? 'bg-gray-50 dark:bg-zinc-900/50 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-gray-400' : ''}
                      placeholder={!isEditing && !formData.address?.city ? 'Not provided' : (isEditing ? 'Enter city' : '')}
                    />
                  </dd>
                </div>

                <div>
                  <dt className="font-semibold text-gray-900 dark:text-white">State</dt>
                  <dd className="mt-2">
                    <Input
                      name="address.state"
                      value={formData.address?.state || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        address: { 
                          ...formData.address,
                          street: formData.address?.street || '',
                          city: formData.address?.city || '',
                          state: e.target.value,
                          zip: formData.address?.zip || '',
                          country: formData.address?.country || '',
                        } 
                      })}
                      readOnly={!isEditing}
                      className={!isEditing ? 'bg-gray-50 dark:bg-zinc-900/50 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-gray-400' : ''}
                      placeholder={!isEditing && !formData.address?.state ? 'Not provided' : (isEditing ? 'Enter state' : '')}
                    />
                  </dd>
                </div>

                <div>
                  <dt className="font-semibold text-gray-900 dark:text-white">ZIP Code</dt>
                  <dd className="mt-2">
                    <Input
                      name="address.zip"
                      value={formData.address?.zip || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        address: { 
                          ...formData.address,
                          street: formData.address?.street || '',
                          city: formData.address?.city || '',
                          state: formData.address?.state || '',
                          zip: e.target.value,
                          country: formData.address?.country || '',
                        } 
                      })}
                      readOnly={!isEditing}
                      className={!isEditing ? 'bg-gray-50 dark:bg-zinc-900/50 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-gray-400' : ''}
                      placeholder={!isEditing && !formData.address?.zip ? 'Not provided' : (isEditing ? 'Enter ZIP code' : '')}
                    />
                  </dd>
                </div>
              </div>

              <div>
                <dt className="font-semibold text-gray-900 dark:text-white">Country</dt>
                <dd className="mt-2">
                  <Input
                    name="address.country"
                    value={formData.address?.country || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      address: { 
                        ...formData.address,
                        street: formData.address?.street || '',
                        city: formData.address?.city || '',
                        state: formData.address?.state || '',
                        zip: formData.address?.zip || '',
                        country: e.target.value,
                      } 
                    })}
                    readOnly={!isEditing}
                    className={!isEditing ? 'bg-gray-50 dark:bg-zinc-900/50 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-gray-400' : ''}
                    placeholder={!isEditing && !formData.address?.country ? 'Not provided' : (isEditing ? 'Enter country' : '')}
                  />
                </dd>
              </div>
            </dl>
          </div>

          {/* Additional Notes Section */}
          <div className="mt-12">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Additional Notes</h3>
            <dl className="mt-6 grid grid-cols-1 text-sm/6 gap-y-6">
              <div>
                <dt className="font-semibold text-gray-900 dark:text-white">Notes</dt>
                <dd className="mt-2">
                  <Textarea
                    name="additional_notes"
                    rows={4}
                    value={formData.additional_notes || ''}
                    onChange={(e) => setFormData({ ...formData, additional_notes: e.target.value })}
                    readOnly={!isEditing}
                    className={!isEditing ? 'bg-gray-50 dark:bg-zinc-900/50 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-gray-400' : ''}
                    placeholder={isEditing ? "Any additional notes about the customer..." : (!formData.additional_notes ? 'No additional notes' : '')}
                  />
                </dd>
              </div>
            </dl>
          </div>

          {/* Metadata Section */}
          <div className="mt-12 pt-6 border-t border-gray-200 dark:border-zinc-700">
            <dl className="grid grid-cols-1 text-sm/6 sm:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <dt className="font-semibold text-gray-900 dark:text-white">Customer Since</dt>
                <dd className="mt-1 text-gray-500 dark:text-gray-400">
                  {customerSince}
                </dd>
              </div>
              
              <div>
                <dt className="font-semibold text-gray-900 dark:text-white">Last Updated</dt>
                <dd className="mt-1 text-gray-500 dark:text-gray-400">
                  {new Date(customer.updated_at).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>
        </form>
      </div>

      {/* Pets List */}
      <div className="lg:col-start-3">
        <h2 className="text-sm/6 font-semibold text-gray-900 dark:text-white">Registered Pets</h2>
        <div className="mt-6">
          {customer.animals.length > 0 ? (
            <div className="space-y-3">
              {customer.animals.map((pet) => (
                <div key={pet.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900/50">
                  <div className="flex items-center gap-3">
                    <HeartIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    <div>
                      <Link href={`/animals/${pet.id}`} className="text-sm font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400">
                        {pet.name}
                      </Link>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {pet.species} {pet.breed && `• ${pet.breed}`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-4 border border-dashed border-gray-300 dark:border-zinc-700 rounded-lg">
              <HeartIcon className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500" />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No pets registered</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}