'use client';

import React from "react";

function Button({ children, type = "button", ...props }) {
  return (
    <button
      type={type}
      className="hover:bg-lighterGreen transition-colors duration-300 ease-in-out bg-lightGreen border-2 border-solid border-black py-3 rounded-md px-10 text-black"
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
