'use server'

import { supabaseServer } from '@/lib/supabaseServer'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Get all quizzes for a subject
export async function getQuizzes(subjectId) {
  try {
    let query = supabaseServer
      .from('quizzes')
      .select('*, subjects(name)')
      .order('created_at', { ascending: false })

    if (subjectId) {
      query = query.eq('subject_id', subjectId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching quizzes:', error)
      return { error: error.message, quizzes: [] }
    }

    return { quizzes: data || [] }
  } catch (error) {
    console.error('Error in getQuizzes:', error)
    return { error: error.message, quizzes: [] }
  }
}

// Get a single quiz with questions
export async function getQuiz(quizId) {
  try {
    // Get quiz details
    const { data: quiz, error: quizError } = await supabaseServer
      .from('quizzes')
      .select('*, subjects(name)')
      .eq('id', quizId)
      .single()

    if (quizError) {
      console.error('Error fetching quiz:', quizError)
      return { error: quizError.message, quiz: null }
    }

    // Get questions
    const { data: questions, error: questionsError } = await supabaseServer
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('order_num', { ascending: true })

    if (questionsError) {
      console.error('Error fetching questions:', questionsError)
      return { error: questionsError.message, quiz: null }
    }

    return { quiz: { ...quiz, questions: questions || [] } }
  } catch (error) {
    console.error('Error in getQuiz:', error)
    return { error: error.message, quiz: null }
  }
}

// Submit quiz attempt
export async function submitQuiz(formData) {
  try {
    const quizId = formData.get('quizId')
    const answers = JSON.parse(formData.get('answers'))
    const timeTaken = parseInt(formData.get('timeTaken')) || 0

    // Get quiz with questions
    const { quiz } = await getQuiz(quizId)
    if (!quiz) {
      return { error: 'Quiz not found' }
    }

    // Calculate score
    let score = 0
    let totalMarks = 0

    quiz.questions.forEach((question) => {
      totalMarks += question.marks || 1
      const userAnswer = answers[question.id]
      if (userAnswer !== undefined && userAnswer === question.correct_answer) {
        score += question.marks || 1
      }
    })

    const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0

    // Save attempt
    const { data, error } = await supabaseServer
      .from('quiz_attempts')
      .insert({
        user_id: formData.get('userId'),
        quiz_id: quizId,
        score: score,
        total_marks: totalMarks,
        percentage: percentage,
        answers: answers,
        time_taken: timeTaken,
        completed_at: new Date().toISOString()
      })
      .select()

    if (error) {
      console.error('Error saving attempt:', error)
      return { error: error.message }
    }

    revalidatePath('/student/quizzes')
    return { 
      attempt: data[0],
      score: score,
      totalMarks: totalMarks,
      percentage: percentage,
      passed: percentage >= (quiz.passing_score || 50)
    }
  } catch (error) {
    console.error('Error in submitQuiz:', error)
    return { error: error.message }
  }
}

// Get user's quiz attempts
export async function getUserQuizAttempts(userId) {
  try {
    const { data, error } = await supabaseServer
      .from('quiz_attempts')
      .select('*, quizzes(title, subject_id, subjects(name))')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })

    if (error) {
      console.error('Error fetching attempts:', error)
      return { error: error.message, attempts: [] }
    }

    return { attempts: data || [] }
  } catch (error) {
    console.error('Error in getUserQuizAttempts:', error)
    return { error: error.message, attempts: [] }
  }
}

// Get quiz analytics
export async function getQuizAnalytics(userId) {
  try {
    // Get all attempts
    const { attempts } = await getUserQuizAttempts(userId)
    
    if (!attempts || attempts.length === 0) {
      return {
        totalQuizzes: 0,
        totalAttempts: 0,
        averageScore: 0,
        highestScore: 0,
        passRate: 0,
        attempts: []
      }
    }

    const totalAttempts = attempts.length
    const totalQuizzes = new Set(attempts.map(a => a.quiz_id)).size
    const scores = attempts.map(a => a.percentage || 0)
    const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / totalAttempts)
    const highestScore = Math.max(...scores)
    const passed = attempts.filter(a => (a.percentage || 0) >= 50).length
    const passRate = Math.round((passed / totalAttempts) * 100)

    return {
      totalQuizzes,
      totalAttempts,
      averageScore,
      highestScore,
      passRate,
      attempts: attempts.slice(0, 5)
    }
  } catch (error) {
    console.error('Error in getQuizAnalytics:', error)
    return {
      totalQuizzes: 0,
      totalAttempts: 0,
      averageScore: 0,
      highestScore: 0,
      passRate: 0,
      attempts: []
    }
  }
}