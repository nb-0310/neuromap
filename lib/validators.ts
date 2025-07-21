import { forbiddenFrameworks } from "./constants";
import { AppError } from "./errors";

export function validateRepoUrl(repoUrl: string) {
  try {
    const url = new URL(repoUrl);
    const parts = url.pathname.split("/").filter(Boolean);
    if (url.hostname !== "github.com" || parts.length !== 2) {
      throw new AppError(
        "Invalid GitHub repository URL",
        "Please enter a URL like https://github.com/user/repo."
      );
    }
    return { owner: parts[0], repo: parts[1] };
  } catch {
    throw new AppError(
      "Invalid URL format",
      "Make sure to enter a valid URL starting with https://"
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateIsVanillaReact(pkg: Record<string, any>) {
  const deps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
  };

  if (!deps.react || !deps["react-dom"]) {
    throw new AppError(
      "React not found",
      "This project doesn't seem to use React.",
      [
        "Make sure it is a vanilla react application.",
        "Make sure the repository itself doesn't have any sub-folders for frontend/backend division.",
        "<a href='#'>Check here</a>",
      ]
    );
  }

  const foundFrameworks = forbiddenFrameworks.filter((fw) => deps[fw]);
  if (foundFrameworks.length > 0) {
    throw new AppError(
      "Unsupported framework detected",
      `This project uses frameworks that aren't supported.`,
      [
        "As of now we only support vanilla react applications.",
        "Next.js, Gatsby, Remix and such react based frameworks are not supported.",
        `Following unsupported frameworks/libraries detected: ${foundFrameworks.join(", ")}`,
      ]
    );
  }
}
