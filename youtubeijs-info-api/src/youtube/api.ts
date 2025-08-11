import { env } from "../env.ts";
import { Log, Innertube, YTNodes, type Types, type YT } from "youtubei.js";
import { defaultConfig, clients, SortBy, thumbnailUrls, aspectRatios } from './constants.ts';
import { calculateAspectRatio } from './utils.ts';

Log.setLevel(Number.isNaN(env.YT_LOG_LEVEL) ? Log.Level.ERROR : env.YT_LOG_LEVEL);

export async function getBasicInfo(id: string, client: Types.InnerTubeClient) {
    const ytdl = await Innertube.create(defaultConfig);
    const info = await ytdl.getBasicInfo(id, { client });

    let basicInfo = pickBasicInfo(info);
    let playabilityStatus = parsePlayabilityStatus(info, client);

    let rawStreamingData = info.streaming_data;
    for (const newClient of clients.slice(0, 3)) {
        if (rawStreamingData) break;
        if (newClient === client) continue;

        const info = await ytdl.getBasicInfo(id, { client: newClient });

        basicInfo = pickBasicInfo(info);
        rawStreamingData = info.streaming_data;
        playabilityStatus = parsePlayabilityStatus(info, newClient);
    }

    if (playabilityStatus.playable && basicInfo.id) {
        const format = [...rawStreamingData?.adaptive_formats ?? [], ...rawStreamingData?.formats ?? []].at(0);
        basicInfo.width = format?.width ?? 0;
        basicInfo.height = format?.height ?? 0;

        basicInfo.thumbnail = getThumbnails(basicInfo.id, basicInfo.width, basicInfo.height);
    }

    return {
        basicInfo: playabilityStatus.playable ? basicInfo : undefined,
        playabilityStatus,
        _rawStreamingData: rawStreamingData
    };
}

export async function searchVideo(query: string, lang: string, sortBy: SortBy) {
    const ytdl = await Innertube.create({ ...defaultConfig, lang });
    const { videos } = await ytdl.search(query, { type: 'video', sort_by: sortBy });

    return videos
        .filter(v => v.type == YTNodes.Video.type) // No shorts yet
        .map(v => parseSearchVideoNode(v.as(YTNodes.Video)));
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

function parseSearchVideoNode(video: YTNodes.Video) {
    const id = video.video_id;
    const { width, height } = (video.thumbnails.at(0) ?? { width: 0, height: 0 });
    return {
        id,
        title: video.title.text ?? '<Untitled>',
        author: {
            id: video.author.id,
            name: video.author.name
        },
        thumbnails: getThumbnails(id, width, height),
        publishedLabel: video.published?.text,
        viewCountLabel: video.view_count?.text,
        shortViewCountLabel: video.short_view_count?.text,
        durationLabel: video.length_text?.text
    };
}

function parsePlayabilityStatus({ playability_status }: YT.VideoInfo, client: Types.InnerTubeClient) {
    return {
        client,
        playable: playability_status?.status === 'OK',
        status: playability_status?.status,
        reason: playability_status?.reason || undefined
    };
}

function pickBasicInfo({ basic_info: videoDetails }: YT.VideoInfo) {
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