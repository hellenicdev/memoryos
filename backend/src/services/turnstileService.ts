import axios from 'axios'

export const verifyTurnstileToken = async (token: string): Promise<boolean> => {
  try {
    const secretKey = process.env.TURNSTILE_SECRET_KEY
    if (!secretKey) {
      console.warn('TURNSTILE_SECRET_KEY not set — skipping verification')
      return true
    }

    const response = await axios.post(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      { secret: secretKey, response: token },
      { headers: { 'Content-Type': 'application/json' } }
    )

    return response.data.success === true
  } catch (error) {
    console.error('Turnstile verification error:', error)
    return false
  }
}
