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
// var fixtureData = require('./fixture_data.json');
// app.locals.barChartHelper = require('./bar_chart_helper');
var url = 'mongodb://' + config.dbhost + ':27017/s_erp_data';

var cookieParser = require('cookie-parser');
router.use(function(req, res, next) {
    // do logging
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next(); // make sure we go to the next routes and don't stop here
});

router.route('/examsgraph/:examination_title/:subject_id/:class_id/:section_id')
 .get(function(req, res, next) {
 	  var examination_title = req.params.examination_title;
      var subject_id = req.params.subject_id;
      var class_id = req.params.class_id;
      var section_id = req.params.section_id;

        var resultArray = [];
        mongo.connect(url, function(err, db) {
            assert.equal(null, err);
            var cursor = db.collection('exams').find({examination_title,subject_id,class_id,section_id});
            cursor.forEach(function(doc, err) {
                assert.equal(null, err);
                resultArray.push(doc);
            }, function() {
                db.close();
                res.send({
                    barchart: resultArray
                });
            });
        });
    });


 router.route('/exams/:examination_title/:student_id/:class_id/:section_id')
 .get(function(req, res, next) {
 	  var examination_title = req.params.examination_title;
      var student_id = req.params.student_id;
      var class_id = req.params.class_id;
      var section_id = req.params.section_id;

        var resultArray = [];
        mongo.connect(url, function(err, db) {
            assert.equal(null, err);
            var cursor = db.collection('exams').find({examination_title,student_id,class_id,section_id});
            cursor.forEach(function(doc, err) {
                assert.equal(null, err);
                resultArray.push(doc);
            }, function() {
                db.close();
                res.send({
                    barchart: resultArray
                });
            });
        });
    });

module.exports = router;