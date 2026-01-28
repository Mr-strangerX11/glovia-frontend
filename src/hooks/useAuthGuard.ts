"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useAuthStore } from "@/store/authStore";
import { User } from "@/types";

interface Options {
  roles?: User["role"][];
  redirectTo?: string;
}

export function useAuthGuard(options?: Options) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, hydrate } = useAuthStore();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      await hydrate();
      if (active) setChecked(true);
    })();
    return () => {
      active = false;
    };
  }, [hydrate]);

  useEffect(() => {
    if (!checked) return;

    const hasToken = !!Cookies.get("access_token");
    const redirectTarget = options?.redirectTo || "/auth/login";

    if (!hasToken || !isAuthenticated) {
      router.replace(redirectTarget);
      return;
    }

    if (options?.roles && user && !options.roles.includes(user.role)) {
      router.replace("/dashboard");
    }
  }, [checked, isAuthenticated, options?.roles, options?.redirectTo, router, user]);

  return {
    user,
    isChecking: isLoading || !checked,
  };
}
