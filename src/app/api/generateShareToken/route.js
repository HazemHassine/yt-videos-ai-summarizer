import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import crypto from 'crypto';
import User from '../../models/User';

export async function POST(req) {
  try {
    console.clear();
    console.log("Received POST request to generate share token.");

    const { articleId, email } = await req.json();
    console.log("Request body:", { articleId, email });

    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState !== 1) {
      console.log("MongoDB not connected. Attempting to connect...");
      await mongoose.connect(process.env.MONGODB_URI);
      console.log("MongoDB connected.");
    }

    // Generate a unique share token
    const shareToken = crypto.randomBytes(16).toString('hex');
    console.log("Generated share token:", shareToken);

    // Find the user by email and update the specific article
    const result = await User.updateOne(
      { email, "articles._id": articleId },
      { $set: { "articles.$.shareToken": shareToken } }
    );

    console.log("Update result:", result);

    if (result.matchedCount === 0) {
      console.log(`User not found or article not found for email: ${email} and articleId: ${articleId}`);
      return NextResponse.json({ error: 'User or article not found' }, { status: 404 });
    }

    if (result.modifiedCount === 0) {
      console.log("No changes were made to the document.");
      return NextResponse.json({ error: 'No changes made' }, { status: 400 });
    }

    console.log("Article share token updated and saved in the database.");

    // Fetch the updated user to confirm changes
    const updatedUser = await User.findOne({ email });
    const updatedArticle = updatedUser.articles.find(article => article._id.toString() === articleId);
    console.log("Updated article:", updatedArticle);

    return NextResponse.json({ shareToken });
  } catch (error) {
    console.error('Error generating share token:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

