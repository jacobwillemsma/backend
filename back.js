const express = require('express');
const formidable = require('express-formidable');
const app = express();
const storjMethods = require("./storjMethods");
const fs = require("fs");
var multer        = require('multer');


var st = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        var extArray = file.mimetype.split("/");
        var extension = extArray[extArray.length - 1];
        cb(null, file["fieldname"] + '.' + extension);
    }
});


app.post('/codeUpload/:userId', function (req, res) {

    f = req.files.video[0];
    u = req.body.username;
    a(f, u, function () {
        res.send(200);
    });

    storjMethods.listBuckets(function (buckets) {
        var bucketIds = [];
        buckets.forEach(function (bucket, index) {
            bucketIds.push(bucket.name);
            if (index === buckets.length - 1) {
                //Here
            }
        })
    });
});


function writeFile(fileName, fileContent, bucket, callback) {
    storjMethods.uploadFile(bucket, fileName, './' + fileName, function (fileId) {
        fs.unlink("./" + fileName);
        callback(fileId)
    });
}

app.listen(3000, function () {
    console.log('Port 3000!')
});






var rank = bucketIds.indexOf(req.params.userId);
var pathFile = __dirname + '/uploads/' + JSON.stringify(req.fields).ethHash;
if (rank !== -1) {
    writeFile(pathFile, req.files, req.params.userId, function (fileId) {
        res.send(fileId);
    })
} else {
    storjMethods.createBucket(req.params.userId, function () {
        writeFile(pathFile, req.files, req.params.userId, function (fileId) {
            res.send(fileId);
        })
    })
}


f = req.files.video[0];
u = req.body.username;
a(f, u, function () {
    // spawn('python',["cut.py", req.files.video[0].filename]);
    res.send(200);
});


var a = function(o, us, callback) {
    o.status = 0;
    o.frames = 0;
    o.username = us;

    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        var collection = db.collection('vidboost');
        collection.insert(o, function(err, records) {
            callback("");
        });
    });
};