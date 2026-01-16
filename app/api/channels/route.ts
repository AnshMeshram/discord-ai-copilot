import { NextRequest, NextResponse } from 'next/server'
import {
  getAllowedChannels,
  addAllowedChannel,
  removeAllowedChannel,
} from '@/lib/supabase/queries'

// GET - List all allowed channels
export async function GET() {
  try {
    const channels = await getAllowedChannels()

    return NextResponse.json({
      success: true,
      data: channels,
    })
  } catch (error) {
    console.error('Error fetching channels:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch channels',
      },
      { status: 500 }
    )
  }
}

// POST - Add channel to allow-list
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { channelId, channelName } = body

    if (!channelId || typeof channelId !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Channel ID is required',
        },
        { status: 400 }
      )
    }

    const channel = await addAllowedChannel(channelId, channelName)

    return NextResponse.json({
      success: true,
      data: channel,
      message: 'Channel added to allow-list',
    })
  } catch (error) {
    console.error('Error adding channel:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add channel',
      },
      { status: 500 }
    )
  }
}

// DELETE - Remove channel from allow-list
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

    await removeAllowedChannel(channelId)

    return NextResponse.json({
      success: true,
      message: 'Channel removed from allow-list',
    })
  } catch (error) {
    console.error('Error removing channel:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove channel',
      },
      { status: 500 }
    )
  }
}
