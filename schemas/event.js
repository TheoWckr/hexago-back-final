let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let validator = require('validator');

let EventSchema = new Schema({
    duration:{
        type: Number,
        required: true,
        min:0
    },
    date:{
        type: Date,
        required: true
    },
    minPlayers:{
        type: Number,
        required: true,
        min:2
    },
    maxPlayers:{
        type: Number,
        required: true,
        min:2
    },
    phone:String,
    details:String,
    locationId: {
        type:String,
        required: true
    },
    // liste de participants
    listPlayers:[{
        type: Schema.Types.ObjectID, ref:'Users'
    }],
    // nombre de particpants
    currentPlayers: Number,
    // owner de l'event
    owner:{
        type: Schema.Types.ObjectID, ref:'Users',
        required: true
    },
    // game id
    listGames:[{
        type: Schema.Types.ObjectID, ref:'GameDetails',
        required: true
    }]
});
EventSchema.index({title: 'text', content: 'text', "content:encoded": 'text'});

module.exports = EventSchema;
