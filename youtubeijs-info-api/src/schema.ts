import { Type } from '@sinclair/typebox';
import { RouteShorthandOptions } from 'fastify/types/route';
import { clients, searchSorting } from './youtube/constants.ts';

const YoutubeIdSchema = Type.String({ pattern: '^[a-zA-Z0-9-_]{11}$' });

export const VideoQuerySchema = Type.Object({
    id: YoutubeIdSchema,
    client: Type.Union(clients.map(v => Type.Literal(v)), { default: clients[0] })
});

export const ThumbnailQuerySchema = Type.Object({
    id: YoutubeIdSchema,
    width: Type.Number(),
    height: Type.Number()
});

export const SearchQuerySchema = Type.Object({
    q: Type.String(),
    lang: Type.String({ default: 'en' }),
    sortBy: Type.Union(searchSorting.map(v => Type.Literal(v)), { default: searchSorting[0] })
});

export const videoEndpointOptions = {
    schema: {
        querystring: VideoQuerySchema,
    }
} satisfies RouteShorthandOptions;

export const thumbnailEndpointOptions = {
    schema: {
        querystring: ThumbnailQuerySchema
    }
} satisfies RouteShorthandOptions;

export const searchEndpointOptions = {
    schema: {
        querystring: SearchQuerySchema
    }
} satisfies RouteShorthandOptions;