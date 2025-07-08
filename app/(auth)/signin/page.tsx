import { SignInForm } from '@/components/features/auth/sign-in-form'
import { Logo } from "@/app/logo";
import { Heading } from '@/components/ui/heading';
import { Text, TextLink } from '@/components/ui/text';

export default function SignInPage() {
  return (
    <div className="grid w-full max-w-sm grid-cols-1 gap-8">
      <Logo className="h-6 text-zinc-950 dark:text-white forced-colors:text-[CanvasText]" />
      <Heading>Sign in to your account</Heading>
      <SignInForm />
      <Text>
        Don’t have an account?{' '}
        <TextLink href="/register">
          <b>Sign up</b>
        </TextLink>
      </Text>
    </div>
  )
}