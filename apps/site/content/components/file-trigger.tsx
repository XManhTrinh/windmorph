import { PropsTable } from '@windmorph/react-pro';
import { ExampleViewer } from '../../components/example-viewer';
import { readComponentProps } from '../../lib/component-props';
import { FileTriggerMenu } from '../../examples/file-trigger/file-trigger-menu';
import { FileTriggerPhoto } from '../../examples/file-trigger/file-trigger-photo';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';

const code = (text: string) => <code className="text-on-surface">{text}</code>;

/** File trigger page body: purpose, examples, the hook and accessibility. */
export async function FileTriggerBody() {
  const [photo, menu] = await Promise.all([
    readExampleSource('file-trigger/file-trigger-photo.tsx'),
    readExampleSource('file-trigger/file-trigger-menu.tsx'),
  ]);
  const [photoHtml, menuHtml] = await Promise.all([highlightSource(photo), highlightSource(menu)]);
  // The hook takes FileTrigger's options (its props, without the button and the input ref),
  // read from the same generated table, so the two can't drift apart.
  const options = (await readComponentProps('FileTrigger')).props.filter(
    (prop) => prop.name !== 'children' && prop.name !== 'inputRef',
  );

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Purpose</h2>
        <p className="text-body-large text-on-surface-variant">
          Makes a library button open the system file picker, or the camera on phones. Browsers open
          the picker only through a file input, so {code('FileTrigger')} keeps one hidden and lets
          the button you wrap be the control, as {code('DialogTrigger')} and {code('MenuTrigger')}{' '}
          do for dialogs and menus. It is{' '}
          <strong className="text-on-surface">not an M3 component</strong>, so it comes from{' '}
          {code('@windmorph/react-pro')}.
        </p>
        <p className="text-body-large text-on-surface-variant">
          To frame a photo before upload, pass the chosen file to {code('ImageCropDialog')}.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-headline-small text-on-surface">Examples</h2>
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
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Options</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            {code('onSelect')} gets the chosen files as an array, never empty. Choosing the same
            file again still calls it.
          </li>
          <li>
            {code('accept')} lists MIME types or extensions; check the real type on the server,
            since a file&apos;s name and type can lie.
          </li>
          <li>
            {code('multiple')} allows several files, {code('capture')} opens the front (
            {code('user')}) or back ({code('environment')}) camera on phones, and{' '}
            {code('directory')} chooses a folder where the browser supports it.
          </li>
          <li>
            {code('useFileTrigger(options)')} returns {code('{ open, input }')} for triggers that
            can&apos;t be wrapped, such as a menu item: call {code('open()')} from its action and
            render {code('input')} once.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">useFileTrigger</h2>
        <p className="text-body-large text-on-surface-variant">
          {code('useFileTrigger(options, inputRef?)')} opens the picker from a trigger that
          can&apos;t be wrapped, such as a menu item. It takes the same options as{' '}
          {code('FileTrigger')} and returns {code('{ open, input }')}.
        </p>
        <PropsTable caption="useFileTrigger options" rows={options} />
        <PropsTable
          caption="useFileTrigger returns"
          rows={[
            {
              name: 'open',
              type: '() => void',
              required: true,
              description:
                'Opens the file picker. Call it from a press or key handler: browsers need a user action.',
            },
            {
              name: 'input',
              type: 'ReactElement',
              required: true,
              description: 'The hidden file input. Render it once, anywhere near the trigger.',
            },
          ]}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Keyboard &amp; screen reader</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>The button is the control: Tab reaches it, and Enter or Space opens the picker.</li>
          <li>
            The input is hidden from everyone ({code('hidden')}, {code('aria-hidden')}, out of the
            tab order), so nothing is announced twice.
          </li>
          <li>
            Put it inside a {code('TooltipTrigger')}: the tooltip keeps working. To stop it, disable
            the button.
          </li>
        </ul>
      </section>
    </>
  );
}
