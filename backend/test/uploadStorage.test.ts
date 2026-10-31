import assert from 'node:assert/strict'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { after, before, describe, it } from 'node:test'
import express from 'express'
import type { Server } from 'http'
import type { AddressInfo } from 'net'
import { MAX_UPLOAD_BYTES } from '../src/config/uploads'
import { createUploadHandler } from '../src/middleware/uploadMiddleware'
import { readAndValidateUpload } from '../src/services/fileService'
import { AppError } from '../src/middleware/errorHandler'

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x00])

describe('disk uploads', () => {
  const uploadDir = fs.mkdtempSync(path.join(os.tmpdir(), 'memoryos-upload-'))
  let server: Server
  let baseUrl = ''

  before(async () => {
    const app = express()
    app.post('/upload', createUploadHandler(uploadDir), (req, res) => {
      const file = req.file
      res.json({
        filename: file?.filename,
        extension: file?.filename ? path.extname(file.filename) : null,
        buffered: Boolean(file?.buffer?.length),
        path: file?.path,
      })
    })
    server = app.listen(0)
    await new Promise<void>((resolve) => server.once('listening', () => resolve()))
    const address = server.address() as AddressInfo
    baseUrl = `http://127.0.0.1:${address.port}`
  })

  after(async () => {
    await new Promise<void>((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())))
    fs.rmSync(uploadDir, { recursive: true, force: true })
  })

  it('streams to disk under a random name with no extension', async () => {
    const form = new FormData()
    form.append('file', new Blob([PNG], { type: 'text/html' }), 'evil.html')

    const response = await fetch(`${baseUrl}/upload`, { method: 'POST', body: form })
    assert.equal(response.status, 200)
    const body = await response.json() as { filename: string; extension: string; buffered: boolean; path: string }

    assert.equal(body.extension, '')
    assert.equal(body.filename.includes('.'), false)
    assert.equal(body.buffered, false)
    assert.equal(path.dirname(body.path), uploadDir)
    assert.equal(fs.readFileSync(body.path).equals(PNG), true)

    const validated = await readAndValidateUpload({
      filename: body.filename,
      path: body.path,
      originalname: 'evil.html',
      mimetype: 'text/html',
      size: PNG.length,
    } as Express.Multer.File)
    assert.equal(validated.mimeType, 'image/png')
    assert.equal(fs.existsSync(body.path), true)
  })

  it('rejects html bytes even when the client calls them text', async () => {
    const html = Buffer.from('<!DOCTYPE html><html><script>alert(1)</script></html>')
    const form = new FormData()
    form.append('file', new Blob([html], { type: 'text/plain' }), 'note.txt')

    const response = await fetch(`${baseUrl}/upload`, { method: 'POST', body: form })
    assert.equal(response.status, 200)
    const body = await response.json() as { filename: string; path: string }
    assert.equal(fs.existsSync(body.path), true)

    await assert.rejects(
      () => readAndValidateUpload({
        filename: body.filename,
        path: body.path,
        originalname: 'note.txt',
        mimetype: 'text/plain',
        size: html.length,
      } as Express.Multer.File),
      (error: unknown) => error instanceof AppError && error.statusCode === 400
    )
    assert.equal(fs.existsSync(body.path), false)
  })

  it('rejects files over 10 MB before they are kept', async () => {
    const form = new FormData()
    form.append('file', new Blob([Buffer.alloc(MAX_UPLOAD_BYTES + 1)]), 'large.bin')

    const before = new Set(fs.readdirSync(uploadDir))
    const response = await fetch(`${baseUrl}/upload`, { method: 'POST', body: form })
    assert.equal(response.status, 413)
    const body = await response.json() as { message: string }
    assert.match(body.message, /10 MB/)
    const leftover = fs.readdirSync(uploadDir).filter((name) => !before.has(name))
    assert.deepEqual(leftover, [])
  })
})
