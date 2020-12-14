let mongoose = require('mongoose');
let GenreSchema = require('../schemas/genre');

module.exports = mongoose.model('genre', GenreSchema);
