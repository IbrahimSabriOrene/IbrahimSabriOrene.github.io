import { Outlet } from "react-router-dom";
import { TopBar } from "./TopBar";

export function AppLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-bg-base">
      <TopBar />
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
