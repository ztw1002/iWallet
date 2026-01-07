"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { type EmailOtpType } from "@supabase/supabase-js";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Confirming your email...");

  useEffect(() => {
    let isMounted = true;

    const confirm = async () => {
      const supabase = createClient();
      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type") as EmailOtpType | null;
      const next = searchParams.get("next") ?? "/";

      let errorMessage: string | null = null;

      if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type,
        });
        if (error) {
          errorMessage = error.message;
        }
      } else {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          errorMessage = error.message;
        } else if (!data.session) {
          errorMessage = "No session or token found";
        }
      }

      if (!isMounted) return;

      if (errorMessage) {
        router.replace(`/auth/error?error=${encodeURIComponent(errorMessage)}`);
        return;
      }

      setStatus("Confirmed. Redirecting...");
      router.replace(next);
    };

    confirm();

    return () => {
      isMounted = false;
    };
  }, [router, searchParams]);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-background dark:bg-[#000000]">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Email confirmation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{status}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
