const express = require('express');

const router = express.Router();

router.post('/login', (req, res) => {

    const { email, password } = req.body;

    // Missing email
    if (!email) {
        return res.status(400).json({
            code: 'INVALID_REQUEST',
            message: 'The request contains invalid data.',
            details: [
                'email is required'
            ]
        });
    }

    // Missing password
    if (!password) {
        return res.status(400).json({
            code: 'INVALID_REQUEST',
            message: 'The request contains invalid data.',
            details: [
                'password is required'
            ]
        });
    }

    // Invalid credentials
    if (
        email !== 'sagar@example.com' ||
        password !== 'Password@123'
    ) {
        return res.status(401).json({
            code: 'INVALID_REQUEST',
            message: 'The request contains invalid data.',
            details: [
                'Invalid email or password'
            ]
        });
    }

    // Successful login
    return res.status(200).json({
        token: 'mock-jwt-token-12345',
        expiresIn: 3600,
        user: {
            id: 101,
            name: 'Sagar Yadav',
            email: email
        }
    });
});

module.exports = router;