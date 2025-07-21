import { AppError } from "./errors";

export type GitHubRepo = {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  forks_count: number | null;
  stargazers_count: number | null;
};

export async function fetchGitHubRepo(owner: string, repo: string) {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
  if (!res.ok) {
    throw new AppError(
      "Repository not found",
      "GitHub says the repository doesn’t exist or is private."
    );
  }
  return await res.json();
}

export async function fetchPackageJson(
  owner: string,
  repo: string
): Promise<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Record<string, any>
> {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/package.json`,
    { headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } }
  );
  if (!res.ok) {
    throw new AppError(
      "package.json missing",
      "Couldn’t find a package.json in the root of the repository.",
      [
        "Make sure your React app has a package.json at the root.",
        "As of now we don't support folder divisions like frontend/backend.",
        "The repo itself has to be a vanilla react app only.",
      ]
    );
  }
  const data = await res.json();
  return JSON.parse(Buffer.from(data.content, "base64").toString("utf8"));
}
