import type { RouteDescriptor } from "@core/navigation/types";

import { SubmissionsPage } from "./SubmissionsPage.js";

export { SubmissionStatusCard, type Repository } from "./components/SubmissionStatusCard.js";
export { SubmissionsPage };

export const submissionsRoute: RouteDescriptor = {
  id: "submissions",
  path: "portal/submissions",
  public: false,
  capability: "submissions.read",
  element: SubmissionsPage,
};
