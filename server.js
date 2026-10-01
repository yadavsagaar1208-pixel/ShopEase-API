const express = require('express');

const app = express();


// ======================================================
// MIDDLEWARE
// ======================================================

app.use(express.json());


// ======================================================
// ROUTES
// ======================================================

const authRoutes = require('./routes/auth');

const productRoutes = require('./routes/products');

const orderRoutes = require('./routes/orders');


// ======================================================
// API ROUTES
// ======================================================

app.use('/v1/auth', authRoutes);

app.use('/v1/products', productRoutes);

app.use('/v1/orders', orderRoutes);


// ======================================================
// 404 HANDLER
// ======================================================

app.use((req, res) => {

    res.status(404).json({
        code: 'NOT_FOUND',
        message: 'The requested resource was not found.',
        details: [
            `${req.method} ${req.originalUrl} does not exist`
        ]
    });

});


// ======================================================
// START SERVER
// ======================================================

app.listen(3000, () => {

    console.log(
        'ShopEase API is running on http://localhost:3000'
    );

});