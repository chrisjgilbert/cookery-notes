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
end
