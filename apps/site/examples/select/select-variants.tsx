'use client';

import { Select, SelectItem, SelectSection } from '@windmorph/react';

/**
 * Filled (the default) and outlined, as Text field: a placeholder, sections with headings,
 * a trailing count, a required field with its error, and a disabled one.
 */
export function SelectVariants() {
  return (
    <div className="grid gap-6 medium:grid-cols-2">
      {(['filled', 'outlined'] as const).map((variant) => (
        <div key={variant} className="flex flex-col gap-6">
          <Select variant={variant} label="Category" placeholder="Any category">
            <SelectSection title="Food">
              <SelectItem key="noodles" trailing="64">
                Noodles and soup
              </SelectItem>
              <SelectItem key="sandwiches" trailing="31">
                Sandwiches
              </SelectItem>
            </SelectSection>
            <SelectSection title="Services">
              <SelectItem key="nails" trailing="128">
                Nails and beauty
              </SelectItem>
              <SelectItem key="tax" trailing="42">
                Tax and accounting
              </SelectItem>
            </SelectSection>
          </Select>
          <Select
            variant={variant}
            label="Currency"
            required
            invalid
            errorMessage="Choose a currency"
          >
            <SelectItem key="GBP">Pound sterling (£)</SelectItem>
            <SelectItem key="USD">US dollar ($)</SelectItem>
            <SelectItem key="AUD">Australian dollar (A$)</SelectItem>
            <SelectItem key="EUR">Euro (€)</SelectItem>
          </Select>
          <Select variant={variant} label="Currency" defaultValue="GBP" disabled>
            <SelectItem key="GBP">Pound sterling (£)</SelectItem>
          </Select>
        </div>
      ))}
    </div>
  );
}
