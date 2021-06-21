const {Schema, model} = require('mongoose');

const CategorySchema = new Schema({
    _id: {type:'String'},
    name: {type: "String", default: ""},
    parent: {type: "String", default: ""},
    path: {type: "String", default: ""},
})

module.exports = model('Category', CategorySchema)