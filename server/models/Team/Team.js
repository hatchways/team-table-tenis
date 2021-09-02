const mongoose = require("mongoose");
const ObjectId = mongoose.ObjectId;

const teamSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: false
  },
  collaborators: [{
    users: {
    type: ObjectId,
    ref: "user"
    }
  }],
  boards: [{
    type: ObjectId,
    ref: "teamBoard"
  }]
})

module.exports = Team = mongoose.model('team', teamSchema)