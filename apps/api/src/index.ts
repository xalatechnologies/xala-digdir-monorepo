import Fastify from 'fastify';

const app = Fastify({ logger: true });

app.get('/health', async () => {
  return { ok: true, service: '@xala/api' };
});

const port = Number(process.env.PORT ?? 3002);
const host = process.env.HOST ?? '0.0.0.0';

await app.listen({ port, host });
app.log.info(`API listening on http://${host}:${port}`);
