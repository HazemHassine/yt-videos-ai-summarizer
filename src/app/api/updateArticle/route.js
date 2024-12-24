import User from "../../models/User";

export async function PUT(req) {
    try {
        // Parse request body
        const { articleId, email, content } = await req.json();
        console.log(`Received request to update article: ${articleId} for email: ${email}`);

        // Check if the input data is valid
        if (!email || !articleId || !content) {
            return new Response(
                JSON.stringify({ message: "Missing required fields: email, articleId, and content" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const user = await User.findOne({
            email: email,
            "articles._id": articleId,
        });

        if (!user) {
            throw new Error("User or article not found");
        }

        const updateResult = await User.updateOne(
            { 
                email: email, 
                "articles._id": articleId 
            },
            { 
                $set: { "articles.$.content": content }
            }
        );

        if (updateResult.modifiedCount === 0) {
            throw new Error("Article content was not modified");
        }

        // Return success response
        return new Response(
            JSON.stringify({ message: "Article updated successfully" }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            }
        );

    } catch (error) {
        console.error("Error:", error);
        return new Response(
            JSON.stringify({
                source: "updateArticle threw an error",
                error: error.message,
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
}
