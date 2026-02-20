import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type User = {
  provider: "google" | "linkedin";
  name: string;
  email: string;
  linkedin?: string;
};

export type SessionState = {
  user: User | null;
  signInWithProvider: (provider: "google" | "linkedin") => Promise<void>;
  signOut: () => void;
};

const session: SessionState = {
  user: null,
  signInWithProvider: async (provider) => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    });
  },
  signOut: async () => {
    await supabase.auth.signOut();
    session.user = null;
    window.dispatchEvent(new Event("jobhaven:session"));
  },
};

export function useSessionStore(): SessionState {
  const [, setTick] = useState(0);

  useEffect(() => {
    const on = () => setTick((t) => t + 1);
    window.addEventListener("jobhaven:session", on);
    return () => window.removeEventListener("jobhaven:session", on);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      if (user) {
        session.user = {
          provider: (user.app_metadata?.provider as "google" | "linkedin") || "google",
          name: user.user_metadata?.full_name || user.email || "Candidate",
          email: user.email || "",
          linkedin: user.user_metadata?.profile || user.user_metadata?.linkedin || "",
        };
      } else {
        session.user = null;
      }
      setTick((t) => t + 1);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      const user = currentSession?.user;
      if (user) {
        session.user = {
          provider: (user.app_metadata?.provider as "google" | "linkedin") || "google",
          name: user.user_metadata?.full_name || user.email || "Candidate",
          email: user.email || "",
          linkedin: user.user_metadata?.profile || user.user_metadata?.linkedin || "",
        };
      } else {
        session.user = null;
      }
      window.dispatchEvent(new Event("jobhaven:session"));
    });

    return () => {
      subscription?.subscription?.unsubscribe();
    };
  }, []);

  return session;
}
