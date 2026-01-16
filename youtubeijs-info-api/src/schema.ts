import { TObject, TProperties, Type } from '@sinclair/typebox';
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

export const videoEndpointOptions = toQueryStringOptions(VideoQuerySchema);
export const thumbnailEndpointOptions = toQueryStringOptions(ThumbnailQuerySchema);
export const searchEndpointOptions = toQueryStringOptions(SearchQuerySchema);

function toQueryStringOptions<T extends TProperties>(querySchema: TObject<T>) {
    return {
        schema: {
            querystring: querySchema
        }
    } satisfies RouteShorthandOptions;
}