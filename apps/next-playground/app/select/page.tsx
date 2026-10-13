import { SelectForm } from './select-form';

/** A Select and an Autocomplete with values, server-rendered inside a server page. */
export default function SelectPage() {
  return (
    <main className="flex flex-col gap-6 p-6">
      <SelectForm />
    </main>
  );
}
