import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface RequestParams {
  params: Promise<{ capsuleId: string }>
}

export async function GET(request: Request, { params }: RequestParams) {
  const { capsuleId } = await params

  console.log(capsuleId)

  try {
    const capsule = await prisma.capsule.findUnique({
      where: { id: capsuleId },
    })

    if (!capsule) {
      return NextResponse.json({ error: 'Capsule not found' }, { status: 404 })
    }

    return NextResponse.json(capsule)
  } catch (error) {
    console.error('Fetch capsule error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
