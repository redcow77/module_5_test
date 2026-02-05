'use client';

interface DividerBlockProps {
  onClick: () => void;
}

export default function DividerBlock({ onClick }: DividerBlockProps) {
  return (
    <div
      onClick={onClick}
      className="px-2 py-4 cursor-pointer group"
    >
      <hr className="border-t border-gray-300 group-hover:border-gray-400 transition" />
    </div>
  );
}
