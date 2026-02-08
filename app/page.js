'use client'
import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import AuthLanding from '../components/AuthLanding'

export default function HomePage() {
  const router = useRouter()
  const redirectingRef = useRef(false)

  useEffect(() => {
    // Only check on initial load, not on every render
    const checkAndRedirect = async () => {
      if (redirectingRef.current) return
      
      try {
        const { data: { user }, error: authError } = await Promise.race([
          supabase.auth.getUser(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Auth check timeout')), 5000))
        ])
        
        if (authError || !user) {
          return
        }
        
        redirectingRef.current = true
        
        // Check user role with timeout
        const profilePromise = supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        const { data, error: profileError } = await Promise.race([
          profilePromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Profile fetch timeout')), 3000))
        ]).catch(() => ({ data: null, error: { message: 'Timeout' } }))
        
        if (data?.role === 'admin') {
          router.replace('/admin')
        } else if (data?.role === 'user') {
          router.replace('/dashboard')
        } else {
          // If no profile, redirect to dashboard as default (profile might be created by trigger)
          router.replace('/dashboard')
        }
        
        redirectingRef.current = false
      } catch (err) {
        console.error('Redirect check error:', err)
        redirectingRef.current = false
      }
    }

    checkAndRedirect()

    // Listen for auth state changes (only for logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Only handle SIGNED_OUT event to reset redirect flag
      if (event === 'SIGNED_OUT') {
        redirectingRef.current = false
      }
      // Don't redirect on SIGNED_IN - let the login/signup handlers do it
    })

    return () => subscription.unsubscribe()
  }, []) // Remove router dependency to prevent re-runs

  // Always show login/signup page as the landing page
  return <AuthLanding />
}

