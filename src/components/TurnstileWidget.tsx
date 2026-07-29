import { Turnstile } from '@marsidev/react-turnstile'

interface TurnstileWidgetProps {
  onVerify: (token: string) => void
}

const TurnstileWidget = ({ onVerify }: TurnstileWidgetProps) => {
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY

  if (!siteKey) return null

  return (
    <Turnstile
      siteKey={siteKey}
      onSuccess={onVerify}
      options={{
        theme: 'dark',
      }}
    />
  )
}

export default TurnstileWidget
