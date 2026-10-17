import { describe, expect, it } from 'vitest';
import { asAppSource } from './example-source';

describe('asAppSource', () => {
  it("imports the icons from the reader's module, as the playground does", () => {
    expect(
      asAppSource(
        "import { Button } from '@windmorph/react';\nimport { AddIcon } from '../../components/icons';",
      ),
    ).toBe(
      "import { Button } from '@windmorph/react';\n// Use your own icon components.\nimport { AddIcon } from './icons';",
    );
  });

  it('rewrites a multi-line import whole', () => {
    expect(asAppSource("import {\n  AddIcon,\n  EditIcon,\n} from '../../components/icons';")).toBe(
      "// Use your own icon components.\nimport {\n  AddIcon,\n  EditIcon,\n} from './icons';",
    );
  });

  it("imports another page's sample photos from the reader's own data", () => {
    expect(asAppSource("import { SAMPLE_PHOTOS } from '../media-viewer/sample-photos';")).toBe(
      "// Use your own data.\nimport { SAMPLE_PHOTOS } from './sample-photos';",
    );
  });

  it('leaves package imports alone', () => {
    const source = "import { List } from '@windmorph/react';";
    expect(asAppSource(source)).toBe(source);
  });
});
