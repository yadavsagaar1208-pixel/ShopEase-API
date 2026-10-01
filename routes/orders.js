const express = require('express');

const router = express.Router();

const products = require('../data/products');

const orders = require('../data/orders');

const authenticateToken = require('../middleware/auth');


// ======================================================
// CREATE ORDER
// POST /orders
// ======================================================

router.post('/', authenticateToken, (req, res) => {

    const {
        items,
        shippingAddress
    } = req.body;


    // Validate items

    if (
        !Array.isArray(items) ||
        items.length === 0
    ) {
        return res.status(400).json({
            code: 'INVALID_REQUEST',
            message: 'The request contains invalid data.',
            details: [
                'items must contain at least one product'
            ]
        });
    }


    // Validate shipping address

    const requiredAddressFields = [
        'street',
        'city',
        'state',
        'postalCode',
        'country'
    ];

    const missingAddressFields =
        requiredAddressFields.filter(
            field => !shippingAddress || !shippingAddress[field]
        );


    if (missingAddressFields.length > 0) {

        return res.status(400).json({
            code: 'INVALID_REQUEST',
            message: 'The request contains invalid data.',
            details: missingAddressFields.map(
                field => `${field} is required`
            )
        });

    }


    // Validate order items

    const orderItems = [];

    for (const item of items) {

        if (
            !Number.isInteger(item.productId) ||
            item.productId < 1
        ) {
            return res.status(400).json({
                code: 'INVALID_REQUEST',
                message: 'The request contains invalid data.',
                details: [
                    'productId must be a valid positive integer'
                ]
            });
        }


        if (
            !Number.isInteger(item.quantity) ||
            item.quantity < 1
        ) {
            return res.status(400).json({
                code: 'INVALID_REQUEST',
                message: 'The request contains invalid data.',
                details: [
                    'quantity must be a positive integer'
                ]
            });
        }


        const product = products.find(
            product => product.id === item.productId
        );


        if (!product) {
            return res.status(400).json({
                code: 'INVALID_REQUEST',
                message: 'The request contains invalid data.',
                details: [
                    `Product ${item.productId} does not exist`
                ]
            });
        }


        // Check stock

        if (item.quantity > product.stock) {

            return res.status(400).json({
                code: 'INVALID_REQUEST',
                message: 'The request contains invalid data.',
                details: [
                    `Insufficient stock for product ${item.productId}`
                ]
            });

        }


        orderItems.push({
            productId: product.id,
            quantity: item.quantity,
            unitPrice: product.price
        });

    }


    // Calculate total

    const totalAmount = orderItems.reduce(
        (total, item) =>
            total + (item.quantity * item.unitPrice),
        0
    );


    // Generate order ID

    const newOrderId =
        Math.max(...orders.map(order => order.id)) + 1;


    const newOrder = {
        id: newOrderId,
        status: 'CREATED',
        items: orderItems,
        totalAmount: Number(totalAmount.toFixed(2)),
        shippingAddress
    };


    // Reduce product stock

    orderItems.forEach(item => {

        const product = products.find(
            product => product.id === item.productId
        );

        product.stock -= item.quantity;

    });


    orders.push(newOrder);


    return res.status(201).json(newOrder);
});


// ======================================================
// GET CUSTOMER ORDERS
// GET /orders
// ======================================================

router.get('/', authenticateToken, (req, res) => {

    const { status } = req.query;


    let filteredOrders = orders;


    if (status) {

        const validStatuses = [
            'CREATED',
            'CONFIRMED',
            'SHIPPED',
            'DELIVERED',
            'CANCELLED'
        ];


        if (!validStatuses.includes(status)) {

            return res.status(400).json({
                code: 'INVALID_REQUEST',
                message: 'The request contains invalid data.',
                details: [
                    'Invalid order status'
                ]
            });

        }


        filteredOrders = orders.filter(
            order => order.status === status
        );

    }


    return res.status(200).json(filteredOrders);
});


// ======================================================
// GET ORDER BY ID
// GET /orders/:orderId
// ======================================================

router.get('/:orderId', authenticateToken, (req, res) => {

    const orderId = Number(req.params.orderId);


    const order = orders.find(
        order => order.id === orderId
    );


    if (!order) {

        return res.status(404).json({
            code: 'NOT_FOUND',
            message: 'Order not found.',
            details: [
                'Order does not exist'
            ]
        });

    }


    return res.status(200).json(order);
});


// ======================================================
// CANCEL ORDER
// DELETE /orders/:orderId
// ======================================================

router.delete('/:orderId', authenticateToken, (req, res) => {

    const orderId = Number(req.params.orderId);


    const order = orders.find(
        order => order.id === orderId
    );


    if (!order) {

        return res.status(404).json({
            code: 'NOT_FOUND',
            message: 'Order not found.',
            details: [
                'Order does not exist'
            ]
        });

    }


    // Only CREATED or CONFIRMED orders can be cancelled

    if (
        order.status !== 'CREATED' &&
        order.status !== 'CONFIRMED'
    ) {

        return res.status(400).json({
            code: 'INVALID_REQUEST',
            message: 'The request contains invalid data.',
            details: [
                'Order cannot be cancelled in its current state'
            ]
        });

    }


    order.status = 'CANCELLED';


    return res.status(200).json(order);
});


module.exports = router;