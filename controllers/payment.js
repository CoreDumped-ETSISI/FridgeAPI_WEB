'use strict';

const input = require('../services/inputValidators');
const Payment = require('../models/payment');
const User = require('../models/user');

const rtn = require("../middlewares/apiResults");

function getPayment(req, res) {
    let paymentId = req.params.id;
    if (!input.validId(paymentId)) return rtn.status(res, 400);

    Payment.findOne({
        _id: paymentId,
        userId: req.user
    }).exec((err, payment) => {
        if (err) return rtn.intrServErr(res);
        if (!payment) return rtn.notFound(res, dict.objs.payment);
        return rtn.obj(res, 200, payment)
    })
}

function getPaymentList(req, res) {
    Payment.find({userId: req.user})
        .sort({ timestamp: -1 })
        .exec((err, payments) => {
            if (err) return rtn.intrServErr(res);
            if (!payments) return rtn.notFound(res, dict.objs.payment);
            return rtn.obj(res, 200, payments)
        })
}

function getPaymentListAll(req, res) {
    Payment.find({})
        .exec((err, payments) => {
            if (err) return rtn.intrServErr(res);
            if (!payments) return rtn.notFound(res, dict.objs.payment);
            return rtn.obj(res, 200, payments)
        })
}

function savePayment(req, res) {
    if (!input.validId(req.body.userId) ||
        !input.validFloat(req.body.amount) ||
        (req.body.amount === 0))
        return rtn.status(res, 400);

    const payment = new Payment({
        userId: req.body.userId,
        adminId: req.user,
        amount: req.body.amount
    });

    User.findOne({_id: req.body.userId})
        .exec((err, user) => {
            if (err) return rtn.status(res, 501);
            if (!user) return rtn.notFound(res, dict.objs.user);

            payment.save((err, paymentStored) => {
                if (err) return rtn.status(res, 502);
                if (!paymentStored) return rtn.intrServErr(res);
                paymentStored.adminId = undefined;

                user.updateOne({$inc: {balance: paymentStored.amount}}, (err, userStored) => {
                    if (err) return rtn.status(res, 503);
                    if (!userStored) return rtn.intrServErr(res); //TODO: Delete the paymentStored


                    return rtn.obj(res, 200, paymentStored)
                })
            })
        })
}

function deletePayment(req, res) {
    const paymentId = req.params.id;
    if (!input.validId(paymentId)) return rtn.status(res, 400);

    Payment.findOne({_id: paymentId})
        .exec((err, payment) => {
            if (err) return rtn.intrServErr(res);
            if (!payment) return rtn.notFound(res, dict.objs.payment);

            User.findOneAndUpdate({_id: payment.userId}, {$inc: {balance: -payment.amount}})
                .exec((err, user) => {
                    if (err) return rtn.intrServErr(res);
                    if (!user) return rtn.notFound(res, dict.objs.user);
                    payment.remove();
                    return rtn.status(res, 200)
                })
        })
}

module.exports = {
    getPayment,
    getPaymentList,
    getPaymentListAll,
    savePayment,
    deletePayment
};
