import "./layout.css";

export default function Layout({ children }) {
  return (
    <div className="layout-wrapper">
      <div className="layout-grid">
        {children}
      </div>
    </div>
  );
}
