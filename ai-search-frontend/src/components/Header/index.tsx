import ResponsiveHeader from "../common/ResponsiveHeader";
import { useEffect, useState } from "react";
import { MenuItem } from "../common/ResponsiveHeader";
import { useAuth } from "../../utils/context/AuthContext";

function Header() {
  const {
    state: { isLoggedIn },
    logout,
  } = useAuth();
  const [links, setLinks] = useState<MenuItem[]>([]);

  useEffect(() => {
    if (isLoggedIn) {
      setLinks([
        { label: "My Projects", link: "/projects" },
        { label: "Logout", onClick: () => logout(), link: "/" },
      ]);
    } else {
      setLinks([])
    }
  }, [isLoggedIn, logout]);

  return <ResponsiveHeader links={links} />;
}

export default Header;
