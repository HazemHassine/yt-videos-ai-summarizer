"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import Button from "../../../components/Button";
import { EyeIcon, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { z } from "zod";

const signUpSchema = z
  .object({
    displayName: z
      .string()
      .min(2, "Display name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    passwordVerif: z.string(),
  })
  .refine((data) => data.password === data.passwordVerif, {
    message: "Passwords do not match",
    path: ["passwordVerif"],
  });

function SignUp() {
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    password: "",
    passwordVerif: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordVerif, setShowPasswordVerif] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignUp = async () => {
    try {
      const validatedData = signUpSchema.parse(formData);

      // Send the signup data to the backend (MongoDB)
      const response = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: validatedData.displayName,
          email: validatedData.email,
          password: validatedData.password,
        }),
      });

      // Check if the response status is OK (status code 200-299)
      if (!response.ok) {
        const errorText = await response.text(); // Read error as text if not OK
        throw new Error(`Signup failed: ${errorText}`);
      }

      const data = await response.json();
      console.log("Response data: ", data);

      if (response.status === 201) {
        // Redirect to home page upon successful signup
        localStorage.setItem("user", JSON.stringify(data.userId));
        router.push("/");
      } else {
        console.error("Error storing user data:", data);
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setFormErrors(err.flatten().fieldErrors);
      } else {
        console.error("Sign up error: ", err);
      }
    }
  };

  return (
    <div className="ml-12 flex flex-col items-center justify-center w-1/5 h-full">
      <div className="flex flex-col w-full">
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
          Create a new account
        </h1>
        <h3 className="pl-1 mt-2 text-lg">
          Already have an account? &nbsp;
          <Link href="/auth/sign-in">
            <span className="text-blue-400 underline font-bold">Sign in</span>
          </Link>
        </h3>

        {/* Input Fields */}
        <div>
          <div className="mb-6">
            <label
              htmlFor="displayName"
              className="mt-3 block mb-2 text-sm font-medium text-black"
            >
              Display Name
            </label>
            <input
              type="text"
              id="displayName"
              name="displayName"
              value={formData.displayName}
              onChange={handleInputChange}
              className="border-2 py-3 border-black text-black text-sm rounded-md focus:ring-orange-400 focus:border-orange-400 block w-full p-2.5 placeholder-gray-400"
              placeholder="Enter your name"
              required
            />
            {formErrors.displayName && (
              <p className="text-red-500 text-sm mt-1">
                {formErrors.displayName}
              </p>
            )}
          </div>

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
              value={formData.email}
              onChange={handleInputChange}
              className="border-2 py-3 border-black text-black text-sm rounded-md focus:ring-orange-400 focus:border-orange-400 block w-full p-2.5 placeholder-gray-400"
              placeholder="john.doe@company.com"
              required
            />
            {formErrors.email && (
              <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
            )}
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="mt-3 block mb-2 text-sm font-medium text-black"
            >
              Password
            </label>
            <div className="flex relative items-center">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="border-2 py-3 border-black text-black text-sm rounded-md focus:ring-orange-400 focus:border-orange-400 block w-full p-2.5 placeholder-gray-400"
                placeholder="Enter your password"
                required
              />
              {!showPassword ? (
                <EyeOff
                  className="absolute right-4 cursor-pointer"
                  size={25}
                  color="#000000"
                  onClick={() => setShowPassword(!showPassword)}
                />
              ) : (
                <EyeIcon
                  className="absolute right-4 cursor-pointer"
                  size={25}
                  color="#000000"
                  onClick={() => setShowPassword(!showPassword)}
                />
              )}
            </div>
            {formErrors.password && (
              <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>
            )}
          </div>

          <div className="mb-6">
            <label
              htmlFor="passwordVerif"
              className="mt-3 block mb-2 text-sm font-medium text-black"
            >
              Repeat Password
            </label>
            <div className="flex relative items-center">
              <input
                type={showPasswordVerif ? "text" : "password"}
                id="passwordVerif"
                name="passwordVerif"
                value={formData.passwordVerif}
                onChange={handleInputChange}
                className="border-2 py-3 border-black text-black text-sm rounded-md focus:ring-orange-400 focus:border-orange-400 block w-full p-2.5 placeholder-gray-400"
                placeholder="Enter your password again"
                required
              />
              {!showPasswordVerif ? (
                <EyeOff
                  className="absolute right-4 cursor-pointer"
                  size={25}
                  color="#000000"
                  onClick={() => setShowPasswordVerif(!showPasswordVerif)}
                />
              ) : (
                <EyeIcon
                  className="absolute right-4 cursor-pointer"
                  size={25}
                  color="#000000"
                  onClick={() => setShowPasswordVerif(!showPasswordVerif)}
                />
              )}
            </div>
            {formErrors.passwordVerif && (
              <p className="text-red-500 text-sm mt-1">
                {formErrors.passwordVerif}
              </p>
            )}
          </div>

          <div className="mt-5 flex items-end justify-end pl-4">
            <Button type="button" onClick={handleSignUp}>
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
