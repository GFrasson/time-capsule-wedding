import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface RequestParams {
  params: Promise<{ capsuleId: string }>
}

export async function GET(request: NextRequest, { params }: RequestParams) {
  const { capsuleId } = await params

  console.log(capsuleId)

  try {
    const posts = await prisma.message.findMany({
      where: { capsuleId },
      orderBy: {
        createdAt: 'asc',
      },
    })
    return NextResponse.json(posts)
  } catch (error) {
    console.error('Fetch posts error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
