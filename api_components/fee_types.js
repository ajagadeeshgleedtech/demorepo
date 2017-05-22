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

// fee types

router.route('/feetypes/:school_id')
    .post(function(req, res, next) {
        var status = 1;
        var item ={
         school_id : req.params.school_id,
         fee_category : req.body.fee_category,
         fee_type : req.body.fee_type,
         class_id : req.body.class_id,
         fee_amount : req.body.fee_amount,
         fee_description : req.body.fee_description,
         fee_due_date : req.body.fee_due_date

        }
         
        mongo.connect(url, function(err, db) {
            
                var collection = db.collection('fee_types');
                 
                    if (item.school_id == null || item.fee_category == null || item.fee_type == null || item.class_id == null || item.fee_amount == null ) {
                        res.end('null');
                    } else {
                        collection.insertOne(item, function(err, result) {
                            if (err) {
                                if (err.code == 11000) {
                                    res.end('false');
                                }
                                res.end('false');
                            }
                            db.close();
                            res.send('true');
                            
                        });
                    }
                  
        });

    })
    .get(function(req, res, next) {
        var school_id = req.params.school_id;
        var resultArray = [];
        mongo.connect(url, function(err, db) {
            assert.equal(null, err);
            var cursor = db.collection('fee_types').find({school_id});
            cursor.forEach(function(doc, err) {
                assert.equal(null, err);
                resultArray.push(doc);
            }, function() {
                db.close();
                res.send({
                    feetypes: resultArray
                });
            });
        });
    });
 
  
 



module.exports = router;
