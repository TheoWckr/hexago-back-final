let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let validator = require('validator');

let usersSchema = new Schema({
    username: {
        type: String,
        required: true,
        match: /^[a-zA-Z0-9-_]+$/ },
    phone: String,
    firstname: {
        type: String,
        required: true,
        match: /^[a-zA-Z0-9-_"  *"]+$/ },
    lastname: {
        type: String,
        required: true,
        match: /^[a-zA-Z0-9-_"  *"]+$/ },
    password: {
        type: String,
        required: true
    },
    email: {
        type:String,
        required:true,
        validator:validator.isEmail
    },
    isActive: {
        type: Boolean,
        default: true
    },
    dateCreation: {
        type:Date,
        default:Date.now
    },
    dateLastConnection: Date,
    dateOfBirth: {
        type:Date,
        default:Date.now
    },
    userProfile: {
        type: Schema.Types.ObjectID, ref:'userProfile',
        required: true
    },
    img: {
        url: {type: String},
        id: {type: String}

    },
    roleId: Number,
    verification: {
        isVerified: {type: Boolean},
        token: {type: String}
    }
}, {
    collection: 'users',
    categories: Array,
    timestamps: true
});

usersSchema.index({title: 'text', content: 'text', "content:encoded": 'text'});

module.exports = usersSchema;