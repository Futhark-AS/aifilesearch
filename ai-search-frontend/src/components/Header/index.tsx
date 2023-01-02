import useUser from "../../utils/hooks/useUser";
import ResponsiveHeader from "../common/ResponsiveHeader";
import { useEffect, useState } from "react";
import { MenuItem } from "../common/ResponsiveHeader";

function Header() {
  const { user, logout } = useUser();
  const [links, setLinks] = useState<MenuItem[]>([]);

  useEffect(() => {
    if (user) {
      setLinks([
        { label: "My Projects", link: "/projects" },
        { label: "Logout", onClick: logout },
      ]);
    }
  }, [user]);

  return <ResponsiveHeader links={links} />;
}

export default Header;
