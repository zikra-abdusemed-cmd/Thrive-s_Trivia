'use client'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import QuestionCard from '../../components/QuestionCard'

export default function Play() {
  const router = useRouter()
  const [categories, setCategories] = useState([])
  const [availableCategories, setAvailableCategories] = useState([])
  const [category, setCategory] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [time, setTime] = useState(30)
  const [done, setDone] = useState(false)
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [answered, setAnswered] = useState(false)
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const [questionsError, setQuestionsError] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push('/')
        return
      }
      setUser(user)
      
      // Check user role - block admins
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

  const loadPlayedCategories = async () => {
    if (!user) return
    
    try {
      // Get all categories user has played (from scores table) - simplified
      const { data: playedScores } = await supabase
        .from('scores')
        .select('category_id')
        .eq('user_id', user.id)
        .not('category_id', 'is', null)
      
      const playedCategoryIds = new Set(
        (playedScores || []).map(score => score.category_id)
      )
      
      // Get all categories
      const { data: allCategories } = await supabase
        .from('categories')
        .select('*')
      
      if (allCategories) {
        const available = allCategories.filter(
          cat => !playedCategoryIds.has(cat.id)
        )
        setAvailableCategories(available)
      }
    } catch (err) {
      console.error('Error loading played categories:', err)
      // On error, show all categories
      const { data: allCategories } = await supabase.from('categories').select('*')
      if (allCategories) {
        setAvailableCategories(allCategories)
      }
    }
  }

  useEffect(() => {
    if (!user) return
    
    // Load all categories - simplified without Promise.race
    const loadCategories = async () => {
      try {
        const { data } = await supabase.from('categories').select('*')
        setCategories(data || [])
      } catch (err) {
        console.error('Error loading categories:', err)
        setCategories([])
      }
    }
    
    loadCategories()
    
    // Load categories user has already played
    loadPlayedCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  useEffect(() => {
    if (!category) {
      setQuestions([])
      setCurrentQuestionIndex(0)
      setDone(false)
      setScore(0)
      setQuestionsError('')
      setLoadingQuestions(false)
      return
    }
    
    setLoadingQuestions(true)
    setQuestionsError('')
    
    // Load questions - simplified without Promise.race to avoid abort errors
    const loadQuestions = async () => {
      try {
        console.log('Loading questions for category:', category)
        
        // Direct query without Promise.race to avoid abort errors
        const { data, error } = await supabase
          .from('questions')
          .select('*')
          .eq('category_id', category)
        
        console.log('Questions query result - error:', error)
        console.log('Questions query result - data:', data)
        console.log('Number of questions found:', data?.length || 0)
        
        if (error) {
          console.error('Error loading questions:', error)
          setQuestionsError(`Failed to load questions: ${error.message || 'Unknown error'}`)
          setQuestions([])
          setLoadingQuestions(false)
          return
        }
        
        // Supabase returns data directly as an array
        const questionsData = data || []
        
        if (!Array.isArray(questionsData)) {
          console.error('Questions data is not an array:', questionsData)
          setQuestionsError('Invalid data format received')
          setQuestions([])
          setLoadingQuestions(false)
          return
        }
        
        if (questionsData.length === 0) {
          console.warn('No questions found for category:', category)
          setQuestionsError('No questions available for this category yet. Please check back later!')
          setQuestions([])
          setLoadingQuestions(false)
          return
        }
        
        // Shuffle and take up to 5 questions
        const shuffled = [...questionsData].sort(() => 0.5 - Math.random()).slice(0, 5)
        console.log('Shuffled questions (first 5):', shuffled.length)
        setQuestions(shuffled)
        setCurrentQuestionIndex(0)
        setDone(false)
        setScore(0)
        setAnswered(false)
        setTime(30)
        setLoadingQuestions(false)
        setQuestionsError('')
      } catch (err) {
        console.error('Error loading questions (catch):', err)
        setQuestionsError(`Failed to load questions: ${err.message || 'Please try again'}`)
        setQuestions([])
        setLoadingQuestions(false)
      }
    }
    
    loadQuestions()
  }, [category])

  // Reset timer when question changes
  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length && !done) {
      setTime(30)
      setAnswered(false)
    }
  }, [currentQuestionIndex, questions.length, done])

  // Timer countdown
  useEffect(() => {
    if (done || questions.length === 0 || currentQuestionIndex >= questions.length || answered) return
    
    if (time <= 0) {
      // Time's up for this question, move to next
      setAnswered(true)
      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(i => i + 1)
        } else {
          setDone(true)
        }
      }, 1000)
      return
    }
    
    const t = setInterval(() => {
      setTime(prev => {
        if (prev <= 1) {
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => clearInterval(t)
  }, [time, done, currentQuestionIndex, questions.length, answered])

  useEffect(() => {
    if (done && user && questions.length > 0 && category) {
      // Save score to database with category_id
      const saveScore = async () => {
        try {
          const { error } = await supabase.from('scores').insert({
            user_id: user.id,
            user_email: user.email,
            score: score,
            total_questions: questions.length,
            category_id: category
          })
          if (error) {
            console.error('Error saving score:', error)
          } else {
            // Reload available categories after saving score
            loadPlayedCategories()
          }
        } catch (err) {
          console.error('Error saving score:', err)
        }
      }
      saveScore()
    }
  }, [done, user, score, questions.length, category])

  const answer = (q, opt) => {
    if (answered) return // Prevent multiple answers
    
    setAnswered(true)
    if (q.correct === opt) {
      setScore(s => s + 1)
    }
    
    // Move to next question after a short delay
    setTimeout(() => {
      handleNextQuestion()
    }, 1500)
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(i => i + 1)
    } else {
      // All questions answered
      setDone(true)
    }
  }

  if (loading) {
    return (
      <>
        <div className="loading-container">
          <div className="loading-spinner">✨</div>
        </div>
        <style jsx>{`
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

  if (!user || userRole === 'admin') return null

  if (done) {
    return (
      <>
        <div className="score-container">
          <div className="score-card">
            <h1 className="score-title">Game Over! 🎉</h1>
            <div className="score-value">{score}</div>
            <p className="score-label">out of {questions.length}</p>
            <button className="play-again-btn" onClick={() => window.location.reload()}>
              Play Again ✨
            </button>
          </div>
        </div>
        <style jsx>{`
          .score-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: calc(100vh - 200px);
            padding: 20px;
          }

          .score-card {
            background: linear-gradient(135deg, #ffffff 0%, #fce7f3 100%);
            padding: 60px 40px;
            border-radius: 30px;
            text-align: center;
            box-shadow: 0 8px 32px rgba(147, 51, 234, 0.2);
            animation: fadeInScale 0.6s ease-out;
          }

          @keyframes fadeInScale {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          .score-title {
            font-size: 2.5rem;
            font-weight: 800;
            margin-bottom: 20px;
            background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .score-value {
            font-size: 5rem;
            font-weight: 900;
            color: #9333ea;
            margin-bottom: 10px;
          }

          .score-label {
            font-size: 1.2rem;
            color: #9333ea;
            margin-bottom: 30px;
          }

          .play-again-btn {
            padding: 16px 32px;
            background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%);
            color: #ffffff;
            border: none;
            border-radius: 12px;
            font-size: 1.1rem;
            font-weight: 700;
            cursor: pointer;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            box-shadow: 0 4px 12px rgba(147, 51, 234, 0.3);
          }

          .play-again-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(147, 51, 234, 0.4);
          }
        `}</style>
      </>
    )
  }

  return (
    <>
      <div className="play-container">
        
        <div className="play-header">
          <div className="timer-box">
            <span className="timer-label">Time</span>
            <span className="timer-value">{time}s</span>
          </div>
          <div className="score-box">
            <span className="score-label">Score</span>
            <span className="score-display">{score}</span>
          </div>
        </div>

        {!category && (
          <div className="categories-section">
            <h2 className="section-title">Choose a Category</h2>
            {availableCategories.length === 0 ? (
              <div className="no-categories-message">
                <p className="no-categories-text">🎉 Amazing! You've played all available categories!</p>
                <p className="no-categories-subtext">Check back later for new categories or check your scores on the leaderboard! ✨</p>
              </div>
            ) : (
              <>
                <p className="categories-count">
                  {availableCategories.length} {availableCategories.length === 1 ? 'category' : 'categories'} available
                </p>
                <div className="categories-grid">
                  {availableCategories.map(c => (
                    <button
                      key={c.id}
                      onClick={() => {
                        console.log('Category selected:', c.id, c.name)
                        setCategory(c.id)
                      }}
                      className="category-button"
                    >
                      {c.name} ✨
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {category && loadingQuestions && (
          <div className="loading-questions">
            <div className="loading-spinner">✨</div>
            <p>Loading questions...</p>
          </div>
        )}

        {category && !loadingQuestions && questionsError && (
          <div className="questions-error">
            <p>{questionsError}</p>
            <button onClick={() => setCategory(null)} className="back-button">
              Go Back
            </button>
          </div>
        )}

        <div className="questions-section">
          {questions.length > 0 && currentQuestionIndex < questions.length && (
            <>
              <div className="question-progress">
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
              <QuestionCard 
                key={questions[currentQuestionIndex].id} 
                q={questions[currentQuestionIndex]} 
                answer={answer}
                answered={answered}
              />
            </>
          )}
        </div>
      </div>
      <style jsx>{`
        .play-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
        }

        .play-logo-container {
          display: flex;
          justify-content: center;
          margin-bottom: 30px;
        }

        .play-logo {
          width: 180px;
          height: auto;
          object-fit: contain;
        }

        .play-header {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 30px;
        }

        .timer-box, .score-box {
          flex: 1;
          background-color:#9333ea;
          padding: 20px;
          border-radius: 16px;
          text-align: center;
          box-shadow: 0 4px 12px rgba(147, 51, 234, 0.3);
          color: #ffffff;
        }

        .timer-label, .score-label {
          display: block;
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 8px;
          opacity: 0.9;
        }

        .timer-value, .score-display {
          display: block;
          font-size: 2rem;
          font-weight: 800;
        }

        .categories-section {
          margin-bottom: 40px;
        }

        .section-title {
          font-size: 1.3rem;
          font-weight: 800;
          color: #000;
          margin-bottom: 24px;
          text-align: center;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .category-button {
          padding: 20px;
          background: linear-gradient(135deg, #ffffff 0%, #fce7f3 100%);
          border: 2px solid #f3e8ff;
          border-radius: 16px;
          font-size: 1.1rem;
          font-weight: 700;
          color: #9333ea;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(147, 51, 234, 0.1);
        }

        .category-button:hover {
          transform: translateY(-4px);
          border-color: #9333ea;
          box-shadow: 0 6px 16px rgba(147, 51, 234, 0.2);
          background: linear-gradient(135deg, #fce7f3 0%, #f3e8ff 100%);
        }

        .questions-section {
          margin-top: 30px;
        }

        .question-progress {
          text-align: center;
          font-size: 1.2rem;
          font-weight: 700;
          color: #9333ea;
          margin-bottom: 20px;
          padding: 12px;
          background: linear-gradient(135deg, #fce7f3 0%, #f3e8ff 100%);
          border-radius: 12px;
        }

        .categories-count {
          text-align: center;
          font-size: 1rem;
          color: #9333ea;
          margin-bottom: 20px;
          font-weight: 600;
        }

        .no-categories-message {
          text-align: center;
          padding: 60px 40px;
          background: linear-gradient(135deg, #ffffff 0%, #fce7f3 100%);
          border-radius: 20px;
          box-shadow: 0 4px 16px rgba(147, 51, 234, 0.15);
        }

        .no-categories-text {
          font-size: 1.5rem;
          font-weight: 700;
          color: #9333ea;
          margin-bottom: 16px;
        }

        .no-categories-subtext {
          font-size: 1.1rem;
          color: #9333ea;
          opacity: 0.8;
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

        .loading-questions {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          min-height: 300px;
          padding: 40px;
        }

        .loading-questions p {
          margin-top: 20px;
          font-size: 1.1rem;
          color: #9333ea;
          font-weight: 600;
        }

        .questions-error {
          text-align: center;
          padding: 40px;
          background: linear-gradient(135deg, #fee2e2 0%, #fce7f3 100%);
          border-radius: 16px;
          margin: 20px 0;
        }

        .questions-error p {
          font-size: 1.1rem;
          color: #dc2626;
          font-weight: 600;
          margin-bottom: 20px;
        }

        .back-button {
          padding: 12px 24px;
          background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%);
          color: #ffffff;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          box-shadow: 0 4px 12px rgba(147, 51, 234, 0.3);
        }

        .back-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(147, 51, 234, 0.4);
        }
      `}</style>
    </>
  )
}
