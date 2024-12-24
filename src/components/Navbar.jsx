import Image from "next/image";
import React, { useEffect, useState } from "react";
import Button from "./Button";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Dropdown from "./Dropdown";

function getFirstTwoLetters(str) {
  const match = (str ?? "").match(/[A-Za-z]/g);
  return match ? match.slice(0, 2).join("") : "XX";
}

function getPastelColorByName(name) {
  if (!name) {
    return "bg-pink-200";
  }
  const pastelColors = [
    "bg-pink-200",
    "bg-purple-200",
    "bg-blue-200",
    "bg-green-200",
    "bg-yellow-200",
    "bg-orange-200",
    "bg-red-200",
    "bg-indigo-200",
    "bg-teal-200",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % pastelColors.length;
  return pastelColors[index];
}

function Navbar({ initialUser }) {
  const [user, setUser] = useState(null);
  const [current, setCurrent] = useState(null);
  const router = useRouter();
  const pathname = usePathname();
  const containsSummarize = pathname.includes("summarize");
  const containsLibrary = pathname.includes("library");
  const containsAccount = pathname.includes("account");

  useEffect(() => {
    setUser(initialUser);
    if (containsSummarize) {
      setCurrent("Summarize");
    } else if (containsLibrary) {
      setCurrent("Library");
    } else if (containsAccount) {
      setCurrent("Account");
    }
  }, [initialUser]);


  const handleSignOut = async () => {
    // Call an API route to clear the cookie
    await fetch("/api/auth/sign-out", { method: "POST" });
    setUser(null);
    router.push("/");
  };

  const dropdownItems = [
    { label: "Account", href: "/account" },
    { label: "Library", href: "/library" },
    { label: "Sign Out", href: "#", onClick: handleSignOut },
  ];

  return (
    <nav className="sticky top-0 z-50 drop-shadow-lg bg-red-500">
      <div className="px-16 py-2 flex justify-between items-center bg-white border-b-2 border-black">
        <Link href="/">
          <Image
            src="/Logo_full.png"
            height={79}
            width={282}
            alt="Logo"
            placeholder="empty"
          />
        </Link>
        {current && <h1 className="text-3xl font-bold">{current}</h1>}
        {!user && (
          <div className="flex gap-5 items-center">
            <Link href="/auth/sign-in">
              <div className="underline text-black hover:font-bold transition-all duration-200 ease-in-out px-2 flex items-center justify-center w-20">
                Sign in
              </div>
            </Link>
            <Button>Try free</Button>
          </div>
        )}
        {user && (
          <div className="flex gap-5 items-center">
            {!containsLibrary && (
              <Link href="/library">
                <div className="underline">Library</div>
              </Link>
            )}
            {!containsSummarize && (
              <Link href="/summarize">
                <Button>Summarize</Button>
              </Link>
            )}
            <Dropdown items={dropdownItems}>
              <div
                className={`${getPastelColorByName(
                  user.displayName
                )} rounded-full w-14 h-14 flex items-center text-xl justify-center border-2 border-solid border-black hover:saturate-150 saturate-100 ease-in-out duration-200 transition-all cursor-pointer`}
              >
                {getFirstTwoLetters(user.displayName).toUpperCase()}
              </div>
            </Dropdown>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;