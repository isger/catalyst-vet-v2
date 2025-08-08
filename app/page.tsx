import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SignInForm } from '@/components/features/auth/sign-in-form'
import { Logo } from "@/app/logo";
import { Heading } from '@/components/ui/heading';
import { Text, TextLink } from '@/components/ui/text';

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // If user is authenticated, redirect to dashboard
  if (user) {
    redirect('/dashboard')
  }

  return (
    <main className="flex min-h-dvh flex-col p-2">
      <div className="flex grow items-center justify-center p-6 lg:rounded-lg lg:bg-white lg:p-10 lg:shadow-xs lg:ring-1 lg:ring-zinc-950/5 dark:lg:bg-zinc-900 dark:lg:ring-white/10">
        <div className="grid w-full max-w-sm grid-cols-1 gap-8">
          <Logo className="h-6 text-zinc-950 dark:text-white forced-colors:text-[CanvasText]" />
          <Heading>Sign in to your account</Heading>
          <SignInForm />
          <Text>
            Don&apos;t have an account?{' '}
            <TextLink href="/signup">
              <b>Sign up</b>
            </TextLink>
          </Text>
        </div>
      </div>
    </main>
  );
}
