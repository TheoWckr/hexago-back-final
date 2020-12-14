let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let validator = require('validator');

let BadgeSchema = new Schema({
    name:{
        type: String,
        required: true,
        match: /^[a-zA-Z0-9-_]+$/ },
    description:String,
    image:{
        type:String,
        validate: {
            validator: validator.isURL,
            message: 'Please fill a valid URL',
            isAsync: false
        }
    }
});
BadgeSchema.index({title: 'text', content: 'text', "content:encoded": 'text'});

module.exports = BadgeSchema;