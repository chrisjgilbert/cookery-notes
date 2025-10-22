require "application_system_test_case"

class RecipesTest < ApplicationSystemTestCase
  test "visiting the index" do
    visit recipes_path

    assert_selector "h1", text: "Cookery Notes"
    assert_selector "p", text: "Your personal recipe collection"
    assert_selector "h2", text: Recipe.first.title
    assert_selector "h2", text: Recipe.last.title
  end

  test "visiting the recipe page from the index" do
    visit recipes_path

    click_on recipes(:roast_chicken_and_gravy).title

    assert_selector "h1", text: recipes(:roast_chicken_and_gravy).title
  end

  test "creating a new recipe through single form" do
    visit recipes_path

    click_on "Add recipe"

    # Fill in recipe details
    fill_in "recipe[title]", with: "Crab Linguine"
    fill_in "recipe[servings]", with: "4"
    fill_in "recipe[prep_time_mins]", with: "10"
    fill_in "recipe[cook_time_mins]", with: "20"
    fill_in "recipe[source]", with: "Rick Stein"

    # Fill in ingredients
    fill_in "recipe[ingredient_groups_attributes][0][ingredients_attributes][0][text]", with: "450g dried linguine or spaghetti"
    fill_in "recipe[ingredient_groups_attributes][0][ingredients_attributes][1][text]", with: "3 vine-ripened tomatoes, skinned, seeded and chopped"
    fill_in "recipe[ingredient_groups_attributes][0][ingredients_attributes][2][text]", with: "300g fresh white crab meat"

    # Fill in cooking steps
    fill_in "recipe[steps_attributes][0][description]", with: "Cook the linguine in a large pot of boiling water until al dente."
    fill_in "recipe[steps_attributes][1][description]", with: "Drain the linguine and set aside."
    fill_in "recipe[steps_attributes][2][description]", with: "Add the tomatoes, crab meat, parsley, lemon juice, olive oil, chilli flakes, garlic and salt and pepper to a large bowl and mix well."

    click_on "Create Recipe"

    # Verify the recipe was created and we're on the show page
    assert_selector "h1", text: "Crab Linguine"
    assert_text "Rick Stein"
    assert_text "450g dried linguine or spaghetti"
    assert_text "3 vine-ripened tomatoes, skinned, seeded and chopped"
    assert_text "300g fresh white crab meat"
    assert_text "Cook the linguine in a large pot of boiling water until al dente."
    assert_text "Drain the linguine and set aside."
    assert_text "Add the tomatoes, crab meat, parsley, lemon juice, olive oil, chilli flakes, garlic and salt and pepper to a large bowl and mix well."
  end
end
