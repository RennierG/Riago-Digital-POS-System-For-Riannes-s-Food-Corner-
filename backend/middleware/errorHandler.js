export function notFound(_req, res) {
    res.status(404).json({ error: 'Not found.' });
}

export function errorHandler(err, _req, res, _next) {
    const status = Number(err.statusCode || err.status) || 500;
    if (err.type === 'entity.too.large') {
        return res.status(413).json({ error: 'The picture is too large. Maximum size is 3 MB.' });
    }
    if (status === 500) console.log(err);
    res.status(status).json({
        error: status === 500 ? 'Internal Server Error' : err.message
    });
}
