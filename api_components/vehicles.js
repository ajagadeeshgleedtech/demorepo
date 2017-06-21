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

// Add Vehicles

router.route('/vehicles/:school_id')
    .post(function(req, res, next) {
        var status = 1;
        var item = {
            vehicle_code: req.body.vehicle_code,
            vehicle_name: req.body.vehicle_name,
            school_id: req.params.school_id,
            status : status 
        };
      mongo.connect(url, function(err, db) {
        var collection = db.collection('vehicles');
        if(item.school_id == null || item.vehicle_code == null || item.vehicle_name == null  ) {
                        res.end('null');
        } else {
          collection.insertOne(item, function(err, result) {
                            if (err) {
                                if (err.code == 11000) {
                                    console.log(err);
                                    res.end('false');
                                }
                                res.end('false');
                            }
                            if(result){
                                db.close();
                                res.end('true');
                            }
                             
                        });
         }
     });
     
    })
    .get(function(req, res, next) {
        var school_id= req.params.school_id;
        var resultArray = [];
          mongo.connect(url, function(err, db) {
            assert.equal(null, err);
            var cursor = db.collection('vehicles').find({school_id});
            cursor.forEach(function(doc, err) {
                assert.equal(null, err);
                resultArray.push(doc);
            }, function() {
                db.close();
                res.send({
                    vehicles: resultArray
                });
            });
        });
    });

    // router.route('/vehicle/:vehicle_id')
    // .get(function(req, res, next){
    //   var _id = req.params.vehicle_id;
    //   var resultArray = [];
    //   mongo.connect(url, function(err, db){
    //   assert.equal(null, err);
    //   db.collection('vehicles').find({'_id':_id},function(err, result){
    //               assert.equal(null, err);
    //               if(err){
    //                res.end('false');
    //               }
    //               if(result){
    //                db.close();
    //                console.log(result)
    //                res.send('true');
    //               }
                   
    //             });
    //     // cursor.forEach(function(doc, err){
    //     //   resultArray.push(doc);
    //     // }, function(){
    //     //   db.close();
    //     //   res.send(resultArray[0]);
    //     // });
    //   });
    // });
 

module.exports = router;
