interface TagChipProps {
  tag: string;
  small?: boolean;
}

export default function TagChip({ tag, small = false }: TagChipProps) {
  return (
    <span
      className={`inline-block ${
        small ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1'
      } bg-gray-100 text-gray-700 rounded-full`}
    >
      #{tag}
    </span>
  );
}
