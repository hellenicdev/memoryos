import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { corsOriginDelegate, isOriginAllowed, resolveAllowedOrigins } from '../src/config/cors'

describe('CORS origins', () => {
  it('allows https://hellenicdev.eu by default and rejects prefix lookalikes', () => {
    const allowed = resolveAllowedOrigins({})
    assert.equal(isOriginAllowed('https://hellenicdev.eu', allowed), true)
    assert.equal(isOriginAllowed('https://hellenicdev.eu.evil.com', allowed), false)
    assert.equal(isOriginAllowed('https://nothellenicdev.eu', allowed), false)
    assert.equal(isOriginAllowed('https://hellenicdev.github.io.evil.com', allowed), false)
    assert.equal(isOriginAllowed('http://localhost:5173.evil.com', allowed), false)
  })

  it('keeps local dev and the GitHub Pages origin as exact matches', () => {
    const allowed = resolveAllowedOrigins({})
    assert.equal(isOriginAllowed('http://localhost:5173', allowed), true)
    assert.equal(isOriginAllowed('http://localhost:5000', allowed), true)
    assert.equal(isOriginAllowed('https://hellenicdev.github.io', allowed), true)
    assert.equal(isOriginAllowed('https://hellenicdev.github.io/memoryos', allowed), false)
  })

  it('replaces the defaults when ALLOWED_ORIGINS is set', () => {
    const allowed = resolveAllowedOrigins({
      ALLOWED_ORIGINS: 'https://app.example.com, https://other.example.com',
      FRONTEND_URL: 'https://ignored.example',
    })
    assert.deepEqual(allowed, ['https://app.example.com', 'https://other.example.com'])
    assert.equal(isOriginAllowed('https://hellenicdev.eu', allowed), false)
    assert.equal(isOriginAllowed('https://app.example.com', allowed), true)
  })

  it('appends FRONTEND_URL only when ALLOWED_ORIGINS is unset', () => {
    const allowed = resolveAllowedOrigins({ FRONTEND_URL: ' https://staging.example.com ' })
    assert.equal(allowed.includes('https://staging.example.com'), true)
    assert.equal(allowed.includes('https://hellenicdev.eu'), true)
  })

  it('calls the CORS callback with false for a disallowed origin', async () => {
    const delegate = corsOriginDelegate(['https://hellenicdev.eu'])
    const allowed = await new Promise<boolean | undefined>((resolve, reject) => {
      delegate('https://hellenicdev.eu', (err, allow) => {
        if (err) reject(err)
        else resolve(allow)
      })
    })
    const denied = await new Promise<boolean | undefined>((resolve, reject) => {
      delegate('https://hellenicdev.eu.evil.com', (err, allow) => {
        if (err) reject(err)
        else resolve(allow)
      })
    })
    assert.equal(allowed, true)
    assert.equal(denied, false)
  })

  it('allows requests that omit Origin', async () => {
    const delegate = corsOriginDelegate(['https://hellenicdev.eu'])
    const allow = await new Promise<boolean | undefined>((resolve, reject) => {
      delegate(undefined, (err, value) => {
        if (err) reject(err)
        else resolve(value)
      })
    })
    assert.equal(allow, true)
  })
})
