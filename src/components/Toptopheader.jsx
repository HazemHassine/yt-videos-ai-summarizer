import Link from "next/link";
import React from "react";

const Toptopheader = () => (
  <div className="sticky top-0 py-1 w-full bg-[#404040] text-white items-center justify-center flex">
    <p>Website created by Mohamed Hazem Hassine. view on &nbsp;</p>
    <Link className="text-white underline" href="www.github.com">
      Github
    </Link>
  </div>
);

export default Toptopheader;
