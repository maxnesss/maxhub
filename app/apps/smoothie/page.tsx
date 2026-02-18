import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { requireAppRead } from "@/lib/authz";

const SMOOTHIE_RECIPES = [
  {
    name: "Strawberry Banana",
    ingredients: ["1 banana", "1 cup strawberries", "1 cup milk", "1 tsp honey"],
  },
  {
    name: "Mango Pineapple",
    ingredients: ["1 cup mango", "1 cup pineapple", "3/4 cup yogurt", "1/2 cup water"],
  },
  {
    name: "Berry Protein",
    ingredients: ["1 cup mixed berries", "1 scoop vanilla protein", "1 cup almond milk"],
  },
  {
    name: "Green Spinach",
    ingredients: ["1 banana", "1 cup spinach", "1/2 apple", "1 cup coconut water"],
  },
  {
    name: "Peanut Butter Cocoa",
    ingredients: [
      "1 banana",
      "1 tbsp peanut butter",
      "1 tbsp cocoa powder",
      "1 cup milk",
    ],
  },
  {
    name: "Tropical Oat",
    ingredients: ["1/2 cup oats", "1 cup mango", "1 cup orange juice", "1/2 cup yogurt"],
  },
];

export default async function SmoothiePage() {
  await requireAppRead("SMOOTHIE");

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      <TopNav current="apps" />

      <section className="mt-10 rounded-3xl border border-(--line) bg-white p-8 shadow-[0_18px_38px_-30px_rgba(19,33,58,0.45)]">
        <Breadcrumbs
          items={[
            { label: "Apps", href: "/apps" },
            { label: "Smoothie" },
          ]}
        />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#132441]">
          Smoothie recipes
        </h1>
        <p className="mt-4 max-w-3xl text-(--text-muted)">
          Simple recipe list for quick, tasty smoothies. Blend everything with a few
          ice cubes and adjust liquid to your preferred thickness.
        </p>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {SMOOTHIE_RECIPES.map((recipe) => (
          <article
            key={recipe.name}
            className="rounded-2xl border border-(--line) bg-white p-6"
          >
            <h2 className="text-xl font-semibold text-[#162947]">{recipe.name}</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-(--text-muted)">
              {recipe.ingredients.map((ingredient) => (
                <li key={ingredient}>• {ingredient}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </main>
  );
}
