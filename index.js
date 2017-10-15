const express = require('express');
const app = express();
const storjMethods = require("./storjMethods");
const mongo = require("./mongo");
var multer = require('multer');
var fs = require('fs');
var bodyParser = require('body-parser');
var cors = require('cors');
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

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
    storjMethods.createBucket(userId, function (reso) {
        storjMethods.uploadFile(reso.id, u, f, function (fileId) {
            if (!res.headerSent) {
                res.json({storjHash: fileId});
            }
        });
    })
}

function goThroughtBuckets(bs, bi, r, filePath, u, res) {
    bs.forEach(function (b, index) {
        bi.push(b.name);
        if (index === bs.length - 1) {
            var rank = bi.indexOf(r);
            if (rank !== -1) {
                var bucketId = bs[rank].id;
                storjMethods.uploadFile(bucketId, u, filePath, function (fileId) {
                    if (!res.headersSent) {
                        res.json({storjHash: fileId});
                    }
                });
            } else {
                uploadF(r, u, filePath, res);
            }
        }
    });
}

app.post('/codeUpload', cp, function (req, res) {
    var f = req.files.file[0];
    var bucketIds = [];
    req.body.fileName = f.filename;
    mongo.createScreening(req.body, function (m) {
        u = req.body.organisation;
        r = req.body.organisation;
        pr = m+u;
        filePath = "./uploads/" + f.filename;
        storjMethods.listBuckets(function (buckets) {
            if (buckets.length === 0) {
                storjMethods.createBucket(r, function (reso) {
                    storjMethods.uploadFile(reso.id, pr, filePath, function (fileId) {
                        if (!res.headerSent) {
                            res.json({storjHash: m});
                        }
                    });
                });
            }
            goThroughtBuckets(buckets, bucketIds, r, filePath, pr, res)
        });
    });
});


app.post('/org_logo', cp, function (req, res) {
    var f = req.files.file[0];
    var n = req.body['hash'];
    console.log(f.path);
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
    mongo.createFile(req.body, function (resp) {
        res.send(resp);
    });
});

app.post('/screening', function (req, res) {
    mongo.createScreening(req.body, function (resp) {
        res.send(resp);
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