import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SubmissionStatusCard } from "./SubmissionStatusCard.js";
import * as useSubmissionModule from "../useSubmission.js";

vi.mock("../useSubmission.js", () => ({
  useAssignmentSubmissions: vi.fn(),
}));

describe("SubmissionStatusCard", () => {
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state when submissions are being fetched", () => {
    vi.mocked(useSubmissionModule.useAssignmentSubmissions).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: mockRefetch,
      isFetching: true,
    } as unknown as ReturnType<typeof useSubmissionModule.useAssignmentSubmissions>);

    render(
      <SubmissionStatusCard
        cohortSlug="cohort-01"
        weekNumber={1}
        description="First task"
      />,
    );

    expect(screen.getByText(/Loading submissions.../i)).toBeInTheDocument();
  });

  it("renders error state when fetch fails", () => {
    vi.mocked(useSubmissionModule.useAssignmentSubmissions).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
      isFetching: false,
    } as unknown as ReturnType<typeof useSubmissionModule.useAssignmentSubmissions>);

    render(
      <SubmissionStatusCard
        cohortSlug="cohort-01"
        weekNumber={1}
        description="First task"
      />,
    );

    expect(screen.getByText(/Failed to load submissions./i)).toBeInTheDocument();
  });

  it("renders multi-repo list in draft state with PR instructions", () => {
    vi.mocked(useSubmissionModule.useAssignmentSubmissions).mockReturnValue({
      data: { submissions: [] },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
      isFetching: false,
    } as unknown as ReturnType<typeof useSubmissionModule.useAssignmentSubmissions>);

    const repositories = [
      { id: "repo-web", githubOwner: "elwarsha", githubRepo: "elwarsha-web" },
      { id: "repo-api", githubOwner: "elwarsha", githubRepo: "elwarsha-api" },
    ];

    render(
      <SubmissionStatusCard
        cohortSlug="cohort-01"
        weekNumber={6}
        repositories={repositories}
        description="Refactor modules"
      />,
    );

    expect(screen.getByText("elwarsha/elwarsha-web")).toBeInTheDocument();
    expect(screen.getByText("elwarsha/elwarsha-api")).toBeInTheDocument();

    const draftBadges = screen.getAllByText("Draft");
    expect(draftBadges).toHaveLength(2);

    expect(
      screen.getAllByText("[week-06] Refactor modules")[0],
    ).toBeInTheDocument();
  });

  it("renders open PR in-review state with PR number and external link", () => {
    vi.mocked(useSubmissionModule.useAssignmentSubmissions).mockReturnValue({
      data: {
        submissions: [
          {
            productRepositoryId: "repo-web",
            status: "in_review",
            pullRequest: {
              number: 42,
              htmlUrl: "https://github.com/elwarsha/elwarsha-web/pull/42",
              state: "open",
            },
          },
        ],
      },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
      isFetching: false,
    } as unknown as ReturnType<typeof useSubmissionModule.useAssignmentSubmissions>);

    render(
      <SubmissionStatusCard
        cohortSlug="cohort-01"
        weekNumber={6}
        repositories={[
          { id: "repo-web", githubOwner: "elwarsha", githubRepo: "elwarsha-web" },
        ]}
        description="Refactor modules"
      />,
    );

    expect(screen.getByText("● In Review")).toBeInTheDocument();
    expect(screen.getByText("PR #42")).toBeInTheDocument();

    const prLink = screen.getByRole("link", {
      name: /View Pull Request #42 on GitHub/i,
    });
    expect(prLink).toHaveAttribute(
      "href",
      "https://github.com/elwarsha/elwarsha-web/pull/42",
    );
    expect(prLink).toHaveAttribute("target", "_blank");
    expect(prLink).toHaveAttribute("rel", "noreferrer noopener");
  });

  it("renders merged PR completion badge", () => {
    vi.mocked(useSubmissionModule.useAssignmentSubmissions).mockReturnValue({
      data: {
        submissions: [
          {
            productRepositoryId: "repo-web",
            status: "merged",
            pullRequest: {
              number: 42,
              htmlUrl: "https://github.com/elwarsha/elwarsha-web/pull/42",
              state: "merged",
            },
          },
        ],
      },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
      isFetching: false,
    } as unknown as ReturnType<typeof useSubmissionModule.useAssignmentSubmissions>);

    render(
      <SubmissionStatusCard
        cohortSlug="cohort-01"
        weekNumber={6}
        repositories={[
          { id: "repo-web", githubOwner: "elwarsha", githubRepo: "elwarsha-web" },
        ]}
        description="Refactor modules"
      />,
    );

    expect(screen.getByText("✓ Merged")).toBeInTheDocument();
    expect(
      screen.getByText(/Your assignment Pull Request has been successfully merged into main/i),
    ).toBeInTheDocument();
  });

  it("triggers manual refetch when clicking the refresh button", async () => {
    const user = userEvent.setup();

    vi.mocked(useSubmissionModule.useAssignmentSubmissions).mockReturnValue({
      data: { submissions: [] },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
      isFetching: false,
    } as unknown as ReturnType<typeof useSubmissionModule.useAssignmentSubmissions>);

    render(
      <SubmissionStatusCard
        cohortSlug="cohort-01"
        weekNumber={1}
        description="First task"
      />,
    );

    const refreshButton = screen.getByRole("button", {
      name: /Refresh from GitHub/i,
    });
    await user.click(refreshButton);

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });
});
