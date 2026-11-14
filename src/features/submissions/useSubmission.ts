import { useQuery } from '@tanstack/react-query'
import { api } from '@core/api'

interface UseAssignmentSubmissionsParams {
  cohortSlug: string
  weekNumber: number
}

export function useAssignmentSubmissions({
  cohortSlug,
  weekNumber,
}: UseAssignmentSubmissionsParams) {
  return useQuery({
    queryKey: [
      'cohorts',
      cohortSlug,
      'weeks',
      weekNumber,
      'submissions',
    ],

    queryFn: () =>
      api.getAssignmentSubmissions(cohortSlug, weekNumber),

    staleTime: 60_000,
  })
}