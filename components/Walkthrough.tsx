"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Info,
  Code2,
  ShieldAlert,
  Eye,
  Github,
  Lightbulb,
  Folders,
  FileMinus,
  GaugeCircle,
  Zap,
  Database,
} from "lucide-react";

export default function WalkthroughModal() {
  const [step, setStep] = useState(1);
  const [open, setOpen] = useState(true);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold">
            {step === 1 && "Welcome to Neuromap!"}
            {step === 2 && "Valid GitHub Repo Requirements"}
            {step === 3 && "Rate Limiting (and Why)"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {step === 1 && "Quick tour to get you started 🚀"}
            {step === 2 && "Make sure your repo meets these requirements"}
            {step === 3 &&
              "Understand why rate limiting exists and how to bypass it locally"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-muted p-3">
                  <Eye className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-lg font-medium">
                    Visualize your React app
                  </p>
                  <p className="text-muted-foreground">
                    Understand file dependencies instantly when onboarding or
                    revisiting a project.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-muted p-3">
                  <Github className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-lg font-medium">
                    Side project, open source
                  </p>
                  <p className="text-muted-foreground">
                    It’s fun, not production-level yet. Feel free to contribute
                    or request features!
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-muted p-3">
                  <Lightbulb className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-lg font-medium">Keep these tips in mind</p>
                  <p className="text-muted-foreground">
                    Some limitations apply. Let’s check them in the next steps.
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-muted p-3">
                  <Code2 className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-lg font-medium">
                    Repo must be public & vanilla React
                  </p>
                  <p className="text-muted-foreground">
                    No Next.js, Gatsby, Remix etc. CRA & Vite are okay. Pure
                    React only. See unsupported frameworks (link).
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-muted p-3">
                  <Folders className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-lg font-medium">Simple repo structure</p>
                  <p className="text-muted-foreground">
                    No monorepos or folders like /frontend, /backend. The repo
                    root itself must be a React app.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-muted p-3">
                  <FileMinus className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-lg font-medium">
                    File limit: max 55 files
                  </p>
                  <p className="text-muted-foreground">
                    Max 55 `.js`, `.jsx`, `.ts`, `.tsx` files. Avoid pushing
                    node_modules.
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-muted p-3">
                  <GaugeCircle className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-lg font-medium">
                    Rate limit: 1 map/day per IP
                  </p>
                  <p className="text-muted-foreground">
                    Using GitHub’s API (5000 calls/hour per IP). Each file
                    triggers an API call.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-muted p-3">
                  <Zap className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-lg font-medium">Want unlimited use?</p>
                  <p className="text-muted-foreground">
                    Clone the repo → switch to <code>nm__no_rate_limit</code> →
                    add your GitHub token → run locally. (see README for
                    details)
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-muted p-3">
                  <Database className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-lg font-medium">
                    Redis - Saviour to Testers
                  </p>
                  <p className="text-muted-foreground">
                    If you call the same repo again within an hour, it
                    won&apos;t make extra API calls — the data comes from cache.
                    Works on local; on the Vercel host it may differ.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <DialogClose asChild>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="cursor-pointer"
            >
              Skip
            </Button>
          </DialogClose>
          <div className="flex gap-2">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="cursor-pointer"
              >
                Back
              </Button>
            )}
            {step < 3 ? (
              <Button
                onClick={() => setStep(step + 1)}
                className="cursor-pointer"
              >
                Next
              </Button>
            ) : (
              <DialogClose asChild>
                <Button
                  onClick={() => setOpen(false)}
                  className="cursor-pointer"
                >
                  Finish
                </Button>
              </DialogClose>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
