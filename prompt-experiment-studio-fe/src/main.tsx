import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import App from "./App.tsx";
import { SidebarProvider } from "./components/ui/sidebar.tsx";
import "./index.css";
import { SidebarWidget } from "./widgets/sidebar/index.ts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SidebarProvider>
      <SidebarWidget />
      <App />
      <Toaster />
    </SidebarProvider>
  </StrictMode>,
);
