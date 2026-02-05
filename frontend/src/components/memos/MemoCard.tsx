import { Memo } from '@/lib/api';
import TagChip from './TagChip';

interface MemoCardProps {
  memo: Memo;
  onClick: () => void;
}

export default function MemoCard({ memo, onClick }: MemoCardProps) {
  return (
    <div
      onClick={onClick}
      className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md hover:border-gray-300 transition cursor-pointer"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
        {memo.title}
      </h3>

      {memo.ai_summary && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-3">
          {memo.ai_summary}
        </p>
      )}

      {memo.tags && memo.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {memo.tags.slice(0, 3).map((tag) => (
            <TagChip key={tag} tag={tag} small />
          ))}
          {memo.tags.length > 3 && (
            <span className="text-xs text-gray-500 self-center">
              +{memo.tags.length - 3}
            </span>
          )}
        </div>
      )}

      <p className="text-xs text-gray-400">
        {new Date(memo.created_at).toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </p>
    </div>
  );
}
