import { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma";
import { z } from 'zod';
import { randomUUID } from "crypto";

export async function voteOnPoll(app: FastifyInstance) {
    app.post('/polls/:pollId/votes', async (req, res) => {
        const voteOnPollBody = z.object({
            pollOptionId: z.string().uuid()
        })

        const voteOnPollParams = z.object({
            pollId: z.string().uuid()
        })

        const { pollId } = voteOnPollParams.parse(req.params);
        const { pollOptionId } = voteOnPollBody.parse(req.body);

        let { sessionId } = req.cookies;

        if (!sessionId) {
            sessionId = randomUUID();

            res.setCookie('sessionId', sessionId, {
                path: '/', // quais rotas da aplicação podem acessar o cookie ('/' = todas)
                maxAge: 60 * 60 * 24 * 30, // 30 days
                signed: true, // cookie assinado (usuário não consegue modificar o valor do cookie)
                httpOnly: true // front-end não consegue acessar o cookie
            })
        } else {
            const userPreviousVoteOnPoll = await prisma.vote.findUnique({
                where: {
                    sessionId_pollId: {
                        sessionId,
                        pollId
                    }
                }
            })

            if (userPreviousVoteOnPoll && userPreviousVoteOnPoll.pollOptionId !== pollOptionId) {
                await prisma.vote.delete({
                    where: {
                        id: userPreviousVoteOnPoll.id
                    }
                })

            } else if (userPreviousVoteOnPoll) {
                return res.status(400).send({ message: 'You already voted on this poll.' });
            }
        }

        await prisma.vote.create({
            data: {
                sessionId,
                pollId,
                pollOptionId
            }
        })

        return res.status(201).send();
    });
}