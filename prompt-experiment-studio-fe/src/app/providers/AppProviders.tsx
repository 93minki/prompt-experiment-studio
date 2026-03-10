import { SidebarProvider } from "@/shared/ui/sidebar";
import { Toaster } from "sonner";

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      {children}
      <Toaster />
    </SidebarProvider>
  );
};
