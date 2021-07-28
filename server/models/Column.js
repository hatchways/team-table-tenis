const mongoose = require("mongoose");

const columnSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: false
  },
  columns: [{
    type: String,
  }]
})

module.exports = Column = mongoose.model('column', columnSchema)