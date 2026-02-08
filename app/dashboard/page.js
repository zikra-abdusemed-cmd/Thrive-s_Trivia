"use client";
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import { Pacifico } from 'next/font/google'
const pacifico = Pacifico({
  weight: '400',
  subsets: ['latin'],
})

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push('/')
        return
      }
      setUser(user)
      
      // Check user role
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      
      if (data) {
        setUserRole(data.role)
        // Redirect admins to admin page
        if (data.role === 'admin') {
          router.push('/admin')
          return
        }
      }
      
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        router.replace('/')
      } else {
        setUser(session.user)
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
        
        if (data?.role === 'admin') {
          router.push('/admin')
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">✨</div>
      </div>
    )
  }

  if (!user || userRole === 'admin') return null
  return (
    <>
      <div className="dashboard-container">
        <div className="dashboard-content">
          <h1 className="dashboard-title">Dashboard</h1>
          <p className={`dashboard-subtitle ${pacifico.className}`}>Welcome to your dashboard!</p>
          <div className="dashboard-cards">
            <div className="dashboard-card">
              <span className="card-emoji">🎯</span>
              <h3 className="card-title">Play Games</h3>
              <p className="card-text">Test your knowledge and climb the leaderboard!</p>
            </div>
            <div className="dashboard-card">
              <span className="card-emoji">🏆</span>
              <h3 className="card-title">View Leaderboard</h3>
              <p className="card-text">See how you rank against other players!</p>
            </div>
            <div className="dashboard-card">
              <span className="card-emoji">✨</span>
              <h3 className="card-title">Have Fun</h3>
              <p className="card-text">Enjoy learning and competing!</p>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .dashboard-container {
          min-height: calc(100vh - 200px);
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 40px 20px;
        }

        .dashboard-content {
          max-width: 1000px;
          width: 100%;
          animation: fadeInUp 0.6s ease-out;
        }

        .dashboard-logo-container {
          display: flex;
          justify-content: center;
          margin-bottom: 30px;
        }

        .dashboard-logo {
          width: 400px;
          height: auto;
          object-fit: contain;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dashboard-title {
          font-size: 2.5rem;
          font-weight: 800;
          text-align: center;
          margin-bottom: 16px;
          background-color: #000;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .dashboard-subtitle {
          font-size: 1.3rem;
          text-align: center;
          color: #9333ea;
          margin-bottom: 40px;
          font-weight: 500;
        }

        .dashboard-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 24px;
        }

        .dashboard-card {
          background: linear-gradient(135deg, #ffffff 0%, #fce7f3 100%);
          padding: 40px 30px;
          border-radius: 20px;
          text-align: center;
          box-shadow: 0 4px 16px rgba(147, 51, 234, 0.15);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .dashboard-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 8px 24px rgba(147, 51, 234, 0.25);
        }

        .card-emoji {
          font-size: 3rem;
          display: block;
          margin-bottom: 16px;
        }

        .card-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #9333ea;
          margin-bottom: 12px;
        }

        .card-text {
          font-size: 1rem;
          color: #9333ea;
          opacity: 0.8;
          line-height: 1.6;
        }

        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: calc(100vh - 200px);
        }

        .loading-spinner {
          font-size: 3rem;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}
