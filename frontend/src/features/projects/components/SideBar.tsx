import { useDisclosure } from "@/hooks/useDisclosure";
import { ArrowRightCircleIcon } from "@heroicons/react/24/outline";
import React, { useRef, useState } from "react";
import "./SideBar.css";

interface Props {
  title: string;
  children: JSX.Element;
  side: "left" | "right";
}

export function SideBar({ title, children, side }: Props) {
  const { isOpen, close: c, open: o } = useDisclosure(true);

  const MINSIZE = 100;
  const CLOSEDSIZE = null;
  const OPENSIZE = 268;

  const sidebarRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState<number | null>(200);

  const close = () => {
    setSidebarWidth(CLOSEDSIZE);
    c();
  };

  const open = () => {
    setSidebarWidth(OPENSIZE);
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

        if (newWidth < MINSIZE) {
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

  function ResizeBar() {
    const borderStyle = "1px solid #e5e5e5";
    return (
      <div
        className="app-sidebar-resizer flex flex-col justify-center hover:bg-slate-300"
        onMouseDown={startResizing}
        style={
          side === "left"
            ? { borderRight: borderStyle }
            : { borderLeft: borderStyle }
        }
      >
        {!isOpen && (
          <>
            {side === "left" ? (
              <ArrowRightCircleIcon className="w-4 text-gray-500" />
            ) : (
              <ArrowRightCircleIcon className="w-4 rotate-180 transform text-gray-500" />
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div
      ref={sidebarRef}
      className="app-sidebar"
      style={{ width: sidebarWidth || "auto" }}
      onMouseDown={(e) => e.preventDefault()}
    >
      {side === "right" && <ResizeBar />}
      {isOpen ? (
        <section className="max-w-3xl flex-1 overflow-auto bg-slate-600 pt-4 text-white">
          <div className="my-4 text-center text-lg font-semibold">{title}</div>
          {children}
        </section>
      ) : (
        <section
          className="app-sidebar-content max-w-3xl overflow-auto bg-slate-600 pt-4 text-white"
          onClick={open}
        ></section>
      )}
      {side === "left" && <ResizeBar />}
    </div>
  );
}
