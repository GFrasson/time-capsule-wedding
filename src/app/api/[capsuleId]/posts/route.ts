import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface Params {
  capsuleId: string
}

export async function GET(request: Request, { params }: { params: Params }) {
  const { capsuleId } = params

  try {
    const posts = await prisma.message.findMany({
      where: { capsuleId },
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
