// An error that carries an HTTP status so controllers can reply correctly.
export class HttpError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.name = 'HttpError';
        this.statusCode = statusCode;
    }
}
