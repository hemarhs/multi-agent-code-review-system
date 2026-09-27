import Navbar from "./Navbar";
import { Ambient } from "./ui";

export default function AppShell({ children }) {
  return (
    <div className="shell">
      <Ambient />
      <Navbar />
      <main className="shell__main">{children}</main>
    </div>
  );
}
