'use client'
import Image from 'next/image'
import { supabase } from '../../lib/supabase'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Admin() {
  const router = useRouter()
  const [categories, setCategories] = useState([])
  const [questions, setQuestions] = useState([])
  const [newCategory, setNewCategory] = useState('')
  const [editingCategory, setEditingCategory] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct: 'a'
  })
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [operationLoading, setOperationLoading] = useState(false)

  useEffect(() => {
    const checkAdminAccess = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        router.replace('/')
        return
      }
      
      setUser(user)
      
      // Get profile - simplified without Promise.race
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        if (profileData?.role === 'admin') {
          setUserRole('admin')
          setLoading(false)
          loadCategories()
          loadQuestions()
        } else {
          router.replace('/dashboard')
        }
      } catch (profileErr) {
        console.error('Profile fetch error:', profileErr)
        router.replace('/dashboard')
      }
    }

    checkAdminAccess()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) {
        router.replace('/')
        return
      }
      
      setUser(session.user)
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()
      
      if (error) {
        console.error('Profile fetch error on auth change:', error)
      }
      
      if (data && data.role === 'admin') {
        setUserRole('admin')
      } else {
        router.replace('/dashboard')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const loadCategories = async () => {
    try {
      const { data } = await supabase.from('categories').select('*')
      setCategories(data || [])
    } catch (err) {
      console.error('Error loading categories:', err)
      setCategories([])
    }
  }

  const loadQuestions = async () => {
    try {
      const { data } = await supabase.from('questions').select(`
        *,
        categories (
          name
        )
      `)
      setQuestions(data || [])
    } catch (err) {
      console.error('Error loading questions:', err)
      setQuestions([])
    }
  }

  const addCategory = async () => {
    if (!newCategory.trim()) {
      setMessage({ type: 'error', text: 'Category name cannot be empty!' })
      return
    }
    setOperationLoading(true)
    try {
      const { data, error } = await supabase.from('categories').insert({ name: newCategory.trim() }).select()
      if (error) {
        setMessage({ type: 'error', text: error.message || 'Failed to create category' })
      } else {
        setMessage({ type: 'success', text: 'Category created successfully! ✨' })
        setNewCategory('')
        // Optimistically add to state instead of reloading
        if (data && data[0]) {
          setCategories(prev => [...prev, data[0]])
        } else {
          loadCategories()
        }
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Operation timed out. Please try again.' })
    } finally {
      setOperationLoading(false)
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    }
  }

  const updateCategory = async (id, name) => {
    if (!name.trim()) {
      setMessage({ type: 'error', text: 'Category name cannot be empty!' })
      return
    }
    setOperationLoading(true)
    try {
      const { error } = await supabase.from('categories').update({ name: name.trim() }).eq('id', id)
      if (error) {
        setMessage({ type: 'error', text: error.message || 'Failed to update category' })
      } else {
        setMessage({ type: 'success', text: 'Category updated successfully! ✨' })
        setEditingCategory(null)
        // Optimistically update state
        setCategories(prev => prev.map(cat => cat.id === id ? { ...cat, name: name.trim() } : cat))
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Operation timed out. Please try again.' })
    } finally {
      setOperationLoading(false)
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    }
  }

  const deleteCategory = async (id) => {
    if (confirm('Are you sure? This will also delete all questions in this category!')) {
      setOperationLoading(true)
      try {
        const { error } = await supabase.from('categories').delete().eq('id', id)
        if (error) {
          setMessage({ type: 'error', text: error.message || 'Failed to delete category' })
        } else {
          setMessage({ type: 'success', text: 'Category deleted successfully! ✨' })
          // Optimistically update state
          setCategories(prev => prev.filter(cat => cat.id !== id))
          setQuestions(prev => prev.filter(q => q.category_id !== id))
        }
      } catch (err) {
        setMessage({ type: 'error', text: err.message || 'Operation timed out. Please try again.' })
      } finally {
        setOperationLoading(false)
        setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      }
    }
  }

  const addQuestion = async () => {
    if (!selectedCategory) {
      setMessage({ type: 'error', text: 'Please select a category!' })
      return
    }
    if (!newQuestion.question.trim()) {
      setMessage({ type: 'error', text: 'Question cannot be empty!' })
      return
    }
    if (!newQuestion.option_a.trim() || !newQuestion.option_b.trim() || 
        !newQuestion.option_c.trim() || !newQuestion.option_d.trim()) {
      setMessage({ type: 'error', text: 'All options must be filled!' })
      return
    }
    setOperationLoading(true)
    try {
      const questionData = {
        question: newQuestion.question.trim(),
        option_a: newQuestion.option_a.trim(),
        option_b: newQuestion.option_b.trim(),
        option_c: newQuestion.option_c.trim(),
        option_d: newQuestion.option_d.trim(),
        correct: newQuestion.correct,
        category_id: selectedCategory
      }
      
      const { data, error } = await supabase.from('questions').insert(questionData).select(`
        *,
        categories (
          name
        )
      `)
      
      if (error) {
        setMessage({ type: 'error', text: error.message || 'Failed to create question' })
      } else {
        setMessage({ type: 'success', text: 'Question created successfully! ✨' })
        // Optimistically add to state instead of reloading
        if (data && data[0]) {
          setQuestions(prev => [...prev, data[0]])
        } else {
          loadQuestions()
        }
        setNewQuestion({
          question: '',
          option_a: '',
          option_b: '',
          option_c: '',
          option_d: '',
          correct: 'a'
        })
        setSelectedCategory('')
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Operation timed out. Please try again.' })
    } finally {
      setOperationLoading(false)
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    }
  }

  const updateQuestion = async (id, updatedQuestion) => {
    if (!updatedQuestion.question.trim()) {
      setMessage({ type: 'error', text: 'Question cannot be empty!' })
      return
    }
    if (!updatedQuestion.option_a.trim() || !updatedQuestion.option_b.trim() || 
        !updatedQuestion.option_c.trim() || !updatedQuestion.option_d.trim()) {
      setMessage({ type: 'error', text: 'All options must be filled!' })
      return
    }
    setOperationLoading(true)
    try {
      const { error } = await supabase.from('questions').update({
        question: updatedQuestion.question.trim(),
        option_a: updatedQuestion.option_a.trim(),
        option_b: updatedQuestion.option_b.trim(),
        option_c: updatedQuestion.option_c.trim(),
        option_d: updatedQuestion.option_d.trim(),
        correct: updatedQuestion.correct,
        category_id: updatedQuestion.category_id
      }).eq('id', id)
      if (error) {
        setMessage({ type: 'error', text: error.message || 'Failed to update question' })
      } else {
        setMessage({ type: 'success', text: 'Question updated successfully! ✨' })
        setEditingQuestion(null)
        // Optimistically update state
        setQuestions(prev => prev.map(q => {
          if (q.id === id) {
            return {
              ...q,
              question: updatedQuestion.question.trim(),
              option_a: updatedQuestion.option_a.trim(),
              option_b: updatedQuestion.option_b.trim(),
              option_c: updatedQuestion.option_c.trim(),
              option_d: updatedQuestion.option_d.trim(),
              correct: updatedQuestion.correct,
              category_id: updatedQuestion.category_id
            }
          }
          return q
        }))
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Operation timed out. Please try again.' })
    } finally {
      setOperationLoading(false)
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    }
  }

  const deleteQuestion = async (id) => {
    if (confirm('Are you sure you want to delete this question?')) {
      setOperationLoading(true)
      try {
        const { error } = await supabase.from('questions').delete().eq('id', id)
        if (error) {
          setMessage({ type: 'error', text: error.message || 'Failed to delete question' })
        } else {
          setMessage({ type: 'success', text: 'Question deleted successfully! ✨' })
          // Optimistically update state
          setQuestions(prev => prev.filter(q => q.id !== id))
        }
      } catch (err) {
        setMessage({ type: 'error', text: err.message || 'Operation timed out. Please try again.' })
      } finally {
        setOperationLoading(false)
        setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      }
    }
  }

  const startEditCategory = (category) => {
    setEditingCategory({ id: category.id, name: category.name })
  }

  const startEditQuestion = (question) => {
    setEditingQuestion({
      id: question.id,
      question: question.question,
      option_a: question.option_a,
      option_b: question.option_b,
      option_c: question.option_c,
      option_d: question.option_d,
      correct: question.correct,
      category_id: question.category_id
    })
    setSelectedCategory(question.category_id)
  }

  const cancelEdit = () => {
    setEditingCategory(null)
    setEditingQuestion(null)
    setNewQuestion({
      question: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct: 'a'
    })
    setSelectedCategory('')
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">✨</div>
      </div>
    )
  }

  if (!user || userRole !== 'admin') {
    return null
  }

  return (
    <>
      <div className="admin-container">
        <div className="admin-header">
          <Image 
            src="/logo.png" 
            alt="Thrive Trivia" 
            width={180} 
            height={60}
            className="admin-logo"
            priority
          />
          <h1 className="admin-title">Admin Panel 💜✨</h1>
        </div>
        
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="admin-section">
          <h2 className="section-title">Categories 💜</h2>
          <div className="input-group">
            <input
              type="text"
              value={editingCategory ? editingCategory.name : newCategory}
              onChange={(e) => editingCategory 
                ? setEditingCategory({...editingCategory, name: e.target.value})
                : setNewCategory(e.target.value)
              }
              placeholder="Category name"
              className="admin-input"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  editingCategory 
                    ? updateCategory(editingCategory.id, editingCategory.name)
                    : addCategory()
                }
              }}
            />
            {editingCategory ? (
              <>
                <button 
                  onClick={() => updateCategory(editingCategory.id, editingCategory.name)} 
                  className="admin-button"
                  disabled={operationLoading}
                >
                  {operationLoading ? 'Updating...' : 'Update'}
                </button>
                <button onClick={cancelEdit} className="cancel-button" disabled={operationLoading}>Cancel</button>
              </>
            ) : (
              <button 
                onClick={addCategory} 
                className="admin-button"
                disabled={operationLoading}
              >
                {operationLoading ? 'Adding...' : 'Add Category'}
              </button>
            )}
          </div>
          <div className="categories-list">
            {categories.map(cat => (
              <div key={cat.id} className="category-item">
                <span>{cat.name}</span>
                <div className="category-actions">
                  <button onClick={() => startEditCategory(cat)} className="edit-button">Edit</button>
                  <button onClick={() => deleteCategory(cat.id)} className="delete-button-small">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-section">
          <h2 className="section-title">Questions 💜</h2>
          <div className="question-form">
            <select
              value={editingQuestion ? editingQuestion.category_id : selectedCategory}
              onChange={(e) => editingQuestion
                ? setEditingQuestion({...editingQuestion, category_id: e.target.value})
                : setSelectedCategory(e.target.value)
              }
              className="admin-input"
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <input
              type="text"
              value={editingQuestion ? editingQuestion.question : newQuestion.question}
              onChange={(e) => editingQuestion
                ? setEditingQuestion({...editingQuestion, question: e.target.value})
                : setNewQuestion({...newQuestion, question: e.target.value})
              }
              placeholder="Question"
              className="admin-input"
            />
            <div className="options-grid">
              <input
                type="text"
                value={editingQuestion ? editingQuestion.option_a : newQuestion.option_a}
                onChange={(e) => editingQuestion
                  ? setEditingQuestion({...editingQuestion, option_a: e.target.value})
                  : setNewQuestion({...newQuestion, option_a: e.target.value})
                }
                placeholder="Option A"
                className="admin-input"
              />
              <input
                type="text"
                value={editingQuestion ? editingQuestion.option_b : newQuestion.option_b}
                onChange={(e) => editingQuestion
                  ? setEditingQuestion({...editingQuestion, option_b: e.target.value})
                  : setNewQuestion({...newQuestion, option_b: e.target.value})
                }
                placeholder="Option B"
                className="admin-input"
              />
              <input
                type="text"
                value={editingQuestion ? editingQuestion.option_c : newQuestion.option_c}
                onChange={(e) => editingQuestion
                  ? setEditingQuestion({...editingQuestion, option_c: e.target.value})
                  : setNewQuestion({...newQuestion, option_c: e.target.value})
                }
                placeholder="Option C"
                className="admin-input"
              />
              <input
                type="text"
                value={editingQuestion ? editingQuestion.option_d : newQuestion.option_d}
                onChange={(e) => editingQuestion
                  ? setEditingQuestion({...editingQuestion, option_d: e.target.value})
                  : setNewQuestion({...newQuestion, option_d: e.target.value})
                }
                placeholder="Option D"
                className="admin-input"
              />
            </div>
            <select
              value={editingQuestion ? editingQuestion.correct : newQuestion.correct}
              onChange={(e) => editingQuestion
                ? setEditingQuestion({...editingQuestion, correct: e.target.value})
                : setNewQuestion({...newQuestion, correct: e.target.value})
              }
              className="admin-input"
            >
              <option value="a">Correct: A</option>
              <option value="b">Correct: B</option>
              <option value="c">Correct: C</option>
              <option value="d">Correct: D</option>
            </select>
            <div className="form-actions">
              {editingQuestion ? (
                <>
                  <button 
                    onClick={() => updateQuestion(editingQuestion.id, {
                      question: editingQuestion.question,
                      option_a: editingQuestion.option_a,
                      option_b: editingQuestion.option_b,
                      option_c: editingQuestion.option_c,
                      option_d: editingQuestion.option_d,
                      correct: editingQuestion.correct,
                      category_id: editingQuestion.category_id
                    })} 
                    className="admin-button"
                    disabled={operationLoading}
                  >
                    {operationLoading ? 'Updating...' : 'Update Question'}
                  </button>
                  <button onClick={cancelEdit} className="cancel-button" disabled={operationLoading}>Cancel</button>
                </>
              ) : (
                <button 
                  onClick={addQuestion} 
                  className="admin-button"
                  disabled={operationLoading}
                >
                  {operationLoading ? 'Adding...' : 'Add Question'}
                </button>
              )}
            </div>
          </div>
          <div className="questions-list">
            {questions.length === 0 ? (
              <div className="empty-state">No questions yet. Create your first question above! ✨</div>
            ) : (
              questions.map(q => (
                <div key={q.id} className="question-item">
                  <div className="question-content">
                    <div className="question-header">
                      <strong>{q.question}</strong>
                      <span className="question-category">{q.categories?.name || 'Uncategorized'}</span>
                    </div>
                    <div className="question-options">
                      <div className="option-row">
                        <span className="option-label">A:</span> {q.option_a}
                      </div>
                      <div className="option-row">
                        <span className="option-label">B:</span> {q.option_b}
                      </div>
                      <div className="option-row">
                        <span className="option-label">C:</span> {q.option_c}
                      </div>
                      <div className="option-row">
                        <span className="option-label">D:</span> {q.option_d}
                      </div>
                    </div>
                    <span className="correct-answer">Correct Answer: {q.correct.toUpperCase()}</span>
                  </div>
                  <div className="question-actions">
                    <button onClick={() => startEditQuestion(q)} className="edit-button">Edit</button>
                    <button onClick={() => deleteQuestion(q.id)} className="delete-button">Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <style jsx>{`
        .admin-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
        }

        .admin-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 40px;
        }

        .admin-logo {
          width: 180px;
          height: auto;
          object-fit: contain;
          margin-bottom: 20px;
        }

        .admin-title {
          font-size: 3rem;
          font-weight: 800;
          text-align: center;
          background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .message {
          padding: 16px 20px;
          border-radius: 12px;
          margin-bottom: 30px;
          text-align: center;
          font-weight: 600;
          animation: slideDown 0.3s ease-out;
        }

        .message.success {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .message.error {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .admin-section {
          background: linear-gradient(135deg, #ffffff 0%, #fce7f3 100%);
          padding: 30px;
          border-radius: 20px;
          margin-bottom: 30px;
          box-shadow: 0 4px 16px rgba(147, 51, 234, 0.15);
        }

        .section-title {
          font-size: 1.8rem;
          font-weight: 700;
          color: #9333ea;
          margin-bottom: 20px;
        }

        .input-group {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
        }

        .admin-input {
          flex: 1;
          padding: 12px 16px;
          border: 2px solid #f3e8ff;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.3s ease;
          background: #ffffff;
          color: #333;
        }

        .admin-input:focus {
          outline: none;
          border-color: #9333ea;
          box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1);
        }

        .admin-button {
          padding: 12px 24px;
          background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%);
          color: #ffffff;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          box-shadow: 0 2px 8px rgba(147, 51, 234, 0.3);
        }

        .admin-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(147, 51, 234, 0.4);
        }

        .admin-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .cancel-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .question-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 30px;
        }

        .options-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .form-actions {
          display: flex;
          gap: 12px;
        }

        .categories-list {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .category-item {
          padding: 12px 20px;
          background: linear-gradient(135deg, #f3e8ff 0%, #fce7f3 100%);
          border-radius: 12px;
          color: #9333ea;
          font-weight: 600;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .category-actions {
          display: flex;
          gap: 8px;
        }

        .edit-button {
          padding: 6px 12px;
          background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .edit-button:hover {
          transform: scale(1.05);
          box-shadow: 0 2px 8px rgba(147, 51, 234, 0.3);
        }

        .delete-button-small {
          padding: 6px 12px;
          background: #ec4899;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.3s ease, background 0.3s ease;
        }

        .delete-button-small:hover {
          background: #db2777;
          transform: scale(1.05);
        }

        .cancel-button {
          padding: 12px 24px;
          background: #6b7280;
          color: #ffffff;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.3s ease, background 0.3s ease;
        }

        .cancel-button:hover {
          background: #4b5563;
          transform: translateY(-2px);
        }

        .questions-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .question-item {
          background: linear-gradient(135deg, #ffffff 0%, #f3e8ff 100%);
          padding: 20px;
          border-radius: 12px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          border: 2px solid #f3e8ff;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .question-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(147, 51, 234, 0.2);
        }

        .question-content {
          flex: 1;
        }

        .question-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
          gap: 12px;
        }

        .question-content strong {
          display: block;
          color: #9333ea;
          font-size: 1.1rem;
          flex: 1;
        }

        .question-category {
          padding: 4px 12px;
          background: linear-gradient(135deg, #f3e8ff 0%, #fce7f3 100%);
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          color: #9333ea;
          white-space: nowrap;
        }

        .question-options {
          margin-bottom: 12px;
        }

        .option-row {
          font-size: 0.9rem;
          color: #9333ea;
          margin-bottom: 6px;
          padding: 8px;
          background: rgba(147, 51, 234, 0.05);
          border-radius: 6px;
        }

        .option-label {
          font-weight: 700;
          margin-right: 8px;
        }

        .question-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .empty-state {
          text-align: center;
          padding: 40px;
          color: #9333ea;
          font-size: 1.1rem;
          font-weight: 600;
          background: linear-gradient(135deg, #fce7f3 0%, #f3e8ff 100%);
          border-radius: 12px;
        }

        .correct-answer {
          display: inline-block;
          padding: 4px 12px;
          background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%);
          color: #ffffff;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 700;
        }

        .delete-button {
          padding: 8px 16px;
          background: #ec4899;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.3s ease, background 0.3s ease;
        }

        .delete-button:hover {
          background: #db2777;
          transform: scale(1.05);
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
