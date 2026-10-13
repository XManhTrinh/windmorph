import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { FileTriggerFolder } from '../../examples/file-trigger/file-trigger-folder';
import { FileTriggerMenu } from '../../examples/file-trigger/file-trigger-menu';
import { FileTriggerPhoto } from '../../examples/file-trigger/file-trigger-photo';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';

/** File trigger page body: purpose, examples, the hook and accessibility. */
export async function FileTriggerBody(): Promise<ComponentDoc> {
  const [photo, menu, folder] = await Promise.all([
    readExampleSource('file-trigger/file-trigger-photo.tsx'),
    readExampleSource('file-trigger/file-trigger-menu.tsx'),
    readExampleSource('file-trigger/file-trigger-folder.tsx'),
  ]);
  const [photoHtml, menuHtml, folderHtml] = await Promise.all([
    highlightSource(photo),
    highlightSource(menu),
    highlightSource(folder),
  ]);

  return {
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className="text-headline-small text-on-surface">
            Examples
          </h2>
          <ExampleViewer
            title="Buttons, the camera and a tooltip"
            code={photo}
            html={photoHtml}
            fileName="file-trigger-photo.tsx"
          >
            <FileTriggerPhoto />
          </ExampleViewer>
          <ExampleViewer
            title="From a menu item (useFileTrigger)"
            code={menu}
            html={menuHtml}
            fileName="file-trigger-menu.tsx"
          >
            <FileTriggerMenu />
          </ExampleViewer>
          <ExampleViewer
            title="A folder, or several documents"
            code={folder}
            html={folderHtml}
            fileName="file-trigger-folder.tsx"
          >
            <FileTriggerFolder />
          </ExampleViewer>
        </section>
      </>
    ),
    guidelines: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="purpose" className="text-headline-small text-on-surface">
            Purpose
          </h2>
          <p className="text-body-large text-on-surface-variant">
            Makes a library button open the system file picker, or the camera on phones. Browsers
            open the picker only through a file input, so <InlineCode>FileTrigger</InlineCode> keeps
            one hidden and lets the button you wrap be the control, as{' '}
            <InlineCode>DialogTrigger</InlineCode> and <InlineCode>MenuTrigger</InlineCode> do for
            dialogs and menus. It is{' '}
            <strong className="text-on-surface">not an M3 component</strong>, so it comes from{' '}
            <InlineCode>@windmorph/react-pro</InlineCode>.
          </p>
          <p className="text-body-large text-on-surface-variant">
            To frame a photo before upload, pass the chosen file to{' '}
            <InlineCode>ImageCropDialog</InlineCode>.
          </p>
        </section>
      </>
    ),
    accessibility: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="keyboard-and-screen-reader" className="text-headline-small text-on-surface">
            Keyboard &amp; screen reader
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>The button is the control: Tab reaches it, and Enter or Space opens the picker.</li>
            <li>
              The input is hidden from everyone (<InlineCode>hidden</InlineCode>,{' '}
              <InlineCode>aria-hidden</InlineCode>, out of the tab order), so nothing is announced
              twice.
            </li>
            <li>
              Put it inside a <InlineCode>TooltipTrigger</InlineCode>: the tooltip keeps working. To
              stop it, disable the button.
            </li>
          </ul>
        </section>
      </>
    ),
    api: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="options" className="text-headline-small text-on-surface">
            Options
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              <InlineCode>onSelect</InlineCode> gets the chosen files as an array, never empty.
              Choosing the same file again still calls it.
            </li>
            <li>
              <InlineCode>accept</InlineCode> lists MIME types or extensions; check the real type on
              the server, since a file&apos;s name and type can lie.
            </li>
            <li>
              <InlineCode>multiple</InlineCode> allows several files,{' '}
              <InlineCode>capture</InlineCode> opens the front (<InlineCode>user</InlineCode>) or
              back (<InlineCode>environment</InlineCode>) camera on phones, and{' '}
              <InlineCode>directory</InlineCode> chooses a folder where the browser supports it.
            </li>
            <li>
              <InlineCode>useFileTrigger(options)</InlineCode> returns{' '}
              <InlineCode>{'{ open, input }'}</InlineCode> for triggers that can&apos;t be wrapped,
              such as a menu item: call <InlineCode>open()</InlineCode> from its action and render{' '}
              <InlineCode>input</InlineCode> once.
            </li>
          </ul>
        </section>
      </>
    ),
  };
}
