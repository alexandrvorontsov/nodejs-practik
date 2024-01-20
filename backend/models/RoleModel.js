const { model, Schema } = require("mongoose");

const roleShema = new Schema({
    value: { type: String, default: "USER" },
});

module.exports = model("role", roleShema);
