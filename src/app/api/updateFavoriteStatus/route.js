import mongoose from "mongoose";
import User from "../../models/User";

export async function PUT(req) {
    try {
        // Connect to MongoDB if not already connected
        if (mongoose.connection.readyState !== 1) {
            await mongoose.connect(process.env.MONGODB_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
        }

        const { articleId, email } = await req.json();

        console.log(`Updating favorite status for article: ${articleId} by user: ${email}`);

        // Find the user by email using Mongoose
        const user = await User.findOne({ email });

        if (!user) {
            throw new Error("User not found.");
        }

        // Find the index of the article
        const articleIndex = user.articles.findIndex((article) => article._id === articleId);

        if (articleIndex === -1) {
            throw new Error("Article not found.");
        }

        // Toggle the favorite status
        const currentStatus = user.articles[articleIndex].favorite;
        user.articles[articleIndex].favorite = !currentStatus;

        // Save the updated user document
        await user.save();

        return new Response(
            JSON.stringify({ success: true, newFavoriteStatus: !currentStatus }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" },
            }
        );
    } catch (error) {
        console.error("Error updating favorite status:", error);
        return new Response(
            JSON.stringify({
                source: "updateFavoriteStatus",
                error: error.message,
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}
