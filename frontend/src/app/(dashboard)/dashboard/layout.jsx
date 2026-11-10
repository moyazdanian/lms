// "use client";
// import React, { useEffect, useState } from "react";
// import { DashboardSidebar } from "./DashboardSidebar";
// import { DashboardHeader } from "./DashboardHeader";
// import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
// import { usePathname } from "next/navigation";
// import { useUser } from "@/hooks/useUser";
// import Loading from "../../loading";
// import { ErrorState } from "@/components/common/ErrorState";
// import "../../globals.css";
// import Providers from "@/app/Providers";
// import { ThemeProvider } from "@/components/ui/ThemeProvider";

// export default function DashboardLayout({
//   sidebarCollapsed = false,
//   children,
// }) {
//   const { data: user, isPending, error } = useUser();
//   

//   const pathname = usePathname();
//   const [collapsed, setCollapsed] = useState(sidebarCollapsed);
//   const [mobileNavOpen, setMobileNavOpen] = useState(false);

//   useEffect(() => setCollapsed(sidebarCollapsed), [sidebarCollapsed]);

//   if (isPending) {
//     return (
//       <html lang="en">
//         <body>
//           <Loading />
//         </body>
//       </html>
//     );
//   }

//   if (error) {
//     return (
//       <html lang="en">
//         <body>
//           <ErrorState message="Failed to load user data. Please try again later." />
//         </body>
//       </html>
//     );
//   }

//   if (!user) {
//     return (
//       <html lang="en">
//         <body>
//           <ErrorState message="User not found. Please log in." />
//         </body>
//       </html>
//     );
//   }

//   return (
//     <html lang="en" suppressHydrationWarning>
//       <body
//         className={`${geistSans.variable} ${geistMono.variable} antialiased dark:bg-neutral-800`}
//       >
//         <div className="flex min-h-screen w-full bg-muted/40">
//           <Providers>
//             <ThemeProvider
//               attribute="class"
//               defaultTheme="dark"
//               forcedTheme="dark"
//               disableTransitionOnChange
//             >
//               <DashboardSidebar
//                 role={user.role}
//                 pathname={pathname}
//                 collapsed={collapsed}
//                 onToggleCollapsed={() => setCollapsed((value) => !value)}
//               />

//               <div className="flex min-w-0 flex-1 flex-col">
//                 <DashboardHeader
//                   mobileNavOpen={mobileNavOpen}
//                   onMobileNavOpenChange={setMobileNavOpen}
//                 />

//                 <main
//                   id="main"
//                   className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8"
//                 >
//                   <div className="mx-auto w-full max-w-[1400px]">
//                     <ProtectedRoute>{children}</ProtectedRoute>
//                   </div>
//                 </main>
//               </div>
//             </ThemeProvider>
//           </Providers>
//         </div>
//       </body>
//     </html>
//   );
// }

import "../../globals.css";
import Providers from "@/app/Providers";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import DashboardShell from "./DashboardShell";
import { TooltipProvider } from "@/components/ui/tooltip";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "sonner";
import { getSettingsSafe } from "@/lib/api/settings";

export async function generateMetadata() {
  const settings = await getSettingsSafe();
  const siteName = settings?.settings?.site_name || "LMS";

  return {
    // Same "Site name - Page" pattern as the storefront.
    title: {
      template: `${siteName} - %s`,
      default: `${siteName} - Dashboard`,
    },
    ...(settings?.settings?.faveicon
      ? { icons: { icon: settings.settings.faveicon } }
      : {}),
  };
}

export default function DashboardLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Toaster richColors position="top-right" />
        <NextTopLoader
          color="linear-gradient(to right, rgb(251, 113, 133), rgb(217, 70, 239), rgb(99, 102, 241))"
          speed={800}
          showSpinner={false}
          crawlSpeed={800}
          height={5}
        />
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            forcedTheme="dark"
            disableTransitionOnChange
          >
            <TooltipProvider>
              <DashboardShell>{children}</DashboardShell>
            </TooltipProvider>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
