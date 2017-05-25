// flow
var express = require("express");
var config = require("../config.json");
var bodyParser = require("body-parser");
var api_key = "api-key-KJFSI4924R23RFSDFSD7F94";
var mongo = require('mongodb').MongoClient;
var autoIncrement = require("mongodb-autoincrement");
var assert = require('assert');
var port = process.env.PORT || 4005;
var router = express.Router();
var url = 'mongodb://' + config.dbhost + ':27017/s_erp_data';

var cookieParser = require('cookie-parser');
router.use(function(req, res, next) {
    // do logging
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next(); // make sure we go to the next routes and don't stop here
});

// Add Timetable

router.route('/bus_route/:school_id')
    .post(function(req, res, next) {
        var status = 1;
        var school_id = req.params.school_id;
        var item = {
            route_id: 'getauto',
                   school_id: school_id,
						route_title: req.body.route_title,
						vehicle_code: req.body.vehicle_code,
						vehicle_number: req.body.vehicle_number,
            status: status,
        }
        mongo.connect(url, function(err, db) {
            autoIncrement.getNextSequence(db, 'bus_routes', function(err, autoIndex) {
                var collection = db.collection('bus_routes');
                collection.ensureIndex({
                    "route_id": 1,
                }, {
                    unique: true
                }, function(err, result) {
                    if (item.route_id == null) {
                        res.end('null');
                    } else {
                        collection.insertOne(item, function(err, result) {
                            if (err) {
                                if (err.code == 11000) {
                                    res.end('false');
                                }
                                res.end('false');
                            }
                            collection.update({
                                _id: item._id
                            }, {
                                $set: {
                                    route_id: 'ROUTE-'+autoIndex
                                }
                            }, function(err, result) {
                                db.close();
                                res.end('true');
                            });
                        });
                    }
                });
            });
        });
    })

    .get(function(req, res, next) {
        var resultArray = [];
        mongo.connect(url, function(err, db) {
            assert.equal(null, err);
            var cursor = db.collection('bus_routes').find();
            cursor.forEach(function(doc, err) {
                assert.equal(null, err);
                resultArray.push(doc);
            }, function() {
                db.close();
                res.send({
                    bus_routes: resultArray
                });
            });
        });
    });





module.exports = router;
