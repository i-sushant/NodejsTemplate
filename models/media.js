const mongoose = require('mongoose');
const mediaSchema = new mongoose.Schema({
    name : String,
    uploader : {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
    },
    url:String,
    timeStamp : Date
});

const Media = mongoose.model('Media', mediaSchema);
module.exports = Media;