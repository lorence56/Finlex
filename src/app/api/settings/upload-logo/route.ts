import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { getCurrentDbUser } from '@/lib/get-current-db-user'

export async function POST(request: Request) {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const file = await request.blob()
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  try {
    const filename = `logos/${dbUser.tenantId}-${Date.now()}.png`
    const blob = await put(filename, file, {
      access: 'public',
    })

    return NextResponse.json({ url: blob.url })
  } catch (err) {
    console.error('Logo upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
