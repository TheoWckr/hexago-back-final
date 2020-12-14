let mongoose = require('mongoose');
let ChatSchema = require('../schemas/chat');

module.exports = mongoose.model('Chat', ChatSchema);
