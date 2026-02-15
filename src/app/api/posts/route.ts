import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const posts = await prisma.message.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })
    return NextResponse.json(posts)
  } catch (error) {
    console.error('Fetch posts error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
