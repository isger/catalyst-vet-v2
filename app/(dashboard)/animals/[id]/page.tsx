import { notFound } from 'next/navigation'
import { getAnimalById } from '@/server/queries/animals'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { 
  CalendarIcon, 
  ExclamationTriangleIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import {
  ArchiveBoxIcon,
  ChevronDownIcon,
  DocumentDuplicateIcon,
  PencilSquareIcon,
  UserPlusIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/20/solid'
import type { MedicalItem } from '@/lib/schemas/animal-intake'
import { Link } from '@/components/ui/link'
import { ChevronLeftIcon } from '@heroicons/react/16/solid'
import { Divider } from '@/components/ui/divider'
import { Subheading } from '@/components/ui/heading'
import { AnimalDetailClient } from './animal-detail-client'
import { AnimalBasicInfoForm } from './animal-basic-info-form'
import type { Tab } from '@/components/ui/tabs-v2'

export default async function AnimalDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { id } = await params
  const { tab } = await searchParams
  const activeTab = typeof tab === 'string' ? tab : 'basic-info'
  const animal = await getAnimalById(id)

  if (!animal) {
    notFound()
  }

  // Parse JSON fields safely
  const allergies = (animal.allergies as MedicalItem[]) || []
  const medicalConditions = (animal.medical_conditions as MedicalItem[]) || []
  const medications = (animal.medications as MedicalItem[]) || []

  // Function to get species badge color
  const getSpeciesBadgeColor = (species: string) => {
    const colors: Record<string, string> = {
      'Dog': 'bg-blue-100 text-blue-800',
      'Cat': 'bg-purple-100 text-purple-800',
      'Bird': 'bg-yellow-100 text-yellow-800',
      'Rabbit': 'bg-green-100 text-green-800',
      'Fish': 'bg-cyan-100 text-cyan-800',
      'Reptile': 'bg-orange-100 text-orange-800',
      'Horse': 'bg-brown-100 text-brown-800',
      'Hamster': 'bg-pink-100 text-pink-800',
      'Guinea Pig': 'bg-red-100 text-red-800',
      'Ferret': 'bg-gray-100 text-gray-800',
    }
    return colors[species] || 'bg-gray-100 text-gray-800'
  }

  // Function to get default animal image based on species
  const getAnimalImage = (species: string): string => {
    const speciesLower = species.toLowerCase()
    if (speciesLower.includes('dog')) {
      return 'https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    } else if (speciesLower.includes('cat')) {
      return 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    } else if (speciesLower.includes('bird')) {
      return 'https://images.unsplash.com/photo-1444464666168-49d633b86797?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    } else if (speciesLower.includes('rabbit')) {
      return 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    }
    return 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  }

  const tabs: Tab[] = [
    { name: 'Basic Information', value: 'basic-info' },
    { name: 'Medical Records', value: 'medical' },
    { name: 'Standard of Care', value: 'standard-of-care' },
    { name: 'Communications', value: 'communications' },
    { name: 'Appointments', value: 'appointments' },
    { name: 'Documents', value: 'documents' }
  ]

  return (
    <>
      {/* Breadcrumb */}
      <div className="max-lg:hidden">
        <Link href="/animals" className="inline-flex items-center gap-2 text-sm/6 text-zinc-500 dark:text-zinc-400">
          <ChevronLeftIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />
          Animals
        </Link>
      </div>

      {/* Header */}
      <div className="mt-4 lg:mt-8">
        <div className="md:flex md:items-center md:justify-between md:space-x-5">
          <div className="flex items-start space-x-5">
            <div className="flex-shrink-0">
              <Avatar 
                src={getAnimalImage(animal.species)} 
                initials={animal.name.charAt(0).toUpperCase()}
                alt={`${animal.name} profile`}
                className="size-20"
              />
            </div>
            <div className="pt-1.5">
              <h1 className="text-2xl font-bold text-zinc-950 dark:text-white">
                {animal.name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getSpeciesBadgeColor(animal.species)}>
                  {animal.species}
                </Badge>
                {animal.breed && (
                  <Badge color="zinc">{animal.breed}</Badge>
                )}
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-col-reverse justify-stretch space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-y-0 sm:space-x-3 sm:space-x-reverse md:mt-0 md:flex-row md:space-x-3">
            <Menu as="div" className="relative inline-block">
              <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white dark:bg-zinc-900 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-xs inset-ring-1 inset-ring-gray-300 dark:inset-ring-zinc-600 hover:bg-gray-50 dark:hover:bg-zinc-800">
                Actions
                <ChevronDownIcon aria-hidden="true" className="-mr-1 size-5 text-gray-400 dark:text-gray-500" />
              </MenuButton>

              <MenuItems
                transition
                className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 dark:divide-zinc-700 rounded-md bg-white dark:bg-zinc-800 shadow-lg outline-1 outline-black/5 dark:outline-white/10 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
              >
                <div className="py-1">
                  <MenuItem>
                    <button
                      type="button"
                      className="group flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 data-focus:bg-gray-100 dark:data-focus:bg-zinc-700 data-focus:text-gray-900 dark:data-focus:text-white data-focus:outline-hidden"
                    >
                      <ClipboardDocumentListIcon
                        aria-hidden="true"
                        className="mr-3 size-5 text-gray-400 dark:text-gray-500 group-data-focus:text-gray-500 dark:group-data-focus:text-gray-400"
                      />
                      Create Clinical Summary
                    </button>
                  </MenuItem>
                  <MenuItem>
                    <button
                      type="button"
                      className="group flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 data-focus:bg-gray-100 dark:data-focus:bg-zinc-700 data-focus:text-gray-900 dark:data-focus:text-white data-focus:outline-hidden"
                    >
                      <DocumentTextIcon
                        aria-hidden="true"
                        className="mr-3 size-5 text-gray-400 dark:text-gray-500 group-data-focus:text-gray-500 dark:group-data-focus:text-gray-400"
                      />
                      Generate Report
                    </button>
                  </MenuItem>
                  <MenuItem>
                    <button
                      type="button"
                      className="group flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 data-focus:bg-gray-100 dark:data-focus:bg-zinc-700 data-focus:text-gray-900 dark:data-focus:text-white data-focus:outline-hidden"
                    >
                      <PencilSquareIcon
                        aria-hidden="true"
                        className="mr-3 size-5 text-gray-400 dark:text-gray-500 group-data-focus:text-gray-500 dark:group-data-focus:text-gray-400"
                      />
                      Edit Record
                    </button>
                  </MenuItem>
                </div>
                <div className="py-1">
                  <MenuItem>
                    <button
                      type="button"
                      className="group flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 data-focus:bg-gray-100 dark:data-focus:bg-zinc-700 data-focus:text-gray-900 dark:data-focus:text-white data-focus:outline-hidden"
                    >
                      <DocumentDuplicateIcon
                        aria-hidden="true"
                        className="mr-3 size-5 text-gray-400 dark:text-gray-500 group-data-focus:text-gray-500 dark:group-data-focus:text-gray-400"
                      />
                      Duplicate Record
                    </button>
                  </MenuItem>
                  <MenuItem>
                    <button
                      type="button"
                      className="group flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 data-focus:bg-gray-100 dark:data-focus:bg-zinc-700 data-focus:text-gray-900 dark:data-focus:text-white data-focus:outline-hidden"
                    >
                      <UserPlusIcon aria-hidden="true" className="mr-3 size-5 text-gray-400 dark:text-gray-500 group-data-focus:text-gray-500 dark:group-data-focus:text-gray-400" />
                      Share with Team
                    </button>
                  </MenuItem>
                </div>
                <div className="py-1">
                  <MenuItem>
                    <button
                      type="button"
                      className="group flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 data-focus:bg-gray-100 dark:data-focus:bg-zinc-700 data-focus:text-gray-900 dark:data-focus:text-white data-focus:outline-hidden"
                    >
                      <ArchiveBoxIcon aria-hidden="true" className="mr-3 size-5 text-gray-400 dark:text-gray-500 group-data-focus:text-gray-500 dark:group-data-focus:text-gray-400" />
                      Archive Record
                    </button>
                  </MenuItem>
                </div>
              </MenuItems>
            </Menu>
            <Button color="indigo">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Schedule Appointment
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mt-5">
        <AnimalDetailClient
          animalId={id}
          activeTab={activeTab}
          tabs={tabs}
        />
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        {activeTab === 'basic-info' && (
          <AnimalBasicInfoForm animal={animal} />
        )}

        {activeTab === 'medical' && (
          <>
            <Subheading>Medical Records</Subheading>
            <Divider className="mt-4" />
            
            {/* Allergies Section */}
            {allergies.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-medium text-zinc-950 dark:text-white mb-4 flex items-center gap-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                  Allergies
                </h3>
                <div className="space-y-3">
                  {allergies.map((allergy, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-red-50 dark:bg-red-950/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-red-800 dark:text-red-200">{allergy.name}</span>
                        {allergy.severity && (
                          <Badge color={allergy.severity === 'Severe' ? 'red' : 'zinc'}>
                            {allergy.severity}
                          </Badge>
                        )}
                      </div>
                      {allergy.notes && (
                        <p className="text-sm text-red-600 dark:text-red-300">{allergy.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Medical Conditions Section */}
            {medicalConditions.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-medium text-zinc-950 dark:text-white mb-4 flex items-center gap-2">
                  <HeartIcon className="h-5 w-5 text-orange-500" />
                  Medical Conditions
                </h3>
                <div className="space-y-3">
                  {medicalConditions.map((condition, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-orange-50 dark:bg-orange-950/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-orange-800 dark:text-orange-200">{condition.name}</span>
                        {condition.date_diagnosed && (
                          <span className="text-sm text-orange-600 dark:text-orange-300">
                            Diagnosed: {new Date(condition.date_diagnosed).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {condition.notes && (
                        <p className="text-sm text-orange-600 dark:text-orange-300">{condition.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Medications Section */}
            {medications.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-medium text-zinc-950 dark:text-white mb-4 flex items-center gap-2">
                  <HeartIcon className="h-5 w-5 text-blue-500" />
                  Current Medications
                </h3>
                <div className="space-y-3">
                  {medications.map((medication, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950/20">
                      <span className="font-medium text-blue-800 dark:text-blue-200">{medication.name}</span>
                      {medication.notes && (
                        <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">{medication.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {allergies.length === 0 && medicalConditions.length === 0 && medications.length === 0 && (
              <div className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-8 text-center mt-6">
                <p className="text-zinc-500 dark:text-zinc-400">No medical records found</p>
                <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-2">
                  Medical information will appear here once added
                </p>
              </div>
            )}
          </>
        )}

        {activeTab === 'standard-of-care' && (
          <>
            <Subheading>Standard of Care</Subheading>
            <Divider className="mt-4" />
            
            {/* Species-specific guidelines */}
            <div className="mt-6">
              <h3 className="text-lg font-medium text-zinc-950 dark:text-white mb-4">
                {animal.species} Care Guidelines
              </h3>
              
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Preventive Care */}
                <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 p-6">
                  <div className="flex items-center mb-4">
                    <ClipboardDocumentCheckIcon className="h-6 w-6 text-green-600 dark:text-green-500 mr-3" />
                    <h4 className="text-base font-semibold text-zinc-950 dark:text-white">Preventive Care</h4>
                  </div>
                  <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></span>
                      Annual wellness examination
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></span>
                      Core vaccinations (species-appropriate)
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></span>
                      Parasite prevention and screening
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></span>
                      Dental health assessment
                    </li>
                  </ul>
                </div>

                {/* Nutritional Guidelines */}
                <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 p-6">
                  <div className="flex items-center mb-4">
                    <HeartIcon className="h-6 w-6 text-blue-600 dark:text-blue-500 mr-3" />
                    <h4 className="text-base font-semibold text-zinc-950 dark:text-white">Nutritional Guidelines</h4>
                  </div>
                  <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></span>
                      Age-appropriate diet formulation
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></span>
                      Body condition scoring
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></span>
                      Feeding frequency recommendations
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></span>
                      Weight management protocols
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Care Schedule */}
            <div className="mt-8">
              <h3 className="text-lg font-medium text-zinc-950 dark:text-white mb-4">
                Recommended Care Schedule
              </h3>
              
              <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
                <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                        Care Item
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                        Frequency
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                        Next Due
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-700">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-white">
                        Annual Physical Exam
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                        Yearly
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                        Coming soon
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                          Up to date
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-white">
                        Vaccinations
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                        As needed
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                        Schedule based on history
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">
                          Review needed
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-white">
                        Dental Care
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                        As recommended
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                        Based on examination
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300">
                          Not assessed
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Guidelines Note */}
            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ClipboardDocumentCheckIcon className="h-5 w-5 text-blue-400 dark:text-blue-500" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                    Care Guidelines
                  </h3>
                  <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                    <p>
                      These recommendations are based on current veterinary standards of care for {animal.species.toLowerCase()}s. 
                      Individual care plans may vary based on the animal&apos;s health status, age, and specific needs. 
                      Always consult with the attending veterinarian for personalized care recommendations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'communications' && (
          <>
            <Subheading>Communications</Subheading>
            <Divider className="mt-4" />
            <div className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-8 text-center mt-6">
              <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <p className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">Communications Hub</p>
              <p className="mt-2 text-zinc-500 dark:text-zinc-400">
                Send messages, emails, and manage all communications with the pet owner
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <Button color="indigo">
                  <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                <Button outline>
                  View Message History
                </Button>
              </div>
            </div>
            
            {/* Recent Communications */}
            <div className="mt-8">
              <h3 className="text-lg font-medium text-zinc-950 dark:text-white mb-4">Recent Communications</h3>
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 p-6">
                <p className="text-zinc-500 dark:text-zinc-400">No recent communications found</p>
                <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-2">
                  Messages, emails, and call logs will appear here once you start communicating with the pet owner
                </p>
              </div>
            </div>
          </>
        )}

        {activeTab === 'appointments' && (
          <>
            <Subheading>Appointments</Subheading>
            <Divider className="mt-4" />
            <div className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-8 text-center mt-6">
              <p className="text-zinc-500 dark:text-zinc-400">Appointment management coming soon</p>
              <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-2">
                View and manage all past and upcoming appointments
              </p>
            </div>
          </>
        )}

        {activeTab === 'documents' && (
          <>
            <Subheading>Documents & Files</Subheading>
            <Divider className="mt-4" />
            <div className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-8 text-center mt-6">
              <p className="text-zinc-500 dark:text-zinc-400">Document management coming soon</p>
              <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-2">
                Upload and manage photos, medical reports, and other files
              </p>
            </div>
          </>
        )}
      </div>
    </>
  )
}