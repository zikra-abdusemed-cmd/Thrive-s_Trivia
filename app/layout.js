import '../styles/globals.css'
import ConditionalNavbar from '../components/ConditionalNavbar'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ConditionalNavbar />
        <main style={{ padding: '24px' }}>{children}</main>
      </body>
    </html>
  )
}
