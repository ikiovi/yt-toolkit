import { Innertube, IStreamingData, UniversalCache } from 'youtubei.js';

type InnerTubeClient = Required<Parameters<Innertube['getInfo']>[1]>;
type VideoInfo = Awaited<ReturnType<Innertube['getInfo']>>;

const clients: InnerTubeClient[] = ['IOS', 'WEB', 'ANDROID'];

const aspectRatios = {
    hd: toFixedNumber(16 / 9, 2),
    sd: toFixedNumber(4 / 3, 2),
    vertical: toFixedNumber(9 / 16, 2),
} as const;

const thumbnailUrls = {
    path: 'https://i.ytimg.com/vi/',
    hd: ['maxresdefault.jpg', 'hq720.jpg', 'maxres2.jpg'],
    sd: ['sddefault.jpg', '0.jpg', 'hqdefault.jpg'],
    vertical: ['oardefault.jpg'],
    fallback: 'frame0.jpg'
};

export async function getBasicInfo(id: string, client: InnerTubeClient = 'IOS') {
    const ytdl = await Innertube.create({ cache: new UniversalCache(false) });
    const info = await ytdl.getBasicInfo(id, client);

    let basicInfo = pickBasicInfo(info);
    let playabilityStatus = parsePlayabilityStatus(info, client);

    let streamingData = info.streaming_data;
    for (const c of clients) {
        if (streamingData) break;
        if (c === client) continue;

        const info = await ytdl.getBasicInfo(id, c);

        basicInfo = pickBasicInfo(info);
        streamingData = info.streaming_data;
        playabilityStatus = parsePlayabilityStatus(info, c);
    }

    if (playabilityStatus.playable && basicInfo.id) {
        const format = [...streamingData?.adaptive_formats ?? [], ...streamingData?.formats ?? []].at(0);
        basicInfo.width = format?.width ?? 0;
        basicInfo.height = format?.height ?? 0;

        basicInfo.thumbnail = getThumbnails(basicInfo.id, basicInfo.width, basicInfo.height);
    }

    return {
        basicInfo: playabilityStatus.playable ? basicInfo : undefined,
        playabilityStatus,
        streamingData
    };
}

export function getThumbnails(id: string, width: number, height: number) {
    const aspectRatio = calculateAspectRatio(width, height);
    const result = [thumbnailUrls.fallback];

    const looseComparison = (a: number, b: number) => a === b || Math.round(a) === Math.round(b);

    if (aspectRatio === aspectRatios.vertical) result.unshift(...thumbnailUrls.vertical);
    else if (looseComparison(aspectRatio, aspectRatios.sd)) result.unshift(...thumbnailUrls.sd);
    else if (looseComparison(aspectRatio, aspectRatios.hd)) result.unshift(...thumbnailUrls.hd);

    return result.map(u => `${thumbnailUrls.path}${id}/${u}`);
}

function parsePlayabilityStatus({ playability_status }: VideoInfo, client: InnerTubeClient) {
    return {
        client,
        playable: playability_status?.status === 'OK',
        status: playability_status?.status,
        reason: playability_status?.reason || undefined
    };
}

function pickBasicInfo({ basic_info: videoDetails }: VideoInfo) {
    return {
        id: videoDetails.id,
        title: videoDetails.title,
        author: videoDetails.author,
        isLive: videoDetails.is_live,
        duration: videoDetails.duration,
        category: videoDetails.category ?? undefined,
        keywords: videoDetails.keywords,
        thumbnail: videoDetails.thumbnail?.map(t => t.url),
        width: 0,
        height: 0
    };
}

function calculateAspectRatio(width: number, height: number) {
    return toFixedNumber((width / height) || 0, 2);
}

function toFixedNumber(num: number, digits: number) {
    const pow = Math.pow(10, digits);
    return Math.round(num * pow) / pow;
}