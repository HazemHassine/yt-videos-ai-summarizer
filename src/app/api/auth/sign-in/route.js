import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import User from "../../../models/User";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    console.log("Received signin request:", { email });

    if (!email || !password) {
      console.error("Missing required fields.");
      return new Response(
        JSON.stringify({ message: "Email and password are required." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

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

    // User existence check
    console.log(`Looking for user with email: ${email}`);
    const user = await User.findOne({ email });

    if (!user) {
      console.warn("User not found.");
      return new Response(
        JSON.stringify({ message: "Invalid email or password." }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Password validation
    console.log("Validating password...");
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      console.warn("Invalid password.");
      return new Response(
        JSON.stringify({ message: "Invalid email or password." }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // JWT generation
    console.log("Generating JWT...");
    const token = jwt.sign(
      { userId: user._id, email: user.email, displayName: user.displayName },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("JWT generated successfully:", { token });

    // Set-Cookie header
    console.log("Setting cookie...");
    const headers = new Headers();
    headers.append(
      "Set-Cookie",
      `authToken=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800` // 7 days
    );

    console.log("Returning response...");
    return new Response(
      JSON.stringify({ userId: user._id, message: "Sign in successful." }),
      {
        status: 200,
        headers,
      }
    );
  } catch (error) {
    console.error("Error during sign-in:", error);
    return new Response(
      JSON.stringify({ message: "Error signing in.", error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
