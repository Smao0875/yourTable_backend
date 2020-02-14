// NOTE: It is not used for database data model
// -- Only for reference.
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var restaurantSchema = new Schema({
    id: String,
    name: String,
    image_url: String,
    url: String,
    is_claimed:Boolean,
    is_closed:Boolean,
    phone: String,
    categories:{
        alias : String,
        title : String
    },
    rating:Number,
    location:{
        address1: String,
        address2: String,
        address3: String,
        city: String,
        zip_code: String,
        country: String,
        state: String,
        display_address: [String],
        cross_streets:String
    },
    coordinates:{
        latitude:Number,
        longitude:Number
    },
    photos:[String],
    hours:[{
        open:[{
            is_overnight:Boolean,
            start:Date,
            end:Date,
            day:Number
        }],
        hours_type:String,
        is_open_now:Boolean
    }],
}, {
    versionKey: false
});

var Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;