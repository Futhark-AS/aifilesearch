import ResponsiveHeader from "../common/ResponsiveHeader";

function Header() {
  return (
    <ResponsiveHeader
      links={[
        { label: "My Projects", link: "/projects" },
      ]}
    />
  );
}

export default Header;
