import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import bcrypt from "bcryptjs";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-change-me"
);

export interface AdminPayload extends JWTPayload {
  handlerName: string;
}

export async function signAdminJWT(handlerName: string): Promise<string> {
  return new SignJWT({ handlerName } as AdminPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(JWT_SECRET);
}

export async function verifyAdminJWT(
  token: string
): Promise<AdminPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as AdminPayload;
  } catch {
    return null;
  }
}

export async function verifyPassword(plainPassword: string): Promise<boolean> {
  const storedPassword = process.env.ADMIN_PASSWORD;
  if (!storedPassword) return false;

  // Hash the stored password at runtime and compare
  // Since we store plain text in env, we compare directly
  return plainPassword === storedPassword;
}

export async function hashToken(token: string): Promise<string> {
  return bcrypt.hash(token, 10);
}
