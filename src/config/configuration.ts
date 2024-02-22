export default () => ({
	port: parseInt(process.env.PORT as string, 10) || 4000,
	database: {
		host: process.env.DATABASE_HOST,
		port: parseInt(process.env.DATABASE_PORT as string, 10),
		username: process.env.DATABASE_USER,
		password: process.env.DATABASE_PASSWORD,
		name: process.env.DATABASE_NAME,
	},
});
