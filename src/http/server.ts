import fastify from 'fastify';
import cookie from '@fastify/cookie';
import websocket from '@fastify/websocket';
import { createPoll } from './routes/create-poll';
import { getPoll } from './routes/get-poll';
import { voteOnPoll } from './routes/vote-on-poll';
import { pollResults } from './ws/poll-results';

const app = fastify();

app.register(cookie, {
    secret: 'polls-app-nlw', // é o "código" de uma assinatura. O secret deve ser uma string muito complicada, como um hash
    hook: 'onRequest' // descriptografa os cookies no momento da requisição para acesso no back-end
});

app.register(websocket)

app.register(createPoll);
app.register(getPoll);
app.register(voteOnPoll);

app.register(pollResults);

app.listen({ port: 3333 }).then(() => console.log('HTTP Server is Running!'))