import { Hono } from 'hono'
import { serveStatic } from '@hono/node-server/serve-static'
import busboy from 'busboy'
import { consola } from 'consola'

const app = new Hono()

app.use('/*', serveStatic({ root: '/public' }))

app.post('/upload', async (c) => {
  const headers = c.req.header()
  // const contentLength = c.req.header('content-length')
  const formdata = await c.req.formData()
  // const file = formdata.get('file')

  const bb = busboy({ headers: formdata })

  bb.on('file', (name, file, info) => {
    consola.success(name)
    consola.info(info)
    consola.error(file)
  })

  // consola.success('filestream:', formdata)
  //consola.warn('headers:', headers)
  // consola.success('file:', file)
  
  // let count = 0

  // for (const ch of Array.from(formdata)) {
  //   count++
  //   consola.info(`Chunk ${ch} #${count}`)
  // }

  // consola.success('file:', file)

  return c.text('OK')
})

export default app