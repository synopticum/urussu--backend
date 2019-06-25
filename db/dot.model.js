const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let DotSchema = new Schema({
    id: {type: String, required: true},
    label: {type: String, required: false},
    type: {type: String, required: true},
    layer: {type: String, required: true},
    coordinates: {type: Array, required: true},

    title: {type: String, required: false},
    shortDescription: {type: String, required: false},
    fullDescription: {type: String, required: false},
    thumbnail: {type: String, required: false},
    images: { type: Object, required: false },

    authorId: {type: String, required: false}
}, { id: false });

let DotModel = mongoose.model('Dot', DotSchema);
module.exports = DotModel;