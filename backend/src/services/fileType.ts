import path from 'path'

export const ALLOWED_MIME_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'text/plain'] as const
export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number]

const PDF = Buffer.from('%PDF')
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
const JPEG = Buffer.from([0xff, 0xd8, 0xff])

const HTML_START = /^(?:<!doctype\s+html\b|<html\b|<script\b|<svg\b|<\?xml\b)/i

export function detectBinary(buffer: Buffer): AllowedMimeType | null {
  if (buffer.length >= PNG.length && buffer.subarray(0, PNG.length).equals(PNG)) {
    return 'image/png'
  }
  if (buffer.length >= JPEG.length && buffer.subarray(0, JPEG.length).equals(JPEG)) {
    return 'image/jpeg'
  }
  if (buffer.length >= PDF.length && buffer.subarray(0, PDF.length).equals(PDF)) {
    return 'application/pdf'
  }
  return null
}

export function detectType(buffer: Buffer): { mimeType: AllowedMimeType } | null {
  if (buffer.length === 0) return null

  const binary = detectBinary(buffer)
  if (binary) return { mimeType: binary }

  if (buffer.includes(0)) return null

  let text: string
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(buffer)
  } catch {
    return null
  }

  const head = text.replace(/^\uFEFF/, '').trimStart()
  if (HTML_START.test(head)) return null

  return { mimeType: 'text/plain' }
}

export function mimeTypeForDownload(header: Buffer, storedMime: string): string {
  const binary = detectBinary(header)
  if (binary) return binary
  if (!header.includes(0) && storedMime === 'text/plain') return 'text/plain'
  return 'application/octet-stream'
}

const EXTENSIONS: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'text/plain': 'txt',
  'application/octet-stream': 'bin',
}

export function contentDispositionHeader(originalName: string, mimeType: string): string {
  const ext = EXTENSIONS[mimeType] || 'bin'
  const baseRaw = path.win32.basename(path.posix.basename(originalName || 'download')).replace(/\.[^.]+$/, '')
  const unicodeBase = baseRaw.replace(/[\r\n"]/g, '').trim().slice(0, 80) || 'download'
  const asciiBase = unicodeBase.replace(/[^A-Za-z0-9._ -]/g, '_').replace(/^_+|_+$/g, '') || 'download'
  const asciiName = `${asciiBase}.${ext}`
  const utf8Name = encodeURIComponent(`${unicodeBase}.${ext}`)
  return `attachment; filename="${asciiName}"; filename*=UTF-8''${utf8Name}`
}

export function resolveStoredPath(uploadDir: string, filename: string): string | null {
  if (!filename || filename.includes('\0')) return null
  if (filename !== path.basename(filename)) return null
  if (filename === '.' || filename === '..') return null

  const root = path.resolve(uploadDir)
  const resolved = path.resolve(root, filename)
  const relative = path.relative(root, resolved)
  if (relative.startsWith('..') || path.isAbsolute(relative)) return null
  return resolved
}
