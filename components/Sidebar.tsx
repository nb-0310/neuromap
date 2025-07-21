"use client"

import { useState, useEffect } from "react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@radix-ui/react-collapsible";

import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";

import { Button } from "./ui/button";
import {
  ArrowLeft,
  Folder,
  ChevronDown,
  ChevronRight,
  FileText,
  Sun,
  Moon,
} from "lucide-react";

import type { GitHubRepo } from "@/lib/github";

type Props = {
  incLoadingCount: () => void;
};

export const Sidebar = ({ incLoadingCount }: Props) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");

  const [repoDetails, setRepoDetails] = useState<GitHubRepo | null>(null);
  const [fileTree, setFileTree] = useState<TreeNode[]>([]);

  const toggleTheme = () => {
    if (resolvedTheme === "dark") setTheme("light");
    else setTheme("dark");
  };

  useEffect(() => {
    async function fetchRepo() {
      if (!owner || !repo) return;
      try {
        // Fetch repo metadata
        const res = await fetch(
          `https://api.github.com/repos/${owner}/${repo}`
        );
        const data = await res.json();
        setRepoDetails(data);

        console.log(data);

        // Fetch file tree from default branch
        const treeRes = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/git/trees/${data.default_branch}?recursive=1`
        );
        const treeData = await treeRes.json();

        // Convert flat list to nested
        const nested = buildNestedTree(treeData.tree);
        setFileTree(nested);

        incLoadingCount();
      } catch { 
        incLoadingCount();
      } finally {
        incLoadingCount();
      }
    }
    fetchRepo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [owner, repo]);

  if (!mounted) return null;

  if (!repoDetails) return <div>Repo not found</div>;

  return (
    <aside className="w-64 h-[95%] bg-muted/20 dark:bg-muted/10 p-4 flex flex-col gap-4 border rounded-lg">
      {/* Top buttons */}
      <div className="flex justify-between items-center">
        <Button
          variant="ghost"
          size="sm"
          className="cursor-pointer"
          onClick={() => router.push("/")}
        >
          <ArrowLeft size={20} />
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="cursor-pointer"
          onClick={toggleTheme}
        >
          {resolvedTheme === "dark" ? <Sun /> : <Moon />}
        </Button>
      </div>

      {/* Repo details */}
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">{repoDetails.name}</h2>
        <p className="text-sm text-muted-foreground">
          {repoDetails.description}
        </p>
        <div className="flex gap-2 text-xs text-muted-foreground">
          <span>⭐ {repoDetails.stargazers_count}</span>
          <span>🍴 {repoDetails.forks_count}</span>
        </div>
      </div>

      {/* File tree */}
      <div className="mt-4 space-y-1 overflow-auto">
        <h3 className="text-sm font-medium text-muted-foreground">
          Project Files
        </h3>
        <div className="space-y-1">
          {(Array.isArray(fileTree) ? fileTree : [])
            .slice()
            .sort((a, b) => {
              if (a.type === b.type) return a.name.localeCompare(b.name);
              return a.type === "folder" ? -1 : 1;
            })
            .map((item, idx) => (
              <FileItem key={idx} item={item} level={0} />
            ))}
        </div>
      </div>

      <div className="mt-auto flex flex-col items-start space-y-2 text-xs text-muted-foreground">
        <a
          href={repoDetails.html_url}
          target="_blank"
          className="hover:underline"
        >
          📦 View this repository
        </a>
        <a
          href="https://github.com/yourusername/neuromap-demo"
          target="_blank"
          className="hover:underline"
        >
          🔗 View Neuromap on GitHub
        </a>
        <a
          href="https://github.com/yourusername/neuromap-demo/stargazers"
          target="_blank"
          className="hover:underline text-primary font-medium"
        >
          ⭐ Give Neuromap a star!
        </a>
      </div>
    </aside>
  );
};

// Recursive component to render files & folders in tree
function FileItem({ item, level }: { item: TreeNode; level: number }) {
  const [open, setOpen] = useState(false);
  const indent = { marginLeft: `${level * 0.5}rem` }; // smaller indent looks better

  if (item.type === "folder") {
    return (
      <div style={indent} className="flex flex-col text-sm relative">
        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center gap-1 cursor-pointer select-none">
              {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <Folder size={16} className="text-yellow-500" />
              <span>{item.name}</span>
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
            {(Array.isArray(item.children) ? item.children : [])
              .slice()
              .sort((a: TreeNode, b: TreeNode) => {
                if (a.type === b.type) return a.name.localeCompare(b.name);
                return a.type === "folder" ? -1 : 1;
              })
              .map((child: TreeNode, idx: number) => (
                <FileItem key={idx} item={child} level={level + 1} />
              ))}
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  }

  // Render file
  return (
    <div style={indent} className="flex items-center gap-2 text-sm">
      <FileText size={16} className="text-muted-foreground" />
      <span>{item.name}</span>
    </div>
  );
}

type TreeNode =
  | { type: "folder"; name: string; children: TreeNode[] }
  | { type: "file"; name: string };

type FlatItem = { type: string; path: string; }

function buildNestedTree(flat: FlatItem[]): TreeNode[] {
  const root: TreeNode[] = [];

  flat.forEach((item) => {
    if (item.type !== "blob" && item.type !== "tree") return;

    const parts = item.path.split("/");
    let current = root;

    parts.forEach((part: string, idx: number) => {
      const isFile = idx === parts.length - 1 && item.type === "blob";
      const existing = current.find((e) => e.name === part);

      if (existing && existing.type === "folder") {
        current = existing.children;
      } else if (!existing) {
        if (isFile) {
          current.push({ type: "file", name: part });
        } else {
          const newFolder: TreeNode = {
            type: "folder",
            name: part,
            children: [],
          };
          current.push(newFolder);
          current = newFolder.children;
        }
      }
    });
  });

  return root;
}
