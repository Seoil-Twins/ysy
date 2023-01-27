import winston from "winston";
import winstonDaily from "winston-daily-rotate-file";

const { combine, timestamp, label, printf, colorize, splat } = winston.format;
const logDir = `${__dirname}/logs`;
const logFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level} : ${message}`;
});

// Only one level
const filterOnly = (level: any) => {
    return winston.format((info: any) => {
        if (info["level"] === level) return info;
    })();
};

const consoleOpts = {
    handleExceptions: true,
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
    format: combine(colorize({ all: true }), timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }))
};

const logger = winston.createLogger({
    format: combine(splat(), timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), label({ label: "YSY" }), logFormat),
    transports: [
        new winston.transports.Console(consoleOpts),
        new winstonDaily({
            level: "info",
            datePattern: "YYYY-MM-DD",
            dirname: logDir,
            filename: `%DATE%.info.log`,
            maxFiles: 30,
            format: filterOnly("info"),
            zippedArchive: true
        }),
        new winstonDaily({
            level: "warn",
            datePattern: "YYYY-MM-DD",
            dirname: logDir + "/warn",
            filename: `%DATE%.warn.log`,
            maxFiles: 30,
            format: filterOnly("warn"),
            zippedArchive: true
        }),
        new winstonDaily({
            level: "error",
            datePattern: "YYYY-MM-DD",
            dirname: logDir + "/error",
            filename: `%DATE%.error.log`,
            maxFiles: 30,
            format: filterOnly("error"),
            zippedArchive: true
        })
    ],
    exceptionHandlers: [
        new winstonDaily({
            level: "error",
            datePattern: "YYYY-MM-DD",
            dirname: logDir + "/exception",
            filename: `%DATE%.exception.log`,
            maxFiles: 30,
            zippedArchive: true
        })
    ]
});

export default logger;
