import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import prisma from '@/lib/prisma'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

interface Params {
  capsuleId: string
}

export async function POST(
  request: Request,
  { params }: { params: Promise<Params> }
) {
  const { capsuleId } = await params

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const sender = formData.get('sender') as string
    const content = formData.get('content') as string

    if (!sender && !content && !file) {
      return NextResponse.json({ error: 'Empty submission' }, { status: 400 })
    }

    let mediaUrl = null
    let mediaType = 'TEXT'

    if (file && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const uploadResult = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'wedding_capsule',
            resource_type: 'auto',
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        )
        stream.end(buffer)
      })

      mediaUrl = uploadResult.secure_url
      mediaType = uploadResult.resource_type === 'video' ? 'VIDEO' : 'IMAGE'
    }

    const message = await prisma.message.create({
      data: {
        sender: sender || 'Anônimo',
        content: content || '',
        mediaUrl: mediaUrl,
        type: mediaType,
        capsuleId: capsuleId,
      },
    })

    return NextResponse.json({ success: true, message })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
