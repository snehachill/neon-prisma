// app/api/users/route.js
import prisma from '../../../lib/prisma'  // adjust path accordingly

export async function GET() {
  const users = await prisma.user.findMany()
  return new Response(JSON.stringify(users), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })
}

export async function POST(req) {
  const body = await req.json()
  // simple validation (beginner friendly)
  if (!body.email) {
    return new Response(JSON.stringify({ error: 'email required' }), { status: 400 })
  }

  const created = await prisma.user.create({
    data: {
      email: body.email,
      name: body.name || null,
    },
  })

  return new Response(JSON.stringify(created), {
    status: 201,
    headers: { 'content-type': 'application/json' },
  })
}
