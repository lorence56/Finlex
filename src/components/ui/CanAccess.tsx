'use client'

import { useUser } from '@clerk/nextjs'
import { ReactNode, useEffect, useState } from 'react'
import { Action, hasRolePermission, Resource } from '@/lib/permissions-client'

type CanAccessProps = {
  resource: Resource
  action: Action
  children: ReactNode
  fallback?: ReactNode
}

export function CanAccess({
  resource,
  action,
  children,
  fallback = null,
}: CanAccessProps) {
  const { user, isLoaded } = useUser()
  const [hasPermission, setHasPermission] = useState(false)

  useEffect(() => {
    if (isLoaded && user) {
      const role = (user.publicMetadata?.role as string) || 'firm_admin'
      setHasPermission(hasRolePermission(role, resource, action))
    }
  }, [user, isLoaded, resource, action])

  if (!isLoaded) return null

  if (hasPermission) return <>{children}</>

  return <>{fallback}</>
}
