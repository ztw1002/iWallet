import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { AlertTriangle, ExternalLink } from "lucide-react";
import Link from "next/link";

export function EnvVarWarning() {
  return (
    <Alert className="border-amber-200 bg-amber-50">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800">需要配置 Supabase</AlertTitle>
      <AlertDescription className="text-amber-700">
        <div className="mt-2 space-y-2">
          <p>
            请创建 <code className="rounded bg-amber-100 px-1 py-0.5 text-xs">.env.local</code> 文件并配置以下环境变量：
          </p>
          <div className="space-y-1 text-sm">
            <code className="block rounded bg-amber-100 px-2 py-1">
              NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
            </code>
            <code className="block rounded bg-amber-100 px-2 py-1">
              NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your_supabase_anon_key
            </code>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Button size="sm" variant="outline" asChild>
              <Link href="/SUPABASE_SETUP.md" target="_blank">
                <ExternalLink className="mr-2 h-3 w-3" />
                查看设置指南
              </Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-3 w-3" />
                Supabase 仪表板
              </a>
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
