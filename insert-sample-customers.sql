-- EXECUTE THIS SQL IN YOUR SUPABASE DASHBOARD SQL EDITOR
-- Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql

-- First, check if you have any existing tenants
-- If you have existing tenants, replace 'sample-tenant-001' with an existing tenant ID
-- You can check with: SELECT id FROM tenant LIMIT 5;

-- Insert sample tenant (skip if you already have tenants)
INSERT INTO tenant (id, name, subdomain, settings, created_at, updated_at) 
VALUES (
  'sample-tenant-001',
  'Catalyst Veterinary Clinic',
  'catalyst-vet',
  '{"businessHours": {"monday": "8:00-18:00", "tuesday": "8:00-18:00"}}',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Insert Sample Owners (Customers)
INSERT INTO owner (id, first_name, last_name, email, phone, address, tenant_id, created_at, updated_at) VALUES
('owner-001', 'Sarah', 'Johnson', 'sarah.johnson@email.com', '555-0123', 
 '{"street": "123 Maple Street", "city": "Springfield", "state": "CA", "zipCode": "90210"}', 
 'sample-tenant-001', NOW() - INTERVAL '45 days', NOW()),
 
('owner-002', 'Mike', 'Chen', 'mike.chen@email.com', '555-0456', 
 '{"street": "456 Oak Avenue", "city": "Springfield", "state": "CA", "zipCode": "90211"}', 
 'sample-tenant-001', NOW() - INTERVAL '60 days', NOW()),
 
('owner-003', 'Emma', 'Davis', 'emma.davis@email.com', '555-0789', 
 '{"street": "789 Pine Road", "city": "Springfield", "state": "CA", "zipCode": "90212"}', 
 'sample-tenant-001', NOW() - INTERVAL '30 days', NOW()),
 
('owner-004', 'Alex', 'Rodriguez', 'alex.rodriguez@email.com', '555-0321', 
 '{"street": "321 Birch Lane", "city": "Springfield", "state": "CA", "zipCode": "90213"}', 
 'sample-tenant-001', NOW() - INTERVAL '90 days', NOW()),
 
('owner-005', 'Lisa', 'Park', 'lisa.park@email.com', '555-0654', 
 '{"street": "654 Cedar Drive", "city": "Springfield", "state": "CA", "zipCode": "90214"}', 
 'sample-tenant-001', NOW() - INTERVAL '20 days', NOW());

-- Insert Sample Patients (Pets)
INSERT INTO patient (id, name, species, breed, date_of_birth, owner_id, microchip_id, tenant_id, created_at, updated_at) VALUES
-- Sarah Johnson's pet
('patient-001', 'Max', 'Dog', 'Golden Retriever', '2020-03-15', 'owner-001', 'MC001234567890', 'sample-tenant-001', NOW() - INTERVAL '45 days', NOW()),

-- Mike Chen's pets  
('patient-002', 'Luna', 'Cat', 'Persian', '2019-08-22', 'owner-002', 'MC001234567891', 'sample-tenant-001', NOW() - INTERVAL '60 days', NOW()),
('patient-003', 'Shadow', 'Cat', 'Persian', '2021-01-10', 'owner-002', 'MC001234567892', 'sample-tenant-001', NOW() - INTERVAL '55 days', NOW()),

-- Emma Davis's pet
('patient-004', 'Charlie', 'Dog', 'Beagle Mix', '2018-11-05', 'owner-003', 'MC001234567893', 'sample-tenant-001', NOW() - INTERVAL '30 days', NOW()),

-- Alex Rodriguez's pet
('patient-005', 'Kiwi', 'Bird', 'Cockatiel', '2020-07-12', 'owner-004', NULL, 'sample-tenant-001', NOW() - INTERVAL '90 days', NOW()),

-- Lisa Park's pets
('patient-006', 'Bella', 'Dog', 'Labrador', '2019-04-18', 'owner-005', 'MC001234567894', 'sample-tenant-001', NOW() - INTERVAL '20 days', NOW()),
('patient-007', 'Whiskers', 'Cat', 'Maine Coon', '2020-12-03', 'owner-005', 'MC001234567895', 'sample-tenant-001', NOW() - INTERVAL '18 days', NOW());

-- Insert Recent Appointments (to make customers "active")
-- Note: You may need to replace 'vet-001' with an actual user ID from your user table
-- Check existing users with: SELECT id FROM "user" LIMIT 5;
INSERT INTO appointment (id, patient_id, veterinarian_id, scheduled_at, duration, type, status, notes, tenant_id, created_at, updated_at) VALUES
('appt-001', 'patient-001', 'vet-001', NOW() - INTERVAL '3 days', 60, 'Annual Checkup', 'completed', 'Routine annual examination. Patient in good health.', 'sample-tenant-001', NOW() - INTERVAL '10 days', NOW()),

('appt-002', 'patient-002', 'vet-001', NOW() - INTERVAL '7 days', 45, 'Vaccination', 'completed', 'Updated vaccinations. No adverse reactions.', 'sample-tenant-001', NOW() - INTERVAL '14 days', NOW()),

('appt-003', 'patient-004', 'vet-001', NOW() - INTERVAL '5 days', 30, 'Follow-up', 'completed', 'Follow-up for previous treatment. Healing well.', 'sample-tenant-001', NOW() - INTERVAL '12 days', NOW()),

('appt-004', 'patient-006', 'vet-001', NOW() - INTERVAL '2 days', 90, 'Surgery', 'completed', 'Spay surgery completed successfully.', 'sample-tenant-001', NOW() - INTERVAL '7 days', NOW()),

('appt-005', 'patient-007', 'vet-001', NOW() - INTERVAL '1 day', 30, 'Checkup', 'completed', 'Routine checkup. Healthy and active.', 'sample-tenant-001', NOW() - INTERVAL '5 days', NOW());

-- Verify the data was inserted
SELECT 
  o.first_name, 
  o.last_name, 
  COUNT(p.id) as pet_count,
  MAX(a.scheduled_at) as last_appointment
FROM owner o
LEFT JOIN patient p ON o.id = p.owner_id
LEFT JOIN appointment a ON p.id = a.patient_id AND a.status = 'completed'
WHERE o.id LIKE 'owner-%'
GROUP BY o.id, o.first_name, o.last_name
ORDER BY last_appointment DESC;