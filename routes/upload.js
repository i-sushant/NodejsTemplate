const fs = require('fs');
const AWS = require('aws-sdk');
const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const Media = require('../models/media');
const path = require('path');
const keys = require('../config/keys');


const s3 = new AWS.S3({
    accessKeyId: keys.accessKeyIdS3,
    secretAccessKey: keys.secretAccessKeyS3
});




router.post('/upload', passport.authenticate("jwt", { session: false }),
    (req, res) => {
            User.findOne({ _id:req.user._id})
                .then(user => {
                    if (!user) {
                        return res.json({
                            "message": "User not found"
                        });
                    };
                    const fileName = req.body.path;
                    const uploadFile = () => {
                        fs.readFile(fileName, (err, data) => {
                            if (err) throw err;
                            var base64data = new Buffer(data, 'binary');
                            const params = {
                                Bucket: 'sushantinternship', // pass your bucket name
                                Key: user._id + Date.now() + path.basename(fileName), // file will be saved as testBucket/contacts.csv
                                Body: base64data
                            };
                            s3.upload(params, function (s3Err, data) {
                                if (s3Err) throw s3Err
                                console.log(`File uploaded successfully at ${data.Location}`)
                                const mediaBody = {
                                    name:data.key,
                                    uploader: user._id,
                                    url: data.Location,
                                    timeStamp: Date.now()
                                }
                                const media = new Media(mediaBody);
                                media
                                    .save()
                                    .then(media => res.status(200).json({"url": media.url}))
                                    .catch(error => res.status(404).send("Error saving media"));
                            });
                        });
                    };
                    uploadFile();  
                });
    });

router.get('/files', passport.authenticate("jwt", { session: false }) , (req,res) => {
    User.findOne({_id:req.user._id})
    .then(user => {
        if (!user) return res.send("No user found");
        Media.find({uploader:user._id})
        .then(media => res.json(media))
        .catch(error => res.send(error));
    })
    .catch(error => res.send(error));
});


module.exports = router;