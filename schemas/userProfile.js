let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let validator = require('validator');

let userProfileSchema = new Schema({
    experience: {
        type: Number,
        //required: true,
        default: 0
    },
    grade: Number,
    rank: {
        type: Number,
        //required: true,
        match: /^[a-zA-Z0-9-_]+$/
    },
    friendList: [{
        type: Number
    }],
    blackList: [{
        type: Number
    }],
    favoriteGames: [{
        type: Number
    }],
    favoriteGenres: [{
        type: Number
    }]
}, {
    collection: 'userProfile',
    categories: Array,
    timestamps: true
});

userProfileSchema.index({title: 'text', content: 'text', "content:encoded": 'text'});

module.exports = userProfileSchema;