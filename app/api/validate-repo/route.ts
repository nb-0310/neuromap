import { NextRequest, NextResponse } from "next/server";
import { validateRepoUrl, validateIsVanillaReact } from "@/lib/validators";
import { fetchGitHubRepo, fetchPackageJson } from "@/lib/github";
import { AppError } from "@/lib/errors";
import { analyzeRepo } from "@/lib/analyzeRepo";
import redis from "@/lib/redis";

import type {Graph} from "@/lib/analyzeRepo"

type CachedData = {
  repo: Record<string, unknown>;
  analysis: Graph;
};

export async function POST(req: NextRequest) {
  try {
    const { repoUrl } = await req.json();
    if (!repoUrl) {
      throw new AppError(
        "Missing input",
        "Please provide a GitHub repository URL."
      );
    }

    const { owner, repo } = validateRepoUrl(repoUrl);
    const cacheKey = `repo:${owner}/${repo}`;

    const cached = await redis.get<CachedData>(cacheKey);

    if (cached) {
      console.log("✅ Cache hit");
      return NextResponse.json({
        message: "Repository is valid (from cache).",
        repo: cached.repo,
        analysis: cached.analysis,
      });
    }

    const repoData = await fetchGitHubRepo(owner, repo);

    if (repoData.private) {
      throw new AppError(
        "Repository is private",
        "Please use a public repository."
      );
    }

    const pkg = await fetchPackageJson(owner, repo);

    validateIsVanillaReact(pkg);

    // Analyze dependency graph
    const analysis = await analyzeRepo(owner, repo, "main");

    await redis.set(
      cacheKey,
      JSON.stringify({ repo: repoData, analysis }),
      { ex: 60 * 60 * 24 } // cache for 24 hours
    );

    return NextResponse.json({
      message: "Repository is valid & is a vanilla React project.",
      repo: repoData,
      analysis,
    });
  } catch (e) {
    // console.error("API error:", e);
    if (e instanceof AppError) {
      return NextResponse.json(
        {
          title: e.title,
          description: e.description,
          items: e.items || [],
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        title: "Server error",
        description: "Something unexpected went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
}
