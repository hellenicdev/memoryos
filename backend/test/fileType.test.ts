import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  contentDispositionHeader,
  detectType,
  mimeTypeForDownload,
  resolveStoredPath,
} from '../src/services/fileType'

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00])
const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10])
const PDF = Buffer.from('%PDF-1.7\n%fake')

describe('magic-byte detection', () => {
  it('recognizes png, jpeg, and pdf from bytes', () => {
    assert.equal(detectType(PNG)?.mimeType, 'image/png')
    assert.equal(detectType(JPEG)?.mimeType, 'image/jpeg')
    assert.equal(detectType(PDF)?.mimeType, 'application/pdf')
  })

  it('accepts utf-8 text and rejects html, empty, and binary payloads', () => {
    assert.equal(detectType(Buffer.from('Καλημέρα, notes'))?.mimeType, 'text/plain')
    assert.equal(detectType(Buffer.from('<!DOCTYPE html><html><script>alert(1)</script></html>')), null)
    assert.equal(detectType(Buffer.from('<html><body>hi</body></html>')), null)
    assert.equal(detectType(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>')), null)
    assert.equal(detectType(Buffer.from([0x00, 0x01, 0x02, 0x03])), null)
    assert.equal(detectType(Buffer.alloc(0)), null)
  })

  it('does not treat a client-supplied name or type as evidence', () => {
    const htmlNamedPdf = Buffer.from('<!DOCTYPE html><title>report.pdf</title>')
    assert.equal(detectType(htmlNamedPdf), null)
  })
})

describe('download headers and paths', () => {
  it('forces attachment and replaces a dangerous extension', () => {
    const header = contentDispositionHeader('../../evil.html', 'text/plain')
    assert.match(header, /^attachment;/)
    assert.match(header, /filename="evil\.txt"/)
    assert.doesNotMatch(header, /\.html/i)
    assert.doesNotMatch(header, /\r|\n/)
  })

  it('serves sniffed image bytes even when the stored type was html', () => {
    assert.equal(mimeTypeForDownload(PNG, 'text/html'), 'image/png')
    assert.equal(mimeTypeForDownload(Buffer.from('<html></html>'), 'text/html'), 'application/octet-stream')
    assert.equal(mimeTypeForDownload(Buffer.from('hello'), 'text/plain'), 'text/plain')
  })

  it('refuses stored names that leave the upload directory', () => {
    const root = '/tmp/memoryos-uploads'
    assert.equal(resolveStoredPath(root, '../etc/passwd'), null)
    assert.equal(resolveStoredPath(root, '..'), null)
    assert.equal(resolveStoredPath(root, '/etc/passwd'), null)
    assert.equal(resolveStoredPath(root, 'uuid/evil'), null)
    const stored = resolveStoredPath(root, '3f1c1c2a-6b1e-4a0e-9d2a-6e5c0b7a1d11')
    assert.equal(stored, `${root}/3f1c1c2a-6b1e-4a0e-9d2a-6e5c0b7a1d11`)
    const legacy = resolveStoredPath(root, '3f1c1c2a-6b1e-4a0e-9d2a-6e5c0b7a1d11-notes.pdf')
    assert.equal(legacy, `${root}/3f1c1c2a-6b1e-4a0e-9d2a-6e5c0b7a1d11-notes.pdf`)
  })
})
