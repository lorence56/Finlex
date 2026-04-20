'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Loader2, Save, UserCog } from 'lucide-react'
import { BackButton } from '@/components/ui/BackButton'
import { PageHeader } from '@/components/ui/PageHeader'
import { SurfaceCard } from '@/components/ui/SurfaceCard'

export default function ProfileSettingsPage() {
  const { user, isLoaded } = useUser()
  const [fullName, setFullName] = useState(user?.fullName || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  if (!isLoaded) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" />
      </div>
    )
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      // 1. Update Clerk
      const [firstName, ...lastNameParts] = fullName.split(' ')
      const lastName = lastNameParts.join(' ')

      await user?.update({
        firstName,
        lastName: lastName || undefined,
      })

      // 2. Update DB via our existing settings API
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName }),
      })

      if (!response.ok) {
        throw new Error('Failed to update database')
      }

      setSuccess('Profile updated successfully.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title="Profile Settings"
        description="Manage your personal information and how it appears across the system."
        action={<BackButton href="/dashboard/settings" />}
      />

      <SurfaceCard>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={user?.imageUrl}
                alt="Profile"
                className="h-20 w-20 rounded-full border-2 border-slate-100 object-cover"
              />
              <div className="absolute -bottom-1 -right-1 rounded-full bg-white p-1 shadow-sm border border-slate-200">
                <UserCog size={14} className="text-slate-500" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Profile Photo
              </h3>
              <p className="text-xs text-slate-500">
                Managed via Clerk. Visit your account settings to change.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Email Address
              </label>
              <input
                type="email"
                value={user?.primaryEmailAddress?.emailAddress || ''}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
                disabled
              />
              <p className="mt-1 text-[10px] text-slate-400">
                Email address cannot be changed here.
              </p>
            </div>
          </div>

          {error && <p className="text-xs font-medium text-red-600">{error}</p>}
          {success && (
            <p className="text-xs font-medium text-emerald-600">{success}</p>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Save Changes
            </button>
          </div>
        </form>
      </SurfaceCard>
    </div>
  )
}
