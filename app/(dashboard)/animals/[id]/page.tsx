import { notFound } from 'next/navigation'
import { getAnimalById } from '@/server/queries/animals'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
 
  CalendarIcon, 
  ScaleIcon, 
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  HeartIcon,
  PencilIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { calculateAge, formatWeight } from '@/lib/schemas/animal-intake'
import type { MedicalItem } from '@/lib/schemas/animal-intake'

export default async function AnimalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl/7 font-bold text-zinc-950 dark:text-white sm:text-3xl sm:tracking-tight">
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
        </div>
        <div className="mt-4 flex gap-3 md:mt-0 md:ml-4">
          <Button outline>
            <PencilIcon className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button>View Medical Records</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HeartIcon className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Species</dt>
                  <dd className="text-sm font-semibold text-gray-900">{animal.species}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Breed</dt>
                  <dd className="text-sm font-semibold text-gray-900">{animal.breed || 'Unknown'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Color</dt>
                  <dd className="text-sm font-semibold text-gray-900">{animal.color || 'Not specified'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Gender</dt>
                  <dd className="text-sm font-semibold text-gray-900">{animal.gender || 'Unknown'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Age</dt>
                  <dd className="text-sm font-semibold text-gray-900">
                    {animal.date_of_birth ? calculateAge(animal.date_of_birth) : 'Unknown'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Weight</dt>
                  <dd className="text-sm font-semibold text-gray-900">
                    {formatWeight(animal.weight_kg)}
                  </dd>
                </div>
              </div>
              
              {animal.microchip_id && (
                <>
                  <Separator />
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Microchip ID</dt>
                    <dd className="text-sm font-semibold text-gray-900 font-mono">{animal.microchip_id}</dd>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Owner Information */}
          <Card>
            <CardHeader>
              <CardTitle>Owner Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="text-sm font-semibold text-gray-900">
                    <Link href={`/customers/${animal.owner.id}`} className="hover:underline">
                      {animal.owner.first_name} {animal.owner.last_name}
                    </Link>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="text-sm font-semibold text-gray-900">{animal.owner.email}</dd>
                </div>
                {animal.owner.phone && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                    <dd className="text-sm font-semibold text-gray-900">{animal.owner.phone}</dd>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Medical Information */}
          {(allergies.length > 0 || medicalConditions.length > 0 || medications.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HeartIcon className="h-5 w-5" />
                  Medical Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Allergies */}
                {allergies.length > 0 && (
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-3">
                      <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                      Allergies
                    </h4>
                    <div className="space-y-2">
                      {allergies.map((allergy, index) => (
                        <div key={index} className="border rounded-lg p-3 bg-red-50">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-red-800">{allergy.name}</span>
                            {allergy.severity && (
                              <Badge color={allergy.severity === 'Severe' ? 'red' : 'zinc'}>
                                {allergy.severity}
                              </Badge>
                            )}
                          </div>
                          {allergy.notes && (
                            <p className="text-sm text-red-600 mt-1">{allergy.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Medical Conditions */}
                {medicalConditions.length > 0 && (
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-3">
                      <HeartIcon className="h-4 w-4 text-orange-500" />
                      Medical Conditions
                    </h4>
                    <div className="space-y-2">
                      {medicalConditions.map((condition, index) => (
                        <div key={index} className="border rounded-lg p-3 bg-orange-50">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-orange-800">{condition.name}</span>
                            {condition.date_diagnosed && (
                              <span className="text-sm text-orange-600">
                                Diagnosed: {new Date(condition.date_diagnosed).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          {condition.notes && (
                            <p className="text-sm text-orange-600 mt-1">{condition.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Medications */}
                {medications.length > 0 && (
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-3">
                      <HeartIcon className="h-4 w-4 text-blue-500" />
                      Current Medications
                    </h4>
                    <div className="space-y-2">
                      {medications.map((medication, index) => (
                        <div key={index} className="border rounded-lg p-3 bg-blue-50">
                          <span className="font-medium text-blue-800">{medication.name}</span>
                          {medication.notes && (
                            <p className="text-sm text-blue-600 mt-1">{medication.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Insurance Information */}
          {(animal.insurance_provider || animal.insurance_policy_number) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheckIcon className="h-5 w-5" />
                  Insurance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {animal.insurance_provider && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Provider</dt>
                    <dd className="text-sm font-semibold text-gray-900">{animal.insurance_provider}</dd>
                  </div>
                )}
                {animal.insurance_policy_number && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Policy Number</dt>
                    <dd className="text-sm font-semibold text-gray-900 font-mono">{animal.insurance_policy_number}</dd>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Additional Notes */}
          {(animal.behavioral_notes || animal.dietary_requirements) && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {animal.behavioral_notes && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Behavioral Notes</dt>
                    <dd className="text-sm text-gray-900 whitespace-pre-wrap">{animal.behavioral_notes}</dd>
                  </div>
                )}
                {animal.dietary_requirements && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Dietary Requirements</dt>
                    <dd className="text-sm text-gray-900 whitespace-pre-wrap">{animal.dietary_requirements}</dd>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" outline>
                <CalendarIcon className="h-4 w-4 mr-2" />
                Schedule Appointment
              </Button>
              <Button className="w-full" outline>
                <HeartIcon className="h-4 w-4 mr-2" />
                View Medical History
              </Button>
              <Button className="w-full" outline>
                <ScaleIcon className="h-4 w-4 mr-2" />
                Update Weight
              </Button>
            </CardContent>
          </Card>

          {/* Meta Information */}
          <Card>
            <CardHeader>
              <CardTitle>Record Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="text-sm text-gray-900">
                  {new Date(animal.created_at).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="text-sm text-gray-900">
                  {new Date(animal.updated_at).toLocaleDateString()}
                </dd>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}