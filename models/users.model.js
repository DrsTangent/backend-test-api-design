const mongoose = require("mongoose")
const Schema = mongoose.Schema

const UsersSchema = new Schema({
    name: {type: String, required:true},
    email: {type: String, unique: true, required:true},
    username: {type: String, unique: true, required:true}
})

let Users = mongoose.model("Users", UsersSchema)

module.exports = {Users}