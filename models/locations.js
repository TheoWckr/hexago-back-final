let mongoose = require('mongoose');
let locationsSchema = require('../schemas/locations');

module.exports = mongoose.model('Locations', locationsSchema);
