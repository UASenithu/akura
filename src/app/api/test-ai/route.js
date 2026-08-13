import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'No API key found',
        hasKey: false 
      }, { status: 500 })
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "Say hello"
                }
              ]
            }
          ]
        })
      }
    )

    const data = await response.json()
    
    return NextResponse.json({
      status: response.status,
      ok: response.ok,
      data: data,
      hasKey: true,
      keyPreview: apiKey.substring(0, 10) + '...'
    })

  } catch (error) {
    return NextResponse.json({ 
      error: error.message,
      hasKey: !!process.env.GEMINI_API_KEY
    }, { status: 500 })
  }
}