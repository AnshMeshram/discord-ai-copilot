import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Discord AI Copilot API is running',
    phase: 'Phase 1 Complete - Ready for Phase 2',
    timestamp: new Date().toISOString(),
  })
}
