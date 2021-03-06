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

// Add Stundents

router.route('/students/:class_id')
    .post(function(req, res, next) {
        var class_id = req.params.class_id;
        var splited = class_id.split("-");
        var school_id = splited[0]+'-'+splited[1];
        var status = 1;
        var item = {
            student_id: 'getauto',
            school_id: school_id,
            class_id: class_id,
            student_name: req.body.student_name,
            student_surname: req.body.student_surname,
            dob: req.body.dob,
            phone: req.body.phone,
            email: req.body.email,
            academic_year: req.body.academic_year,
            status: status,
        };
        var current_address = {
            cur_address: req.body.cur_address,
            cur_city: req.body.cur_city,
            cur_state: req.body.cur_state,
            cur_pincode: req.body.cur_pincode,
            cur_long: req.body.cur_long,
            cur_lat: req.body.cur_lat
        };
        var permanent_address = {
            perm_address: req.body.perm_address,
            perm_city: req.body.perm_city,
            perm_state: req.body.perm_state,
            perm_pincode: req.body.perm_pincode,
            perm_long: req.body.perm_long,
            perm_lat: req.body.perm_lat
        };
        mongo.connect(url, function(err, db) {
            autoIncrement.getNextSequence(db, 'students', function(err, autoIndex) {
                var collection = db.collection('students');
                collection.ensureIndex({
                    "student_id": 1,
                }, {
                    unique: true
                }, function(err, result) {
                    if (item.student_name == null || item.dob == null || item.phone == null) {
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
                                    student_id: class_id+'-STD-'+autoIndex
                                },
                                $push: {
                                  current_address, permanent_address
                                }
                            }, function(err, result) {
                                db.close();
                                 res.send({status:'true',id:class_id+'-STD-'+autoIndex});
                            });
                        });
                    }
                });
            });
        });

    })
    .get(function(req, res, next) {
        var class_id = req.params.class_id;
        var resultArray = [];
        mongo.connect(url, function(err, db) {
            assert.equal(null, err);
            var cursor = db.collection('students').find({class_id});
            cursor.forEach(function(doc, err) {
                assert.equal(null, err);
                resultArray.push(doc);
            }, function() {
                db.close();
                res.send({
                    students: resultArray
                });
            });
        });
    });

router.route('/add_parent/:student_id')
    .post(function(req, res, next){
      parents = [];
      var student_id = req.params.student_id;
      var parents = {
        parent_name: req.body.parent_name,
        parent_contact: req.body.parent_contact,
        parent_relation: req.body.parent_relation
      };
      mongo.connect(url, function(err, db){
            db.collection('students').update({student_id},{$push:{parents}}, function(err, result){
              assert.equal(null, err);
               db.close();
               res.send('true');
            });
      });
    });

router.route('/add_old_acadamic_details/:student_id')
    .post(function(req, res, next){
      old_acadamic_details = [];
      var student_id = req.params.student_id;
      var old_acadamic_details = {
        school_name: req.body.school_name,
        class_name: req.body.class_name,
        percentage: req.body.percentage,
        rank: req.body.rank
      };
      mongo.connect(url, function(err, db){
            db.collection('students').update({student_id},{$push:{old_acadamic_details}}, function(err, result){
              assert.equal(null, err);
               db.close();
               res.send('true');
            });
      });
    });

router.route('/student_current_address/:student_id')
    .post(function(req, res, next){
      current_address = [];
      var student_id = req.params.student_id;
      var cur_address = req.body.cur_address;
      var cur_city = req.body.cur_city;
      var cur_state = req.body.cur_state;
      var cur_pincode = req.body.cur_pincode;
      var cur_long = req.body.cur_long;
      var cur_lat = req.body.cur_lat;
      var current_address = {
          cur_address: cur_address,
          cur_city: cur_city,
          cur_state: cur_state,
          cur_pincode: cur_pincode,
          cur_long: cur_long,
          cur_lat: cur_lat
      };
      mongo.connect(url, function(err, db){
            db.collection('students').findOneAndUpdate({student_id},{$set:{current_address}}, function(err, result){
              assert.equal(null, err);
               db.close();
               res.send('true');
            });
      });
    });
router.route('/student_permanent_address/:student_id')
    .post(function(req, res, next){
      permanent_address = [];
      var student_id = req.params.student_id;
      var perm_address = req.body.perm_address;
      var perm_city = req.body.perm_city;
      var perm_state = req.body.perm_state;
      var perm_pincode = req.body.perm_pincode;
      var perm_long = req.body.perm_long;
      var perm_lat = req.body.perm_lat;
      var permanent_address = {
          perm_address: perm_address,
          perm_city: perm_city,
          perm_state: perm_state,
          perm_pincode: perm_pincode,
          perm_long: perm_long,
          perm_lat: perm_lat
      };
      mongo.connect(url, function(err, db){
            db.collection('students').findOneAndUpdate({student_id},{$set:{permanent_address}}, function(err, result){
              assert.equal(null, err);
               db.close();
               res.send('true');
            });
      });
    });

    router.route('/students/:student_id')
        .get(function(req, res, next){
          var student_id = req.params.student_id;
          var resultArray = [];
          mongo.connect(url, function(err, db){
            assert.equal(null, err);
            var cursor = db.collection('students').find({student_id});
            cursor.forEach(function(doc, err){
              resultArray.push(doc);
            }, function(){
              db.close();
              res.send(resultArray[0]);
            });
          });
        });

    router.route('/get_parents/:student_id/')
    .get(function(req, res, next){
      var student_id = req.params.student_id;
      var resultArray = [];
      mongo.connect(url, function(err, db){
        assert.equal(null, err);
        var cursor = db.collection('students').find({student_id},{'parents': 1, '_id': 0});
        cursor.forEach(function(doc, err){
          resultArray.push(doc);
        }, function(){
          db.close();
          res.send(resultArray[0]);
        });
      });
    });

    router.route('/get_array_students/:student_id/:array_name')
    .get(function(req, res, next){
      var student_id = req.params.student_id;
      var array_name = req.params.array_name;
      var resultArray = [];
      mongo.connect(url, function(err, db){
        assert.equal(null, err);
        var cursor = db.collection('students').find({student_id},{[array_name]: 1, '_id': 0});
        cursor.forEach(function(doc, err){
          resultArray.push(doc);
        }, function(){
          db.close();
          res.send(resultArray[0]);
        });
      });
    });



module.exports = router;
