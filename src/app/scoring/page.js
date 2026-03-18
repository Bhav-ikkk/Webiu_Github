import { ScoringMethodology } from '@/components/ScoringMethodology';

export default function ScoringPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Scoring Methodology</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Learn how we calculate Activity, Complexity, and Difficulty scores for GitHub repositories.
          </p>
        </div>

        <ScoringMethodology />

        <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h2 className="font-bold text-lg mb-3">Fair & Transparent Scoring</h2>
          <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
            <li>✅ <strong>All metrics are normalized</strong> to ensure fair comparison across repositories of all sizes</li>
            <li>✅ <strong>Weights are configurable</strong> based on empirical analysis of GitHub project distributions</li>
            <li>✅ <strong>Edge cases handled</strong> with appropriate defaults and caps</li>
            <li>✅ <strong>Full transparency</strong> - see exactly how each repository is scored</li>
            <li>✅ <strong>No black boxes</strong> - every formula is documented and explainable</li>
          </ul>
        </div>

        <div className="mt-8 text-sm text-gray-600 dark:text-gray-400">
          <p>
            Have questions about the scoring? Check out the{' '}
            <a href="https://github.com/Bhav-ikkk/Webiu_Github" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
              GitHub repository
            </a>
            {' '}for the full implementation details.
          </p>
        </div>
      </div>
    </div>
  );
}
