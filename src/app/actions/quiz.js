'use server'

import { supabaseServer } from '@/lib/supabaseServer'
import { revalidatePath } from 'next/cache'

// Get all quizzes
export async function getQuizzes() {
  try {
    const { data, error } = await supabaseServer
      .from('quizzes')
      .select(`
        *,
        subjects (id, name)
      `)
      .order('created_at', { ascending: false })

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
    const { data: quiz, error: quizError } = await supabaseServer
      .from('quizzes')
      .select('*, subjects(name)')
      .eq('id', quizId)
      .single()

    if (quizError) {
      console.error('Error fetching quiz:', quizError)
      return { error: quizError.message, quiz: null }
    }

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
    const userId = formData.get('userId')
    const answers = JSON.parse(formData.get('answers'))
    const timeTaken = parseInt(formData.get('timeTaken')) || 0

    const { quiz } = await getQuiz(quizId)
    if (!quiz) {
      return { error: 'Quiz not found' }
    }

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

    // Check if userId is valid UUID
    const isValidUuid = userId && userId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    const finalUserId = isValidUuid ? userId : null

    const { data, error } = await supabaseServer
      .from('quiz_attempts')
      .insert({
        user_id: finalUserId,
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

// Toggle quiz publish status
export async function toggleQuizPublish(formData) {
  try {
    const quizId = formData.get('quizId')
    const isPublished = formData.get('isPublished') === 'true'

    const { error } = await supabaseServer
      .from('quizzes')
      .update({ is_published: isPublished })
      .eq('id', quizId)

    if (error) {
      console.error('Error toggling publish status:', error)
      return { error: error.message }
    }

    revalidatePath('/admin/quizzes')
    return { success: true }
  } catch (error) {
    console.error('Error in toggleQuizPublish:', error)
    return { error: error.message }
  }
}