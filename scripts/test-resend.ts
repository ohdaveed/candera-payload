import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import { Resend } from 'resend'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load the project-specific .env file relative to this script directory
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const apiKey = process.env.RESEND_API_KEY

if (!apiKey) {
  console.error('Error: RESEND_API_KEY is not defined in your .env file.')
  process.exit(1)
}

console.log(`Loaded API Key: ${apiKey.slice(0, 7)}...`)

const resend = new Resend(apiKey)

async function run() {
  console.log('Sending test email via Resend SDK...')
  try {
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'arrizon.david@gmail.com',
      subject: 'Hello World',
      html: '<p>Congrats on sending your <strong>first email</strong>!</p>',
    })
    console.log('Email sent successfully:', data)
  } catch (error) {
    console.error('Failed to send email:', error)
  }
}

void run()
