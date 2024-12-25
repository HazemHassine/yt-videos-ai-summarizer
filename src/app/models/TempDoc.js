import mongoose from "mongoose";

const TempDocSchema = new mongoose.Schema(
    {
        content: String,
    },
    { timestamps: true }
);

// Delete the existing model if it exists
mongoose.models = {};

const TempDoc = mongoose.models.TempDoc || mongoose.model("TempDoc", TempDocSchema);

export default TempDoc;

