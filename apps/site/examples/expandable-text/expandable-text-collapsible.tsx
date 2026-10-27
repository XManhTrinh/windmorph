import { ExpandableText } from '@windmorph/react-pro';

const review =
  "Un bánh mì croustillant, un pâté parfumé et des herbes fraîches. La boutique est petite mais très propre, et le patron se souvient des habitués. C'est bondé à midi, mieux vaut commander par téléphone. Prix corrects, je reviendrai goûter le bún chả ce week-end.";

/** A review with "See less" (`collapsible`), its words in French through `labels`. */
export function ExpandableTextCollapsible() {
  return (
    <div className="w-full max-w-md rounded-corner-large bg-surface-container-high p-4">
      <ExpandableText
        as="p"
        lang="fr"
        lines={2}
        collapsible
        labels={{ more: 'Voir plus', less: 'Voir moins' }}
        className="text-body-medium text-on-surface"
      >
        {review}
      </ExpandableText>
    </div>
  );
}
