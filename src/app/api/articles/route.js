import mongoose from "mongoose";
import User from "../../models/User"; // Import the User model
import { cookies } from "next/headers";
import jwt from "jsonwebtoken"; // Import jsonwebtoken

export async function POST(req) {
    try {
        // Connect to MongoDB if not already connected
        if (mongoose.connection.readyState !== 1) {
            await mongoose.connect(process.env.MONGODB_URI);
        }

        const cookieStore = await cookies();
        const authToken = cookieStore.get("authToken")?.value;
        const token_data = jwt.verify(authToken, process.env.JWT_SECRET);

        if (!token_data) {
            throw new Error("Unauthorized access.");
        }

        const email = token_data.email;

        if (!email) throw new Error("Email parameter is required!");

        // Find user by email using Mongoose
        const user = await User.findOne({ email });

        if (!user) {
            throw new Error("User not found.");
        }

        // Return the user's articles
        return new Response(
            JSON.stringify({ articles: user.articles || [] }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    } catch (error) {
        console.error("Error fetching user library:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
}
