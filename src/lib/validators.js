import { z } from 'zod';

const GITHUB_URL_REGEX = /^https?:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/;

export const repoUrlsSchema = z.object({
  urls: z
    .string()
    .min(1, 'Please enter at least one GitHub repository URL')
    .refine(
      (val) => {
        const lines = val.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
        return lines.length > 0 && lines.length <= 10;
      },
      { message: 'Enter between 1 and 10 repository URLs' }
    )
    .refine(
      (val) => {
        const lines = val.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
        return lines.every((line) => GITHUB_URL_REGEX.test(line));
      },
      { message: 'Each line must be a valid GitHub URL (e.g., https://github.com/owner/repo)' }
    ),
});
