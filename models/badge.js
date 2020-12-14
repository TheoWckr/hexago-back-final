let mongoose = require('mongoose');
let BadgeSchema = require('../schemas/badge');

module.exports = mongoose.model('Badge', BadgeSchema);
