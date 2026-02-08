'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

export default function Navbar() {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        fetchUserRole(user.id)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserRole(session.user.id)
      } else {
        setUserRole(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserRole = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()
    
    if (data) {
      setUserRole(data.role)
    }
  }

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Logout error:', error)
      }
      // The auth state change listener in each page will handle the redirect
      // But we'll also redirect here as a fallback
      router.replace('/')
    } catch (err) {
      console.error('Logout error:', err)
      // Force redirect even on error
      router.replace('/')
    }
  }

  if (!user) {
    return null
  }

  return (
    <>
      <nav className="navbar">
        {/* Brand */}
        <Link href="/dashboard" className="navbar-brand">
          <Image 
            src="/logo.png" 
            alt="Thrive Trivia" 
            width={160} 
            height={90}
            className="logo-image"
            priority
          />
        </Link>

        {/* Links */}
        <div className="navbar-links">
          {userRole === 'admin' ? (
            <>
              <Link href="/admin" style={{ textDecoration: 'none' }} className="nav-link">Admin</Link>
              <Link href="/leaderboard" style={{ textDecoration: 'none' }} className="nav-link">Leaderboard</Link>
            </>
          ) : (
            <>
              <Link href="/dashboard" style={{ textDecoration: 'none' }} className="nav-link">Dashboard</Link>
              <Link href="/play" style={{ textDecoration: 'none' }} className="nav-link">Play</Link>
              <Link href="/leaderboard" style={{ textDecoration: 'none' }} className="nav-link">Leaderboard</Link>
            </>
          )}
        </div>

        {/* Logout */}
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </nav>

      <style jsx>{`
        /* Navbar entrance animation */
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes sparkle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .navbar {
          height: 80px;
          
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 56px;
          box-shadow: 0 4px 20px rgba(147, 51, 234, 0.4);
          animation: slideDown 0.6s ease-out;
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          text-decoration: none;
          transition: transform 0.3s ease, opacity 0.3s ease;
        }

        .navbar-brand:hover {
          transform: scale(1.05);
          opacity: 0.9;
        }

        .logo-image {
          height: 50px;
          width: auto;
          object-fit: contain;
        }

        .navbar-links {
          display: flex;
          gap: 40px;
          text-decoration: none;
        }

        .nav-link {
          font-size: 1.4rem;
          font-weight: 700;
          text-decoration: none;
          color: #ffffff;
          position: relative;
          transition: color 0.3s ease, transform 0.3s ease;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: -8px;
          width: 0;
          height: 3px;
          background-color: #fce7f3;
          transition: width 0.3s ease;
          border-radius: 2px;
        }

        .nav-link:hover {
          transform: translateY(-2px);
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .nav-link:hover::after {
          width: 100%;
        }

        .logout-btn {
          font-size: 1rem;
          font-weight: 700;
          padding: 12px 22px;
          border: none;
          border-radius: 20px;
          cursor: pointer;
          background-color: rgba(255, 255, 255, 0.1);
          color:  #9333ea;
          transition: transform 0.25s ease, background-color 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
        }

        .logout-btn:hover {
          background-color: #ffffff;
          color: #9333ea;
          border-color: #ffffff;
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
        }

        .logout-btn:active {
          transform: scale(0.98);
        }  
         

      `}</style>
    </>
  )
}
