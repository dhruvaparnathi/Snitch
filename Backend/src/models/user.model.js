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
        required: false,
        sparse: true,
    },
    fullName: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: false,
    },
    googleId: {
        type: String,
        default: null,
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
}, { timestamps: true });

userSchema.pre("save", async function () {
    if (this.password && this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    if(this.googleId){
        this.isVerified = true;
    }
});

userSchema.methods.comparePassword = function(password) {
    if (!this.password) return false;
    return bcrypt.compare(password, this.password);
}

const userModel = mongoose.model("User", userSchema);

export default userModel;