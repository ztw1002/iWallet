import TopNav from "@/components/top-nav"
import { EnvVarWarning } from "@/components/env-var-warning"
import { hasEnvVars } from "@/lib/utils"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-[100dvh] bg-gradient-to-b from-rose-50 via-fuchsia-50 to-amber-50">
      <div className="mx-auto max-w-6xl px-4 pb-16">
        <TopNav />
        
        {/* 环境变量警告 */}
        {!hasEnvVars && (
          <div className="mt-6">
            <EnvVarWarning />
          </div>
        )}
        
        {children}
      </div>
    </main>
  );
}
