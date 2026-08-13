'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// System prompt - makes AI act as a friendly Sri Lankan tutor
const SYSTEM_PROMPT = `
You are "Akura AI" - a friendly, encouraging study assistant for Sri Lankan A/L students.

Your personality:
- Speak in a mix of English and simple Sinhala (Singlish) when helpful
- Be warm, encouraging, and stress-free
- Use emojis occasionally (😊, 📚, 💡, 🎯)
- Keep explanations simple and clear
- Break down complex topics into easy steps
- Never say "I can't help" - always try to guide

Your knowledge:
- Sri Lankan A/L curriculum (Physical Science, Biological Science, Commerce, Technology)
- Exam tips and study techniques
- Subject-specific help (Physics, Chemistry, Biology, Maths, Accounting, Economics, IT)

When answering:
1. Start with encouragement ("Great question! 😊")
2. Explain step-by-step
3. Give practical tips for exams
4. Ask if they understood
5. Offer to explain more

Keep responses concise (under 200 words for simple questions).
`

export async function askAI(formData) {
  try {
    const question = formData.get('question')
    const subject = formData.get('subject') || 'General'
    const context = formData.get('context') || ''

    if (!question) {
      return { error: 'Please ask a question!' }
    }

    // Get the model
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction: SYSTEM_PROMPT
    })

    // Build the prompt with context
    const prompt = `
Subject: ${subject}
${context ? `Context: ${context}` : ''}
Student Question: ${question}

Please help this Sri Lankan A/L student with their question. Be encouraging and helpful!
`

    // Generate response
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return { 
      answer: text || "I'm not sure about that. Could you rephrase your question? 😊",
      subject: subject
    }

  } catch (error) {
    console.error('AI Error:', error)
    return { 
      error: "AI is currently unavailable. Please try again later! 😊",
      answer: "AI is temporarily down. Try again in a moment! 💪"
    }
  }
}

// Get study tips for a subject
export async function getStudyTips(subject) {
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction: SYSTEM_PROMPT
    })

    const prompt = `
Give 5 practical study tips for ${subject} for a Sri Lankan A/L student.
Make it encouraging and actionable. 
Keep it under 100 words total.
Format as bullet points with emojis.
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return { tips: text }

  } catch (error) {
    console.error('Error getting study tips:', error)
    return { tips: "Study regularly, practice past papers, and stay calm! 📚💪" }
  }
}

// Get quick summary of a topic
export async function getSummary(topic) {
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction: SYSTEM_PROMPT
    })

    const prompt = `
Summarize "${topic}" for a Sri Lankan A/L student.
Keep it clear and simple.
Include key points and a simple example.
Under 150 words.
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return { summary: text }

  } catch (error) {
    console.error('Error getting summary:', error)
    return { summary: "I couldn't generate a summary right now. Try again! 😊" }
  }
}