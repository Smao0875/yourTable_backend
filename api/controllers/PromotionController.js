var Promotion = require('../models/Promotion');
var User = require('../models/User');
var auth = require('../utils/auth');
var csv = require('fast-csv');
var superagent = require('superagent');
var yelpAPIKEY = 'Bearer ';
var validator = require('../utils/validator');

var PromotionController = {
    createPromotion: function (req, res) {
        var token = req.headers.authorization;

        auth.verifyToken(token, function (err, userID) {
            if (err) return res.status(401).json(err.message);

            User.findOne(userID, function (e, user) {
                if (e) return res.status(401).json(e.message);

                if (!user.isAdmin) return res.status(403).json("Admin required");

                var file = req.files.upload[0];
                var promotions = [];

                csv.fromString(file.buffer.toString(), {headers: true})
                .on('data', function (data) {
                    data.location = {
                        lng: data.lng,
                        lat: data.lat
                    }
                    delete data.lng;
                    delete data.lat;

                    promotions.push(data);
                })
                .on('error', function (err) {
                    return res.status(500).json(err.message);
                })
                .on('end', function () {
                    Promotion.create(promotions, function (err, _) {
                        if (err) return res.status(500).json(err.message);

                        return res.status(204).send()
                    })
                })
            })

        })
    },

    getPromotions: function(req, res) {
        var page = req.swagger.params.page.value;
        var pageSize = req.swagger.params.pageSize.value;

        var lng = req.swagger.params.lng.value;
        var lat = req.swagger.params.lat.value;
        var radius = req.swagger.params.radius.value;
        var isValid = validator.validateCoordination(lat, lng);

        var where = {};

        if (isValid) {
            where.location = {
                $near: {
                    $geometry: {
                        type: "Point" ,
                        coordinates: [lng, lat]
                    },
                    $maxDistance: radius
                }
            };

        }

        Promotion.find(where, function (err, promotions) {
            if (err) return res.status(500).json(err.message);

            res.json({promotions: promotions});
        })
        .skip((page-1)*pageSize)
        .limit(pageSize)
    },

    getPromotionById: function(req, res) {
        var id = req.swagger.params.id.value;

        Promotion.findById(id, function (err, promotion) {
            if (err) return res.status(500).json(err.message);

            res.json({promotions: [promotion]});
        })
    },

    getRestaurantById: function(req, res) {
        var id = req.swagger.params.id.value;
        PromotionController.getRestaurantFromYelp(id, function(err, data) {
            if (err) return res.status(500).json(err.message);

            return res.json({restaurant: data.body})
        });
    },

    getRestaurantFromYelp: function(id, callback) {
        superagent
        .get('https://api.yelp.com/v3/businesses/'+ id)
        .set('Authorization', yelpAPIKEY)
        .set('Accept', 'application/json')
        .end(callback);
    }
};

module.exports = PromotionController;