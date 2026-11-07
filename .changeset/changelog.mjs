// Changelog entries for `changeset version` (docs/plans/changelog-format.md): the changeset's
// text, ending with a link to the pull request that added it. No commit hash and no author.
// Without a token, a commit or a match (a local run), the entry is written without a link.

/** The pull request that added `commit`, from GitHub's "pull requests for a commit" API. */
async function pullRequestFor(repo, commit) {
  const token = process.env.GITHUB_TOKEN;
  if (!repo || !commit || !token) return undefined;
  try {
    const response = await fetch(`https://api.github.com/repos/${repo}/commits/${commit}/pulls`, {
      headers: {
        accept: 'application/vnd.github+json',
        authorization: `Bearer ${token}`,
        'x-github-api-version': '2022-11-28',
      },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) return undefined;
    const pulls = await response.json();
    const merged = pulls.find((pull) => pull.merged_at) ?? pulls[0];
    return merged?.number;
  } catch {
    return undefined;
  }
}

/** One entry: `- text ([#N](…/pull/N))`, continuation lines indented under the bullet. */
export function formatEntry(summary, repo, pull) {
  const lines = summary.trim().split('\n');
  if (pull !== undefined) {
    const last = lines.length - 1;
    lines[last] = `${lines[last]} ([#${pull}](https://github.com/${repo}/pull/${pull}))`;
  }
  const [first, ...rest] = lines;
  return [`- ${first}`, ...rest.map((line) => (line.trim() ? `  ${line}` : ''))].join('\n');
}

/** @type {import('@changesets/types').ChangelogFunctions} */
const changelog = {
  async getReleaseLine(changeset, _type, options) {
    const repo = options?.repo;
    const pull = await pullRequestFor(repo, changeset.commit);
    return `\n\n${formatEntry(changeset.summary, repo, pull)}`;
  },
  // Only one package publishes, so no dependency notes.
  async getDependencyReleaseLine() {
    return '';
  },
};

export default changelog;
