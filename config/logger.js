const { createLogger, transports, format, info } = require('winston');
require('winston-mongodb');
require('dotenv').config();

const timezone = () => {
    return new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Calcutta'
    });
}

const logger = createLogger({
    transports: [
        new transports.File({
            filename: 'info.log',
            format: format.combine(format.timestamp({ format: timezone }), format.prettyPrint()),
            level: 'info'
        }),

        new transports.MongoDB({
            level: 'error',
            format: format.combine(format.timestamp({ format: timezone }), format.metadata(), format.prettyPrint()),
            options: { useUnifiedTopology: true },
            db: process.env.MONGO_DATABASE,
            collection: "users",

        })
    ]
})

module.exports = logger;