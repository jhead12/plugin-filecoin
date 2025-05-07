import * as winston from "winston";

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
    ),
    transports: [
        new winston.transports.File({ filename: "error.log", level: "error" }),
        new winston.transports.File({ filename: "combined.log" }),
    ],
});

if (process.env.NODE_ENV !== "production") {
    logger.add(
        new winston.transports.Console({ format: winston.format.simple() }),
    );
}

// Add a new method for debug logs
export function logDebug(message: string): void {
    logger.debug(message);
}

// Update the error logging to use winston
export function logError(message: string, error: unknown): void {
    logger.error(message, { error });
}
