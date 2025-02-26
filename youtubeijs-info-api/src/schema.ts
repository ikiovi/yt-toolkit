import { Type } from '@sinclair/typebox';
import { RouteShorthandOptions } from 'fastify/types/route';

export const VideoQuerySchema = Type.Object({
    id: Type.String({ pattern: '^[a-zA-Z0-9-_]{11}$' }),
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

export const videoEndpointOptions = {
    schema: {
        querystring: VideoQuerySchema,
    }
} satisfies RouteShorthandOptions;