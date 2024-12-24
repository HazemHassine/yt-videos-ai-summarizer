import User from "../../models/User";

export async function DELETE(req) {
    try {
        const { email, articleId } = await req.json();
        console.log(email, articleId);

        // Validate input
        if (!email || !articleId) {
            console.error("Validation error: email and articleId are required.");
            return new Response(
                JSON.stringify({ error: "Email and articleId are required." }),
                { status: 400 }
            );
        }

        console.log(`Request received with email: ${email} and articleId: ${articleId}`);
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

        const user = await User.findOne({ email });
        if (!user) {
            console.error(`User not found for email: ${email}`);
            return new Response(
                JSON.stringify({ error: "User not found." }),
                { status: 404 }
            );
        }

        console.log(`User found with email: ${email}. Proceeding to delete article...`);

        const updateResult = await User.updateOne(
            { email },
            {
                $pull: {
                    articles: { _id: articleId } // Pull the article with the matching _id
                }
            }
        );

        if (updateResult.modifiedCount === 0) {
            console.warn(`No article found with _id: ${articleId} for user: ${email}`);
            return new Response(
                JSON.stringify({ error: "Article not found or could not be deleted." }),
                { status: 404 }
            );
        }

        console.log(`Article with _id: ${articleId} deleted successfully for user: ${email}`);

        return new Response(
            JSON.stringify({ message: "Article deleted successfully" }),
            { status: 200 }
        );
    } catch (err) {
        // Step 6: Catch and log errors
        console.error("Error deleting article:", err);
        return new Response(
            JSON.stringify({ error: `Error deleting article: ${err.message}` }),
            { status: 500 }
        );
    }
}
