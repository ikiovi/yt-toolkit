import fastify from 'fastify';
import { logger } from './logger';
import { videoEndpointOptions } from './schema';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { getBasicInfo } from './youtube';

const server = fastify().withTypeProvider<TypeBoxTypeProvider>();

server.get('/ping', async (_, res) => await res.code(200).send());

server.get('/video', videoEndpointOptions, async (req, res) => {
    const { id, client } = req.query;
    const result = await getBasicInfo(id, client);
    await res.code(200).send(result);
});

server.listen({ port: 8080, host: '0.0.0.0' }, (err, address) => {
    if (!err) return logger.info(`Server listening at ${address}`);
    logger.error(err);
    process.exit(1);
});