import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { compare, hash } from "bcryptjs"
import { db } from "./db"
import { cleanText, logSecurityEvent } from "./security"
import { serverEnv } from "./env"
import { z } from "./validation"

const credentialsSchema = z.object({
  email: z.string().email().max(254).transform((value) => value.trim().toLowerCase()),
  password: z.string().min(1).max(128),
  name: z.string().max(80).optional(),
  action: z.enum(["login", "register"]).optional().default("login"),
})

const providers: any[] = [
  CredentialsProvider({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
      name: { label: "Name", type: "text" },
      action: { label: "Action", type: "text" },
    },
    async authorize(credentials) {
      const parsedCredentials = credentialsSchema.safeParse(credentials)
      if (!parsedCredentials.success) return null

      const { email, password, action } = parsedCredentials.data

      if (action === "register") {
        if (password.length < 8) {
          logSecurityEvent("weak_registration_password")
          return null
        }

        const existing = await db.user.findUnique({
          where: { email },
        })
        if (existing) throw new Error("Unable to create account")

        const hashed = await hash(password, 12)
        const user = await db.user.create({
          data: {
            email,
            name: cleanText(parsedCredentials.data.name, 80) || null,
            password: hashed,
          },
        })
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      }

      const user = await db.user.findUnique({
        where: { email },
      })
      if (!user || !user.password) {
        logSecurityEvent("failed_credentials_login")
        return null
      }

      const valid = await compare(password, user.password)
      if (!valid) {
        logSecurityEvent("failed_credentials_login")
        return null
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
      }
    },
  }),
]

if (serverEnv.googleClientId && serverEnv.googleClientSecret) {
  providers.push(
    GoogleProvider({
      clientId: serverEnv.googleClientId,
      clientSecret: serverEnv.googleClientSecret,
      allowDangerousEmailAccountLinking: true,
    })
  )
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: serverEnv.authSecret,
  adapter: PrismaAdapter(db),
  providers,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },
  callbacks: {
    async session({ session, token }: any) {
      if (token && session.user) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.sub = user.id
      }
      return token
    },
  },
})
