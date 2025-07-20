import React, { useState, useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { logger } from '../services/logger'
import type { User, Session } from '@supabase/supabase-js'

interface UserProfile {
  id: string
  store_id: string | null
  email: string
  full_name: string | null
  avatar_url: string | null
}

export default function ProtectedRoute() {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const fetchSessionAndProfile = async () => {
      try {
        // Check for an active session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          throw sessionError
        }

        if (!mounted) return

        if (session?.user) {
          setSession(session)
          setUser(session.user)

          // Fetch user profile to check store association
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('id, store_id, email, full_name, avatar_url')
            .eq('id', session.user.id)
            .single()

          if (profileError) {
            logger.error('Failed to fetch user profile', { 
              error: profileError, 
              userId: session.user.id 
            })
            throw new Error('Access denied: No admin profile found')
          }

          if (!profileData.store_id) {
            logger.warn('User has no store association', { userId: session.user.id })
            throw new Error('Access denied: No store associated with this account')
          }

          setProfile(profileData)
          logger.info('User profile loaded', {
            userId: session.user.id,
            storeId: profileData.store_id,
            email: profileData.email
          })
        } else {
          setSession(null)
          setUser(null)
          setProfile(null)
        }
      } catch (error) {
        if (!mounted) return
        
        const errorMessage = error instanceof Error ? error.message : 'Authentication failed'
        logger.error('Protected route authentication error', { error: errorMessage })
        setError(errorMessage)
        setSession(null)
        setUser(null)
        setProfile(null)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchSessionAndProfile()

    // Listen for auth changes (login, logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logger.info('Auth state changed', { event, userId: session?.user?.id })
        
        if (event === 'SIGNED_OUT' || !session) {
          setSession(null)
          setUser(null)
          setProfile(null)
          setError(null)
          setLoading(false)
        } else if (event === 'SIGNED_IN' && session) {
          // Re-fetch profile when user signs in
          fetchSessionAndProfile()
        }
      }
    )

    // Cleanup function
    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#17c076] mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying access...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="text-red-600 text-lg font-semibold mb-2">Access Denied</div>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => {
                setError(null)
                setLoading(true)
                // Retry authentication
                window.location.reload()
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  // If there's a valid session with proper profile, render the child routes (the dashboard)
  // Otherwise, redirect to the login page
  if (session && user && profile) {
    return <Outlet context={{ user, profile, session }} />
  }

  return <Navigate to="/admin/login" replace />
}


