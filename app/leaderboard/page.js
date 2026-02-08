'use client'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function Leaderboard() {
  const [scores, setScores] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/')
        return
      }
      setUser(user)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.replace('/')
      } else {
        setUser(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  useEffect(() => {
    if (!user) return
    supabase.from('scores').select('*').order('score', { ascending: false })
      .then(({ data }) => setScores(data))
  }, [user])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">✨</div>
      </div>
    )
  }

  if (!user) return null

  return (
    <>
      <div className="leaderboard-container">
        
        <div className="leaderboard-list">
          {scores.length === 0 ? (
            <div className="empty-state">
              <p>No scores yet! Be the first to play! 🎯</p>
            </div>
          ) : (
            scores.map((s, index) => (
              <div key={s.id} className={`leaderboard-item ${index < 3 ? 'top-three' : ''}`}>
                <div className="rank-badge">
                  {index === 0 && '🥇'}
                  {index === 1 && '🥈'}
                  {index === 2 && '🥉'}
                  {index > 2 && `#${index + 1}`}
                </div>
                <div className="score-info">
                  <span className="score-value">{s.score}</span>
                  {s.user_email && (
                    <span className="user-email">{s.user_email}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <style jsx>{`
        .leaderboard-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .leaderboard-logo-container {
          display: flex;
          justify-content: center;
          margin-bottom: 30px;
        }

        .leaderboard-logo {
          width: 200px;
          height: auto;
          object-fit: contain;
        }

        .leaderboard-title {
          font-size: 3rem;
          font-weight: 800;
          text-align: center;
          margin-bottom: 40px;
         
        }

        .leaderboard-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .leaderboard-item {
          background: linear-gradient(135deg, #ffffff 0%, #fce7f3 100%);
          padding: 24px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 20px;
          box-shadow: 0 2px 8px rgba(147, 51, 234, 0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .leaderboard-item:hover {
          transform: translateX(8px);
          box-shadow: 0 4px 16px rgba(147, 51, 234, 0.2);
        }

        .leaderboard-item.top-three {
          background: linear-gradient(135deg, #fce7f3 0%, #f3e8ff 100%);
          border: 2px solid #9333ea;
        }

        .rank-badge {
          font-size: 2rem;
          font-weight: 800;
          color: #9333ea;
          min-width: 60px;
          text-align: center;
        }

        .score-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .score-value {
          font-size: 1.8rem;
          font-weight: 800;
          color: #9333ea;
        }

        .user-email {
          font-size: 0.9rem;
          color: #9333ea;
          opacity: 0.7;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: linear-gradient(135deg, #ffffff 0%, #fce7f3 100%);
          border-radius: 20px;
          box-shadow: 0 4px 16px rgba(147, 51, 234, 0.1);
        }

        .empty-state p {
          font-size: 1.3rem;
          color: #9333ea;
          font-weight: 600;
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
