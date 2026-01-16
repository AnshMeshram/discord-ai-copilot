import { NextRequest, NextResponse } from 'next/server'
import {
  getAllSummaries,
  getConversationSummary,
  resetConversationSummary,
} from '@/lib/supabase/queries'

// GET - Get conversation summaries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const channelId = searchParams.get('channelId')

    if (channelId) {
      // Get summary for specific channel
      const summary = await getConversationSummary(channelId)
      return NextResponse.json({
        success: true,
        data: summary,
      })
    } else {
      // Get all summaries
      const summaries = await getAllSummaries()
      return NextResponse.json({
        success: true,
        data: summaries,
      })
    }
  } catch (error) {
    console.error('Error fetching summaries:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch summaries',
      },
      { status: 500 }
    )
  }
}

// DELETE - Reset conversation summary
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const channelId = searchParams.get('channelId')

    if (!channelId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Channel ID is required',
        },
        { status: 400 }
      )
    }

    await resetConversationSummary(channelId)

    return NextResponse.json({
      success: true,
      message: 'Conversation summary reset successfully',
    })
  } catch (error) {
    console.error('Error resetting summary:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reset summary',
      },
      { status: 500 }
    )
  }
}
