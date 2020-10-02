module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://marliree@localhost/awareapi',
    TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://marliree@localhost/awareapi-test',
    CLIENT_ORIGIN: 'https://aware-app.vercel.app'
}

// || ''http://localhost:3000'''https://aware-app.vercel.app/'