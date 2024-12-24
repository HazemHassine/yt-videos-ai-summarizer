'use client'
import "../app/globals.css";
import NavbarWrapper from "./NavbarWrapper";
import Toptopheader from "./Toptopheader";

export default function HomeLayout({ children }) {
  return (
    <>
      <Toptopheader />
      <div className="absolute -z-10 inset-0 h-full w-full bg-white bg-[linear-gradient(to_right,#80808032_1px,transparent_1px),linear-gradient(to_bottom,#80808032_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <NavbarWrapper />
      {children}
    </>
  );
}
