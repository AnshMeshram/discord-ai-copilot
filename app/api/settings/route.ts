import { NextRequest, NextResponse } from 'next/server'
import { getSystemInstructions, updateSystemInstructions, getAIConfig } from '@/lib/supabase/queries'

// GET - Fetch current system instructions
export async function GET() {
  try {
    const instructions = await getSystemInstructions()
    const aiConfig = await getAIConfig()

    return NextResponse.json({
      success: true,
      data: {
        instructions: instructions.text,
        aiConfig,
      },
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch settings',
      },
      { status: 500 }
    )
  }
}

// PUT - Update system instructions
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { instructions } = body

    if (!instructions || typeof instructions !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Instructions text is required',
        },
        { status: 400 }
      )
    }

    await updateSystemInstructions(instructions)

    return NextResponse.json({
      success: true,
      message: 'System instructions updated successfully',
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update settings',
      },
      { status: 500 }
    )
  }
}
