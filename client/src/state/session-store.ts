import { useEffect, useState } from "react";

export type User = {
  provider: "google" | "linkedin";
  name: string;
  email: string;
};

export type SessionState = {
  user: User | null;
  signInMock: (u: User) => void;
  signOut: () => void;
};

const session: SessionState = {
  user: null,
  signInMock: (u) => {
    session.user = u;
    window.dispatchEvent(new Event("jobhaven:session"));
  },
  signOut: () => {
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

  return session;
}
