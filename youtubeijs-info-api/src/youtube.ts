import { Innertube, UniversalCache } from 'youtubei.js';

type InnerTubeClient = Required<Parameters<Innertube['getInfo']>[1]>;
type VideoInfo = Awaited<ReturnType<Innertube['getInfo']>>;

const clients: InnerTubeClient[] = ['IOS', 'WEB', 'ANDROID'];

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

    if (playabilityStatus.playable) {
        const format = [...streamingData?.adaptive_formats ?? [], ...streamingData?.formats ?? []].at(0);
        const width = format?.width ?? 0;
        const height = format?.height ?? 0;
        const aspectRatio = calculateAspectRatio(width, height);

        if (aspectRatio < 1) basicInfo.thumbnail?.unshift({ width, height, url: `https://i.ytimg.com/vi/${id}/frame0.jpg` });
    }

    return {
        basicInfo: playabilityStatus.playable ? basicInfo : undefined,
        playabilityStatus,
        streamingData
    };
}

function parsePlayabilityStatus({ playability_status }: VideoInfo, client: InnerTubeClient) {
    return {
        client,
        playable: playability_status?.status === 'OK',
        status: playability_status?.status,
        reason: playability_status?.reason
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
        thumbnail: videoDetails.thumbnail
    };
}

function calculateAspectRatio(width: number, height: number) {
    return +((width / height) || 0).toFixed(1);
}