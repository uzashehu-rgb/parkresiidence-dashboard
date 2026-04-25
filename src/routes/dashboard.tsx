import { Outlet, createFileRoute } from "@tanstack/react-router";

import { DashboardProvider } from "@/components/dashboard/dashboard-shell";
import { siteConfig } from "@/lib/site";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: `Dashboard - ${siteConfig.name}` },
      {
        name: "description",
        content: `Dashboard lokal per menaxhim te ${siteConfig.name}.`,
      },
    ],
  }),
  component: DashboardLayout,
});

function DashboardLayout() {
  return (
    <DashboardProvider>
      <Outlet />
    </DashboardProvider>
  );
}
