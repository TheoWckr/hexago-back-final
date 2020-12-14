let mongoose = require('mongoose');
let GameContentSchema = require('../schemas/gameContent');

module.exports = mongoose.model('Event', GameContentSchema);
