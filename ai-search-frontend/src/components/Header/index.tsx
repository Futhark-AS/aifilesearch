import ResponsiveHeader from "../common/ResponsiveHeader";
import { useEffect, useState } from "react";
import { MenuItem } from "../common/ResponsiveHeader";
import { useSelector } from "react-redux";
import { logout, selectUserIsLoggedIn } from "../../redux/slices/userSlice";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";

function Header() {
  const isAuthenticated = useAppSelector((state) =>
    selectUserIsLoggedIn(state)
  );
  const [links, setLinks] = useState<MenuItem[]>([]);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (isAuthenticated) {
      setLinks([
        { label: "My Projects", link: "/projects" },
        {
          label: "Logout",
          onClick: () => {
            console.log("dispatching logout");
            dispatch(logout());
          },
          link: "/",
        },
      ]);
    } else {
      setLinks([]);
    }
  }, [isAuthenticated, dispatch, logout]);

  return <ResponsiveHeader links={links} />;
}

export default Header;
