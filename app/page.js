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
      
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        redirectingRef.current = true
        
        // Wait a bit for profile to be created (for new signups)
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Check user role and redirect accordingly
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        if (data?.role === 'admin') {
          router.replace('/admin')
        } else if (data?.role === 'user') {
          router.replace('/dashboard')
        }
        // If no profile yet, wait a bit more and try again
        else {
          setTimeout(async () => {
            const { data: retryData } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', user.id)
              .single()
            
            if (retryData?.role === 'admin') {
              router.replace('/admin')
            } else if (retryData?.role === 'user') {
              router.replace('/dashboard')
            }
            redirectingRef.current = false
          }, 1000)
          return
        }
        
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
  }, [router])

  // Always show login/signup page as the landing page
  return <AuthLanding />
}

