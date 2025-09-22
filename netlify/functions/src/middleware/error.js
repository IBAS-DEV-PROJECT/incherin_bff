"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, _req, res, _next) => {
    const { statusCode = 500, message } = err;
    console.error('Error:', {
        statusCode,
        message,
        stack: err.stack,
    });
    res.status(statusCode).json({
        error: {
            message: statusCode === 500 ? 'Internal Server Error' : message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        },
    });
};
exports.errorHandler = errorHandler;
