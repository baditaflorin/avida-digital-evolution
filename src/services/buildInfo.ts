import { QueryClient } from '@tanstack/query-core';
import { z } from 'zod';

const BuildInfoSchema = z.object({
  version: z.string(),
  commit: z.string(),
  fullCommit: z.string(),
  builtAt: z.string(),
  repository: z.string().url(),
  paypalUrl: z.string().url(),
  pagesUrl: z.string().url(),
});

const GitHubCommitSchema = z.object({
  sha: z.string(),
  html_url: z.string().url(),
});

export type BuildInfo = z.infer<typeof BuildInfoSchema> & {
  latestMainCommit?: string;
  latestMainCommitUrl?: string;
};

const queryClient = new QueryClient();
const fallbackBuildInfo = {
  version: import.meta.env.VITE_APP_VERSION ?? '0.1.0',
  commit: 'runtime-main',
  fullCommit: 'runtime-main',
  builtAt: 'static',
  repository: 'https://github.com/baditaflorin/avida-digital-evolution',
  paypalUrl: 'https://www.paypal.com/paypalme/florinbadita',
  pagesUrl: 'https://baditaflorin.github.io/avida-digital-evolution/',
};

export const loadBuildInfo = async (): Promise<BuildInfo> => {
  return queryClient.fetchQuery({
    queryKey: ['build-info'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.BASE_URL}build-info.json`, {
        cache: 'no-store',
      });
      const fallback = BuildInfoSchema.parse(fallbackBuildInfo);
      if (!response.ok) {
        return fallback;
      }
      return BuildInfoSchema.parse(await response.json());
    },
    staleTime: 60_000,
  });
};

export const loadLatestMainCommit = async (): Promise<
  Pick<BuildInfo, 'latestMainCommit' | 'latestMainCommitUrl'>
> => {
  return queryClient.fetchQuery({
    queryKey: ['github-latest-commit'],
    queryFn: async () => {
      const response = await fetch(
        'https://api.github.com/repos/baditaflorin/avida-digital-evolution/commits/main',
        { headers: { Accept: 'application/vnd.github+json' } },
      );
      if (!response.ok) {
        return {};
      }
      const data = GitHubCommitSchema.parse(await response.json());
      return {
        latestMainCommit: data.sha.slice(0, 12),
        latestMainCommitUrl: data.html_url,
      };
    },
    staleTime: 300_000,
  });
};
