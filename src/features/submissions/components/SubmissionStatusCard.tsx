
import { useAssignmentSubmissions } from "../useSubmission";
import styles from "./SubmissionStatusCard.module.css";

export interface Repository {
  id: string;
  githubOwner: string;
  githubRepo: string;
}

const DEFAULT_REPOSITORIES: Repository[] = [
  {
    id: "repo-web",
    githubOwner: "El-warsha",
    githubRepo: "elwarsha-web",
  },
  {
    id: "repo-api",
    githubOwner: "El-warsha",
    githubRepo: "elwarsha-api",
  },
];

interface Props {
  cohortSlug?: string;
  weekNumber?: number;
  repositories?: Repository[];
  description?: string;
}

export function SubmissionStatusCard({
  cohortSlug = "cohort-01",
  weekNumber = 1,
  repositories = DEFAULT_REPOSITORIES,
  description = "assignment submission",
}: Props) {
  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useAssignmentSubmissions({ cohortSlug, weekNumber });

  if (isLoading) {
    return (
      <div className={styles.loadingPanel} role="status">
        Loading submissions...
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.errorPanel} role="alert">
        Failed to load submissions.
        <button
          type="button"
          className={styles.syncBtn}
          onClick={() => refetch()}
          disabled={isFetching}
        >
          Try again
        </button>
      </div>
    );
  }

  const repositorySubmissions = repositories.map((repo) => {
    const submission = data?.submissions?.find(
      (item) =>
        item.productRepositoryId === repo.id ||
        item.githubRepo?.toLowerCase() === repo.githubRepo.toLowerCase(),
    );

    const status =
      submission?.status === "merged" ||
      submission?.pullRequest?.state === "merged"
        ? "merged"
        : submission?.pullRequest ||
            submission?.status === "in_review"
          ? "in_review"
          : "draft";

    return { repo, submission, status };
  });

  return (
    <section
      className={styles.card}
      role="region"
      aria-label="Assignment submissions status"
      aria-live="polite"
    >
      <header className={styles.header}>
        <h2 className={styles.title}>
          Assignment Submissions
        </h2>

        <button
          type="button"
          className={styles.syncBtn}
          onClick={() => refetch()}
          disabled={isFetching}
        >
          {isFetching ? "Syncing..." : "↻ Refresh from GitHub"}
        </button>
      </header>

      <div className={styles.repoList}>
        {repositorySubmissions.map(({ repo, submission, status }) => {
          const repoUrl = `https://github.com/${repo.githubOwner}/${repo.githubRepo}`;

          return (
            <article key={repo.id} className={styles.repoItem}>
              <div className={styles.repoTop}>
                <h3 className={styles.repoName}>
                  <a
                    href={repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.repoLink}
                    aria-label={`Visit repository ${repo.githubOwner}/${repo.githubRepo} on GitHub`}
                  >
                    {repo.githubOwner}/{repo.githubRepo}
                  </a>
                </h3>

                {status === "draft" && (
                  <span className={styles.badgeDraft}>
                    Draft
                  </span>
                )}

                {status === "in_review" && (
                  <span className={styles.badgeInReview}>
                    ● In Review
                  </span>
                )}

                {status === "merged" && (
                  <span className={styles.badgeMerged}>
                    ✓ Merged
                  </span>
                )}
              </div>

              {status === "draft" && (
                <div className={styles.stateContent}>
                  <p>
                    Open a Pull Request on GitHub titled:
                  </p>

                  <code className={styles.codeInstruction}>
                    [week-{String(weekNumber).padStart(2, "0")}] {description}
                  </code>

                  <p className={styles.reassuranceText}>
                    Your submission will be automatically synchronized
                    when you load this page.
                  </p>
                </div>
              )}

              {status === "in_review" && (
                <div className={styles.stateContent}>
                  {submission?.pullRequest && (
                    <div className={styles.prRow}>
                      <span className={styles.prMeta}>
                        PR #{submission.pullRequest.number}
                      </span>

                      <a
                        href={
                          submission.pullRequest.htmlUrl ??
                          submission.prUrl ??
                          repoUrl
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.prActionLink}
                        aria-label={`View Pull Request #${submission.pullRequest.number} on GitHub`}
                      >
                        View Pull Request ↗
                      </a>
                    </div>
                  )}
                </div>
              )}

              {status === "merged" && (
                <div className={styles.stateContent}>
                  <p>
                    Your assignment Pull Request has been successfully
                    merged into main.
                  </p>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
