const {Schema, model} = require('mongoose');

const ItemSchema = new Schema({
    _id: {type:'String'},
    article: {type: "String", default: ""},
    brand: {type: "String", default: ""},
    name: {type: "String", default: ""},
    description: {type: "String", default: ""},

})

module.exports = model('Item', ItemSchema)