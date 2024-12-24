import { useEffect, useState } from "react";
import Navbar from "./Navbar";

export default function NavbarWrapper() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log("fetching user jwt or something");
        const response = await fetch("/api/auth/user");

        if (response.ok) {
          response.json().then((data) => {  
            console.log(data);
            setUser(data);
          });
        } else {
          console.log("User not authenticated");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUser();
  }, []);
  return <Navbar initialUser={user} />;
}
