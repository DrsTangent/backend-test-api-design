const mongoose = require("mongoose")
const Schema = mongoose.Schema

const OrganizationSchema = new Schema({
    name: { type: String, required: true },
    repositories:[{type:Schema.Types.ObjectId, ref: 'Repositories'}],
    lastFetchedDate: {
        type: Date,
        default: null,
    }
  });

let Organizations = mongoose.model("Organizations", OrganizationSchema);

module.exports = {Organizations}