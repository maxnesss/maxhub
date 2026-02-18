import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { requireAppRead } from "@/lib/authz";

const SMOOTHIE_SECTIONS = [
  {
    title: "Fruit (Healthy)",
    description: "Naturally sweet smoothies focused on fruit, fiber, and hydration.",
    recipes: [
      {
        name: "Berry Citrus Boost",
        ingredients: ["1 cup mixed berries", "1/2 orange", "1 cup water", "1 tbsp chia seeds"],
      },
      {
        name: "Tropical Mango Glow",
        ingredients: ["1 cup mango", "1/2 banana", "3/4 cup yogurt", "1/2 cup water"],
      },
      {
        name: "Apple Kiwi Green",
        ingredients: ["1 apple", "1 kiwi", "1 cup spinach", "1 cup coconut water"],
      },
      {
        name: "Pineapple Peach Refresh",
        ingredients: ["1/2 cup pineapple", "1 peach", "3/4 cup water", "1 tsp honey"],
      },
      {
        name: "Blueberry Banana Fiber",
        ingredients: ["1 banana", "3/4 cup blueberries", "1 cup almond milk", "1 tbsp oats"],
      },
      {
        name: "Cherry Oat Recovery",
        ingredients: ["3/4 cup cherries", "1/4 cup oats", "1 cup milk", "1 tsp cinnamon"],
      },
    ],
  },
  {
    title: "Veggie (Healthy)",
    description: "Green and vegetable-forward smoothies with light, clean ingredients.",
    recipes: [
      {
        name: "Spinach Apple Clean",
        ingredients: ["1 cup spinach", "1/2 apple", "1/2 banana", "1 cup water"],
      },
      {
        name: "Kale Pear Hydrate",
        ingredients: ["1 cup kale", "1 pear", "1 cup coconut water", "1 tbsp lemon juice"],
      },
      {
        name: "Cucumber Mint Cooler",
        ingredients: ["1/2 cucumber", "6 mint leaves", "1/2 green apple", "1 cup water"],
      },
      {
        name: "Carrot Orange Ginger",
        ingredients: ["1/2 cup carrot", "1 orange", "1/2 tsp ginger", "3/4 cup water"],
      },
      {
        name: "Beet Berry Balance",
        ingredients: ["1/4 cooked beet", "1/2 cup berries", "1 cup almond milk"],
      },
      {
        name: "Avocado Celery Lime",
        ingredients: ["1/4 avocado", "1 celery stalk", "1 tbsp lime juice", "1 cup water"],
      },
    ],
  },
  {
    title: "Tasty",
    description: "Dessert-style smoothies for flavor first, no healthy rules required.",
    recipes: [
      {
        name: "Chocolate Peanut Swirl",
        ingredients: ["1 banana", "1 tbsp peanut butter", "1 tbsp cocoa", "1 cup milk"],
      },
      {
        name: "Cookies and Cream Shake",
        ingredients: ["3 sandwich cookies", "1/2 cup vanilla ice cream", "3/4 cup milk"],
      },
      {
        name: "Salted Caramel Banana",
        ingredients: ["1 banana", "1 tbsp caramel sauce", "1 cup milk", "pinch of salt"],
      },
      {
        name: "Mocha Oat Blast",
        ingredients: ["1 tsp instant coffee", "1 tbsp cocoa", "1/4 cup oats", "1 cup milk"],
      },
      {
        name: "Strawberry Cheesecake Cup",
        ingredients: ["3/4 cup strawberries", "2 tbsp cream cheese", "1 cup milk"],
      },
      {
        name: "Coconut Vanilla Dream",
        ingredients: ["1/2 cup coconut milk", "1 scoop vanilla ice cream", "1/2 cup milk"],
      },
    ],
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

      <section className="mt-6 space-y-6">
        {SMOOTHIE_SECTIONS.map((section) => (
          <section key={section.title} className="space-y-3">
            <div className="rounded-2xl border border-(--line) bg-white px-5 py-4">
              <h2 className="text-2xl font-semibold tracking-tight text-[#162947]">
                {section.title}
              </h2>
              <p className="mt-1 text-sm text-(--text-muted)">{section.description}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {section.recipes.map((recipe) => (
                <article
                  key={`${section.title}-${recipe.name}`}
                  className="rounded-2xl border border-(--line) bg-white p-6"
                >
                  <h3 className="text-xl font-semibold text-[#162947]">{recipe.name}</h3>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-(--text-muted)">
                    {recipe.ingredients.map((ingredient) => (
                      <li key={ingredient}>• {ingredient}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>
        ))}
      </section>
    </main>
  );
}
