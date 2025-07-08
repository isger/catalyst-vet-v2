import { describe, it, expect } from 'vitest'
import { 
  customerIntakeSchema, 
  addressSchema, 
  phoneSchema, 
  emailSchema, 
  titleSchema,
  personalInfoSchema,
  addressPreferencesSchema,
  consentNotesSchema,
  formatPhoneNumber,
  getEmailSuggestion
} from '../customer-intake'

describe('Customer Intake Schema', () => {
  describe('addressSchema', () => {
    it('should validate valid address', () => {
      const validAddress = {
        street: '123 Main St',
        city: 'Anytown',
        state: 'NY',
        zipCode: '12345',
        country: 'US'
      }

      const result = addressSchema.parse(validAddress)
      expect(result).toEqual(validAddress)
    })

    it('should use default country US', () => {
      const address = {
        street: '123 Main St',
        city: 'Anytown',
        state: 'NY',
        zipCode: '12345'
      }

      const result = addressSchema.parse(address)
      expect(result.country).toBe('US')
    })

    it('should reject invalid state length', () => {
      const invalidAddress = {
        street: '123 Main St',
        city: 'Anytown',
        state: 'NEW',
        zipCode: '12345'
      }

      expect(() => addressSchema.parse(invalidAddress)).toThrow('State must be 2 characters')
    })

    it('should reject short ZIP code', () => {
      const invalidAddress = {
        street: '123 Main St',
        city: 'Anytown',
        state: 'NY',
        zipCode: '123'
      }

      expect(() => addressSchema.parse(invalidAddress)).toThrow('ZIP code must be at least 5 characters')
    })

    it('should reject missing required fields', () => {
      expect(() => addressSchema.parse({ street: '123 Main St' })).toThrow('City is required')
      expect(() => addressSchema.parse({ street: '', city: 'Anytown' })).toThrow('Street address is required')
    })
  })

  describe('phoneSchema', () => {
    it('should validate and format valid phone numbers', () => {
      const validPhones = [
        '(555) 123-4567',
        '555-123-4567',
        '555.123.4567',
        '5551234567',
        '+1 555 123 4567'
      ]

      validPhones.forEach(phone => {
        const result = phoneSchema.parse(phone)
        expect(result).toBe('15551234567')
      })
    })

    it('should handle phone number without country code', () => {
      const result = phoneSchema.parse('555-123-4567')
      expect(result).toBe('5551234567')
    })

    it('should reject invalid phone formats', () => {
      const invalidPhones = [
        'abc-def-ghij',
        '123',
        '555-123-456a',
        ''
      ]

      invalidPhones.forEach(phone => {
        expect(() => phoneSchema.parse(phone)).toThrow()
      })
    })

    it('should reject short phone numbers', () => {
      expect(() => phoneSchema.parse('123456789')).toThrow('Phone number must be at least 10 digits')
    })
  })

  describe('emailSchema', () => {
    it('should validate valid email addresses', () => {
      const validEmails = [
        'user@example.com',
        'test.email@domain.org',
        'user+tag@example.com'
      ]

      validEmails.forEach(email => {
        const result = emailSchema.parse(email)
        expect(result).toBe(email.toLowerCase())
      })
    })

    it('should convert email to lowercase', () => {
      const result = emailSchema.parse('USER@EXAMPLE.COM')
      expect(result).toBe('user@example.com')
    })

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user..name@example.com',
        ''
      ]

      invalidEmails.forEach(email => {
        expect(() => emailSchema.parse(email)).toThrow()
      })
    })
  })

  describe('titleSchema', () => {
    it('should validate valid titles', () => {
      const validTitles = ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.', 'Rev.']

      validTitles.forEach(title => {
        const result = titleSchema.parse(title)
        expect(result).toBe(title)
      })
    })

    it('should allow undefined', () => {
      const result = titleSchema.parse(undefined)
      expect(result).toBeUndefined()
    })

    it('should reject invalid titles', () => {
      expect(() => titleSchema.parse('Sir')).toThrow()
      expect(() => titleSchema.parse('Captain')).toThrow()
    })
  })

  describe('customerIntakeSchema', () => {
    const validCustomerData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '555-123-4567',
      address: {
        street: '123 Main St',
        city: 'Anytown',
        state: 'NY',
        zipCode: '12345'
      },
      gdprConsent: true
    }

    it('should validate complete valid customer data', () => {
      const result = customerIntakeSchema.parse(validCustomerData)
      expect(result).toMatchObject({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '5551234567',
        gdprConsent: true
      })
    })

    it('should validate with optional fields', () => {
      const dataWithOptionals = {
        ...validCustomerData,
        title: 'Dr.',
        preferredPractice: 'Main Clinic',
        additionalNotes: 'Prefers morning appointments',
        marketingConsent: true,
        emergencyContact: {
          name: 'Jane Doe',
          phone: '555-987-6543',
          relationship: 'Spouse'
        }
      }

      const result = customerIntakeSchema.parse(dataWithOptionals)
      expect(result.title).toBe('Dr.')
      expect(result.preferredPractice).toBe('Main Clinic')
      expect(result.marketingConsent).toBe(true)
    })

    it('should reject invalid name formats', () => {
      const invalidNames = [
        { firstName: 'J' }, // Too short
        { firstName: 'John123' }, // Contains numbers
        { lastName: 'Doe@' }, // Invalid characters
        { firstName: 'A'.repeat(51) } // Too long
      ]

      invalidNames.forEach(nameOverride => {
        const invalidData = { ...validCustomerData, ...nameOverride }
        expect(() => customerIntakeSchema.parse(invalidData)).toThrow()
      })
    })

    it('should require GDPR consent', () => {
      const dataWithoutConsent = {
        ...validCustomerData,
        gdprConsent: false
      }

      expect(() => customerIntakeSchema.parse(dataWithoutConsent)).toThrow('You must consent to data processing')
    })

    it('should validate emergency contact fields', () => {
      const dataWithEmergencyContact = {
        ...validCustomerData,
        emergencyContact: {
          name: 'A'.repeat(101), // Too long
          phone: '555-123-4567',
          relationship: 'Spouse'
        }
      }

      expect(() => customerIntakeSchema.parse(dataWithEmergencyContact)).toThrow('Emergency contact name must not exceed 100 characters')
    })

    it('should validate additional notes length', () => {
      const dataWithLongNotes = {
        ...validCustomerData,
        additionalNotes: 'A'.repeat(501)
      }

      expect(() => customerIntakeSchema.parse(dataWithLongNotes)).toThrow('Additional notes must not exceed 500 characters')
    })

    it('should default marketingConsent to false', () => {
      const result = customerIntakeSchema.parse(validCustomerData)
      expect(result.marketingConsent).toBe(false)
    })
  })

  describe('Step schemas', () => {
    it('should validate personalInfoSchema', () => {
      const personalInfo = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '555-123-4567'
      }

      const result = personalInfoSchema.parse(personalInfo)
      expect(result).toMatchObject({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '5551234567'
      })
    })

    it('should validate addressPreferencesSchema', () => {
      const addressPreferences = {
        address: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'NY',
          zipCode: '12345'
        },
        preferredPractice: 'Main Clinic'
      }

      const result = addressPreferencesSchema.parse(addressPreferences)
      expect(result.address.street).toBe('123 Main St')
      expect(result.preferredPractice).toBe('Main Clinic')
    })

    it('should validate consentNotesSchema', () => {
      const consentNotes = {
        gdprConsent: true,
        marketingConsent: false,
        additionalNotes: 'No special notes'
      }

      const result = consentNotesSchema.parse(consentNotes)
      expect(result).toEqual(consentNotes)
    })
  })

  describe('Helper functions', () => {
    describe('formatPhoneNumber', () => {
      it('should format 10-digit phone numbers correctly', () => {
        expect(formatPhoneNumber('5551234567')).toBe('(555) 123-4567')
        expect(formatPhoneNumber('555-123-4567')).toBe('(555) 123-4567')
        expect(formatPhoneNumber('(555) 123-4567')).toBe('(555) 123-4567')
      })

      it('should return unformatted for non-10-digit numbers', () => {
        expect(formatPhoneNumber('123456789')).toBe('123456789')
        expect(formatPhoneNumber('12345678901')).toBe('12345678901')
        expect(formatPhoneNumber('invalid')).toBe('invalid')
      })
    })

    describe('getEmailSuggestion', () => {
      it('should suggest corrections for common domains', () => {
        expect(getEmailSuggestion('user@gmial.com')).toBe('user@gmail.com')
        expect(getEmailSuggestion('user@yahooo.com')).toBe('user@yahoo.com')
        expect(getEmailSuggestion('user@outlok.com')).toBe('user@outlook.com')
      })

      it('should return null for valid emails', () => {
        expect(getEmailSuggestion('user@gmail.com')).toBeNull()
        expect(getEmailSuggestion('user@yahoo.com')).toBeNull()
        expect(getEmailSuggestion('user@example.com')).toBeNull()
      })

      it('should return null for invalid email formats', () => {
        expect(getEmailSuggestion('invalid-email')).toBeNull()
        expect(getEmailSuggestion('user@')).toBeNull()
        expect(getEmailSuggestion('@domain.com')).toBeNull()
      })

      it('should handle case insensitive matching', () => {
        expect(getEmailSuggestion('user@GMIAL.COM')).toBe('user@gmail.com')
        expect(getEmailSuggestion('user@Gmail.COM')).toBeNull()
      })
    })
  })
})