import React from 'react';

/**
 * SelectOption Props
 */
export interface SelectOptionProps extends React.OptionHTMLAttributes<HTMLOptionElement> {
  /** Option value */
  value: string | number;
  /** Option display text */
  children: React.ReactNode;
  /** Whether the option is disabled */
  disabled?: boolean;
}

/**
 * SelectOption Component
 *
 * A wrapper around the native `<option>` element for use with Designsystemet's Select.
 * Provides a typed interface for select options.
 *
 * @example
 * ```tsx
 * import { Select, SelectOption } from '@xalatechnologies/platform/ui';
 *
 * function MyComponent() {
 *   return (
 *     <Select label="Choose an option" onChange={handleChange}>
 *       <SelectOption value="">Select...</SelectOption>
 *       <SelectOption value="option1">Option 1</SelectOption>
 *       <SelectOption value="option2">Option 2</SelectOption>
 *       <SelectOption value="option3" disabled>Option 3 (disabled)</SelectOption>
 *     </Select>
 *   );
 * }
 * ```
 */
export const SelectOption: React.FC<SelectOptionProps> = ({
  value,
  children,
  disabled,
  ...props
}) => {
  return (
    <option value={value} disabled={disabled} {...props}>
      {children}
    </option>
  );
};

SelectOption.displayName = 'SelectOption';

export default SelectOption;
