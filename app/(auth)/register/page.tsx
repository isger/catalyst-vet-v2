'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Logo } from '@/app/logo'
import { Button } from '@/components/ui/button'
import { Field, Label } from '@/components/ui/fieldset'
import { Heading } from '@/components/ui/heading'
import { Input } from '@/components/ui/input'
import { Strong, Text, TextLink } from '@/components/ui/text'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [subdomain, setSubdomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, subdomain }),
      })

      if (res.ok) {
        router.push('/login')
      } else {
        const data = await res.json()
        setError(data.message || 'Registration failed')
      }
    } catch (error) {
      setError('An error occurred during registration')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid w-full max-w-sm grid-cols-1 gap-8">
      <Logo className="h-6 text-zinc-950 dark:text-white forced-colors:text-[CanvasText]" />
      <Heading>Create your account</Heading>
      
      {error && (
        <div className="rounded-md bg-red-50 p-4 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
          <div className="text-sm text-red-800 dark:text-red-200">
            {error}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
        <Field>
          <Label>Company Name</Label>
          <Input 
            type="text" 
            name="subdomain"
            placeholder="acme-inc"
            value={subdomain}
            onChange={(e) => setSubdomain(e.target.value)}
            required
            disabled={loading}
          />
        </Field>
        <Field>
          <Label>Full Name</Label>
          <Input 
            type="text" 
            name="name" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
          />
        </Field>
        <Field>
          <Label>Email</Label>
          <Input 
            type="email" 
            name="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </Field>
        <Field>
          <Label>Password</Label>
          <Input 
            type="password" 
            name="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </Field>
        <Button type="submit" className="w-full btn-primary" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </Button>
      </form>

      <Text>
        Already have an account?{' '}
        <TextLink href="/login">
          <Strong>Sign in</Strong>
        </TextLink>
      </Text>
    </div>
  )
}