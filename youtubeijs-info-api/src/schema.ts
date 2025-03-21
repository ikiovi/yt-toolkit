import { Type } from '@sinclair/typebox';
import { RouteShorthandOptions } from 'fastify/types/route';

const YoutubeIdSchema = Type.String({ pattern: '^[a-zA-Z0-9-_]{11}$' });

export const VideoQuerySchema = Type.Object({
    id: YoutubeIdSchema,
    client: Type.Union([
        Type.Literal("IOS"),
        Type.Literal("WEB"),
        Type.Literal("MWEB"),
        Type.Literal("ANDROID"),
        Type.Literal("YTMUSIC"),
        Type.Literal("YTMUSIC_ANDROID"),
        Type.Literal("YTSTUDIO_ANDROID"),
        Type.Literal("TV"),
        Type.Literal("TV_EMBEDDED"),
        Type.Literal("YTKIDS"),
        Type.Literal("WEB_EMBEDDED"),
        Type.Literal("WEB_CREATOR")
    ], { default: 'IOS' })
});

export const ThumbnailQuerySchema = Type.Object({
    id: YoutubeIdSchema,
    width: Type.Number(),
    height: Type.Number()
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