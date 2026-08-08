import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    mobile: {
        type: String,
        required: true,
        unique: true,
    },
    fullName: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["buyer", "seller"],
        default: "buyer",
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
});

userSchema.pre("save", async function() {
    if(this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
});

userSchema.methods.comparePassword = function(password) {
    return bcrypt.compare(password, this.password);
}

const userModel = mongoose.model("User", userSchema);

export default userModel;