let mongoose = require('mongoose');
let GameDetailsSchema = require('../schemas/gameDetails');

module.exports = mongoose.model('GameDetails', GameDetailsSchema);
