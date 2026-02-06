import { useEffect, useState } from "react";

export type User = {
  provider: "google" | "linkedin";
  name: string;
  email: string;
  linkedin?: string;
};

export type SessionState = {
  user: User | null;
  users: User[];
  signInMock: (u: User) => void;
  signOut: () => void;
};

function loadUsers(): User[] {
  try {
    const raw = window.localStorage.getItem("jobhaven-users");
    if (!raw) return [];
    return JSON.parse(raw) as User[];
  } catch {
    return [];
  }
}

function persistUsers(users: User[]) {
  window.localStorage.setItem("jobhaven-users", JSON.stringify(users));
}

const session: SessionState = {
  user: null,
  users: [],
  signInMock: (u) => {
    session.user = u;
    if (!session.users.length) {
      session.users = loadUsers();
    }
    if (!session.users.find((existing) => existing.email === u.email)) {
      session.users = [...session.users, u];
      persistUsers(session.users);
    }
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

  useEffect(() => {
    if (!session.users.length) {
      session.users = loadUsers();
      setTick((t) => t + 1);
    }
  }, []);

  return session;
}
