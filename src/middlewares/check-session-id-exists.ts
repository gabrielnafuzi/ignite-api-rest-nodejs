/* eslint-disable require-await -- Fastify requires routes to be async */
import type { FastifyReply, FastifyRequest } from 'fastify'

export const checkSessionIdExists = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  const sessionId = req.cookies.sessionId

  if (!sessionId) {
    return reply.status(401).send({
      message: 'Unauthorized',
    })
  }
}
