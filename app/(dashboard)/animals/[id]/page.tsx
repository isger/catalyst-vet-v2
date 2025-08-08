import { notFound } from 'next/navigation'
import { getAnimalById } from '@/server/queries/animals'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { 
  CalendarIcon, 
  ExclamationTriangleIcon,
  HeartIcon,
  PencilIcon
} from '@heroicons/react/24/outline'
import { calculateAge, formatWeight } from '@/lib/schemas/animal-intake'
import type { MedicalItem } from '@/lib/schemas/animal-intake'
import { DemoAnimalComments } from '@/components/features/comments/demo-animal-comments'
import { Link } from '@/components/ui/link'
import { ChevronLeftIcon } from '@heroicons/react/16/solid'
import { Divider } from '@/components/ui/divider'
import { Subheading } from '@/components/ui/heading'
import { DescriptionDetails, DescriptionList, DescriptionTerm } from '@/components/ui/description-list'
import { AnimalDetailClient } from './animal-detail-client'
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
    { name: 'Activity & Comments', value: 'activity' },
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
              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Age: {animal.date_of_birth ? calculateAge(animal.date_of_birth) : 'Unknown'}
                </span>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Weight: {formatWeight(animal.weight_kg)}
                </span>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Owner: <Link href={`/customers/${animal.owner.id}`} className="hover:underline">
                    {animal.owner.first_name} {animal.owner.last_name}
                  </Link>
                </span>
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-col-reverse justify-stretch space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-y-0 sm:space-x-3 sm:space-x-reverse md:mt-0 md:flex-row md:space-x-3">
            <Button outline>
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button color="indigo">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Schedule Appointment
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mt-8">
        <AnimalDetailClient
          animalId={id}
          activeTab={activeTab}
          tabs={tabs}
        />
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        {activeTab === 'basic-info' && (
          <>
            <Subheading>Basic Information</Subheading>
            <Divider className="mt-4" />
            
            <DescriptionList className="mt-6">
              <DescriptionTerm>Full Name</DescriptionTerm>
              <DescriptionDetails>{animal.name}</DescriptionDetails>
              
              <DescriptionTerm>Species</DescriptionTerm>
              <DescriptionDetails>{animal.species}</DescriptionDetails>
              
              <DescriptionTerm>Breed</DescriptionTerm>
              <DescriptionDetails>{animal.breed || 'Unknown'}</DescriptionDetails>
              
              <DescriptionTerm>Color</DescriptionTerm>
              <DescriptionDetails>{animal.color || 'Not specified'}</DescriptionDetails>
              
              <DescriptionTerm>Gender</DescriptionTerm>
              <DescriptionDetails>{animal.gender || 'Unknown'}</DescriptionDetails>
              
              <DescriptionTerm>Date of Birth</DescriptionTerm>
              <DescriptionDetails>
                {animal.date_of_birth ? new Date(animal.date_of_birth).toLocaleDateString() : 'Unknown'}
              </DescriptionDetails>
              
              <DescriptionTerm>Weight</DescriptionTerm>
              <DescriptionDetails>{formatWeight(animal.weight_kg)}</DescriptionDetails>
              
              {animal.microchip_id && (
                <>
                  <DescriptionTerm>Microchip ID</DescriptionTerm>
                  <DescriptionDetails className="font-mono">{animal.microchip_id}</DescriptionDetails>
                </>
              )}
              
              <DescriptionTerm>Owner</DescriptionTerm>
              <DescriptionDetails>
                <Link href={`/customers/${animal.owner.id}`} className="hover:underline">
                  {animal.owner.first_name} {animal.owner.last_name}
                </Link>
              </DescriptionDetails>
              
              <DescriptionTerm>Owner Email</DescriptionTerm>
              <DescriptionDetails>{animal.owner.email}</DescriptionDetails>
              
              {animal.owner.phone && (
                <>
                  <DescriptionTerm>Owner Phone</DescriptionTerm>
                  <DescriptionDetails>{animal.owner.phone}</DescriptionDetails>
                </>
              )}
              
              {animal.insurance_provider && (
                <>
                  <DescriptionTerm>Insurance Provider</DescriptionTerm>
                  <DescriptionDetails>{animal.insurance_provider}</DescriptionDetails>
                </>
              )}
              
              {animal.insurance_policy_number && (
                <>
                  <DescriptionTerm>Policy Number</DescriptionTerm>
                  <DescriptionDetails className="font-mono">{animal.insurance_policy_number}</DescriptionDetails>
                </>
              )}
              
              {animal.behavioral_notes && (
                <>
                  <DescriptionTerm>Behavioral Notes</DescriptionTerm>
                  <DescriptionDetails className="whitespace-pre-wrap">{animal.behavioral_notes}</DescriptionDetails>
                </>
              )}
              
              {animal.dietary_requirements && (
                <>
                  <DescriptionTerm>Dietary Requirements</DescriptionTerm>
                  <DescriptionDetails className="whitespace-pre-wrap">{animal.dietary_requirements}</DescriptionDetails>
                </>
              )}
              
              <DescriptionTerm>Record Created</DescriptionTerm>
              <DescriptionDetails>{new Date(animal.created_at).toLocaleDateString()}</DescriptionDetails>
              
              <DescriptionTerm>Last Updated</DescriptionTerm>
              <DescriptionDetails>{new Date(animal.updated_at).toLocaleDateString()}</DescriptionDetails>
            </DescriptionList>
          </>
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

        {activeTab === 'activity' && (
          <>
            <Subheading>Activity & Comments</Subheading>
            <Divider className="mt-4" />
            <div className="mt-6">
              <DemoAnimalComments animalId={animal.id} />
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