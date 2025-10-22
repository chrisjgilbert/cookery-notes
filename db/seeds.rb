# Crab Linguine Recipe
crab_linguine = Recipe.create!(
  title: "The Ultimate Crab Linguine",
  servings: "4",
  prep_time_mins: 15,
  cook_time_mins: 15,
  source: "Rick Stein"
)

main_crab_linguine_group = crab_linguine.ingredient_groups.create!(
  recipe: crab_linguine,
  name: "Main"
)

main_crab_linguine_ingredients = [
  "450g dried linguine or spaghetti",
  "3 vine-ripened tomatoes, skinned, seeded and chopped",
  "300g fresh white crab meat",
  "1 tablespoon chopped parsley",
  "1½ tablespoons lemon juice",
  "50ml extra virgin olive oil",
  "Pinch of dried chilli flakes",
  "1 garlic clove, finely chopped",
  "Sea salt and freshly ground black pepper"
]

main_crab_linguine_ingredients.each_with_index do |ingredient_text, index|
  main_crab_linguine_group.ingredients.create!(
    text: ingredient_text
  )
end

crab_linguine.steps.create!(
  description: "Cook the linguine in a large pot of boiling water until al dente."
)

crab_linguine.steps.create!(
  description: "Drain the linguine and set aside."
)

crab_linguine.steps.create!(
  description: "Add the tomatoes, crab meat, parsley, lemon juice, olive oil, chilli flakes, garlic and salt and pepper to a large bowl and mix well."
)

# Roast Chicken and Gravy Recipe
roast_chicken = Recipe.create!(
  title: "Classic Roast Chicken and Gravy",
  servings: "4-6",
  prep_time_mins: 20,
  cook_time_mins: 90,
  source: "Traditional"
)

chicken_group = roast_chicken.ingredient_groups.create!(
  recipe: roast_chicken,
  name: "For the chicken"
)

[
  "1 whole chicken (1.5-2kg)",
  "2 tbsp olive oil",
  "1 lemon, halved",
  "2 sprigs fresh thyme",
  "2 sprigs fresh rosemary",
  "Salt and black pepper"
].each_with_index do |ingredient_text, index|
  chicken_group.ingredients.create!(
    ingredient_group: chicken_group,
    text: ingredient_text
  )
end

gravy_group = roast_chicken.ingredient_groups.create!(
  recipe: roast_chicken,
  name: "For the gravy"
)

[
  "Pan juices from roast chicken",
  "2 tbsp plain flour",
  "500ml chicken stock",
  "1 tbsp butter",
  "Salt and pepper to taste"
].each_with_index do |ingredient_text, index|
  gravy_group.ingredients.create!(
    ingredient_group: gravy_group,
    text: ingredient_text
  )
end
