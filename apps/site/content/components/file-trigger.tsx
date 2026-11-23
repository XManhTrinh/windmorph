import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';
import { lazyExample } from '../../lib/lazy-example';

const FileTriggerFolder = lazyExample('file-trigger/file-trigger-folder', 'FileTriggerFolder');
const FileTriggerMenu = lazyExample('file-trigger/file-trigger-menu', 'FileTriggerMenu');
const FileTriggerPhoto = lazyExample('file-trigger/file-trigger-photo', 'FileTriggerPhoto');

/** File trigger page body: purpose, examples and the hook. */
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
    api: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="options" className="text-headline-small text-on-surface">
            Options
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              <InlineCode>onFileAccept</InlineCode> gets the chosen files that match{' '}
              <InlineCode>accept</InlineCode> as an array, never empty. Choosing the same file again
              still calls it.
            </li>
            <li>
              <InlineCode>accept</InlineCode> lists MIME types, wildcards or extensions, in any
              case. List the extensions beside the MIME types (
              <InlineCode>{"['text/csv', '.csv']"}</InlineCode>), since a file&apos;s type comes
              from the system and can differ from the one you expect (a CSV is{' '}
              <InlineCode>application/vnd.ms-excel</InlineCode> where a spreadsheet app owns it).{' '}
              <InlineCode>*</InlineCode> or <InlineCode>*/*</InlineCode> takes any file, as does no
              list, and an entry may hold several types, comma-separated. The system dialog only
              hints at it (a person can pick any file there, and a folder&apos;s contents ignore
              it), so a chosen file off it never reaches <InlineCode>onFileAccept</InlineCode>.{' '}
              <InlineCode>onFileReject(rejections)</InlineCode> gets the files a pick brought that
              weren&apos;t taken, after <InlineCode>onFileAccept</InlineCode> and never with an
              empty list, each with its <InlineCode>reason</InlineCode> (
              <InlineCode>type</InlineCode>, off <InlineCode>accept</InlineCode>), so you can say
              why a file didn&apos;t appear. Check the real type on the server too, since a
              file&apos;s name and type can lie.
            </li>
            <li>
              <InlineCode>onFilePick(pick)</InlineCode> is called once for each pick that brings
              files, with all of them: <InlineCode>accepted</InlineCode>, the files taken, and{' '}
              <InlineCode>rejected</InlineCode>, the files refused with their reasons, each list in
              the order the files came (<InlineCode>accepted</InlineCode> is empty when every file
              was refused). It runs first, then <InlineCode>onFileAccept</InlineCode> and{' '}
              <InlineCode>onFileReject</InlineCode>, all in the same task, so you can treat a pick
              as one thing: add what fits and say once what was left out. A closed dialog calls
              nothing. It is enough on its own to take files, and each callback gets its own copy of
              the lists. Its type, <InlineCode>FilePick</InlineCode>, comes from{' '}
              <InlineCode>@windmorph/react-pro</InlineCode>.
            </li>
            <li>
              <InlineCode>multiple</InlineCode> allows several files,{' '}
              <InlineCode>capture</InlineCode> opens the front (<InlineCode>user</InlineCode>) or
              back (<InlineCode>environment</InlineCode>) camera on phones, and{' '}
              <InlineCode>directory</InlineCode> chooses a folder where the browser supports it,
              leaving out the files the system keeps there for itself (
              <InlineCode>.DS_Store</InlineCode>, <InlineCode>Thumbs.db</InlineCode>, dot files),
              neither taken nor reported.
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
