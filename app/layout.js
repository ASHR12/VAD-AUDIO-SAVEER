export const metadata = {
  title: 'VAD Audio Saver',
  description: 'Save audio when voice activity is detected',
}

// RootLayout.js
export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body>{children}</body>
    </html>
  )
}
