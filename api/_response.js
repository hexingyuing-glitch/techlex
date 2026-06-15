import { DeepSeekError } from '../server/deepseekClient.js'

export function json(data, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json; charset=utf-8',
    },
  })
}

export function errorResponse(error) {
  if (error instanceof DeepSeekError) {
    return json(
      { error: { code: error.code, message: error.message } },
      error.status,
    )
  }

  console.error(error)
  return json(
    {
      error: {
        code: 'INTERNAL_ERROR',
        message: '服务器处理请求时发生错误。',
      },
    },
    500,
  )
}

export async function readJson(request) {
  try {
    return await request.json()
  } catch {
    return null
  }
}
