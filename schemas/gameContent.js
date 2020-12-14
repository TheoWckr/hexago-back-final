let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let validator = require('validator');

let GameContent = new Schema({
    type:{
        type: String,
        required: true,
        match: /secondaryImage|video/,
        message: 'Please use a valid type : mainImage, secondaryImage, video, description'
    },
    contentPath:{
        type:String,
        required:true
    },
    gameDetailsId:{
        type:String,
        required:true
    }
});
GameContent.index({title: 'text', content: 'text', "content:encoded": 'text'});

module.exports = GameContent;