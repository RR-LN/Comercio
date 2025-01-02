import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { compress } from 'next/dist/compiled/compression'

export async function middleware(request: NextRequest) {
  // Verificar se o cliente aceita compressão
  const acceptEncoding = request.headers.get('accept-encoding') || ''

  // Aplicar compressão se suportado
  if (acceptEncoding.includes('br')) {
    const response = await NextResponse.next()
    response.headers.set('Content-Encoding', 'br')
    return response
  }

  if (acceptEncoding.includes('gzip')) {
    const response = await NextResponse.next()
    response.headers.set('Content-Encoding', 'gzip')
    return response
  }

  // Cache Control
  const response = await NextResponse.next()
  
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=10, stale-while-revalidate=59'
    )
  }

  if (request.nextUrl.pathname.match(/\.(jpg|jpeg|png|webp|avif|css|js)$/)) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=31536000, immutable'
    )
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 