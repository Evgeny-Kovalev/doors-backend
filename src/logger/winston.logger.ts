import { createLogger, format } from 'winston';
import * as Sentry from '@sentry/node';
import Transport from 'winston-transport';

const SentryWinstonTransport = Sentry.createSentryWinstonTransport(Transport);

const logger = {
	format: format.combine(
		format.timestamp(),
		format.errors({ stack: true }),
		format.json(),
	),

	transports: [new SentryWinstonTransport()],
};

export const winstonLogger = createLogger(logger);
