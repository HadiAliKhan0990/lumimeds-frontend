import { SignatureV4 } from '@smithy/signature-v4';
import { defaultProvider } from '@aws-sdk/credential-provider-node';
import { Sha256 } from '@aws-crypto/sha256-js';
import { HttpRequest } from '@aws-sdk/protocol-http';


type AwsSignedFetchOptions = {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  region: string
  service?: string // default: execute-api
  query?: Record<string, string | number | boolean | undefined>
  headers?: Record<string, string>
  body?: unknown
}
export class AwsSignedFetchError extends Error {
  status: number
  error: string

  constructor(status: number, error: string) {
    super(`API error ${status}: ${error}`)
    this.name = 'AwsSignedFetchError'
    this.status = status
    this.error = error
  }
}

export interface AwsSignedFetchResponse {
  [key: string]: unknown;
}

export async function awsSignedFetch<T = AwsSignedFetchResponse>({
  url,
  method = 'GET',
  region,
  service = 'execute-api',
  query,
  headers = {},
  body
}: AwsSignedFetchOptions): Promise<T> {
  const creds = await defaultProvider()()
  const signer = new SignatureV4({
    credentials: creds,
    region,
    service,
    sha256: Sha256
  })

  const urlObj = new URL(url)

  // add query params to url so that the query object will be combined with 
  // the query params in the url if there are any in the url object
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        urlObj.searchParams.set(key, String(value))
      }
    })
  }

  // Build headers - only include content-type if there's a body
  const requestHeaders: Record<string, string> = {
    host: urlObj.hostname,
    ...headers
  }
  
  if (body) {
    requestHeaders['content-type'] = 'application/json'
  }

  const request = new HttpRequest({
    protocol: urlObj.protocol,
    hostname: urlObj.hostname,
    port: urlObj.port ? Number(urlObj.port) : undefined,
    method,
    path: urlObj.pathname,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
    query: Object.fromEntries(urlObj.searchParams.entries())
  })

  const signedRequest = await signer.sign(request)
  
  // Build fetch URL using URL object - ensures exact match with signed path
  const fetchUrl = urlObj.toString()
  
  const response = await fetch(fetchUrl, {
    method: signedRequest.method,
    headers: signedRequest.headers as HeadersInit,
    body: signedRequest.body as BodyInit | undefined
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Response body:', errorText)
    throw new AwsSignedFetchError(response.status, errorText)
  }

  return response.json()
}