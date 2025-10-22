require "test_helper"

class RecipesControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get recipes_path

    assert_response :success
  end

  test "should show recipe" do
    get recipe_path(recipes(:roast_chicken_and_gravy))

    assert_response :success
  end
end
