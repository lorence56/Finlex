'use client'

import { useEffect, useState } from 'react'
import {
  Loader2,
  Mail,
  Plus,
  Trash2,
  UserPlus,
  Users,
  ShieldCheck,
  Shield,
  ShieldAlert,
  User,
} from 'lucide-react'
import { BackButton } from '@/components/ui/BackButton'
import { PageHeader } from '@/components/ui/PageHeader'
import { SurfaceCard, SurfaceCardHeader } from '@/components/ui/SurfaceCard'
import { Badge } from '@/components/ui/Badge'

type TeamMember = {
  id: string
  fullName: string
  email: string
  role: 'firm_admin' | 'staff' | 'accountant' | 'paralegal' | 'client'
  status: 'active' | 'invited'
}

export default function TeamSettingsPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [inviting, setInviting] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<TeamMember['role']>('staff')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    async function loadMembers() {
      try {
        const response = await fetch('/api/settings/team')
        if (!response.ok) throw new Error('Failed to load team members')
        const data = await response.json()
        setMembers(data.members)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }
    loadMembers()
  }, [])

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setInviting(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/settings/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to send invitation')
      }

      setSuccess(`Invitation sent to ${inviteEmail}`)
      setInviteEmail('')
      // Refresh list
      const data = await response.json()
      setMembers(data.members)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation')
    } finally {
      setInviting(false)
    }
  }

  async function updateRole(userId: string, newRole: TeamMember['role']) {
    try {
      const response = await fetch(`/api/settings/team/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) throw new Error('Failed to update role')

      setMembers(
        members.map((m) => (m.id === userId ? { ...m, role: newRole } : m))
      )
      setSuccess('Role updated successfully')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role')
    }
  }

  async function removeMember(userId: string) {
    if (!confirm('Are you sure you want to remove this team member?')) return

    try {
      const response = await fetch(`/api/settings/team/${userId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to remove member')

      setMembers(members.filter((m) => m.id !== userId))
      setSuccess('Member removed successfully')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member')
    }
  }

  const getRoleIcon = (role: TeamMember['role']) => {
    switch (role) {
      case 'firm_admin':
        return <ShieldAlert size={14} className="text-rose-500" />
      case 'accountant':
        return <ShieldCheck size={14} className="text-emerald-500" />
      case 'paralegal':
        return <Shield size={14} className="text-blue-500" />
      case 'staff':
        return <User size={14} className="text-slate-500" />
      default:
        return <User size={14} className="text-slate-400" />
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Management"
        description="Invite and manage team members and their access levels."
        action={<BackButton href="/dashboard/settings" />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <SurfaceCard>
            <SurfaceCardHeader title="Team Members" />
            {loading ? (
              <div className="flex h-32 items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <th className="pb-3 pr-4 font-semibold">Member</th>
                      <th className="pb-3 pr-4 font-semibold">Role</th>
                      <th className="pb-3 pr-4 font-semibold">Status</th>
                      <th className="pb-3 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {members.map((member) => (
                      <tr key={member.id} className="group">
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-600">
                              {member.fullName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">
                                {member.fullName}
                              </p>
                              <p className="text-xs text-slate-500">
                                {member.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <select
                            value={member.role}
                            onChange={(e) =>
                              updateRole(
                                member.id,
                                e.target.value as TeamMember['role']
                              )
                            }
                            className="bg-transparent text-xs font-medium text-slate-700 hover:text-blue-600 focus:outline-none"
                            disabled={
                              member.role === 'firm_admin' &&
                              members.filter((m) => m.role === 'firm_admin')
                                .length === 1
                            }
                          >
                            <option value="firm_admin">Firm Admin</option>
                            <option value="staff">Staff</option>
                            <option value="accountant">Accountant</option>
                            <option value="paralegal">Paralegal</option>
                          </select>
                        </td>
                        <td className="py-4 pr-4">
                          <Badge
                            label={member.status}
                            variant={
                              member.status === 'active' ? 'green' : 'amber'
                            }
                          />
                        </td>
                        <td className="py-4 text-right">
                          <button
                            onClick={() => removeMember(member.id)}
                            className="p-1 text-slate-400 transition-colors hover:text-red-600"
                            disabled={
                              member.role === 'firm_admin' &&
                              members.filter((m) => m.role === 'firm_admin')
                                .length === 1
                            }
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SurfaceCard>
        </div>

        <div className="space-y-4">
          <SurfaceCard>
            <SurfaceCardHeader title="Invite Member" />
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="rounded-lg bg-blue-50 p-3 text-[11px] leading-relaxed text-blue-700">
                Invitations will be sent via Clerk. Once they accept, they will
                be added to your workspace.
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={14}
                  />
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    placeholder="colleague@firm.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) =>
                    setInviteRole(e.target.value as TeamMember['role'])
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="staff">Staff</option>
                  <option value="accountant">Accountant</option>
                  <option value="paralegal">Paralegal</option>
                  <option value="firm_admin">Firm Admin</option>
                </select>
              </div>

              {error && (
                <p className="text-[11px] font-medium text-red-600">{error}</p>
              )}
              {success && (
                <p className="text-[11px] font-medium text-emerald-600">
                  {success}
                </p>
              )}

              <button
                type="submit"
                disabled={inviting || !inviteEmail}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                {inviting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <UserPlus size={16} />
                )}
                Send Invitation
              </button>
            </form>
          </SurfaceCard>

          <SurfaceCard>
            <SurfaceCardHeader title="Roles Summary" />
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-md bg-rose-50 p-1 text-rose-600">
                  <ShieldAlert size={14} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">
                    Firm Admin
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Full access to all settings, billing, and team management.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-md bg-emerald-50 p-1 text-emerald-600">
                  <ShieldCheck size={14} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">
                    Accountant
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Access to accounting, payroll, and financial reports.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-md bg-blue-50 p-1 text-blue-600">
                  <Shield size={14} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">
                    Paralegal / Staff
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Manage matters, documents, and clients. No financial access.
                  </p>
                </div>
              </div>
            </div>
          </SurfaceCard>
        </div>
      </div>
    </div>
  )
}
