import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'lucky-wheel-fallback-secret-2024'
)

export const ADMIN_COOKIE_NAME = 'lucky_admin_token'
export const PLAYER_COOKIE_NAME = 'lucky_player_token'

export async function createToken(payload: Record<string, unknown>, expiresIn = '7d') {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(SECRET_KEY)
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY)
    return payload
  } catch {
    return null
  }
}

export async function getAdminSession() {
  const cookieStore = cookies()
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value
  if (!token) return null
  return await verifyToken(token)
}

export async function getPlayerSession() {
  const cookieStore = cookies()
  const token = cookieStore.get(PLAYER_COOKIE_NAME)?.value
  if (!token) return null
  return await verifyToken(token)
}
