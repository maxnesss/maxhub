import Link from "next/link";

type BreadcrumbItem = {
  label: string;
  href?: string;
  preserveCase?: boolean;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  className?: string;
};

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`text-xs font-semibold tracking-[0.16em] text-[#647494] uppercase ${className ?? ""}`}
    >
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className={`hover:text-[#314970] ${item.preserveCase ? "normal-case" : ""}`}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={`${isLast ? "text-[#3f5275]" : ""} ${item.preserveCase ? "normal-case" : ""}`}
                >
                  {item.label}
                </span>
              )}

              {!isLast ? <span className="text-[#95a4c2]">/</span> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
