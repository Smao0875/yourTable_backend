var AWS = require('aws-sdk');

module.exports = {
    uploadFileToAWS: function(file, fileName, callback) {
        AWS.config.update({
            accessKeyId:"",
            secretAccessKey:""
        });

        var bucket = new AWS.S3({apiVersion:'2006-03-01'});
        var uploadParams = {
            Bucket:'yourtable-avatars',
            Key: fileName,
            Body: file.buffer.toString()
        };

        bucket.upload(uploadParams, callback);
    }
};