import { Avatar } from '@windmorph/react-pro';
import { SAMPLE_PHOTO } from '../image-crop/sample-photo';

/**
 * A photo (`src`) covers the fallback once it loads, at any size and shape. With `href` the
 * avatar is a link to the profile, with a focus ring and a state layer.
 */
export function AvatarPhotos() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Avatar name="Nora Lindqvist" alt="Nora Lindqvist" src={SAMPLE_PHOTO} size="sm" />
      <Avatar name="Nora Lindqvist" alt="Nora Lindqvist" src={SAMPLE_PHOTO} size="lg" />
      <Avatar
        name="Nora Lindqvist"
        alt="Nora Lindqvist"
        src={SAMPLE_PHOTO}
        size="xl"
        shape="Cookie9Sided"
      />
      <Avatar
        name="Sam Taylor"
        alt="Sam Taylor's profile"
        href="#demo-profile"
        size="lg"
        presence="online"
      />
    </div>
  );
}
