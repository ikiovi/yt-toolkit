import fastify from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { logger } from './logger.ts';
import { searchEndpointOptions, thumbnailEndpointOptions, videoEndpointOptions } from './schema.ts';
import { getBasicInfo, getThumbnails, searchVideo } from './youtube/api.ts';

const server = fastify().withTypeProvider<TypeBoxTypeProvider>();

server.get('/ping', async (_, res) => await res.code(200).send());

server.get('/video', videoEndpointOptions, async (req, res) => {
    const { id, client } = req.query;
    const result = await getBasicInfo(id, client);
    await res.code(200).send(result);
});

server.get('/thumbnail', thumbnailEndpointOptions, async (req, res) => {
    const { id, width, height } = req.query;
    const thumbnails = getThumbnails(id, width, height);

    for (const url of thumbnails) {
        const result = await fetch(url, { method: 'HEAD' });
        if (!result.ok) {
            logger.debug(`Thumbnail ${url} is invalid.`);
            continue;
        }
        return await res.redirect(url);
    }

    await res.code(404).send();
});

server.get('/search', searchEndpointOptions, async (req, res) => {
    const { q, lang, sortBy } = req.query;
    const result = await searchVideo(q, lang, sortBy);
    await res.code(200).send(result);
});

server.listen({ port: 8080, host: '0.0.0.0' }, (err, address) => {
    if (!err) return logger.info(`Server listening at ${address}`);
    logger.error(err);
    Deno.exit(1);
});