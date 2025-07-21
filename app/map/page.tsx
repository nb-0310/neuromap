"use client";

import { useEffect, useState } from "react";

import { Loader2Icon } from "lucide-react";

import "@xyflow/react/dist/style.css";
import { Sidebar } from "@/components/Sidebar";
import MapClient from "@/components/MapClient";

export default function MapPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [loadingCount, setLoadingCount] = useState(0);

  const incLoadingCount = () => {
    setLoadingCount((prev) => prev + 1);
  };

  useEffect(() => {
    console.log("Loading Count: ", loadingCount);
  }, [loadingCount]);

  if (!mounted) return null;

  return (
    <div className="flex w-screen min-h-screen h-screen items-center pl-2">
      {loadingCount < 2 && (
        <div className="absolute inset-0 z-50 flex justify-center items-center bg-white/80">
          <Loader2Icon className="animate-spin" />
        </div>
      )}
      <Sidebar incLoadingCount={incLoadingCount} />
      <MapClient incLoadingCount={incLoadingCount} />
    </div>
  );
}
