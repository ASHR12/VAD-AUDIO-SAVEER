import fs from 'node:fs/promises'
import path from 'node:path'

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
        ],
      },
    ]
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = { ...config.resolve.fallback, fs: false }
    }
    return config
  },
}

export default nextConfig

// File copying logic
async function copyFiles() {
  try {
    await fs.access('public/')
  } catch {
    await fs.mkdir('public/', { recursive: true })
  }

  const wasmFiles = (
    await fs.readdir('node_modules/onnxruntime-web/dist/')
  ).filter((file) => path.extname(file) === '.wasm')

  await Promise.all([
    fs.copyFile(
      'node_modules/@ricky0123/vad-web/dist/vad.worklet.bundle.min.js',
      'public/vad.worklet.bundle.min.js'
    ),
    fs.copyFile(
      'node_modules/@ricky0123/vad-web/dist/silero_vad.onnx',
      'public/silero_vad.onnx'
    ),
    fs.copyFile(
      'node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.mjs',
      'public/ort-wasm-simd-threaded.mjs'
    ),
    ...wasmFiles.map((file) =>
      fs.copyFile(`node_modules/onnxruntime-web/dist/${file}`, `public/${file}`)
    ),
  ])
}

// Call the function to copy files during build
copyFiles()
