let mongoose = require('mongoose');
let userProfileSchema = require('../schemas/userProfile');

module.exports = mongoose.model('userProfile', userProfileSchema);
