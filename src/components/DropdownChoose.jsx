"use client";

import { Check } from "lucide-react";
import React, { useState, useRef } from "react";

export default function DropdownChoose({ children, items, setChoice, current, changedLLM }) {
  const [isOpen, setIsOpen] = useState(false);
  const choose = (item) => {
    setChoice(item);
  };

  return (
    <div className="">
      {isOpen && (
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="absolute z-[99] right-0 mt-2 w-screen min-h-screen h-full inset-0 top-0"
        ></div>
      )}
      <div onClick={() => setIsOpen(!isOpen)}>{children}</div>
      {isOpen && (
        <div className="absolute z-[100] translate-x-[calc(-25vw)] right-0 mt-2 w-fit rounded-sm shadow-lg bg-white border-2 border-solid border-black mb-20">
          <div className="flex flex-col" role="menu">
            {items.map((item, index) => (
              <li key={index} className="list-none">
                <p
                  className={`text-black ${
                    index !== items.length - 1 ? "border-b-2" : ""
                  } ${item === current ? "bg-black hover:bg-gray-700 text-white font-bold": "text-black hover:bg-slate-200 bg-white"} px-3 py-2 border-solid border-black transition-all duration-75 ease-linear flex justify-between`}
                  onClick={() => {
                    setIsOpen(false);
                    changedLLM(true);
                    choose(item);
                  }}
                >
                  {item}{item === current && <span><Check/></span>}
                </p>
              </li>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
