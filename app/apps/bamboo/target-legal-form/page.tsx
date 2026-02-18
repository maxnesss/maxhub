import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { requireAppRead } from "@/lib/authz";

const ADVANTAGES = [
  "Your personal risk is lower than with sole trade (you separate private and company business).",
  "It looks more professional to suppliers, landlords, and partners.",
  "You can run it with 1 person and add a second owner later.",
  "It is easier to grow, hire, or bring in a partner in the future.",
  "Good fit if you want a stable long-term company, not a temporary setup.",
];

const DISADVANTAGES = [
  "Setup is slower and more expensive than being a sole trader.",
  "You must keep proper accounting and regular admin.",
  "Some company details are public in the commercial register.",
  "You need help from an accountant (and sometimes legal support).",
];

const COMPANY_STRUCTURE = [
  {
    title: "Owner",
    points: [
      "Single-owner setup: one person owns 100% of the company.",
      "Owner usually also leads key business decisions.",
      "Keep role boundaries clear between owner and daily operations.",
    ],
  },
  {
    title: "Simple decision rules",
    points: [
      "In a one-person company: you decide everything.",
      "Document important decisions in one place for clarity.",
      "Use simple routine: decision -> note -> next action.",
    ],
  },
  {
    title: "Managing director (jednatel)",
    points: [
      "This person can legally sign and act for the company.",
      "For a small company, usually one director is enough.",
      "If there are two directors, define if they sign alone or together.",
    ],
  },
];

const DECISIONS = [
  "Confirm single owner with 100% share.",
  "Who is the managing director.",
  "How signing works (in most cases one signature).",
  "How much starting capital you want to show (legal minimum vs credibility).",
  "Who handles accounting, tax deadlines, and monthly admin.",
];

const MONEY_RULES = [
  "Company bank account is only for company income and expenses.",
  "Do not pay private spending directly from company account.",
  "Pay yourself through a clear legal method and keep documents for each payout.",
  "Set one monthly money routine with your accountant (salary/fees/tax reserve).",
];

const OWNER_PAYOUT_OPTIONS = [
  {
    title: "Salary as managing director/employee",
    details:
      "Regular monthly income, predictable, but includes payroll taxes and contributions.",
  },
  {
    title: "Profit distribution (dividend)",
    details:
      "Paid from after-tax profit, usually after annual accounts are closed and approved.",
  },
  {
    title: "Reimbursement of business expenses",
    details:
      "If you paid a true company expense privately, company can reimburse you with receipt support.",
  },
  {
    title: "Loan repayment (if you lent money to company)",
    details:
      "Company can return the loan principal based on loan agreement and accounting records.",
  },
];

const TAX_STRATEGY_STEPS = [
  "Set a small fixed monthly owner pay for baseline personal cashflow.",
  "Keep most profit in company during the year (do not withdraw randomly).",
  "After year-end close, take larger payout from approved post-tax profit (dividend).",
  "Use reimbursements only for real company expenses with receipts.",
];

const TAX_REFERENCE_POINTS = [
  "Corporate income tax (s.r.o.) standard rate: 21%.",
  "Typical withholding on dividend/profit share: 15% (standard case).",
  "Combined tax on distributed profit is roughly 32.85% (21% CIT + 15% on remaining amount).",
];

export default async function BambooTargetLegalFormPage() {
  await requireAppRead("BAMBOO");

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      <TopNav current="apps" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <Breadcrumbs
          items={[
            { label: "Apps", href: "/apps" },
            { label: "Bamboo", href: "/apps/bamboo" },
            { label: "Company setup", href: "/apps/bamboo/company-setup" },
            { label: "Target legal form and structure" },
          ]}
        />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
          Target legal form and structure
        </h1>
        <p className="mt-4 max-w-3xl text-(--text-muted)">
          Simple practical guide for a small single-owner company: what s.r.o. means,
          when it helps, and which decisions matter most at the start.
        </p>
      </section>

      <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">What is s.r.o.?</h2>
        <p className="mt-3 text-sm leading-6 text-[#314567]">
          s.r.o. is a Czech limited company. The company is a separate legal entity,
          so business contracts, invoices, and operations are done by the company, not
          by you as a private person.
        </p>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-(--line) bg-white p-6">
          <h2 className="text-xl font-semibold tracking-tight text-[#162947]">Advantages</h2>
          <ul className="mt-4 space-y-2">
            {ADVANTAGES.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-[#314567]">
                <span className="mt-1 h-2 w-2 rounded-full bg-[#8fb6ff]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-(--line) bg-white p-6">
          <h2 className="text-xl font-semibold tracking-tight text-[#162947]">Disadvantages</h2>
          <ul className="mt-4 space-y-2">
            {DISADVANTAGES.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-[#314567]">
                <span className="mt-1 h-2 w-2 rounded-full bg-[#f1a6a6]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">Company structure</h2>
        <p className="mt-2 text-sm text-(--text-muted)">
          Keep this lightweight for a one-owner setup.
        </p>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {COMPANY_STRUCTURE.map((group) => (
            <article key={group.title} className="rounded-xl border border-[#e3eaf7] bg-[#fbfdff] p-4">
              <h3 className="text-lg font-semibold text-[#1a2b49]">{group.title}</h3>
              <ul className="mt-3 space-y-2">
                {group.points.map((point) => (
                  <li key={point} className="flex items-start gap-2 text-sm text-[#314567]">
                    <span className="mt-1 h-2 w-2 rounded-full bg-[#8fb6ff]" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">
          Most important startup decisions
        </h2>
        <p className="mt-2 text-sm text-(--text-muted)">
          If you set these clearly, operations become much easier.
        </p>
        <ul className="mt-4 space-y-2">
          {DECISIONS.map((item) => (
            <li key={item} className="rounded-lg border border-[#e3eaf7] bg-[#fbfdff] px-3 py-2 text-sm text-[#1a2b49]">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">
          Company money vs private money
        </h2>
        <p className="mt-2 text-sm text-(--text-muted)">
          For a one-owner s.r.o., this is one of the most important habits.
        </p>

        <ul className="mt-4 space-y-2">
          {MONEY_RULES.map((item) => (
            <li key={item} className="rounded-lg border border-[#e3eaf7] bg-[#fbfdff] px-3 py-2 text-sm text-[#1a2b49]">
              {item}
            </li>
          ))}
        </ul>

        <h3 className="mt-6 text-xl font-semibold tracking-tight text-[#162947]">
          How to get money from company to owner
        </h3>
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          {OWNER_PAYOUT_OPTIONS.map((item) => (
            <article key={item.title} className="rounded-xl border border-[#e3eaf7] bg-[#fbfdff] p-4">
              <h4 className="text-sm font-semibold text-[#1a2b49]">{item.title}</h4>
              <p className="mt-2 text-sm text-[#314567]">{item.details}</p>
            </article>
          ))}
        </div>

        <p className="mt-4 rounded-lg border border-[#f0cbc1] bg-[#fff4f1] px-3 py-2 text-sm text-[#9a4934]">
          Practical rule: never transfer money to yourself without a clear accounting reason.
          Confirm your payout method with your accountant before first transfer.
        </p>
      </section>

      <section className="mt-6 rounded-2xl border border-(--line) bg-white p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">
          Practical tax-wise strategy (single owner)
        </h2>
        <p className="mt-2 text-sm text-(--text-muted)">
          Simple default setup many small s.r.o. founders use.
        </p>

        <ul className="mt-4 space-y-2">
          {TAX_STRATEGY_STEPS.map((item) => (
            <li key={item} className="rounded-lg border border-[#e3eaf7] bg-[#fbfdff] px-3 py-2 text-sm text-[#1a2b49]">
              {item}
            </li>
          ))}
        </ul>

        <h3 className="mt-6 text-xl font-semibold tracking-tight text-[#162947]">
          Reference rates (check each year)
        </h3>
        <ul className="mt-3 space-y-2">
          {TAX_REFERENCE_POINTS.map((item) => (
            <li key={item} className="rounded-lg border border-[#e3eaf7] bg-[#fbfdff] px-3 py-2 text-sm text-[#1a2b49]">
              {item}
            </li>
          ))}
        </ul>

        <p className="mt-4 rounded-lg border border-[#f0cbc1] bg-[#fff4f1] px-3 py-2 text-sm text-[#9a4934]">
          Always confirm the final payout mix and current tax rates with your accountant
          before executing owner payouts.
        </p>
      </section>
    </main>
  );
}
