let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let validator = require('validator');

let locationsSchema = new Schema({
    openedHours: Date,
    locationType: {
        type: Number,
        required: true,
        default:0
    },
    address: {
        type: String,
        required: true
    },
    address2: String,
    postCode: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    country: {
        type: String,
        default: "France"
    }
});
locationsSchema.index({title: 'text', content: 'text', "content:encoded": 'text'});

module.exports = locationsSchema;
