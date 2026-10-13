import { HookTable } from '../../components/hook-table';
import { InlineCode } from '../../components/inline-code';
import { PropsList } from '../../components/props-list';
import {
  readComponentPropsSafe,
  readHookDocSafe,
  type ComponentPropsFile,
  type HookDocFile,
} from '../../lib/component-props';
import { GUIDE_API } from './guide-api-data';

/**
 * A guide page's API reference: the props tables of the components it covers and the tables
 * of its hooks, generated from the library's types like a component page's API tab. A Server
 * Component.
 */
export async function GuideApiReference({ path }: { path: string }) {
  const api = GUIDE_API[path];
  if (!api) return null;
  const [components, hooks] = await Promise.all([
    Promise.all(api.components.map((name) => readComponentPropsSafe(name))),
    Promise.all(api.hooks.map((name) => readHookDocSafe(name))),
  ]);
  return (
    <section className="flex flex-col gap-6">
      <h2 id="api-reference" className="text-headline-small text-on-surface">
        API reference
      </h2>
      {components
        .filter((json): json is ComponentPropsFile => json !== null && json.props.length > 0)
        .map((json) => (
          <div key={json.displayName} className="flex flex-col gap-3">
            <h3 className="text-title-medium text-on-surface">
              <InlineCode dir="ltr">{json.displayName}</InlineCode>
            </h3>
            <PropsList caption={`${json.displayName} props`} rows={json.props} />
          </div>
        ))}
      {hooks
        .filter((doc): doc is HookDocFile => doc !== null)
        .map((doc) => (
          <HookTable key={doc.displayName} doc={doc} />
        ))}
    </section>
  );
}
