'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { repoUrlsSchema } from '@/lib/validators';
import { Search, Loader2 } from 'lucide-react';

const EXAMPLE_URLS = `https://github.com/facebook/react
https://github.com/vercel/next.js
https://github.com/microsoft/vscode`;

export default function RepoForm({ onSubmit, isLoading }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(repoUrlsSchema),
    defaultValues: { urls: '' },
  });

  const urlsValue = watch('urls');
  const urlCount = urlsValue
    ? urlsValue.split('\n').filter((u) => u.trim().length > 0).length
    : 0;

  const processSubmit = (data) => {
    const urls = data.urls
      .split('\n')
      .map((u) => u.trim())
      .filter((u) => u.length > 0);
    onSubmit(urls);
  };

  return (
    <div className="Box">
      <div className="Box-header d-flex flex-items-center flex-justify-between">
        <label htmlFor="urls" className="font-semibold">
          Repository URLs
        </label>
        {urlCount > 0 && (
          <span className="counter">{urlCount}</span>
        )}
      </div>
      <div className="Box-body">
        <form onSubmit={handleSubmit(processSubmit)}>
          <textarea
            {...register('urls')}
            id="urls"
            placeholder="Enter GitHub repository URLs, one per line:

https://github.com/facebook/react
https://github.com/vercel/next.js
https://github.com/microsoft/vscode"
            className={`form-control text-mono ${errors.urls ? 'border-[var(--danger)]' : ''}`}
            rows={6}
            style={{ resize: 'vertical', minHeight: '140px' }}
          />

          {errors.urls && (
            <p className="text-small mt-2" style={{ color: 'var(--danger)' }}>
              {errors.urls.message}
            </p>
          )}

          <p className="text-small text-muted mt-2">
            Enter up to 10 repository URLs, one per line
          </p>

          <div className="d-flex flex-items-center flex-justify-between mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
            <button
              type="button"
              onClick={() => setValue('urls', EXAMPLE_URLS)}
              className="text-small link"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              Load example repositories
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4" style={{ animation: 'spin 1s linear infinite' }} />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Analyze
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
