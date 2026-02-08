'use client'
import { supabase } from '../../lib/supabase'

export default function Signup() {
  const submit = async e => {
    e.preventDefault()
    const email = e.target.email.value
    const password = e.target.password.value

    const { data } = await supabase.auth.signUp({ email, password })

    await supabase.from('profiles').insert({
      id: data.user.id,
      email,
      role: 'user',
    })
  }

  return (
    <>
      <div className="auth-container">
        <form onSubmit={submit} className="auth-form">
          <h2 className="auth-title">Sign Up 💖</h2>
          <div className="input-group">
            <label className="input-label">Email</label>
            <input name="email" type="email" className="auth-input" placeholder="your@email.com" required />
          </div>
          <div className="input-group">
            <label className="input-label">Password</label>
            <input name="password" type="password" className="auth-input" placeholder="••••••••" required />
          </div>
          <button type="submit" className="auth-button">Sign Up ✨</button>
        </form>
      </div>
      <style jsx>{`
        .auth-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: calc(100vh - 200px);
          padding: 20px;
        }

        .auth-form {
          max-width: 400px;
          width: 100%;
          background: linear-gradient(135deg, #ffffff 0%, #fce7f3 100%);
          padding: 40px;
          border-radius: 24px;
          box-shadow: 0 8px 32px rgba(147, 51, 234, 0.2);
          animation: fadeInUp 0.6s ease-out;
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

        .auth-title {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 30px;
          text-align: center;
          background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
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

        .auth-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(147, 51, 234, 0.4);
        }

        .auth-button:active {
          transform: translateY(0);
        }
      `}</style>
    </>
  )
}
