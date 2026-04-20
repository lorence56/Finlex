import { NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'
import { getCurrentDbUser } from '@/lib/get-current-db-user'

export async function POST(request: Request) {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { email, role } = await request.json()

  if (!email || !role) {
    return NextResponse.json(
      { error: 'Email and role are required' },
      { status: 400 }
    )
  }

  try {
    const client = await clerkClient()

    // Create an invitation in Clerk
    // We store tenantId and intended role in publicMetadata
    await client.invitations.createInvitation({
      emailAddress: email,
      publicMetadata: {
        tenantId: dbUser.tenantId,
        role: role,
      },
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sign-up`,
      ignoreExisting: true,
    })

    return NextResponse.json({ message: 'Invitation sent successfully' })
  } catch (err) {
    console.error('Invitation error:', err)
    return NextResponse.json(
      { error: 'Failed to send invitation' },
      { status: 500 }
    )
  }
}
