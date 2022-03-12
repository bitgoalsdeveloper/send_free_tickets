'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/**
 * User Schema
 */

const userSchema = new Schema({
    name: {},
    address: {},
    tag: {},
    comment: {},
    erc20_sent: {},
    created_at: { type: Date },
    updated_at: { type: Date }

});

userSchema.pre('save', function (next) {
    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
})


mongoose.model('User', userSchema);
