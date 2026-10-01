const orders = [
    {
        id: 50001,
        status: 'CREATED',
        items: [
            {
                productId: 1001,
                quantity: 2,
                unitPrice: 2499.99
            },
            {
                productId: 1002,
                quantity: 1,
                unitPrice: 3499.00
            }
        ],
        totalAmount: 8498.98,
        shippingAddress: {
            street: '10 Main Road',
            city: 'Mumbai',
            state: 'Maharashtra',
            postalCode: '400001',
            country: 'India'
        }
    }
];

module.exports = orders;