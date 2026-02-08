'use client'
import { useState } from 'react'
import Image from 'next/image'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import { Pacifico } from 'next/font/google'
const pacifico = Pacifico({
  weight: '400',
  subsets: ['latin'],
})

export default function AuthLanding() {
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()


  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      const email = e.target.email.value.trim().toLowerCase()
      const password = e.target.password.value

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })
      
      if (error) {
        // Provide more helpful error messages
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials and make sure the user is confirmed in Supabase Dashboard.')
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Email not confirmed. Please check your email or confirm the user in Supabase Dashboard.')
        } else if (error.message.includes('User not found')) {
          throw new Error('User not found. Please sign up first or check if the user exists in Supabase Dashboard.')
        }
        throw error
      }

      if (data.user) {
        // Try to get profile with timeout (single attempt)
        const profilePromise = supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()
        
        const { data: profileData, error: profileError } = await Promise.race([
          profilePromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Profile fetch timeout')), 3000))
        ]).catch(() => ({ data: null, error: { message: 'Timeout' } }))
        
        // Default to dashboard if profile not found (profile might be created by trigger)
        if (profileData?.role === 'admin') {
          router.replace('/admin')
        } else {
          router.replace('/dashboard')
        }
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      const email = e.target.email.value
      const password = e.target.password.value

      // Disable email confirmation for development (set emailRedirectTo to null)
      const { data, error: signUpError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: null,
          // Disable email confirmation - user will be auto-confirmed
        }
      })
      
      if (signUpError) {
        // Handle specific error messages
        if (signUpError.message.includes('rate limit') || signUpError.message.includes('Email rate limit')) {
          throw new Error('Email rate limit exceeded. Please wait a few minutes and try again, or disable email confirmation in Supabase settings.')
        }
        throw signUpError
      }

      if (data.user) {
        // Create profile
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          email,
          role: 'user',
        })
        
        if (profileError) {
          console.error('Profile creation error:', profileError)
          // Continue anyway - profile might already exist or be created by trigger
        }
        
        // Wait a moment for profile to be created
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // New users are always regular users, so redirect to dashboard
        router.replace('/dashboard')
      }
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
    
      <div className="landing-container">
        <div className="landing-content">
          <div className="logo-container">
            <Image 
              src="/logo.png" 
              alt="Thrive Trivia" 
              width={200} 
              height={100}
              className="landing-logo"
              priority
            />
          </div>
          <h1 className="landing-title">Thrive's Trivia </h1>
          <p className={`landing-subtitle ${pacifico.className}`}>Test your knowledge and climb the leaderboard!</p>

          <div className="auth-tabs">
            <button
              className={`tab-button ${isLogin ? 'active' : ''}`}
              onClick={() => {
                setIsLogin(true)
                setError('')
              }}
            >
              Login
            </button>
            <button
              className={`tab-button ${!isLogin ? 'active' : ''}`}
              onClick={() => {
                setIsLogin(false)
                setError('')
              }}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="error-message">{error}</div>
          )}

          <form onSubmit={isLogin ? handleLogin : handleSignup} className="auth-form">
            <div className="input-group">
              <label className="input-label">Email</label>
              <input
                name="email"
                type="email"
                className="auth-input"
                placeholder="your@email.com"
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label">Password</label>
              <input
                name="password"
                type="password"
                className="auth-input"
                placeholder="••••••••"
                required
              />
            </div>
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Loading...' : (isLogin ? 'Login ✨' : 'Sign Up ✨')}
            </button>
          </form>
        </div>
      </div>
      <style jsx>{`
        .landing-container {
          min-height: calc(100vh - 200px);
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 40px 10px;
        }

        .landing-content {
          max-width: 500px;
          width: 100%;
          animation: fadeInUp 0.8s ease-out;
        }

        .logo-container {
          display: flex;
          justify-content: center;
          margin-bottom: 0px;
        }

        .landing-logo {
          width: 200px;
          height: auto;
          object-fit: contain;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .landing-title {
          font-size: 2.5rem;
          font-weight: 800;
          text-align: center;
          margin-bottom: 14px;
          background-color:#000;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .landing-subtitle {
          font-size: 1.3rem;
          text-align: center;
          color: #9333ea;
          margin-bottom: 40px;
          font-weight: 500;
          font-family: ${pacifico.style.fontFamily};
        }

        .auth-tabs {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          background: #f3e8ff;
          padding: 6px;
          border-radius: 12px;
        }

        .tab-button {
          flex: 1;
          padding: 14px;
          border: none;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          background: transparent;
          color: #9333ea;
        }

        .tab-button.active {
          background-color:#9333ea;
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(147, 51, 234, 0.3);
        }

        .tab-button:hover:not(.active) {
          background: rgba(147, 51, 234, 0.1);
        }

        .error-message {
          background: #fee2e2;
          color: #dc2626;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 0.9rem;
          text-align: center;
        }

        .auth-form {
          background: linear-gradient(135deg, #ffffff 0%, #fce7f3 100%);
          padding: 40px;
          border-radius: 24px;
          box-shadow: 0 8px 32px rgba(147, 51, 234, 0.2);
        }

        .input-group {
          margin-bottom: 24px;
        }

        .input-label {
          display: block;
          font-size: 1rem;
          font-weight: 600;
          color: #9333ea;
          margin-bottom: 8px;
        }

        .auth-input {
          width: 100%;
          padding: 14px 18px;
          border: 2px solid #f3e8ff;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.3s ease;
          background: #ffffff;
          color: #333;
        }

        .auth-input:focus {
          outline: none;
          border-color: #9333ea;
          box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1);
        }

        .auth-button {
          width: 100%;
          padding: 16px;
          background-color: #9333ea;
          color: #ffffff;
          border: none;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          box-shadow: 0 4px 12px rgba(147, 51, 234, 0.3);
        }

        .auth-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(147, 51, 234, 0.4);
        }

        .auth-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </>
  )
}

