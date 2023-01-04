import React from "react";
import {
  Burger,
  Container,
  Group,
  Header,
  Paper,
  Transition,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import { HEADER_HEIGHT, useStyles } from "./NavbarStyles";
import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
export interface MenuItem {
  label: string;
  link: string;
  onClick?: () => void;
}

interface HeaderResponsiveProps {
  links: MenuItem[];
}

export function Navbar({ links }: HeaderResponsiveProps) {
  const [opened, { toggle, close }] = useDisclosure(false);
  const [active, setActive] = useState<string | null>(null);
  const { classes, cx } = useStyles();

  const items = links.map((link) => (
    <div
      key={link.label}
      className={cx(
        classes.link
        // TODO: fix this, active is not always right
        //   , {
        //   [classes.linkActive]: active === link.label,
        // }
      )}
      onClick={(event) => {
        event.preventDefault();
        link.onClick && link.onClick();
        setActive(link.label);
        close();
      }}
    >
      {<Link to={link.link || ""}>{link.label}</Link>}
    </div>
  ));

  return (
    <Header height={HEADER_HEIGHT} className={classes.root}>
      <Container className={classes.header}>
        <Logo />

        <Group spacing={5} className={classes.links}>
          {items}
        </Group>

        <Burger
          opened={opened}
          onClick={toggle}
          className={classes.burger}
          size="sm"
        />

        <Transition transition="pop-top-right" duration={200} mounted={opened}>
          {(styles) => (
            <Paper className={classes.dropdown} withBorder style={styles}>
              {items}
            </Paper>
          )}
        </Transition>
      </Container>
    </Header>
  );
}

export default Navbar;
