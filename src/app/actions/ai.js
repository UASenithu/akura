'use server'

export async function askAI(formData) {
  let question = ''  // ← Declare outside try block
  let subject = 'General'
  
  try {
    question = formData.get('question')
    subject = formData.get('subject') || 'General'

    if (!question) {
      return { error: 'Please ask a question!' }
    }

    console.log('🔍 Question:', question)
    console.log('📚 Subject:', subject)

    // ✅ Try a free public API first
    try {
      const response = await fetch('https://api.akura.ai/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: question,
          subject: subject,
          context: 'Sri Lankan A/L student'
        }),
        signal: AbortSignal.timeout(5000) // 5 second timeout
      })

      if (response.ok) {
        const data = await response.json()
        if (data.answer) {
          return { 
            answer: data.answer,
            subject: subject
          }
        }
      }
    } catch (apiError) {
      console.log('API not available, using fallback')
    }

    // ✅ Use fallback responses
    return { 
      answer: getFallbackResponse(question, subject),
      subject: subject
    }

  } catch (error) {
    console.error('❌ AI Error:', error)
    // ✅ question is now accessible here
    return { 
      answer: getFallbackResponse(question || 'help', subject || 'General')
    }
  }
}

// Fallback responses (no API needed!)
function getFallbackResponse(question, subject) {
  const q = question?.toLowerCase() || ''
  
  // Physics
  if (q.includes('newton') || q.includes('force') || q.includes('motion')) {
    return `**Newton's Laws of Motion** 📐

1️⃣ **First Law (Inertia)**: An object at rest stays at rest, and an object in motion stays in motion unless acted upon by an external force.

2️⃣ **Second Law (F=ma)**: Force equals mass times acceleration. The more mass, the more force needed!

3️⃣ **Third Law (Action-Reaction)**: For every action, there is an equal and opposite reaction.

💡 **Tip for A/L**: Practice applying these to real-world examples like car crashes, sports, and rockets! 🚀`
  }

  if (q.includes('physics')) {
    return `**Physics** is the study of matter, energy, and their interactions! 🔬

Key topics for A/L:
- Mechanics (motion, forces, energy)
- Waves and Optics
- Electricity and Magnetism
- Modern Physics (quantum, relativity)

💡 **Study Tip**: Draw diagrams and practice past papers! 📚`
  }

  // Chemistry
  if (q.includes('chemistry') || q.includes('chemical') || q.includes('reaction')) {
    return `**Chemistry** is the study of substances and how they react! 🧪

Key topics for A/L:
- Atomic Structure
- Chemical Bonding
- Stoichiometry
- Organic Chemistry

💡 **Study Tip**: Practice balancing equations and memorize reaction mechanisms! ⚗️`
  }

  if (q.includes('photosynthesis')) {
    return `**Photosynthesis** - How plants make food! 🌱

📝 **Equation**: 
6CO₂ + 6H₂O + Light → C₆H₁₂O₆ + 6O₂

🔑 **Key Points**:
- Takes place in chloroplasts (chlorophyll)
- Two stages: Light reactions + Calvin cycle
- Produces glucose (food) and oxygen

💡 **A/L Tip**: Know the structure of chloroplast and the role of each pigment! 🍃`
  }

  // Biology
  if (q.includes('biology') || q.includes('cell') || q.includes('dna')) {
    return `**Biology** is the study of living organisms! 🌿

Key topics for A/L:
- Cell Structure and Function
- Genetics (DNA, RNA, Inheritance)
- Human Body Systems
- Ecology and Evolution

💡 **Study Tip**: Use diagrams and mnemonics to remember processes! 🧬`
  }

  // Maths
  if (q.includes('math') || q.includes('calculus') || q.includes('algebra')) {
    return `**Mathematics** is the study of numbers, patterns, and logic! 📐

Key topics for A/L:
- Algebra (Equations, Functions)
- Calculus (Differentiation, Integration)
- Trigonometry
- Statistics and Probability

💡 **Study Tip**: Practice daily and understand concepts, don't just memorize! 📊`
  }

  // Accounting
  if (q.includes('accounting') || q.includes('balance sheet')) {
    return `**Accounting** is the language of business! 💼

Key topics for A/L:
- Double Entry System
- Financial Statements (Income Statement, Balance Sheet)
- Trial Balance
- Cash Flow

💡 **Study Tip**: Practice with real business scenarios and past papers! 📊`
  }

  // Economics
  if (q.includes('economics') || q.includes('supply') || q.includes('demand')) {
    return `**Economics** - How societies allocate resources! 📈

Key topics for A/L:
- Microeconomics (Supply & Demand)
- Macroeconomics (GDP, Inflation)
- Market Structures

💡 **Study Tip**: Connect theories to real-world events in Sri Lanka! 🇱🇰`
  }

  // IT / Technology
  if (q.includes('it') || q.includes('technology') || q.includes('computer')) {
    return `**Information Technology** is powering the modern world! 💻

Key topics for A/L:
- Programming Concepts
- Databases
- Networking
- Web Development

💡 **Study Tip**: Practice coding and understand how systems work! 🖥️`
  }

  // Study tips
  if (q.includes('study tip') || q.includes('study strategy') || q.includes('how to study')) {
    return `**Study Tips for A/L Success** 📚✨

1️⃣ **Create a Schedule** - Study at fixed times daily 📅
2️⃣ **Active Recall** - Test yourself instead of re-reading 💪
3️⃣ **Past Papers** - Practice exam-style questions 📝
4️⃣ **Mind Maps** - Visualize connections between topics 🧠
5️⃣ **Teach Others** - Explain concepts to friends 👥
6️⃣ **Healthy Lifestyle** - Sleep, eat, and exercise well 🌿
7️⃣ **Stay Calm** - Take breaks and avoid stress 🧘

💡 **Motivation**: "The harder you work, the luckier you get!" 🍀`
  }

  // Motivational
  if (q.includes('motivation') || q.includes('encouragement') || q.includes('stress')) {
    return `**You've Got This!** 💪🌟

Remember, success is not about being perfect. It's about consistent effort and learning from mistakes.

✅ Believe in yourself
✅ Take it one step at a time
✅ Every day is a chance to improve
✅ You're capable of amazing things

"Small steps lead to big achievements!" 🏆

💡 **A/L Tip**: Focus on understanding, not memorizing. Your journey matters more than the destination! 🌿`
  }

  // Default response
  return `Great question! 🤔 Let me help you with that!

I can answer questions about:
📚 Physics - Newton's laws, motion, forces
🧪 Chemistry - Reactions, equations, photosynthesis
🧬 Biology - Cells, DNA, human body
📐 Maths - Calculus, algebra, statistics
💼 Commerce - Accounting, economics, business
💻 Technology - IT, programming, networks

📝 Feel free to ask for:
- Study tips for your subject 📚
- Topic explanations 💡
- Exam strategies 🎯
- Motivation and encouragement 🌟

What would you like to know? 😊`
}

export async function getStudyTips(subject) {
  return { 
    tips: `**Study Tips for ${subject}** 📚✨

1️⃣ **Daily Practice** - Study ${subject} for at least 1 hour daily
2️⃣ **Past Papers** - Practice past paper questions
3️⃣ **Diagrams** - Use diagrams to visualize concepts
4️⃣ **Explain to Others** - Teaching helps reinforce learning
5️⃣ **Stay Consistent** - Regular study beats cramming!

💡 **Pro Tip**: Focus on understanding the fundamentals first! 🎯`
  }
}

export async function getSummary(topic) {
  return { 
    summary: `**Summary: ${topic}** 📝

Here's a quick overview of this topic for your A/L studies:

This topic is an important part of your A/L curriculum. Focus on understanding the key concepts and practicing with past papers.

💡 **Key Points to Remember**:
- Understand the basic principles
- Practice related problems
- Connect to real-world examples

Keep studying hard and you'll master this topic! 💪`
  }
}