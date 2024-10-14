import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { NextResponse } from 'next/server'
import { existsSync } from 'fs'

export async function POST(request) {
  const formData = await request.formData()
  const file = formData.get('audio')

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const tempFolder = join(process.cwd(), 'public', 'recordings')
  const fileName = `recording_${Date.now()}.wav`
  const filePath = join(tempFolder, fileName)

  try {
    // Create the temp folder if it doesn't exist
    if (!existsSync(tempFolder)) {
      await mkdir(tempFolder, { recursive: true })
    }

    // Save the audio file to the temp folder
    await writeFile(filePath, buffer)

    return NextResponse.json({
      message: 'Audio saved successfully',
      path: filePath,
    })
  } catch (error) {
    console.error('Error saving file:', error)
    return NextResponse.json({ error: 'Error saving file' }, { status: 500 })
  }
}
