// components/ResultsInfo.jsx
export default function ResultsInfo({ 
  total, 
  showing, 
  currentPage, 
  itemsPerPage,
  compact = false 
}) {
  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, total);

  if (compact) {
    return (
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {total} {total === 1 ? 'result' : 'results'}
      </div>
    );
  }

  return (
    <div className="text-sm text-gray-600 dark:text-gray-400">
      Showing {start}-{end} of {total} {total === 1 ? 'result' : 'results'}
    </div>
  );
}