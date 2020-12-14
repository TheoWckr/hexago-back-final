let mongoose = require('mongoose');
let EventSchema = require('../schemas/event');

module.exports = mongoose.model('Event', EventSchema);
