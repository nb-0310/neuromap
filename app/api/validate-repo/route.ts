import { NextRequest, NextResponse } from "next/server";
import { validateRepoUrl, validateIsVanillaReact } from "@/lib/validators";
import { fetchGitHubRepo, fetchPackageJson } from "@/lib/github";
import { AppError } from "@/lib/errors";
import { analyzeRepo } from "@/lib/analyzeRepo";
import redis from "@/lib/redis";
import { rateLimitOncePerDay } from "@/lib/rateLimit";

import type { Graph } from "@/lib/analyzeRepo";

type CachedData = {
  repo: Record<string, unknown>;
  analysis: Graph;
};

const MY_IPS = process.env.MY_IPS?.split(",") ?? [];

function isMyIp(ip: string): boolean {
  return MY_IPS.includes(ip);
}

export async function POST(req: NextRequest) {
  const forwardedFor = req.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0] ?? "unknown";

  if (!isMyIp(ip)) {
    const { allowed } = await rateLimitOncePerDay(ip);

    if (!allowed) {
      // return NextResponse.json(
      //   { message: "Rate limit exceeded. Only once per day allowed." },
      //   { status: 429 }
      // );
      throw new AppError(
        "Rate Limit Exceeded",
        "For now you can only create a map once per day",
        [
          "Due to Github REST API having IP Address based rate limiting, I have implemented the same.",
          "If you want to play with this more, please clone the repo, switch to nm__no_rate_limit branch, put your own github token and tr in local.",
          "If you input a large repo which exceeded more than 55 js/ts/jsx/tsx files then also it won't work anymore",
        ]
      );
    }
  } else {
    console.log ("Skipping rate limiting for my own IP Addresses.")
  }

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
