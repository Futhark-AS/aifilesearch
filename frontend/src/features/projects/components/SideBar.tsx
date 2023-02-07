import { useDisclosure } from "@/hooks/useDisclosure";
import { ArrowRightCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import React, { useRef, useState } from "react";
import "./SideBar.css";

interface Props {
  title: string;
  children: JSX.Element;
  side: "left" | "right";
}

export function SideBar({ title, children, side }: Props) {
  const { isOpen, toggle, close: c, open: o } = useDisclosure(true);

  const minSize = 100;
  const closedSize = 0;
  const openSize = 268;

  const sidebarRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(268);

  const close = () => {
    setSidebarWidth(closedSize);
    c();
  };

  const open = () => {
    setSidebarWidth(openSize);
    o();
  };

  const startResizing = React.useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResizing = React.useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = React.useCallback(
    (mouseMoveEvent: MouseEvent) => {
      if (isResizing && sidebarRef.current) {
        const newWidth =
          side === "left"
            ? mouseMoveEvent.clientX -
              sidebarRef.current.getBoundingClientRect().left
            : sidebarRef.current.getBoundingClientRect().right -
              mouseMoveEvent.clientX;

        if (newWidth < minSize) {
          close();
        } else {
          open();
          setSidebarWidth(newWidth);
        }
      }
    },
    [isResizing]
  );

  React.useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  return (
    <div className="app-container">
      <div
        ref={sidebarRef}
        className="app-sidebar"
        style={{ width: sidebarWidth }}
        onMouseDown={(e) => e.preventDefault()}
      >
        {side === "right" && (
          <div className="app-sidebar-resizer" onMouseDown={startResizing} onClick={() => !isOpen && open()}/>
        )}
        {isOpen ? (
          <section className="app-sidebar-content max-w-3xl overflow-auto bg-slate-600 pt-4 text-white">
            <div className="flex h-16 items-center justify-between px-4">
              <div className="mr-4">{title}</div>
            </div>
            {children}
          </section>
        ) : (
          <section
            className="app-sidebar-content w-4 max-w-3xl overflow-auto bg-slate-600 pt-4 text-white"
            onClick={open}
          ></section>
        )}
        {side === "left" && (
          <div className="app-sidebar-resizer" onMouseDown={startResizing} onClick={() => !isOpen && open()} />
        )}
      </div>
    </div>
  );
}
