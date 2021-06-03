var mongoose = require('mongoose')
var Schema = mongoose.Schema

var schema = new Schema ({
    userId: {type: String},
    items: {type: Object, required: true}
})

module.exports = mongoose.model('Cart', schema)