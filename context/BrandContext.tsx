"use client";

import { setCookie } from "nookies";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

type Brand = "litto" | "skwezed";

interface BrandContextType {
  brand: Brand;
  setBrand: (brand: Brand) => void;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export function BrandProvider({ children }: { children: ReactNode }) {
  const [brand, setBrandState] = useState<Brand>("litto"); // ✅ renamed
  const router = useRouter();

  const setBrand = (newBrand: Brand) => {
    setBrandState(newBrand);
    localStorage.setItem("brand", newBrand);
    setCookie(null, "selected_brand", newBrand, { path: "/" });
    document.cookie = `selected_brand=${newBrand}; path=/`;

    // Refresh to fetch data base on ENV
    router.refresh();
  };

  useEffect(() => {
    const stored = localStorage.getItem("brand") as Brand | null;
    if (stored) setBrandState(stored); // ✅ use the setter
  }, []);

  return (
    <BrandContext.Provider value={{ brand, setBrand }}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  const context = useContext(BrandContext);
  if (!context) {
    throw new Error("useBrand must be used inside a BrandProvider");
  }
  return context;
}
