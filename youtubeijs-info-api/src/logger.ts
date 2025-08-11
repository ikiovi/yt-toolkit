import { colorConsole } from 'tracer';
import { env } from "./env.ts";

export const logger = colorConsole({
    level: env.LOG_LEVEL,
    format: (env.DISABLE_LOG_TIMESTAMP ? '' : '{{timestamp}} ') + '[{{title}}] ({{file}}:{{line}}): {{message}}',
    dateformat: env.DATE_FORMAT
});
