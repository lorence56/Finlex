import { cookies } from 'next/headers'
import {
  getWorkspaceById,
  resolveWorkspaceId,
  WORKSPACE_COOKIE,
} from '@/lib/workspaces'

export async function getCurrentWorkspaceId() {
  const cookieStore = await cookies()
  return resolveWorkspaceId(cookieStore.get(WORKSPACE_COOKIE)?.value)
}

export async function getCurrentWorkspace() {
  const workspaceId = await getCurrentWorkspaceId()
  return getWorkspaceById(workspaceId)
}
