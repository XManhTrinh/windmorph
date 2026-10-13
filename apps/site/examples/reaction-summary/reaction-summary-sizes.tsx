import { ReactionSummary } from '@windmorph/react-pro';

const TOP = [
  { id: 'love', icon: '❤️' },
  { id: 'like', icon: '👍' },
  { id: 'wow', icon: '😮' },
];

/**
 * Both variants in the two sizes, and `maxIcons` showing only the most used reaction. Without
 * `onPress` the summary is plain text, not a button.
 */
export function ReactionSummarySizes() {
  return (
    <div className="flex flex-col items-start gap-4">
      <div className="flex flex-wrap items-center gap-6">
        <ReactionSummary items={TOP} total={48} size="md" />
        <ReactionSummary items={TOP} total={48} size="sm" />
        <ReactionSummary items={TOP} total={48} maxIcons={1} />
      </div>
      <div className="flex flex-wrap items-center gap-6">
        <ReactionSummary variant="chip" items={TOP} total={7} size="md" />
        <ReactionSummary variant="chip" items={TOP} total={7} size="sm" />
        <ReactionSummary variant="chip" items={TOP} total={7} maxIcons={1} />
      </div>
    </div>
  );
}
