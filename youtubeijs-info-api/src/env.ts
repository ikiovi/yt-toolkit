export const env = {
    LOG_LEVEL: Deno.env.get('LOG_LEVEL') ?? 'debug',
    DISABLE_LOG_TIMESTAMP: Deno.env.get('DISABLE_LOG_TIMESTAMP') === 'true',
    DATE_FORMAT: Deno.env.get('DATE_FORMAT') ?? 'HH:MM dd.mm.yyyy',
    YT_LOG_LEVEL: Number(Deno.env.get('YT_LOG_LEVEL')),
    YT_CACHE_PATH: Deno.env.get('YT_CACHE_PATH')
};