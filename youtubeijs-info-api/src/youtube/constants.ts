import { UniversalCache, type Types } from 'youtubei.js';
import { toFixedNumber } from "./utils.ts";
import { env } from "../env.ts";

export type SortBy = Exclude<Types.SearchFilters['sort_by'], undefined>;

export const defaultConfig: Types.InnerTubeConfig = {
    cache: new UniversalCache(Boolean(env.YT_CACHE_PATH), env.YT_CACHE_PATH),
    generate_session_locally: false,
    retrieve_player: false,
    enable_safety_mode: false
};

export const clients: Types.InnerTubeClient[] = [
    'IOS', 'WEB', 'ANDROID',
    'MWEB', 'YTMUSIC', 'YTMUSIC_ANDROID',
    'YTSTUDIO_ANDROID', 'TV', 'TV_EMBEDDED',
    'YTKIDS', 'WEB_EMBEDDED', 'WEB_CREATOR'
];

export const searchSorting: SortBy[] = ['relevance', 'view_count', 'rating', 'upload_date'];

export const aspectRatios = {
    hd: toFixedNumber(16 / 9, 2),
    sd: toFixedNumber(4 / 3, 2),
    vertical: toFixedNumber(9 / 16, 2),
} as const;

export const thumbnailUrls = {
    path: 'https://i.ytimg.com/vi/',
    hd: ['maxresdefault.jpg', 'hq720.jpg', 'maxres2.jpg'],
    sd: ['sddefault.jpg', '0.jpg', 'hqdefault.jpg'],
    vertical: ['oardefault.jpg'],
    fallback: 'frame0.jpg'
};