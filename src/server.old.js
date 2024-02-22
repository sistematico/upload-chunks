import { Hono } from 'hono'
import { serveStatic } from '@hono/node-server/serve-static'
import busboy from 'busboy'
import { consola } from 'consola'

const app = new Hono()

app.use('/*', serveStatic({ root: '/public' }))

app.post('/upload', async (c) => {
  // const body = await c.req.parseBody({ all: true })
  // const buf = Buffer.from(file)
  const body = await c.req.raw.body
  const headers = await c.req.header()

  if (!body) return c.text('Corpo não definido')
  
  consola.success('Headers', headers)
  
  // const bb = busboy({ headers })
  // bb.on("file", () => { consola.success('OnFile') })
  // bb.on("finish", () => { consola.warn('Finish') })

  if (typeof body.file === 'string') {
    consola.warn('É STRING')
  } else if (body.file instanceof File) {
    consola.warn('É File')
  } else if (Array.isArray(body.file)) {
    consola.warn('É File[]')
  } 

  return c.text('Hono!')
})

export default app