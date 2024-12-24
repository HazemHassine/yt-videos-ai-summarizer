import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true },
        displayName: String,
        videosSummarized: { type: Number, default: 0 },
        passwordHash: { type: String, required: true },
        articles: [
            {
                _id: { type: String, required: true },
                videoTitle: String,
                video_thumbnail: {
                    url: String,
                    width: Number,
                    height: Number
                },
                videoUrl: String,
                content: String,
                favorite: { type: Boolean, default: false },
                createdAt: { type: Date, default: Date.now },
                shareToken: { type: String, unique: true }
            }
        ]
    },
    { timestamps: true }
);

// Delete the existing model if it exists
mongoose.models = {};

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;

