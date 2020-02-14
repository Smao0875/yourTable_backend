var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var promotionSchema = new Schema({
    yelpID: String,
    name: String,
    contact: String,
    email: String,
    phone: String,
    country: String,
    province: String,
    city: String,
    street: String,
    promotionType: { type: String, enum: ['featured', 'discount', 'deal'] },
    startDate: Date,
    endDate: Date,
    startHour: String,
    endHour: String,
    price: String,
    amount: Number,
    item: String,
    images: [String],
    location: { lng: Number, lat: Number },
    createdAt: { type: Date, default: Date.now() },
    updatedAt: { type: Date, default: Date.now() }
}, {
    versionKey: false
});

var Promotion = mongoose.model('Promotion', promotionSchema);

module.exports = Promotion;