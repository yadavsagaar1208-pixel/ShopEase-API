function authenticateToken(req, res, next) {

    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
        return res.status(401).json({
            code: 'UNAUTHORIZED',
            message: 'Authentication is required.',
            details: [
                'Authorization header is required'
            ]
        });
    }

    if (!authorizationHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            code: 'UNAUTHORIZED',
            message: 'Authentication is required.',
            details: [
                'Authorization header must use Bearer token'
            ]
        });
    }

    const token = authorizationHeader.substring(7);

    if (token !== 'mock-jwt-token-12345') {
        return res.status(401).json({
            code: 'UNAUTHORIZED',
            message: 'Authentication is required.',
            details: [
                'Invalid or expired token'
            ]
        });
    }

    next();
}

module.exports = authenticateToken;