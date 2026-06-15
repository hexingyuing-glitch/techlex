import { createServer } from 'node:http'
import { createServer as createViteServer } from 'vite'
import extractTermsHandler from '../api/extract-terms.js'
import generateCardHandler from '../api/generate-card.js'

const host = '127.0.0.1'
const port = 5173
const handlers = new Map([
  ['/api/extract-terms', extractTermsHandler],
  ['/api/generate-card', generateCardHandler],
])

function createWebRequest(request, body) {
  const headers = new Headers()
  for (const [name, value] of Object.entries(request.headers)) {
    if (Array.isArray(value)) {
      value.forEach((item) => headers.append(name, item))
    } else if (value !== undefined) {
      headers.set(name, value)
    }
  }

  return new Request(`http://${request.headers.host}${request.url}`, {
    method: request.method,
    headers,
    body: ['GET', 'HEAD'].includes(request.method) ? undefined : body,
  })
}

async function readBody(request) {
  const chunks = []
  for await (const chunk of request) chunks.push(chunk)
  return Buffer.concat(chunks)
}

async function writeWebResponse(response, nodeResponse) {
  nodeResponse.statusCode = response.status
  response.headers.forEach((value, name) => nodeResponse.setHeader(name, value))
  nodeResponse.end(Buffer.from(await response.arrayBuffer()))
}

const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: 'spa',
})

const server = createServer(async (request, response) => {
  const pathname = new URL(request.url, `http://${request.headers.host}`).pathname
  const handler = handlers.get(pathname)

  if (!handler) {
    vite.middlewares(request, response)
    return
  }

  try {
    const webRequest = createWebRequest(request, await readBody(request))
    await writeWebResponse(await handler.fetch(webRequest), response)
  } catch (error) {
    console.error(error)
    response.statusCode = 500
    response.setHeader('Content-Type', 'application/json; charset=utf-8')
    response.end(
      JSON.stringify({
        error: {
          code: 'LOCAL_SERVER_ERROR',
          message: '本地服务处理请求失败。',
        },
      }),
    )
  }
})

server.listen(port, host, () => {
  console.log(`TechLex real API mode: http://${host}:${port}/`)
})

async function shutdown() {
  await vite.close()
  server.close()
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
