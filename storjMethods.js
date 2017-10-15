const libstorj = require('storj');

const storj = new libstorj.Environment({
    bridgeUrl: 'https://api.storj.io',
    bridgeUser: 'shevchenkoalexander@icloud.com',
    bridgePass: '123qweasd',
    encryptionKey: '2314321fkjdsalgjhdsoahu3i21y4uio312yhrfdjsfghiug34ui32h1ui4h321jrgesahjfgdsahjfgdsa',
    logLevel: 0
});

//Download File
//ARGUMENTS: bucketId = STRING, the ID of the bucket we created.
//           fileName = STRING, the fileName you want to give to the file.
//           filePath = STRING, where your file is located.
function uploadFile(bucketId, fileName, filePath, callback) {
    console.log(fileName, filePath);
    try {
        storj.storeFile(bucketId, filePath, {
            filename: fileName,
            progressCallback: function (progress, uploadedBytes, totalBytes) {
                console.log('Progress: %d, uploadedBytes: %d, totalBytes: %d',
                    progress, uploadedBytes, totalBytes);
            },
            finishedCallback: function (err, fileId) {
                if (err) {
                    callback(err.toString())
                }
                console.log('File upload complete:', fileId);
                callback(fileId);
            }
        });
    }
    catch(err) {
        callback(err.toString());
    }
}

//Download File
//ARGUMENTS: bucketId = STRING, the ID of the bucket we created.
//           fileId   = STRING, the fileId of the file we uploaded.
//           filePath = STRING, where you want the file to be downloaded to.
function downloadFile(bucketId, fileId, downloadFilePath, callback) {
    console.log(bucketId, fileId, downloadFilePath);
    storj.resolveFile(bucketId, fileId, downloadFilePath, {
        progressCallback: function (progress, downloadedBytes, totalBytes) {
            console.log('Progress: %d, downloadedBytes: %d, totalBytes: %d',
                progress, downloadedBytes, totalBytes);
        },
        finishedCallback: function (err) {
            if (err) {
                callback(200);
                return console.error(err);
            }
            console.log('File download complete');
            callback(200)
        }
    });
}

//List buckets that you have created
//NO ARGUMENTS
function listBuckets(callback) {
    storj.getBuckets(function (err, result) {
        if (err) {
            return console.error(err);
        }
        callback(result);
    });
}

//List files that you have uploaded
//ARGUMENTS: bucket = STRING, the bucket id you want files from.
function getFiles(bucket, callback) {
    storj.listFiles(bucket, function (err, results) {
        if (err) {
            return console.error(err);
        }
        console.log(results);
        callback(results)
    });
}


//Create bucket
//ARGUMENTS: bucketName = STRING, name for the bucket you want to create.
function createBucketFunc(bucketName, callback) {
    storj.createBucket(bucketName, function (err, result) {
        if (err) {
            return console.error(err);
        }
        callback(result);
    });
}


//Remove all buckets owned by the account except for passed IDs
//ARGUMENTS: omit = ARRAY, list of IDs of buckets you do not want deleted.
function removeAllBucketsExcept(omit) {
    if (omit){
        omit = []
    }
    listBuckets(function (buckets) {
        buckets.forEach(function (bucket) {
            if(omit.indexOf(bucket.id) === -1){
                storj.deleteBucket(bucket.id, function (err, res) {
                    console.log(err, res);
                })
            }
        })
    })
}

module.exports = {
    'download': downloadFile,
    'uploadFile': uploadFile,
    'listBuckets': listBuckets,
    'getFiles': getFiles,
    'createBucket': createBucketFunc,
    'removeAllBucketExcept': removeAllBucketsExcept,
    'storj': storj
};