import type { ReactNode } from "react";
import "./layout.css";

interface Props {
  children: ReactNode;
}

export default function Layout({ children }: Props) {
  return (
    <div className="layout-wrapper">
      <div className="layout-grid">
        {children}
      </div>
    </div>
  );
}
