const mongoose = require("mongoose")
const Schema = mongoose.Schema

const RepositoriesSchema = new Schema({
    name: {type: String, unique: true, required:true},
    contributors: {
        type: [{userId: {type:Schema.Types.ObjectId, ref: 'Users'}, firstCommit: Date}],
        required: true,
        default: []
    },
    fullName: {
        type: {
            organization: String,
            repository: String
        },
        require: true,
        unique: true
    },
    lastFetchedDate: {
        type: Date,
        default: null,
    }
})

let Repositories = mongoose.model("Repositories", RepositoriesSchema);

module.exports = {Repositories}