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

// Add Exam Schedule

router.route('/exam_schedule/:school_id')
    .post(function(req, res, next) {
        var school_id = req.params.school_id;
        var status = 1;
        subjects = [];
        var item = {
            exam_sch_id: 'getauto',
            school_id: school_id,
            exam_title: req.body.exam_title,
            exam_classes: req.body.exam_classes,
            from_date: req.body.from_date,
            status: status,
        };
        mongo.connect(url, function(err, db) {
            autoIncrement.getNextSequence(db, 'exam_schedule', function(err, autoIndex) {
                var collection = db.collection('exam_schedule');
                collection.ensureIndex({
                    "exam_sch_id": 1,
                }, {
                    unique: true
                }, function(err, result) {
                    if (item.school_id == null ||  item.exam_title == null) {
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
                                    exam_sch_id: school_id+'-EXM_SCH-'+autoIndex
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
      var school_id = req.params.school_id;
        var resultArray = [];
        mongo.connect(url, function(err, db) {
            assert.equal(null, err);
            var cursor = db.collection('exam_schedule').find({school_id});
            cursor.forEach(function(doc, err) {
                assert.equal(null, err);
                resultArray.push(doc);
            }, function() {
                db.close();
                res.send({
                    exam_schedules: resultArray
                });
            });
        });
    });

    router.route('/get_exam_schedule/:exam_sch_id')

    .get(function(req, res, next) {
      var exam_sch_id = req.params.exam_sch_id;
        var resultArray = [];
        mongo.connect(url, function(err, db) {
            assert.equal(null, err);
            var cursor = db.collection('exam_schedule').find({exam_sch_id});
            cursor.forEach(function(doc, err) {
                assert.equal(null, err);
                resultArray.push(doc);
            }, function() {
                db.close();
                res.send({
                    exam_schedule: resultArray
                });
            });
        });
    });

    router.route('/edit_exam_schedule/:exam_sch_id')
        .post(function(req, res, next){
          var exam_sch_id = req.params.exam_sch_id;
          var name = req.body.name;
          var value = req.body.value;
          mongo.connect(url, function(err, db){
                db.collection('exam_schedule').update({exam_sch_id},{$set:{[name]: value}}, function(err, result){
                  assert.equal(null, err);
                   db.close();
                   res.send('true');
                });
          });
        });


module.exports = router;
