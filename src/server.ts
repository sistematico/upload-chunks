import { Hono } from 'hono'
import { serveStatic } from '@hono/node-server/serve-static'
import { createWriteStream } from 'fs'

const app = new Hono()

async function concatChunks() {
  
}

app.use('/*', serveStatic({ root: '/public' }))

app.post('/upload', async (c) => {
  const body = await c.req.parseBody() // parse
  const filename = c.req.header('filename') // parse
  const file = body['file']

  if (!filename) return c.text('No filename was passed.') // Check if anything was passed as 'file'
  if (!file) return c.text('No file was passed in.') // Check if anything was passed as 'file'
  if (!(file instanceof File)) return c.text('That is not a file.') // Check if its a file

  const stream = createWriteStream(import.meta.dir + '/' + filename) // Where to save - process.cwd().replace(/\\/g, '/')+'/'+file.name
  stream.on('error', _ => c.text('Error writing to file.')) // Error Handling
  
  const buffer = Buffer.from(await file.arrayBuffer()) // buffering the buffer? idk
  stream.write(buffer)
  
  stream.end()

  return c.html('File has been uploaded!')
})

export default app