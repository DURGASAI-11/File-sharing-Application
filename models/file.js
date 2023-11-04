const mongoose = require('mongoose')

const File = new mongoose.Schema({
  path: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  password: String,
  downloadCount: {
    type: Number,
    default: 0,
  },
})
module.exports = mongoose.model('UploadFile', File)
