import mongoose from "mongoose";
import User from "../../models/User";

export async function GET(req) {
    try {
        // MongoDB connection
        if (mongoose.connection.readyState !== 1) {
            console.log("MongoDB not connected, connecting...");
            await mongoose.connect(process.env.MONGODB_URI,
                //   {
                //   useUnifiedTopology: true,
                // }
            );
            console.log("MongoDB connected.");
        }

        const userCount = await User.countDocuments();
        console.log("User count retrieved:", userCount);

        const articlesSummarized = await User.aggregate([
            { $group: { _id: null, total: { $sum: "$videosSummarized" } } }
        ]);
        console.log("Articles summarized retrieved:", articlesSummarized);

        const articlesSaved = await User.aggregate([
            { $unwind: "$articles" },
            { $group: { _id: null, total: { $sum: 1 } } }
        ]);
        console.log("Articles saved retrieved:", articlesSaved);

        return new Response(JSON.stringify({
            userCount,
            articlesSummarized: articlesSummarized[0]?.total || 0,
            articlesSaved: articlesSaved[0]?.total || 0,
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error("Error occurred:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } finally {
        console.log("Closing MongoDB connection...");
        mongoose.connection.close();
        console.log("MongoDB connection closed");
    }
}