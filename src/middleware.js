import { NextResponse } from "next/server";
import { jwtVerify } from "jose"; // For verifying the JWT token
import { cookies } from "next/headers"; // Next.js 13+ cookies API

export async function middleware(req) {
  const url = new URL(req.url); // Parse the request URL
  const path = url.pathname; // Extract the request path

  console.log("Request path:", path);

  // Allow public API routes and authentication routes
  if (
    path.startsWith("/api/auth") ||
    path.startsWith("/api/public") ||
    path.startsWith("/shared") ||
    path.startsWith("/api/shared") ||
    path.startsWith("/unauthorized")
  ) {
    console.log("Bypassing auth middleware for:", path);
    return NextResponse.next(); // Allow the request to proceed
  }
  else {
    console.log("Not bypassing auth middleware for:", path);
    if (path.startsWith("/api/transcriptToArticle")){
      console.log("recieving request from transcriptToArticle");
    }
  };
  // Access cookies using Next.js API
  const cookieStore = await cookies(); // New Next.js 13 API
  const authToken = cookieStore.get("authToken")?.value; // Get the 'authToken' cookie

  if (!authToken) {
    console.log("No authToken found, redirecting to /unauthorized");
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  try {
    // Decode and verify the JWT
    const secret = new TextEncoder().encode(process.env.JWT_SECRET); // Use your secret key from .env
    const { payload } = await jwtVerify(authToken, secret); // Verify the JWT token

    // Check if the payload contains necessary user information
    if (!payload?.email) {
      console.log("Token payload is invalid, redirecting to /unauthorized");
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // Optionally add user information to request headers for downstream use
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-email", payload.email);

    console.log("Middleware: Authentication successful for:", path);

    // Allow the request to proceed, with modified headers if needed
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error("Error verifying token:", error);
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }
}

// Configuring which routes the middleware applies to
export const config = {
  matcher: [
    // Exclude API routes like auth or public, and apply middleware to secure paths
    "/api/((?!auth|public|shared).*)", // Match all API routes except /api/auth and /api/public
    "/library",                 // Apply middleware to this route
    "/summarize",               // Apply middleware to this route
    "/account",                 // Apply middleware to this route
  ],
};