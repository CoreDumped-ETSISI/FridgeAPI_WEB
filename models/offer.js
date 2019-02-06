'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OfferSchema = Schema({
    name: String,
    price: Number,
    image: String,
    stock: Number,
    products: [{
        _id: false,
        product: { type: Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, default: 1, min: 0 }
    }]
}, {versionKey: false});

module.exports = mongoose.model('Offer', OfferSchema);
