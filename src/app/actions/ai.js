'use server'

export async function askAI(formData) {
  try {
    const question = formData.get('question')
    const subject = formData.get('subject') || 'General'

    if (!question) {
      return { error: 'Please ask a question!' }
    }

    const apiKey = process.env.OPENROUTER_API_KEY
    
    if (!apiKey) {
      console.error('❌ No OpenRouter API key found!')
      return { 
        error: "API key missing",
        answer: "API key not configured. Please check your .env.local file! 🔑" 
      }
    }

    // ✅ CORRECT OpenRouter model names
    const models = [
      'google/gemini-2.0-flash-exp:free',
      'google/gemini-2.0-flash-lite:free',
      'google/gemini-1.5-flash:free',
      'google/gemini-1.5-pro:free',
      'mistralai/mistral-7b-instruct:free',
      'meta-llama/llama-3.2-3b-instruct:free'
    ]

    let lastError = null
    let answer = null

    for (const model of models) {
      try {
        console.log(`🔄 Trying model: ${model}`)
        
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://akura.lk',
            'X-Title': 'Akura AI Assistant'
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: 'system',
                content: `You are "Akura AI" - a friendly, encouraging study assistant for Sri Lankan A/L students. 
                Speak in a mix of English and simple Sinhala (Singlish) when helpful.
                Be warm, encouraging, and stress-free.
                Use emojis occasionally (😊, 📚, 💡, 🎯).
                Keep explanations simple and clear.
                Break down complex topics into easy steps.
                Never say "I can't help" - always try to guide.`
              },
              {
                role: 'user',
                content: `Subject: ${subject}\nQuestion: ${question}\n\nPlease help this Sri Lankan A/L student with their question. Be encouraging and helpful!`
              }
            ],
            max_tokens: 500
          })
        })

        const data = await response.json()

        if (response.ok && data.choices?.[0]?.message?.content) {
          answer = data.choices[0].message.content
          console.log(`✅ Success with ${model}!`)
          break
        } else {
          console.log(`❌ ${model} failed:`, data.error?.message || 'Unknown error')
          lastError = data.error?.message
        }
      } catch (err) {
        console.log(`❌ ${model} error:`, err.message)
        lastError = err.message
      }
    }

    if (answer) {
      return { 
        answer: answer,
        subject: subject
      }
    }

    return { 
      error: lastError || "All models failed",
      answer: "Sorry, I'm having trouble connecting. Please try again later! 😊" 
    }

  } catch (error) {
    console.error('❌ AI Error:', error)
    return { 
      error: error.message,
      answer: "AI is temporarily down. Try again in a moment! 💪" 
    }
  }
}

export async function getStudyTips(subject) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY
    
    if (!apiKey) {
      return { tips: "Study regularly, practice past papers, and stay calm! 📚💪" }
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-exp:free',
        messages: [
          {
            role: 'user',
            content: `Give 5 practical study tips for ${subject} for a Sri Lankan A/L student. Make it encouraging and actionable. Keep it under 100 words. Format as bullet points with emojis.`
          }
        ]
      })
    })

    const data = await response.json()
    const tips = data.choices?.[0]?.message?.content || "Study regularly, practice past papers, and stay calm! 📚💪"

    return { tips: tips }

  } catch (error) {
    console.error('Error getting study tips:', error)
    return { tips: "Study regularly, practice past papers, and stay calm! 📚💪" }
  }
}

export async function getSummary(topic) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY
    
    if (!apiKey) {
      return { summary: "I couldn't generate a summary right now. Try again! 😊" }
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-exp:free',
        messages: [
          {
            role: 'user',
            content: `Summarize "${topic}" for a Sri Lankan A/L student. Keep it clear and simple. Include key points and a simple example. Under 150 words.`
          }
        ]
      })
    })

    const data = await response.json()
    const summary = data.choices?.[0]?.message?.content || "I couldn't generate a summary right now. Try again! 😊"

    return { summary: summary }

  } catch (error) {
    console.error('Error getting summary:', error)
    return { summary: "I couldn't generate a summary right now. Try again! 😊" }
  }
}