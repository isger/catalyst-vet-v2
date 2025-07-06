-- Sample data for Catalyst Veterinary Management System
-- This will create active customers with pets and recent appointments

-- First, let's create a sample tenant (or use existing one)
-- You may need to update the tenantId values to match your existing tenant

-- Sample tenant (update the ID as needed)
INSERT INTO "Tenant" (id, name, subdomain, settings, "createdAt", "updatedAt") 
VALUES (
  'tenant-catalyst-vet',
  'Catalyst Veterinary Clinic',
  'catalyst-vet',
  '{"businessHours": {"monday": "8:00-18:00", "tuesday": "8:00-18:00"}}',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Sample Owners (Customers)
INSERT INTO "Owner" (id, "firstName", "lastName", email, phone, address, "tenantId", "createdAt", "updatedAt") VALUES
(
  'owner-1',
  'Sarah',
  'Johnson',
  'sarah.johnson@email.com',
  '555-0123',
  '{"street": "123 Maple Street", "city": "Springfield", "state": "CA", "zipCode": "90210"}',
  'tenant-catalyst-vet',
  NOW() - INTERVAL '45 days',
  NOW()
),
(
  'owner-2',
  'Mike',
  'Chen',
  'mike.chen@email.com',
  '555-0456',
  '{"street": "456 Oak Avenue", "city": "Springfield", "state": "CA", "zipCode": "90211"}',
  'tenant-catalyst-vet',
  NOW() - INTERVAL '60 days',
  NOW()
),
(
  'owner-3',
  'Emma',
  'Davis',
  'emma.davis@email.com',
  '555-0789',
  '{"street": "789 Pine Road", "city": "Springfield", "state": "CA", "zipCode": "90212"}',
  'tenant-catalyst-vet',
  NOW() - INTERVAL '30 days',
  NOW()
),
(
  'owner-4',
  'Alex',
  'Rodriguez',
  'alex.rodriguez@email.com',
  '555-0321',
  '{"street": "321 Birch Lane", "city": "Springfield", "state": "CA", "zipCode": "90213"}',
  'tenant-catalyst-vet',
  NOW() - INTERVAL '90 days',
  NOW()
),
(
  'owner-5',
  'Lisa',
  'Park',
  'lisa.park@email.com',
  '555-0654',
  '{"street": "654 Cedar Drive", "city": "Springfield", "state": "CA", "zipCode": "90214"}',
  'tenant-catalyst-vet',
  NOW() - INTERVAL '20 days',
  NOW()
),
(
  'owner-6',
  'James',
  'Wilson',
  'james.wilson@email.com',
  '555-0987',
  '{"street": "987 Elm Street", "city": "Springfield", "state": "CA", "zipCode": "90215"}',
  'tenant-catalyst-vet',
  NOW() - INTERVAL '75 days',
  NOW()
);

-- Sample Patients (Pets)
INSERT INTO "Patient" (id, name, species, breed, "dateOfBirth", "ownerId", "microchipId", "tenantId", "createdAt", "updatedAt") VALUES
-- Sarah Johnson's pets
(
  'patient-1',
  'Max',
  'Dog',
  'Golden Retriever',
  '2020-03-15',
  'owner-1',
  'MC001234567890',
  'tenant-catalyst-vet',
  NOW() - INTERVAL '45 days',
  NOW()
),
-- Mike Chen's pets
(
  'patient-2',
  'Luna',
  'Cat',
  'Persian',
  '2019-08-22',
  'owner-2',
  'MC001234567891',
  'tenant-catalyst-vet',
  NOW() - INTERVAL '60 days',
  NOW()
),
(
  'patient-3',
  'Shadow',
  'Cat',
  'Persian',
  '2021-01-10',
  'owner-2',
  'MC001234567892',
  'tenant-catalyst-vet',
  NOW() - INTERVAL '55 days',
  NOW()
),
-- Emma Davis's pet
(
  'patient-4',
  'Charlie',
  'Dog',
  'Beagle Mix',
  '2018-11-05',
  'owner-3',
  'MC001234567893',
  'tenant-catalyst-vet',
  NOW() - INTERVAL '30 days',
  NOW()
),
-- Alex Rodriguez's pet
(
  'patient-5',
  'Kiwi',
  'Bird',
  'Cockatiel',
  '2020-07-12',
  'owner-4',
  NULL,
  'tenant-catalyst-vet',
  NOW() - INTERVAL '90 days',
  NOW()
),
-- Lisa Park's pets
(
  'patient-6',
  'Bella',
  'Dog',
  'Labrador',
  '2019-04-18',
  'owner-5',
  'MC001234567894',
  'tenant-catalyst-vet',
  NOW() - INTERVAL '20 days',
  NOW()
),
(
  'patient-7',
  'Whiskers',
  'Cat',
  'Maine Coon',
  '2020-12-03',
  'owner-5',
  'MC001234567895',
  'tenant-catalyst-vet',
  NOW() - INTERVAL '18 days',
  NOW()
),
-- James Wilson's pet
(
  'patient-8',
  'Rocky',
  'Dog',
  'German Shepherd',
  '2017-09-25',
  'owner-6',
  'MC001234567896',
  'tenant-catalyst-vet',
  NOW() - INTERVAL '75 days',
  NOW()
);

-- Sample Appointments (Recent ones to make customers "active")
INSERT INTO "Appointment" (id, "patientId", "veterinarianId", "scheduledAt", duration, type, status, notes, "tenantId", "createdAt", "updatedAt") VALUES
-- Recent completed appointments
(
  'appt-1',
  'patient-1',
  'vet-1',
  NOW() - INTERVAL '3 days',
  60,
  'Annual Checkup',
  'completed',
  'Routine annual examination. Patient in good health.',
  'tenant-catalyst-vet',
  NOW() - INTERVAL '10 days',
  NOW()
),
(
  'appt-2',
  'patient-2',
  'vet-1',
  NOW() - INTERVAL '7 days',
  45,
  'Vaccination',
  'completed',
  'Updated vaccinations. No adverse reactions.',
  'tenant-catalyst-vet',
  NOW() - INTERVAL '14 days',
  NOW()
),
(
  'appt-3',
  'patient-4',
  'vet-1',
  NOW() - INTERVAL '5 days',
  30,
  'Follow-up',
  'completed',
  'Follow-up for previous treatment. Healing well.',
  'tenant-catalyst-vet',
  NOW() - INTERVAL '12 days',
  NOW()
),
(
  'appt-4',
  'patient-6',
  'vet-1',
  NOW() - INTERVAL '2 days',
  90,
  'Surgery',
  'completed',
  'Spay surgery completed successfully.',
  'tenant-catalyst-vet',
  NOW() - INTERVAL '7 days',
  NOW()
),
(
  'appt-5',
  'patient-7',
  'vet-1',
  NOW() - INTERVAL '1 day',
  30,
  'Checkup',
  'completed',
  'Routine checkup. Healthy and active.',
  'tenant-catalyst-vet',
  NOW() - INTERVAL '5 days',
  NOW()
),
(
  'appt-6',
  'patient-3',
  'vet-1',
  NOW() - INTERVAL '10 days',
  45,
  'Dental Cleaning',
  'completed',
  'Dental cleaning completed. Good oral health.',
  'tenant-catalyst-vet',
  NOW() - INTERVAL '15 days',
  NOW()
),
-- Some upcoming appointments
(
  'appt-7',
  'patient-5',
  'vet-1',
  NOW() + INTERVAL '3 days',
  30,
  'Wellness Check',
  'scheduled',
  'Scheduled wellness check for Kiwi.',
  'tenant-catalyst-vet',
  NOW() - INTERVAL '2 days',
  NOW()
),
(
  'appt-8',
  'patient-8',
  'vet-1',
  NOW() + INTERVAL '7 days',
  60,
  'Annual Checkup',
  'scheduled',
  'Annual checkup for Rocky.',
  'tenant-catalyst-vet',
  NOW() - INTERVAL '1 day',
  NOW()
);

-- Note: You may need to update the tenantId and veterinarianId values to match your existing data
-- You can check existing tenant IDs with: SELECT id FROM "Tenant";
-- You may also need to create a veterinarian user or update the veterinarianId references