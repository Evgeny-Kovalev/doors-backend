export default () => ({
	port: parseInt(process.env.PORT as string, 10) || 4000,
	database: {
		host: process.env.DATABASE_HOST,
		port: parseInt(process.env.DATABASE_PORT as string, 10),
		username: process.env.DATABASE_USER,
		password: process.env.DATABASE_PASSWORD,
		name: process.env.DATABASE_NAME,
	},
	app: {
		url: process.env.APP_URL,
		port: process.env.PORT,
	},
	files: {
		images: {
			path: process.env.STATIC_IMAGES_PATH,
			apiPath: process.env.STATIC_IMAGES_PATH_API,
		},
		docs: {
			path: process.env.STATIC_DOCS_PATH,
		},
	},
});
