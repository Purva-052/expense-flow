/* eslint-disable @typescript-eslint/no-explicit-any */
// src/store/auth-store.ts
import { LoginUser } from "@/features/auth/sign-in/types";
import { StorageEnum } from "@/types";
import { setItem } from "@/utils/storage";
import Cookies from "js-cookie";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthState = {
  user: LoginUser | null;
  isAuthenticated: boolean;
  login: (user: LoginUser) => void;
  logout: () => void;
  verify: any;
  token?: any;
  reverify: any;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: (user) =>
        set(() => ({
          user,
          isAuthenticated: true,
        })),
      logout: () => {
        set(() => ({
          user: null,
          isAuthenticated: false,
        }));
        setItem(StorageEnum.TOKEN, null);
        Cookies.remove("token");
      },
      verify: (data: any) =>
        set(() => ({
          isAuthenticated: false,
          token: data?.token,
        })),

      reverify: () =>
        set(() => ({
          isAuthenticated: false,
          token: "",
        })),
    }),
    {
      name: "auth-storage", // key in localStorage
    }
  )
);
