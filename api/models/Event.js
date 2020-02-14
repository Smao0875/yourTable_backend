var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var eventSchema = new Schema({
    yelpID: String,
    title: String,
    description: String,
    purpose: String,
    startTime: { type: Date, default: Date.now() },
    minAge: { type: Number, default: 19 },
    maxAge: { type: Number, default: 80 },
    capacity: Number,
    gender: String,
    attendees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    hasFinished: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    location: { lng: Number, lat: Number },
    createdAt: { type: Date, default: Date.now() },
    updatedAt: { type: Date, default: Date.now() }
}, {
    versionKey: false
});

var Event = mongoose.model('Event', eventSchema);

module.exports = Event;