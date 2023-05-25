import { clsx } from "@mantine/core";
import React, { useRef, useState } from "react";
import "./SideBar.css";

interface Props {
  title: string;
  children: JSX.Element;
  side: "left" | "right";
  className?: string;
  onClose: () => void;
  initialSize?: number;
}

export function SideBar({
  title,
  children,
  side,
  className,
  onClose,
  initialSize,
}: Props) {
  const MINSIZE = 20;
  const OPENSIZE = 268;

  const sidebarRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState<number | null>(
    OPENSIZE ?? initialSize
  );

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
          onClose();
        } else {
          setSidebarWidth(newWidth);
        }
      }
    },
    [isResizing, onClose, side]
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
      ></div>
    );
  }

  return (
    <div
      ref={sidebarRef}
      className="app-sidebar"
      style={{ width: sidebarWidth || "auto" }}
    >
      {side === "right" && <ResizeBar />}
      <section
        className={clsx("max-w-3xl flex-1 overflow-auto px-4 pt-4", className)}
      >
        <div className="my-4 text-xl font-semibold">{title}</div>
        {children}
      </section>
      {side === "left" && <ResizeBar />}
    </div>
  );
}
