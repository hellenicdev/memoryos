const DEFAULT_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5000',
  'https://hellenicdev.eu',
  'https://hellenicdev.github.io',
]

export function resolveAllowedOrigins(env: NodeJS.ProcessEnv): string[] {
  const configured = env.ALLOWED_ORIGINS?.split(',').map((origin) => origin.trim()).filter(Boolean)
  if (configured && configured.length > 0) {
    return configured
  }

  const origins = [...DEFAULT_ORIGINS]
  const frontendUrl = env.FRONTEND_URL?.trim()
  if (frontendUrl && !origins.includes(frontendUrl)) {
    origins.push(frontendUrl)
  }
  return origins
}

export function isOriginAllowed(origin: string | undefined, allowedOrigins: readonly string[]): boolean {
  if (!origin) return true
  return allowedOrigins.includes(origin)
}

export function corsOriginDelegate(allowedOrigins: readonly string[]) {
  return (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void): void => {
    if (isOriginAllowed(origin, allowedOrigins)) {
      callback(null, true)
    } else {
      callback(null, false)
    }
  }
}
