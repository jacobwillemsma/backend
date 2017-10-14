const express = require('express');
const app = express();
const storjMethods = require("./storjMethods");
const mongo = require("./mongo");
var multer = require('multer');
var fs = require('fs');

var st = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        cb(null, 'f' + Date.now().toString() + Math.round(Math.random() * 2550))
    }
});

const up = multer({storage: st});
var cp = up.fields([{name: 'file', maxCount: 1}]);


function uploadF(userId, u, f, res) {
    storjMethods.createBucket(userId, function (res) {
        storjMethods.uploadFile(res.id, u, "./" + f, function (fileId) {
            if (!res.headersSent) {
                res.send(fileId);
            }
        });
    })
}

function goThroughtBuckets(bs, bi, r, f, u, res) {
    bs.forEach(function (b, index) {
        bi.push(b.name);
        if (index === bs.length - 1) {
            var rank = bi.indexOf(r);
            if (rank !== -1) {
                var bucketId = bs[rank].id;
                storjMethods.uploadFile(bucketId, u, "./" + f.path, function (fileId) {
                    if (!res.headersSent) {
                        res.send(fileId);
                    }
                });
            } else {
                uploadF(r, u, "./" + f, res);
            }
        }
    });
}

app.post('/codeUpload/:userId', cp, function (req, res) {
    var f = req.files.file[0];
    var u = req.body['hash'];
    var r = req.params['userId'];
    var bucketIds = [];
    storjMethods.listBuckets(function (buckets) {
        if (buckets.length === 0) {
            uploadF(r, u, "./" + f);
        }
        goThroughtBuckets(buckets, bucketIds, r, f, u, res)
    });
});


app.post('/org_logo', cp, function (req, res) {
    var f = req.files.file[0];
    var n = req.body['hash'];
    fs.readFile(f.path, function (err, data) {
        fs.writeFile("./local/"+n, data, function (err) {
            if (err) return console.log(err);
            res.send(200);
        });
    });
});

app.get('/org_logo/:hash', function (req, res) {
    res.sendFile(__dirname + "/local/" + req.params["hash"]);
});

app.get('/list/:bucket', function (req, res) {
    var b = req.params['bucket'];
    storjMethods.getFiles(b, function (files) {
        res.send(files);
    })
});

app.post('/claim/check_exist', function (req, res) {
    mongo.getFile(req.body, function (files) {
        res.send(files);
    })
});

app.post('/claim', function (req, res) {
    mongo.createFile(req.body, function (res) {
        res.send(200);
    });
});

app.post('/screening', function (req, res) {
    mongo.createFile(req.body, function (res) {
        res.send(200);
    });
});

app.get('/screening/:hash', function (req, res) {
    h = req.params['hash'];
    mongo.getScreening(req.body, h, function (files) {
        res.send(files);
    })
});

app.get('/download/:bucket/:hash', function (req, res) {
    var b = req.params['bucket'];
    var h = req.params['hash'];

    storjMethods.getFiles(b, function (files) {
        var nf = true;
        files.forEach(function (file, index) {
            if (file.filename === h) {
                var p = file['name'];
                storjMethods.download(b, file.id, "./local/" + p, function () {
                    res.sendFile(__dirname + "/local/" + p);
                });
                nf = false;
            }
            if (index === files.length - 1 && nf) {
                res.send(404);
            }
        });
    });
});


app.listen(3000, function () {
    console.log('Port 3000!')
});