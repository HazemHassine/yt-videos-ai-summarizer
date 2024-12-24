import bcrypt from "bcryptjs"; // Add bcrypt to hash passwords
import mongoose from "mongoose"; // Import mongoose
import jwt from "jsonwebtoken"; // Import jsonwebtoken
import User from "../../models/User"; // Import User model

export async function POST(req) {
  try {
    // Parse request body
    const { displayName, email, password } = await req.json();

    console.log("Received signup request:", { displayName, email });

    // Validate input
    if (!displayName || !email || !password) {
      console.error("Missing required fields:", { displayName, email, password });
      return new Response(
        JSON.stringify({
          message: "Missing required fields: displayName, email, and password are required",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`Received signup request for email: ${email}`);

    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState !== 1) {
      console.log("MongoDB not connected, connecting...");
      await mongoose.connect(process.env.MONGODB_URI);
      console.log("MongoDB connected.");
    } else {
      console.log("MongoDB is already connected.");
    }

    // Check if user already exists
    console.log(`Checking if user with email ${email} exists...`);
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.warn(`User with email ${email} already exists.`);
      return new Response(
        JSON.stringify({
          message: "User already exists. Please use a different email.",
        }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }

    // Hash the password
    console.log("Hashing the password...");
    const passwordHash = await bcrypt.hash(password, 10);
    console.log("Password hashed successfully.");

    // Create new user with hashed password
    const newUser = new User({
      displayName,
      email,
      passwordHash,
      createdAt: new Date(),
      videosSummarized: 0, // Initialize the videosSummarized field
      articles: [], // Initialize an empty articles array
    });

    // Save the new user in the database
    console.log("Saving new user to the database...");
    await newUser.save();
    console.log("User saved successfully:", newUser._id);

    // Generate JWT for the new user
    console.log("Generating JWT for the new user...");
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email, displayName: displayName },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // Token valid for 7 days
    );
    console.log("JWT generated successfully.");

    // Create a cookie to store the JWT
    const cookie = `authToken=${token}; Path=/; HttpOnly; ${
      process.env.NODE_ENV === "production" ? "Secure" : ""
    }; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}`;

    // Return response with cookie and user data
    console.log("Returning response with new user and JWT.");
    return new Response(
      JSON.stringify({
        userId: newUser._id,
        message: "User created successfully",
      }),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": cookie, // Send the cookie in the response
        },
      }
    );
  } catch (error) {
    console.error("Error occurred during signup:", error);
    return new Response(
      JSON.stringify({
        message: "Error creating user. Please try again later.",
        error: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
