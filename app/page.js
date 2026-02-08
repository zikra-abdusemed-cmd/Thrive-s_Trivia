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
        // Simplified - no Promise.race to avoid abort errors
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        // Ignore abort errors from auth
        if (authError) {
          if (authError.name === 'AbortError' || authError.message?.includes('aborted')) {
            return
          }
        }
        
        if (authError || !user) {
          // No user logged in, show landing page
          return
        }
        
        redirectingRef.current = true
        
        // Check user role - simplified without Promise.race
        try {
          const { data } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()
          
          // Only redirect if we have a valid role
          if (data?.role === 'admin') {
            router.replace('/admin')
          } else if (data?.role === 'user') {
            router.replace('/dashboard')
          }
          // If no profile found, stay on landing page (let user login/signup)
        } catch (profileErr) {
          // Ignore abort errors
          if (profileErr.name === 'AbortError' || profileErr.message?.includes('aborted')) {
            return
          }
          // If profile fetch fails, stay on landing page
          console.warn('Profile fetch failed, staying on landing page:', profileErr)
        }
        
        redirectingRef.current = false
      } catch (err) {
        // Ignore abort errors - they're just from navigation/cleanup
        if (err.name === 'AbortError' || err.message?.includes('aborted')) {
          return
        }
        console.error('Redirect check error:', err)
        redirectingRef.current = false
      }
    }

    // Small delay to prevent flash of content
    const timer = setTimeout(() => {
      checkAndRedirect()
    }, 100)

    // Listen for auth state changes (only for logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Only handle SIGNED_OUT event to reset redirect flag
      if (event === 'SIGNED_OUT') {
        redirectingRef.current = false
      }
      // Don't redirect on SIGNED_IN - let the login/signup handlers do it
    })

    return () => {
      clearTimeout(timer)
      subscription.unsubscribe()
    }
  }, [router])

  // Always show login/signup page as the landing page
  return <AuthLanding />
}

