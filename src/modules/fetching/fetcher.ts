import { z } from 'zod'
import { fetch } from '@tauri-apps/plugin-http'

type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD' | 'CONNECT' | 'TRACE'
type BodyMethod = 'POST' | 'PUT' | 'PATCH'

export type APIRoute<Method extends HTTPMethod = HTTPMethod> = {
  url: string
  method: Method
  responseSchema: z.ZodType
} & (Method extends BodyMethod ? {} : { bodySchema: z.ZodType })

type FetchDataParams<Route extends APIRoute> = {
  route: Route
  headers?: Record<string, string>
} & (Route extends { bodySchema: z.ZodType } ? { body: z.infer<Route['bodySchema']> } : {})

export const fetchData = async <Route extends APIRoute>(
  params: FetchDataParams<Route>
): Promise<z.infer<Route['responseSchema']>> => {
  const response = await fetch(params.route.url, {
    method: params.route.method,
    headers: { 'Content-Type': 'application/json', ...params.headers },
    body: 'body' in params ? JSON.stringify(params.body) : undefined
  })

  console.log(response.ok)

  if (!response.ok) throw new Error(`Server sent an error : ${response.status} ${response.statusText}`)

  const unsafeData = await response.json()
  console.log(unsafeData)
  const data = params.route.responseSchema.parse(unsafeData)
  return data
}
