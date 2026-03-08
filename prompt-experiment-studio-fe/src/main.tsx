import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import SidebarContainer from "./components/sidebar/index.tsx";
import { SidebarProvider } from "./components/ui/sidebar.tsx";
import { Toaster } from "sonner";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SidebarProvider>
      <SidebarContainer />
      <App />
      <Toaster />
    </SidebarProvider>
  </StrictMode>,
);
