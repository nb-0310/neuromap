import fetch from "node-fetch";
import type { ImportDeclaration } from "@babel/types";

import { parse } from "@babel/parser";
import traverse, { NodePath } from "@babel/traverse";
import { AppError } from "./errors";

import { MAX_FILES } from "./constants";

export type MapTreeNode = { type: "blob" | "tree"; path: string; url: string };

export type Node = {
  id: string;
  label: string;
  position: { x: number; y: number };
};

export type Edge = {
  id: string;
  source: string;
  target: string;
};

export type Graph = {
  nodes: Node[];
  edges: Edge[];
};

export async function analyzeRepo(
  owner: string,
  repo: string,
  branch: string
): Promise<Graph> {
  // Fetch the git tree
  const treeRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    { headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } }
  );
  const treeData = (await treeRes.json()) as { tree: MapTreeNode[] };
  const files: MapTreeNode[] = treeData.tree;

  // Keeping only source files inside src/ and .js, .jsx, .ts, .tsx
  const sourceFiles = files.filter(
    (file) =>
      file.type === "blob" &&
      /\.(js|jsx|ts|tsx)$/.test(file.path) &&
      file.path.startsWith("src/")
  );

  if (sourceFiles.length > MAX_FILES) {
    throw new AppError(
      "Too many Files",
      `This repository has too many source files in src/ folder (${sourceFiles.length}). Max allowed: ${MAX_FILES}.`
    );
  }

  // Creating nodes
  const nodes: Node[] = sourceFiles.map((file) => ({
    id: file.path,
    label: file.path.split("/").pop() || file.path,
    position: {
      x: Math.floor(Math.random() * 250), // better spread
      y: Math.floor(Math.random() * 250),
    },
  }));

  // Building a set of valid node ids
  const validNodeIds = new Set(nodes.map((n) => n.id));

  const edges: Edge[] = [];

  // For each file, fetching content & parse
  for (const file of sourceFiles) {
    const rawRes = await fetch(
      `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${file.path}`
    );
    const code = await rawRes.text();

    try {
      const ast = parse(code, {
        sourceType: "module",
        plugins: ["typescript", "jsx"],
      });

      traverse(ast, {
        ImportDeclaration(path: NodePath<ImportDeclaration>) {
          const sourceValue = path.node.source.value;
          if (sourceValue.startsWith(".") || sourceValue.startsWith("/")) {
            const resolved = resolveImportPath(
              file.path,
              sourceValue,
              sourceFiles
            );
            if (resolved && validNodeIds.has(resolved)) {
              edges.push({
                id: `${file.path}-${resolved}`,
                source: file.path,
                target: resolved,
              });
            }
          }
        },
      });
    } catch {
      // console.error(`Error parsing file: ${file.path}`, e);
      continue;
    }
  }

  return { nodes, edges };
}

function resolveImportPath(
  fromPath: string,
  importPath: string,
  files: MapTreeNode[]
): string | null {
  const fromParts = fromPath.split("/").slice(0, -1);
  const importParts = importPath.split("/");

  const stack = [...fromParts];

  for (const part of importParts) {
    if (part === ".") continue;
    else if (part === "..") stack.pop();
    else stack.push(part);
  }

  const base = stack.join("/");

  const candidates = [
    base,
    base + ".js",
    base + ".jsx",
    base + ".ts",
    base + ".tsx",
  ];

  for (const candidate of candidates) {
    if (files.find((f) => f.path === candidate)) {
      return candidate;
    }
  }

  return null; // not found
}
