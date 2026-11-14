import { messages, type Locale } from "@core/i18n";
import { PageSection } from "@ui/patterns/PageSection/PageSection";
import { SubmissionStatusCard, type Repository } from "./components/SubmissionStatusCard";

interface Props {
  locale: Locale;
  cohortSlug?: string;
  weekNumber?: number;
  repositories?: Repository[];
  description?: string;
}

export function SubmissionsPage({
  locale,
  cohortSlug = "cohort-1",
  weekNumber = 1,
  repositories = [],
  description = "assignment submission",
}: Props) {
  const copy = messages[locale];

  return (
    <PageSection
      eyebrow={copy.portal.submissions}
      title={copy.portal.submissions}
    >
      <SubmissionStatusCard
        cohortSlug={cohortSlug}
        weekNumber={weekNumber}
        repositories={repositories}
        description={description}
      />
    </PageSection>
  );
}