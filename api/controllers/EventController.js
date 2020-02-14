var Event = require('../models/Event');
var User = require('../models/User');
var auth = require('../utils/auth');
var validator = require('../utils/validator');
var PromotionController = require('../controllers/PromotionController');

var EventController = {

    createEvent: function (req, res) {
        var token = req.headers.authorization;
        var event = req.body;

        auth.verifyToken(token, function (err, userID) {
            if (err) return res.status(401).json(err.message);

            var validation = validator.validateEventBody(event);
            if (validation) return res.status(400).json(validation.message);

            User.findById(userID, function (err, user) {
                if (err) return res.status(500).json(err.message);
                
                event.author = user._id;

                event.location = {
                    lng: event.lng,
                    lat: event.lat
                };

                delete event.lng;
                delete event.lat;

                PromotionController.getRestaurantFromYelp(event.yelpID, function(err, data) {
                    if (err) return res.status(500).json(err.message);

                    if(!validator.validateOpenHour(event, data.body)) {
                        return res.status(400).json("Restaurant not open.");
                    }

                    var isReachableFromCurrentLocation = validator.validateDistance(event.location, data.body.coordinates, 
                        Date.now(), Date.parse(event.startTime), true);

                    if(isReachableFromCurrentLocation) {
                        EventController.getUpcomingEvents(user._id, function(err, upcomingEvents) {
                            if (err) return res.status(500).json(err.message);

                            var isReachableFromUpcomingEvent = false;
                            if(upcomingEvents.length > 0){
                                isReachableFromUpcomingEvent = validator.validateDistance(upcomingEvents[0].location, data.body.coordinates, 
                                    Date.parse(upcomingEvents[0].startTime), Date.parse(event.startTime), false);
                            }

                            if(upcomingEvents.length == 0 || isReachableFromUpcomingEvent) {
                                // here we update event location to restaurant location
                                event.location = {
                                    lng: data.body.coordinates.longitude,
                                    lat: data.body.coordinates.latitude
                                };

                                Event.create(event, function (e, newEvent) {
                                    if (e) return res.status(500).json(e.message);
                                    
                                    return res.status(200).json(newEvent._id);
                                });
                            } else {
                                return res.status(400).json("Sorry, you have an upcoming event during that time.");
                            }
                        });
                    } else {
                        return res.status(400).json("Are you sure you can make it?");
                    }
                });
            })
        })
    },

    getUpcomingEvents: function(userID, callback) {
        var where = {};
        where.isDeleted = false;
        where.$or = [{author:userID}, {attendees:userID}];
        where.startTime = {$gt : Date.now()};

        Event.find(where)
        .sort({startTime: 'asc'})
        .exec(callback);
    },

    update: function (req, res) {
        var eventId = req.swagger.params.id.value;
        var token = req.headers.authorization;

        auth.verifyToken(token, function (err, userID) {
            if (err) return res.status(401).json(err.message);

            Event.findById(eventId, function(err, event){
                if (err) return res.status(500).json(err.message);

                if(userID == event.author){
                    var update = {};
                    
                    if (req.body.title)         update.title = req.body.title;
                    if (req.body.description)   update.description = req.body.description;
                    if (req.body.purpose)       update.purpose = req.body.purpose;
                    if (req.body.minAge)        update.minAge = req.body.minAge;
                    if (req.body.maxAge)        update.maxAge = req.body.maxAge;
                    update.updatedAt = Date.now();
            
                    Event.findOneAndUpdate(eventId, update,function (err, _) {
                        if (err) return res.status(500).json(err.message);
            
                        res.status(204).send()
                    })
                } else {
                    if(validator.validateCoordination(req.body.lat, req.body.lng)) {
                        // I am copying an new event to pass in user location and event start time.
                        var outset = {};
                        outset.lat = req.body.lat;
                        outset.lng = req.body.lng;

                        var destination = {};
                        destination.latitude = event.location.lat;
                        destination.longitude = event.location.lng;

                        var isReachableFromCurrentLocation = validator.validateDistance(outset, destination,
                                                        Date.now(), Date.parse(event.startTime), true);

                        if(isReachableFromCurrentLocation) {
                            EventController.getUpcomingEvents(userID, function(err, upcomingEvents) {
                                if (err) return res.status(500).json(err.message);

                                var isReachableFromUpcomingEvent = false;
                                if(upcomingEvents.length > 0){
                                    isReachableFromUpcomingEvent = validator.validateDistance(upcomingEvents[0].location, destination,
                                        Date.parse(upcomingEvents[0].startTime), Date.parse(event.startTime), false);
                                }

                                if(upcomingEvents.length == 0 || isReachableFromUpcomingEvent) {
                                    Event.findOneAndUpdate(eventId, {$push : {attendees : userID}, $set:{"updatedAt": Date.now()}}, function (err, _) {
                                        if (err) return res.status(500).json(err.message);
                    
                                        res.status(204).send()
                                    })
                                } else {
                                    return res.status(400).json("Sorry, you have an upcoming event during that time.");
                                }
                            });
                        } else {
                            return res.status(400).json("Are you sure you can make it?");
                        }
                    } else {
                        return res.status(400).json("Invalid coordinates.");
                    }
                }
            })
        })
    },
    
    delete: function (req, res) {
        var eventId = req.swagger.params.id.value;
        var token = req.headers.authorization;

        auth.verifyToken(token, function (err, userID) {
            if (err) return res.status(401).json(err.message);

            User.findById(userID, function(err, user){
                if(user.isAdmin){
                    Event.findByIdAndUpdate(eventId, {isDeleted : true}, function (e) {
                        if (e) return res.status(500).json(e.message);
            
                        res.status(204).send()
                    })   
                } else {
                    Event.findById(eventId, function(err, event){
                        if (err) return res.status(500).json(err.message);
        
                        if(userID == event.author){
                            Event.findByIdAndUpdate(eventId, {isDeleted : true}, function (e) {
                                if (e) return res.status(500).json(e.message);
                    
                                res.status(204).send()
                            }) 
                        } else {
                            return res.status(500).json("Only admin user or event author can delete an event.");
                        }
                    })
                }
            })
        })
    },

    getOne: function(req, res) {
        var id = req.swagger.params.id.value;

        Event.findById(id, function (e, event) {
            if (e) return res.status(500).json(e.message);

            res.json({events: [event]});
        }).populate('author');
    },

    getEvents: function(req, res) {
        var page = req.swagger.params.page.value;
        var pageSize = req.swagger.params.pageSize.value;

        var lng = req.swagger.params.lng.value;
        var lat = req.swagger.params.lat.value;
        var radius = req.swagger.params.radius.value;
        var isValid = validator.validateCoordination(lat, lng);
        var regex = new RegExp(req.swagger.params.search.value, "i");

        var where = {};
        var sort = {};
        where.isDeleted = false;

        if (isValid) {
            where.hasFinished = false;
            where.location = {
                $near: {
                    $geometry: {
                        type: "Point" ,
                        coordinates: [lng, lat]
                    },
                    $maxDistance: radius
                }
            };
            where.$or = [{title:regex}, {description:regex}];
        } else {
            // we should order by create time if user location is not provided.
            sort = {createdAt: -1};
        }

        Event.find(where)
            .populate('author')
            .sort(sort)
            .skip((page-1)*pageSize)
            .limit(pageSize).exec(function(err, events) {
                if (err) return res.status(500).json(err.message);

                res.json({events: events});
            })
    }
};

module.exports = EventController;
