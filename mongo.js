var MongoClient  = require('mongodb').MongoClient;
var assert       = require('assert');
var url          = require("./secret/pass.js").url;

var getFile = function(body, callback) {
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        var collection = db.collection('storj');
        findFileById({
            fileId: body.hash,
            lineRange: body.lineRange
        }, collection, function (result) {
            callback(result);
        })
    })
};

var getScreening = function(body, hash, callback) {
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        var collection = db.collection('storj');
        findFileById({
            fileId: hash
        }, collection, function (result) {
            callback(result[0]);
        })
    })
};


var findFileById = function (body, collection, callback) {
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        var collection = db.collection('storj');
        collection.find(body.query).toArray(function (err, docs) {
            assert.equal(err, null);
            if (docs.length === 0) {
                callback(404);
            } else {
                callback(docs[0]);
            }
        })
    })
};

var changeEntry = function (body, collection, callback) {
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        var collection = db.collection('storj');
        collection.updateOne({hash: body.fileId}, body.query, function (err, res) {
            if (err) throw err;
            console.log("1 document updated");
            callback(200);
        });
    })
};

var createScreening = function (body, callback) {
    var id = body.fileName;
    var lineRange = body.lineRange;
    var comment = body.comment;
    getScreening(body, id, function (obj) {
        var fileId = obj.id;
        MongoClient.connect(url, function(err, db) {
            assert.equal(null, err);
            var collection = db.collection('storj');
            collection.updateOne({fileId:fileId},{
                lineRange: lineRange,
                comment: comment
            }, function(err, records) {
                callback(id)
            });
        });
    });
};



var createFile = function(body, callback) {
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        var collection = db.collection('storj');
        collection.insertOne({
            fileId: body.fileId,
            status: "active",
            lineRange: [0,0],
            comment: "",
            category: ""
        }, function(err, records) {
            callback(200)
        });
    });
};

module.exports = {
    'createFile': createFile,
    'getFile': getFile,
    'changeEntry': changeEntry,
    'getScreening': getScreening,
    'findFileById': findFileById,
    'createScreening': createScreening
};