import fastify from 'fastify';
import { logger } from './logger';
import { videoEndpointOptions } from './schema';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { getBasicInfo } from './youtube';

const server = fastify().withTypeProvider<TypeBoxTypeProvider>();

server.get('/ping', (_, res) => res.code(200));

server.get('/video', videoEndpointOptions, async (req, res) => {
    const { id, client } = req.query;
    const result = await getBasicInfo(id, client);
    res.code(200).send(result);
});

server.listen({ port: 8080 }, (err, address) => {
    if (!err) return logger.info(`Server listening at ${address}`);
    logger.error(err);
    process.exit(1);
});