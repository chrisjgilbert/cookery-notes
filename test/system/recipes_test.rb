require "application_system_test_case"

class RecipesTest < ApplicationSystemTestCase
  test "visiting the index" do
    visit recipes_url

    assert_selector "h1", text: "Cookery Notes"
    assert_selector "p", text: "Your personal recipe collection"
  end
end
