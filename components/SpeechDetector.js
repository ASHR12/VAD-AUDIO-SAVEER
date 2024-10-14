'use client'
import { useState } from 'react'
import { useMicVAD, utils } from '@ricky0123/vad-react'

export default function SpeechDetector() {
  const [isRecording, setIsRecording] = useState(false)

  const vad = useMicVAD({
    onSpeechStart: () => setIsRecording(true),
    onSpeechEnd: async (audio) => {
      setIsRecording(false)
      const wav = utils.encodeWAV(audio)
      const blob = new Blob([wav], { type: 'audio/wav' })
      await sendAudioToBackend(blob)
    },
    // Speech Detection Thresholds
    positiveSpeechThreshold: 0.6, // Confidence level to indicate speech
    negativeSpeechThreshold: 0.2, // Confidence level to indicate silence

    // Redemption frames: ~5 frames ≈ 0.5 seconds of silence
    redemptionFrames: 5,

    // Ensure valid speech segments have at least 3 frames (~288 ms of speech)
    minSpeechFrames: 3,

    // Prepend 5 frames (~480 ms) to the start of each speech segment to avoid cut-off
    preSpeechPadFrames: 5,

    // Default frame size
    frameSamples: 1536,
    workletURL: '/vad.worklet.bundle.min.js',
    modelURL: '/silero_vad.onnx',

    ortConfig(ort) {
      const isSafari = /^((?!chrome|android).)*safari/i.test(
        navigator.userAgent
      )
      ort.env.wasm = {
        wasmPaths: {
          'ort-wasm-simd-threaded.wasm': '/ort-wasm-simd-threaded.wasm',
          'ort-wasm-simd.wasm': '/ort-wasm-simd.wasm',
          'ort-wasm.wasm': '/ort-wasm.wasm',
          'ort-wasm-threaded.wasm': '/ort-wasm-threaded.wasm',
        },
        numThreads: isSafari ? 1 : 4,
      }
    },
  })

  async function sendAudioToBackend(audioBlob) {
    const formData = new FormData()
    formData.append('audio', audioBlob, 'recording.wav')

    try {
      const response = await fetch('/api/save-audio', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        console.log('Audio saved successfully')
      } else {
        console.error('Failed to save audio')
      }
    } catch (error) {
      console.error('Error sending audio to backend:', error)
    }
  }

  return (
    <div>
      <h1>Speech Detector</h1>
      <p>
        Status: {vad.loading ? 'Loading...' : vad.errored ? 'Error' : 'Ready'}
      </p>
      <p>Recording: {isRecording ? 'Yes' : 'No'}</p>
    </div>
  )
}
