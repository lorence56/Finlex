'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Bell, X, Check } from 'lucide-react'
import clsx from 'clsx'
import type { Notification } from '@/db/schema'

interface NotificationPanelProps {
  workspaceTheme: {
    solid: string
    orb: string
  }
}

export function NotificationPanel({ workspaceTheme }: NotificationPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000) // Poll every 30 seconds
    return () => clearInterval(interval)
  }, [fetchNotifications])

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(
        `/api/notifications/${notificationId}/read`,
        {
          method: 'POST',
        }
      )
      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/80 transition-colors hover:bg-slate-100"
      >
        <Bell size={16} className="text-slate-500" />
        {unreadCount > 0 && (
          <span
            className={clsx(
              'absolute right-2 top-2 h-2 w-2 rounded-full',
              workspaceTheme.solid
            )}
          />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-96 rounded-lg border border-slate-200 bg-white shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <p className="text-xs text-slate-500">{unreadCount} unread</p>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center px-4 py-8">
                <p className="text-sm text-slate-500">Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-8">
                <Bell size={32} className="mb-2 text-slate-300" />
                <p className="text-sm text-slate-500">No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: (id: string) => void
}

function NotificationItem({
  notification,
  onMarkAsRead,
}: NotificationItemProps) {
  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      welcome: 'bg-blue-50',
      info: 'bg-blue-50',
      warning: 'bg-yellow-50',
      error: 'bg-red-50',
      success: 'bg-green-50',
    }
    return colors[type] || 'bg-slate-50'
  }

  const getTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      welcome: 'bg-blue-100 text-blue-700',
      info: 'bg-blue-100 text-blue-700',
      warning: 'bg-yellow-100 text-yellow-700',
      error: 'bg-red-100 text-red-700',
      success: 'bg-green-100 text-green-700',
    }
    return colors[type] || 'bg-slate-100 text-slate-700'
  }

  return (
    <div
      className={clsx(
        'border-b border-slate-100 px-4 py-3 transition-colors hover:bg-slate-50',
        !notification.isRead && getTypeColor(notification.type)
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1 flex-1">
          <div className="flex items-start gap-2">
            <h4 className="text-sm font-medium text-slate-900">
              {notification.title}
            </h4>
            <span
              className={clsx(
                'text-xs font-medium px-2 py-1 rounded',
                getTypeBadgeColor(notification.type)
              )}
            >
              {notification.type}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">{notification.body}</p>
          <p className="mt-2 text-xs text-slate-400">
            {new Date(notification.createdAt).toLocaleDateString()} at{' '}
            {new Date(notification.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        {!notification.isRead && (
          <button
            onClick={() => onMarkAsRead(notification.id)}
            className="mt-1 rounded p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
            title="Mark as read"
          >
            <Check size={14} />
          </button>
        )}
      </div>
      {notification.link && (
        <div className="mt-2">
          <a
            href={notification.link}
            className="text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            View Details →
          </a>
        </div>
      )}
    </div>
  )
}
