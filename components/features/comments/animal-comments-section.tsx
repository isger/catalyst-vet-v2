'use client'

import { useState } from 'react'
import Image from 'next/image'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import {
  FaceFrownIcon,
  FaceSmileIcon,
  FireIcon,
  HandThumbUpIcon,
  HeartIcon,
  PaperClipIcon,
  XMarkIcon,
} from '@heroicons/react/20/solid'
import { Label, Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'

interface FieldChange {
  from?: string | number | null
  to?: string | number | null
  old?: string | number | null
  new?: string | number | null
}

interface ActivityChanges {
  [fieldName: string]: FieldChange | string | number | null
}

interface ActivityItem {
  id: string
  type: 'created' | 'edited' | 'sent' | 'viewed' | 'paid' | 'commented'
  person: {
    name: string
    imageUrl?: string
  }
  comment?: string
  date: string
  dateTime: string
  changes?: ActivityChanges
  action_description?: string
}

interface User {
  id: string
  name: string
  imageUrl?: string
}

interface AnimalCommentsSectionProps {
  activities: ActivityItem[]
  currentUser: User
  onAddComment: (content: string, mood?: string) => Promise<void>
}

const moods = [
  { name: 'Excited', value: 'excited', icon: FireIcon, iconColor: 'text-white', bgColor: 'bg-red-500' },
  { name: 'Loved', value: 'loved', icon: HeartIcon, iconColor: 'text-white', bgColor: 'bg-pink-400' },
  { name: 'Happy', value: 'happy', icon: FaceSmileIcon, iconColor: 'text-white', bgColor: 'bg-green-400' },
  { name: 'Sad', value: 'sad', icon: FaceFrownIcon, iconColor: 'text-white', bgColor: 'bg-yellow-400' },
  { name: 'Thumbsy', value: 'thumbsy', icon: HandThumbUpIcon, iconColor: 'text-white', bgColor: 'bg-blue-500' },
  { name: 'I feel nothing', value: null, icon: XMarkIcon, iconColor: 'text-gray-400', bgColor: 'bg-transparent' },
]

function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

function getUserInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatFieldChanges(changes: ActivityChanges | undefined, action_description?: string): string {
  if (!changes || typeof changes !== 'object') {
    return action_description || 'updated the record'
  }

  const fieldLabels: Record<string, string> = {
    name: 'name',
    species: 'species',
    breed: 'breed',
    color: 'color',
    gender: 'gender',
    date_of_birth: 'date of birth',
    weight_kg: 'weight',
    microchip_id: 'microchip ID',
    insurance_provider: 'insurance provider',
    insurance_policy_number: 'insurance policy number',
    behavioral_notes: 'behavioral notes',
    dietary_requirements: 'dietary requirements',
    allergies: 'allergies',
    medical_conditions: 'medical conditions',
    medications: 'medications'
  }

  const changedFields = Object.keys(changes)
  if (changedFields.length === 0) {
    return action_description || 'updated the record'
  }

  if (changedFields.length === 1) {
    const field = changedFields[0]
    const change = changes[field]
    const fieldLabel = fieldLabels[field] || field
    
    if (change && typeof change === 'object') {
      // Handle both 'from'/'to' and 'old'/'new' formats
      let fromValue: string, toValue: string
      
      if ('from' in change && 'to' in change) {
        fromValue = change.from ? String(change.from) : 'empty'
        toValue = change.to ? String(change.to) : 'empty'
      } else if ('old' in change && 'new' in change) {
        fromValue = change.old ? String(change.old) : 'empty'
        toValue = change.new ? String(change.new) : 'empty'
      } else {
        return `updated ${fieldLabel}`
      }
      
      return `changed ${fieldLabel} from "${fromValue}" to "${toValue}"`
    } else {
      return `updated ${fieldLabel}`
    }
  }

  // Multiple fields changed
  const fieldNames = changedFields.map(field => fieldLabels[field] || field)
  if (fieldNames.length <= 3) {
    return `updated ${fieldNames.join(', ')}`
  } else {
    return `updated ${fieldNames.slice(0, 2).join(', ')} and ${fieldNames.length - 2} other field${fieldNames.length - 2 > 1 ? 's' : ''}`
  }
}

export function AnimalCommentsSection({ activities, currentUser, onAddComment }: AnimalCommentsSectionProps) {
  const [selected, setSelected] = useState(moods[5])
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!comment.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      await onAddComment(comment.trim(), selected.value || undefined)
      setComment('')
      setSelected(moods[5]) // Reset to "I feel nothing"
    } catch (error) {
      console.error('Failed to add comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <ul role="list" className="space-y-6">
        {activities.map((activityItem, activityItemIdx) => (
          <li key={activityItem.id} className="relative flex gap-x-4">
            <div
              className={classNames(
                activityItemIdx === activities.length - 1 ? 'h-6' : '-bottom-6',
                'absolute top-0 left-0 flex w-6 justify-center',
              )}
            >
              <div className="w-px bg-gray-200 dark:bg-gray-700" />
            </div>
            {activityItem.type === 'commented' ? (
              <>
                {activityItem.person.imageUrl ? (
                  <Image
                    alt=""
                    src={activityItem.person.imageUrl}
                    width={24}
                    height={24}
                    className="relative mt-3 size-6 flex-none rounded-full bg-gray-50 dark:bg-gray-800"
                  />
                ) : (
                  <div className="relative mt-3 size-6 flex-none rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                      {getUserInitials(activityItem.person.name)}
                    </span>
                  </div>
                )}
                <div className="flex-auto rounded-md p-3 ring-1 ring-gray-200 dark:ring-gray-700 ring-inset bg-white dark:bg-gray-800">
                  <div className="flex justify-between gap-x-4">
                    <div className="py-0.5 text-xs/5 text-gray-500 dark:text-gray-400">
                      <span className="font-medium text-gray-900 dark:text-white">{activityItem.person.name}</span> commented
                    </div>
                    <time dateTime={activityItem.dateTime} className="flex-none py-0.5 text-xs/5 text-gray-500 dark:text-gray-400">
                      {activityItem.date}
                    </time>
                  </div>
                  <p className="text-sm/6 text-gray-500 dark:text-gray-300">{activityItem.comment}</p>
                </div>
              </>
            ) : (
              <>
                <div className="relative flex size-6 flex-none items-center justify-center bg-white dark:bg-gray-900">
                  {activityItem.type === 'paid' ? (
                    <CheckCircleIcon aria-hidden="true" className="size-6 text-indigo-600" />
                  ) : (
                    <div className="size-1.5 rounded-full bg-gray-100 dark:bg-gray-800 ring-1 ring-gray-300 dark:ring-gray-600" />
                  )}
                </div>
                <p className="flex-auto py-0.5 text-xs/5 text-gray-500 dark:text-gray-400">
                  <span className="font-medium text-gray-900 dark:text-white">{activityItem.person.name}</span>{' '}
                  {activityItem.type === 'edited' ? 
                    formatFieldChanges(activityItem.changes, activityItem.action_description) : 
                    `${activityItem.type} the record`
                  }.
                </p>
                <time dateTime={activityItem.dateTime} className="flex-none py-0.5 text-xs/5 text-gray-500 dark:text-gray-400">
                  {activityItem.date}
                </time>
              </>
            )}
          </li>
        ))}
      </ul>

      {/* New comment form */}
      <div className="mt-6 flex gap-x-3">
        {currentUser.imageUrl ? (
          <Image
            alt=""
            src={currentUser.imageUrl}
            width={24}
            height={24}
            className="size-6 flex-none rounded-full bg-gray-50 dark:bg-gray-800"
          />
        ) : (
          <div className="size-6 flex-none rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
              {getUserInitials(currentUser.name)}
            </span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="relative flex-auto">
          <div className="overflow-hidden rounded-lg pb-12 outline-1 -outline-offset-1 outline-gray-300 dark:outline-gray-600 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
            <label htmlFor="comment" className="sr-only">
              Add your comment
            </label>
            <textarea
              id="comment"
              name="comment"
              rows={2}
              placeholder="Add your comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={isSubmitting}
              className="block w-full resize-none bg-transparent px-3 py-1.5 text-base text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
            />
          </div>

          <div className="absolute inset-x-0 bottom-0 flex justify-between py-2 pr-2 pl-3">
            <div className="flex items-center space-x-5">
              <div className="flex items-center">
                <button
                  type="button"
                  disabled={isSubmitting}
                  className="-m-2.5 flex size-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-500 disabled:opacity-50"
                >
                  <PaperClipIcon aria-hidden="true" className="size-5" />
                  <span className="sr-only">Attach a file</span>
                </button>
              </div>
              <div className="flex items-center">
                <Listbox value={selected} onChange={setSelected} disabled={isSubmitting}>
                  <Label className="sr-only">Your mood</Label>
                  <div className="relative">
                    <ListboxButton className="relative -m-2.5 flex size-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-500 disabled:opacity-50">
                      <span className="flex items-center justify-center">
                        {selected.value === null ? (
                          <span>
                            <FaceSmileIcon aria-hidden="true" className="size-5 shrink-0" />
                            <span className="sr-only">Add your mood</span>
                          </span>
                        ) : (
                          <span>
                            <span
                              className={classNames(
                                selected.bgColor,
                                'flex size-8 items-center justify-center rounded-full',
                              )}
                            >
                              <selected.icon aria-hidden="true" className="size-5 shrink-0 text-white" />
                            </span>
                            <span className="sr-only">{selected.name}</span>
                          </span>
                        )}
                      </span>
                    </ListboxButton>

                    <ListboxOptions
                      transition
                      className="absolute bottom-10 z-10 -ml-6 w-60 rounded-lg bg-white dark:bg-gray-800 py-3 text-base shadow-sm ring-1 ring-black/5 dark:ring-white/10 focus:outline-hidden data-leave:transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0 sm:ml-auto sm:w-64 sm:text-sm"
                    >
                      {moods.map((mood) => (
                        <ListboxOption
                          key={mood.value || 'nothing'}
                          value={mood}
                          className="relative cursor-default bg-white dark:bg-gray-800 px-3 py-2 select-none data-focus:bg-gray-100 dark:data-focus:bg-gray-700"
                        >
                          <div className="flex items-center">
                            <div
                              className={classNames(
                                mood.bgColor,
                                'flex size-8 items-center justify-center rounded-full',
                              )}
                            >
                              <mood.icon aria-hidden="true" className={classNames(mood.iconColor, 'size-5 shrink-0')} />
                            </div>
                            <span className="ml-3 block truncate font-medium text-gray-900 dark:text-white">{mood.name}</span>
                          </div>
                        </ListboxOption>
                      ))}
                    </ListboxOptions>
                  </div>
                </Listbox>
              </div>
            </div>
            <button
              type="submit"
              disabled={!comment.trim() || isSubmitting}
              className="rounded-md bg-white dark:bg-gray-800 px-2.5 py-1.5 text-sm font-semibold text-gray-900 dark:text-white shadow-xs ring-1 ring-gray-300 dark:ring-gray-600 ring-inset hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Posting...' : 'Comment'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}