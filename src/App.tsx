import { lazy, Suspense, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Routes, Route, NavLink, Link } from "react-router-dom";

import { AuroraBackground } from "@/components/tracker/AuroraBackground";
import { Toaster } from "@/components/ui/sonner";
import { carryOverIfNeeded } from "@/lib/tracker/store";
import { cn } from "@/lib/utils";

const ArchivePage = lazy(() => import("@/pages/Archive"));
const BoardPage = lazy(() => import("@/pages/Board"));
const NotFoundPage = lazy(() => import("@/pages/NotFound"));
const TeamPage = lazy(() => import("@/pages/Team"));

const queryClient = new QueryClient();

function HeaderLink({
  to,
  children,
  end,
}: {
  to: string;
  children: React.ReactNode;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }: { isActive: boolean }) =>
        cn(
          "group relative text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
          isActive && "text-foreground",
        )
      }
    >
      {({ isActive }: { isActive: boolean }) => (
        <>
          <span>{children}</span>
          <span
            className={cn(
              "absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-gradient-to-r from-aurora-3 via-aurora-2 to-aurora-1 transition-transform duration-300 group-hover:scale-x-100",
              isActive && "scale-x-100",
            )}
          />
        </>
      )}
    </NavLink>
  );
}

function RouteLoading() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-sm text-muted-foreground">
      Loading workspace...
    </div>
  );
}

export default function App() {
  useEffect(() => {
    carryOverIfNeeded();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuroraBackground />
      <div className="relative min-h-screen">
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="sticky top-0 z-40 border-b border-white/5 glass-strong"
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <Link to="/" className="group flex items-baseline gap-2">
              <span className="relative">
                <span className="absolute -inset-2 -z-10 rounded-full bg-aurora-3/30 blur-xl opacity-0 transition-opacity group-hover:opacity-100" />
                <span className="font-serif text-2xl italic text-aurora">Founder's</span>
              </span>
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                Weekly OS
              </span>
            </Link>
            <nav className="flex items-center gap-8">
              <HeaderLink to="/" end>
                Board
              </HeaderLink>
              <HeaderLink to="/archive">Archive</HeaderLink>
              <HeaderLink to="/team">Team</HeaderLink>
            </nav>
          </div>
        </motion.header>
        <main className="relative mx-auto max-w-7xl px-6 py-10">
          <Suspense fallback={<RouteLoading />}>
            <Routes>
              <Route path="/" element={<BoardPage />} />
              <Route path="/archive" element={<ArchivePage />} />
              <Route path="/team" element={<TeamPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </main>
      </div>
      <Toaster richColors position="bottom-right" theme="dark" />
    </QueryClientProvider>
  );
}
