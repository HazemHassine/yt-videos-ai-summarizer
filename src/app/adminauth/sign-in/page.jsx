"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import Button from "../../../components/Button";
import { useRouter } from "next/navigation";

function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignIn = async () => {
    try {
      setError(""); // Reset error message
      console.log("Attempting to sign in with email:", email);

      // Send request to the API
      const res = await fetch("/api/adminauth/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const { message } = await res.json();
        setError(message || "Error signing in. Please try again.");
        return;
      }

      const data = await res.json();
      console.log("User signed in successfully:", data);

      // Save user info to local storage (optional)
      localStorage.setItem("user", JSON.stringify(data));

      // Redirect to home page
      router.push("/");
    } catch (error) {
      console.error("Error signing in user:", error);
      setError("An unexpected error occurred. Please try again later.");
    }
  };

  return (
    <div className="ml-12 flex flex-col items-center justify-center w-1/5 h-full">
      <div className="flex flex-col w-full bg-white">
        <Link href="/" className="cursor-default">
          <Image
            src="/Logo_full.png"
            height={79}
            width={282}
            alt="Logo"
            placeholder="empty"
            className="self-center cursor-pointer"
          />
        </Link>
        <h1 className="pl-1 mt-3 text-lightGreen text-3xl">
          Log in to your account
        </h1>
        <h3 className="pl-1 mt-2 text-lg">
          <span>Don{"'"}t have an account? </span>
          <Link href="/adminauth/sign-up">
            <span className="text-blue-400 underline font-bold">Sign up</span>
          </Link>
        </h3>
        <div className="mt-5 flex flex-col items-center justify-center">
          <p className="bg-white z-20 px-2">Or with email and password</p>
          <div className="h-[2px] w-1/6 bg-gradient-to-r from-[rgba(0,0,0,0.5)] via-[rgba(0,0,0,1)] to-[rgba(0,0,0,0.5)] absolute"></div>
        </div>
        {error && <p className="text-red-500 mt-2">{error}</p>}
        <form>
          <div className="mb-6">
            <label
              htmlFor="email"
              className="mt-3 block mb-2 text-sm font-medium text-black"
            >
              Email address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              onChange={(e) => setEmail(e.target.value)}
              className="border-2 py-3 border-black text-black text-sm rounded-md focus:ring-orange-400 focus:border-orange-400 block w-full p-2.5 placeholder-gray-400"
              placeholder="john.doe@company.com"
              required
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="mt-3 block mb-2 text-sm font-medium text-black"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              onChange={(e) => setPassword(e.target.value)}
              className="border-2 py-3 border-black text-black text-sm rounded-md focus:ring-orange-400 focus:border-orange-400 block w-full p-2.5 placeholder-gray-400"
              placeholder="Enter your password"
              required
            />
            <div className="mt-5 flex flex-row-reverse justify-between pl-4">
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  handleSignIn();
                }}
              >
                Sign In
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignInForm;
