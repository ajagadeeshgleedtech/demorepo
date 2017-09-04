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
router.use(function (req, res, next) {
    // do logging
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next(); // make sure we go to the next routes and don't stop here
});

// Add Teachers

router.route('/teachers/:school_id')
    .post(function (req, res, next) {
        var status = 1;
        var school_id = req.params.school_id;
        subjects = [];
        var item = {
            teacher_id: 'getauto',
            school_id: school_id,
            employee_id: req.body.employee_id,
            added_on: req.body.added_on,
            status: status,
        };
        var subjects = {
            subject_id: req.body.subject_id,
            subject_name: req.body.subject_name
        };
        mongo.connect(url, function (err, db) {
            autoIncrement.getNextSequence(db, 'teachers', function (err, autoIndex) {
                var collection = db.collection('teachers');
                collection.ensureIndex({
                    "teacher_id": 1,
                }, {
                    unique: true
                }, function (err, result) {
                    if (item.school_id == null || item.employee_id == null || subjects.subject_id == null) {
                        res.end('null');
                    } else {
                        collection.insertOne(item, function (err, result) {
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
                                    teacher_id: 'SCH-TCH-' + autoIndex
                                },
                                $push: {
                                    subjects
                                }
                            }, function (err, result) {
                                db.close();
                                res.end('true');
                            });
                        });
                    }
                });
            });
        });

    })

    .get(function (req, res, next) {
        var resultArray = [];
        var school_id = req.params.school_id;
        mongo.connect(url, function (err, db) {
            assert.equal(null, err);
 
            var cursor = db.collection('teachers').aggregate([ 
                {
                    "$lookup": {
                        "from": "employee",
                        "localField": "employee_id",
                        "foreignField": "employee_id",
                        "as": "employee_doc"
                    }
                },
                {
                    "$unwind": "$employee_doc"
                },
                {
                    "$redact": {
                        "$cond": [{
                                "$eq": ["$employee_id", "$employee_doc.employee_id"]
                            },
                            "$$KEEP",
                            "$$PRUNE"
                        ]
                    }
                },
                {
                    "$project": {
                        "_id": "$_id",
                        "teacher_id": "$teacher_id",
                        "employee": "$employee_doc"  ,
                        "school_id": "$school_id",
                        "employee_id": "$employee_id",
                        "added_on": "$added_on",

                        "subjects": "$subjects"

                    }
                }
            ]);
            cursor.forEach(function (doc, err) {
                assert.equal(null, err);
                resultArray.push(doc);
            }, function () {
                db.close();
                res.send({
                    teachers: resultArray
                });
            });
        });
    });

router.route('/add_subjects_to_teacher/:teacher_id')
    .post(function (req, res, next) {
        subjects = [];
        var teacher_id = req.params.teacher_id;
        var subjects = {
            subject_id: req.body.subject_id,
            subject_name: req.body.subject_name
        };
        mongo.connect(url, function (err, db) {
            db.collection('teachers').update({
                teacher_id
            }, {
                $push: {
                    subjects
                }
            }, function (err, result) {
                assert.equal(null, err);
                db.close();
                res.send('true');
            });
        });
    });


router.route('/addorupdatesubjectstoteacher/:school_id')
    .post(function (req, res, next) {
        var status = 1;
        var school_id = req.params.school_id;
        var employee_id = req.body.employee_id;
        subjects = [];
        var item = {
            teacher_id: 'getauto',
            school_id: school_id,
            employee_id: req.body.employee_id,
            added_on: req.body.added_on,
            status: status,
        };
        var subjects = {
            subject_id: req.body.subject_id,
            subject_name: req.body.subject_name
        };

        mongo.connect(url, function (err, db) {
            var collection = db.collection('teachers');

            collection.find({
                "employee_id": employee_id
            }).toArray(function (err, results) {
                if (err) {
                    res.send('false')
                }


                if (results.length == 0) {


                    autoIncrement.getNextSequence(db, 'teachers', function (err, autoIndex) {

                        collection.ensureIndex({
                            "teacher_id": 1,
                        }, {
                            unique: true
                        }, function (err, result) {
                            if (item.school_id == null || item.employee_id == null || subjects.subject_id == null) {
                                res.end('null');
                            } else {
                                collection.insertOne(item, function (err, result) {
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
                                            teacher_id: 'SCH-TCH-' + autoIndex
                                        },
                                        $push: {
                                            subjects
                                        }
                                    }, function (err, result) {
                                        db.close();
                                        res.end('true');
                                    });
                                });
                            }
                        });
                    });


                } else {

                    collection.update({
                            "employee_id": employee_id
                        }, {
                            "$addToSet": {
                                "subjects": {
                                    subject_id: req.body.subject_id,
                                    subject_name: req.body.subject_name
                                }
                            }
                        },
                        function (err, numAffected) {
                            if (err) {
                                res.send('false')
                            }

                            if (numAffected.result.nModified == 1) {
                                res.send('true')
                            } else {
                                res.send('false')
                            }
                        });
                    // res.send('false')
                }
            });


        });
    });

module.exports = router;
