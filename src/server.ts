import { Hono } from 'hono'
import { serveStatic } from '@hono/node-server/serve-static'
import { appendFile } from 'node:fs/promises'
import { join } from 'node:path'

const app = new Hono()

const UPLOAD_DIR = join(import.meta.dir, '..', 'public', 'uploads')

app.use('/*', serveStatic({ root: '/public' }))

app.post('/upload', async (c) => {
  const body = await c.req.parseBody() // parse
  const file = body['file']
  const filename = c.req.header('filename') // parse
  const uploadDir = UPLOAD_DIR + '/' + filename
    
  if (!filename) return c.text('No filename was passed.') // Check if anything was passed as 'file'
  if (!file) return c.text('No file was passed in.') // Check if anything was passed as 'file'
  if (!(file instanceof File)) return c.text('That is not a file.') // Check if its a file

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  await appendFile(uploadDir, buffer)

  return c.html('File has been uploaded!')
})

export default app