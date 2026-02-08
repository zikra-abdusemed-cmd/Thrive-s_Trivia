'use client'

export default function QuestionCard({ q, answer, answered = false }) {
  return (
    <>
      <div className="question-card">
        <h3 className="question-text">{q.question}</h3>
        <div className="options-container">
          {['a','b','c','d'].map(o => {
            const isCorrect = q.correct === o
            const buttonClass = answered 
              ? (isCorrect ? 'option-button correct' : 'option-button incorrect')
              : 'option-button'
            
            return (
              <button
                key={o}
                onClick={() => !answered && answer(q, o)}
                className={buttonClass}
                disabled={answered}
              >
                {q[`option_${o}`]}
                {answered && isCorrect && ' ✓'}
              </button>
            )
          })}
        </div>
      </div>
      <style jsx>{`
        .question-card {
          background: linear-gradient(135deg, #ffffff 0%, #fce7f3 100%);
          padding: 30px;
          border-radius: 20px;
          margin-bottom: 24px;
          box-shadow: 0 4px 16px rgba(147, 51, 234, 0.15);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .question-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(147, 51, 234, 0.2);
        }

        .question-text {
          font-size: 1.3rem;
          font-weight: 700;
          color: #9333ea;
          margin-bottom: 20px;
          line-height: 1.6;
        }

        .options-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .option-button {
          width: 100%;
          padding: 16px 20px;
          background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%);
          color: #ffffff;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
          box-shadow: 0 2px 8px rgba(147, 51, 234, 0.2);
        }

        .option-button:hover {
          transform: translateX(8px);
          box-shadow: 0 4px 12px rgba(147, 51, 234, 0.3);
          background: linear-gradient(135deg, #a855f7 0%, #f472b6 100%);
        }

        .option-button:active:not(:disabled) {
          transform: translateX(4px);
        }

        .option-button:disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }

        .option-button.correct {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          animation: correctPulse 0.5s ease;
        }

        .option-button.incorrect {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          opacity: 0.6;
        }

        @keyframes correctPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </>
  )
}
