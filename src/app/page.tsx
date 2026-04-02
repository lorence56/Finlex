import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { LandingExperience } from '@/components/marketing/LandingExperience'

export default async function HomePage() {
  const { userId } = await auth()

  if (userId) {
    redirect('/dashboard')
  }

  return <LandingExperience />
}
