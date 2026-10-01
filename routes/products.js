const express = require('express');

const router = express.Router();

const products = require('../data/products');

const authenticateToken = require('../middleware/auth');


// ======================================================
// GET ALL PRODUCTS
// GET /products
// ======================================================

router.get('/', (req, res) => {

    const {
        category,
        page = 1,
        limit = 10
    } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);


    // Validate page

    if (
        !Number.isInteger(pageNumber) ||
        pageNumber < 1
    ) {
        return res.status(400).json({
            code: 'INVALID_REQUEST',
            message: 'The request contains invalid data.',
            details: [
                'page must be an integer greater than or equal to 1'
            ]
        });
    }


    // Validate limit

    if (
        !Number.isInteger(limitNumber) ||
        limitNumber < 1 ||
        limitNumber > 50
    ) {
        return res.status(400).json({
            code: 'INVALID_REQUEST',
            message: 'The request contains invalid data.',
            details: [
                'limit must be an integer between 1 and 50'
            ]
        });
    }


    // Category filtering

    let filteredProducts = products;

    if (category) {

        filteredProducts = products.filter(
            product => product.category === category
        );

    }


    // Pagination

    const total = filteredProducts.length;

    const startIndex =
        (pageNumber - 1) * limitNumber;

    const endIndex =
        startIndex + limitNumber;

    const paginatedProducts =
        filteredProducts.slice(startIndex, endIndex);


    return res.status(200).json({
        data: paginatedProducts,
        page: pageNumber,
        limit: limitNumber,
        total: total
    });
});


// ======================================================
// CREATE PRODUCT
// POST /products
// ======================================================

router.post('/', authenticateToken, (req, res) => {

    const {
        name,
        category,
        price,
        stock
    } = req.body;


    // Validate required fields

    const missingFields = [];

    if (!name) missingFields.push('name is required');

    if (!category) missingFields.push('category is required');

    if (price === undefined) {
        missingFields.push('price is required');
    }

    if (stock === undefined) {
        missingFields.push('stock is required');
    }


    if (missingFields.length > 0) {

        return res.status(400).json({
            code: 'INVALID_REQUEST',
            message: 'The request contains invalid data.',
            details: missingFields
        });

    }


    // Validate price

    if (
        typeof price !== 'number' ||
        price < 0
    ) {
        return res.status(400).json({
            code: 'INVALID_REQUEST',
            message: 'The request contains invalid data.',
            details: [
                'price must be a number greater than or equal to 0'
            ]
        });
    }


    // Validate stock

    if (
        !Number.isInteger(stock) ||
        stock < 0
    ) {
        return res.status(400).json({
            code: 'INVALID_REQUEST',
            message: 'The request contains invalid data.',
            details: [
                'stock must be an integer greater than or equal to 0'
            ]
        });
    }


    // Generate new product ID

    const newProductId =
        Math.max(...products.map(product => product.id)) + 1;


    const newProduct = {
        id: newProductId,
        name,
        category,
        price,
        stock
    };


    products.push(newProduct);


    return res.status(201).json(newProduct);
});


// ======================================================
// GET PRODUCT BY ID
// GET /products/:productId
// ======================================================

router.get('/:productId', (req, res) => {

    const productId = Number(req.params.productId);


    if (
        !Number.isInteger(productId) ||
        productId < 1
    ) {
        return res.status(404).json({
            code: 'NOT_FOUND',
            message: 'Product not found.',
            details: [
                'Product does not exist'
            ]
        });
    }


    const product = products.find(
        product => product.id === productId
    );


    if (!product) {
        return res.status(404).json({
            code: 'NOT_FOUND',
            message: 'Product not found.',
            details: [
                'Product does not exist'
            ]
        });
    }


    return res.status(200).json(product);
});


module.exports = router;