import type { ValueHelpOption } from "@/lib/value-helps";

type ValueHelpSelectProps = {
  name: string;
  defaultValue: string;
  options: ValueHelpOption[];
  className?: string;
};

export function ValueHelpSelect({
  name,
  defaultValue,
  options,
  className,
}: ValueHelpSelectProps) {
  return (
    <select name={name} defaultValue={defaultValue} className={className}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
