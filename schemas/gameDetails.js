let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let validator = require('validator');

let GameDetailsSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    author: {
        type: Array
    },
    editor: {
        type: String
    },
    distributor: {
        type: String
    },
    releaseDate: Date,
    popularity: Number,
    playerMin: {
        type: Number,
        required: true,
        min:1
    },
    nbPlayer:{
        type:Number,
        required: false,
        min:1
    },
    playerMax: {
        type: Number,
        required: true,
        min:1
    },
    gameLengthMin: Number,
    gameLengthDesired:Number,
    gameLengthMax: Number,
    minAge: {
        type:Number,
        min:0
    },
    description: String,
    playedAtEvent: {
        type:Number,
        min:0
    },
    genres: [{ type: Schema.Types.ObjectID, ref:'genre'}]
    ,
    // sort handling
    whatToSortBy:String,
    sortValue:Number,
    baseGameId:{
        type: Schema.Types.ObjectID, ref:'GameDetails'
    },
    img: {
        type: Object
    }
});

GameDetailsSchema.index({name: 'text'});

module.exports = GameDetailsSchema;
