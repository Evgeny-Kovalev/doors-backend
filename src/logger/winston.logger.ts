import { createLogger, format, transports } from 'winston';
import { utilities } from 'nest-winston';

const options = {
	file: {
		filename: 'error.log',
		level: 'error',
	},
	console: {
		level: 'info',
	},
};

const devLogger = {
	format: format.combine(
		format.timestamp({ format: 'DD-MM-YYYY, HH:mm:ss' }),
		format.ms(),
		utilities.format.nestLike('Nest', {
			colors: true,
			prettyPrint: true,
			processId: true,
		}),
	),
	transports: [new transports.Console(options.console)],
};

const prodLogger = {
	format: format.combine(
		format.timestamp(),
		format.errors({ stack: true }),
		format.json(),
	),
	transports: [
		new transports.File(options.file),
		new transports.File({
			filename: 'combine.log',
		}),
	],
};

const instanceLogger = process.env.NODE_ENV === 'production' ? prodLogger : devLogger;

export const winstonLogger = createLogger(instanceLogger);
