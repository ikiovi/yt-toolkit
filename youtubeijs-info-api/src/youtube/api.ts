import { env } from "../env.ts";
import { Log, Innertube, YTNodes, type Types, type YT, IStreamingData, YTMusic, Player } from "youtubei.js";
import { defaultConfig, clients, SortBy, thumbnailUrls, aspectRatios, qualityMapping } from './constants.ts';
import { calculateAspectRatio } from './utils.ts';

Log.setLevel(Number.isNaN(env.YT_LOG_LEVEL) ? Log.Level.ERROR : env.YT_LOG_LEVEL);

export async function getBasicInfo(id: string, client: Types.InnerTubeClient) {
    const ytdl = await Innertube.create(defaultConfig);
    const info = await ytdl.getBasicInfo(id, { client });

    let basicInfo = mapBasicInfo(info);
    let playabilityStatus = normalizePlayabilityStatus(info, client);
    let streamingData = normalizeStreamingData(info);

    for (const newClient of clients.slice(0, 3)) {
        if (streamingData) break;
        if (newClient === client) continue;

        const info = await ytdl.getBasicInfo(id, { client: newClient });

        basicInfo = mapBasicInfo(info);
        streamingData = normalizeStreamingData(info);
        playabilityStatus = normalizePlayabilityStatus(info, newClient);
    }

    const basicInfoSizes: { width: number, height: number } = { width: 0, height: 0 };
    let thumbnail: string[] = [];

    if (playabilityStatus.playable && basicInfo?.id) {
        const format = streamingData?.formats.find(f => f.hasVideo);

        basicInfoSizes.width = format?.width || basicInfoSizes.width;
        basicInfoSizes.height = format?.height || basicInfoSizes.height;

        thumbnail = getThumbnails(basicInfo.id, basicInfoSizes.width, basicInfoSizes.height);
    }

    return {
        playabilityStatus,
        ...!playabilityStatus.playable ? {} : {
            basicInfo: { ...basicInfo, ...basicInfoSizes, thumbnail },
            _streamingData: streamingData
        }
    };
}

export async function searchVideo(query: string, lang: string, sortBy: SortBy) {
    const ytdl = await Innertube.create({ ...defaultConfig, lang });
    const { videos } = await ytdl.search(query, { type: 'video', sort_by: sortBy });

    return videos
        .filter(v => v.type == YTNodes.Video.type)
        .map(v => mapSearchVideoNode(v.as(YTNodes.Video)));
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

function mapSearchVideoNode(video: YTNodes.Video) {
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

function normalizePlayabilityStatus({ playability_status }: YT.VideoInfo | YTMusic.TrackInfo, client: Types.InnerTubeClient) {
    return {
        client,
        playable: playability_status?.status === 'OK',
        status: playability_status?.status,
        reason: playability_status?.reason || undefined
    };
}


function mapFormat(format: IStreamingData['adaptive_formats'][0], player?: Player) {
    const { itag, height, width } = format;

    const url = format.url ?? (format.decipher(player) || undefined);

    const videoQuality = qualityMapping[format.quality!] ?? qualityMapping.none;
    const audioQuality = qualityMapping[format.audio_quality!] ?? qualityMapping.none;

    return {
        itag, url,
        height: height ?? 0,
        width: width ?? 0,
        quality: {
            audio: audioQuality,
            video: videoQuality
        },
        hasAudio: format.has_audio,
        hasVideo: format.has_video,
        duration: format.approx_duration_ms,
        mimeType: format.mime_type,
        contentLength: format.content_length ?? 0
    };
}

function normalizeStreamingData({ streaming_data }: YT.VideoInfo | YTMusic.TrackInfo, player?: Player) {
    if (!streaming_data) return;
    return {
        expires: streaming_data?.expires,
        formats: [...streaming_data.adaptive_formats, ...streaming_data.formats].map(f => mapFormat(f, player))
    };
}

function mapBasicInfo({ basic_info }: YT.VideoInfo | YTMusic.TrackInfo) {
    if (!basic_info.id || !basic_info.id?.length) return;

    return {
        id: basic_info.id,
        title: basic_info.title,
        author: basic_info.author,
        channelId: basic_info.channel_id,
        isLive: basic_info.is_live ?? false,
        duration: basic_info.duration ?? 0,
        category: basic_info.category || undefined,
        keywords: basic_info.keywords ?? [],
    };
}