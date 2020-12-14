let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let validator = require('validator');

let chatSchema = new Schema({
    dateCreation: {
        type:Date,
        default:Date.now
    },
    userIdList: [{
        type: Schema.Types.ObjectID, ref:'Users'
    }],
    userIdNames: [{
        type: String
    }],
    eventId:{
        type: Schema.Types.ObjectID, ref:'Event',
        default: null
    },
    messages:[{
        userId: {type: Schema.Types.ObjectID, ref:'Users'},
        message: String
    }]

});
chatSchema.index({title: 'text', content: 'text', "content:encoded": 'text'});

module.exports = chatSchema;
