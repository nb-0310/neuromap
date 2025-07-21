"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Moon, Sun, Loader2Icon, AlertCircleIcon, Github } from "lucide-react";
import WalkthroughModal from "@/components/Walkthrough";

type ErrorState = {
  title: string;
  description: string;
  list?: string[];
} | null;

export default function Home() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const router = useRouter();
  const [openWalkthrough, setOpenWalkthrough] = useState(false);
  const [loading, setLoading] = useState(false);
  const [repoUrl, setRepoUrl] = useState("");
  const [error, setError] = useState<ErrorState | null>(null);

  const validateUrl = async () => {
    setError(null); // clear previous error

    // frontend checks
    try {
      const url = new URL(repoUrl);
      // console.log(url.pathname);
      if (url.hostname !== "github.com") {
        setError({
          title: "Unsupported host",
          description: "Only GitHub repositories are supported at this time.",
        });
        return;
      }
      const parts = url.pathname.split("/").filter(Boolean); // removes empty ""
      if (parts.length !== 2) {
        setError({
          title: "Invalid repository URL format",
          description: "Please enter a URL like https://github.com/user/repo.",
        });
        return;
      }
    } catch {
      setError({
        title: "Invalid URL format",
        description: "Make sure to enter a valid URL starting with https://",
      });
      return;
    }

    setLoading(true);

    try {
      // call backend API
      const response = await fetch("/api/validate-repo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl }),
      });
      const data = await response.json();

      if (!response.ok) {
        // console.log(data);
        setError({
          title: data.title,
          description: data.description,
          list: data.items ?? undefined,
        });
      } else {
        setLoading(false);

        // parse owner/repo from URL
        const parts = new URL(repoUrl).pathname.split("/").filter(Boolean);
        const owner = parts[0];
        const repo = parts[1];

        // console.log (data)

        router.push(
          `/map?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(
            repo
          )}`
        );
      }
    } catch {
      setError({
        title: "Network error",
        description:
          "Couldn’t reach the server. Please check your internet connection and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    if (theme === "dark") setTheme("light");
    else setTheme("dark");
  };

  // useEffect(() => {
  //   const hasSeen = localStorage.getItem("hasSeenWalkthrough");
  //   if (!hasSeen) {
  //     setOpenWalkthrough(true);
  //     localStorage.setItem("hasSeenWalkthrough", "true");
  //   }
  // }, []);

  return (
    <div className="flex flex-col w-screen min-h-screen">
      {/* Navbar */}
      <nav className="w-full flex items-center justify-between py-4 px-16">
        <h1 className="text-2xl font-semibold tracking-tight">Neuromap</h1>
        <Button
          size="icon"
          variant="outline"
          className="cursor-pointer"
          onClick={toggleTheme}
        >
          {resolvedTheme === "dark" ? <Sun /> : <Moon />}
        </Button>
      </nav>

      {/* Main Content */}
      <div className="flex justify-center items-center flex-1">
        <section className="container w-[80%] p-2 md:pb-10 flex flex-col items-center">
          <h1 className="text-xl font-extrabold tracking-tight md:text-2xl lg:text-2xl">
            <p className="center text-center text-3xl py-1 md:text-5xl">
              Visualize Your Codebase Instantly
            </p>
            <span className="inline-block bg-gradient-to-r from-ring to-foreground bg-clip-text text-transparent text-center">
              Turn complex React projects into beautiful interactive maps
              effortlessly.
            </span>
          </h1>

          {/* <div className="flex w-full max-w-lg items-center gap-2 mt-6 relative">
            <div
              className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 min-w-0 rounded-md border bg-transparent px-3 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive w-full py-5">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <Github size={20} />
              </div>
              <Input
                type="text"
                placeholder="Enter public GitHub repository URL..."
                className="w-[70%] absolute left-7 top-0 py-5 dark:bg-input-30 border-none focus-visible:ring-0 focus-visible:border-transparent focus:border-transparent focus:outline-none"
                onChange={(e) => setRepoUrl(e.target.value)}
                value={repoUrl}
              />
            </div>
            <div className="absolute right-1 bg-background">
              <Button
                type="button"
                variant="outline"
                size="xs"
                className="cursor-pointer"
                onClick={validateUrl}
                disabled={loading}
              >
                {loading && <Loader2Icon className="animate-spin" />}
                {!loading && "Generate Map"}
              </Button>
            </div>
          </div> */}

          <div className="flex w-full max-w-lg items-center sm:gap-2 gap-0 mt-6 bg-input/30 border border-input rounded-md px-3 pr-2 py-1">
            <Github size={20} className="flex-shrink-0" />
            <Input
              type="text"
              placeholder="Enter public GitHub repository URL..."
              className="flex-grow sm:px-3 px-0 dark:bg-input-30 border-none shadow-none focus-visible:ring-0 focus-visible:border-none focus:outline-none bg-transparent"
              onChange={(e) => setRepoUrl(e.target.value)}
              value={repoUrl}
            />
            <Button
              type="button"
              variant="outline"
              size="xs"
              className="cursor-pointer"
              onClick={validateUrl}
              disabled={loading}
            >
              {loading ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                "Generate Map"
              )}
            </Button>
          </div>

          {/* Error State */}
          {error && (
            <div className="w-full max-w-lg mt-6">
              <Alert variant="destructive">
                <AlertCircleIcon className="h-4 w-4" />
                <AlertTitle>{error.title}</AlertTitle>
                <AlertDescription>
                  <p>{error.description}</p>
                  {error.list && error.list.length > 0 && (
                    <ul className="list-inside list-disc text-sm mt-2">
                      {error.list.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  )}
                </AlertDescription>
              </Alert>
            </div>
          )}
        </section>
      </div>

      <WalkthroughModal />
    </div>
  );
}
