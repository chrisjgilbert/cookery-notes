require "test_helper"

class RecipeTest < ActiveSupport::TestCase
  test "validates presence of title" do
    recipe = Recipe.new

    assert_not recipe.valid?

    assert_not_nil recipe.errors[:title]
  end

  test "validates numericality of cook time mins" do
    recipe = Recipe.new
    recipe.cook_time_mins = -1

    assert_not recipe.valid?

    assert_not_nil recipe.errors[:cook_time_mins]
  end

  test "validates numericality of prep time mins" do
    recipe = Recipe.new
    recipe.prep_time_mins = -1

    assert_not recipe.valid?

    assert_not_nil recipe.errors[:prep_time_mins]
  end

  test "validates numericality of servings" do
    recipe = Recipe.new
    recipe.servings = -1

    assert_not recipe.valid?

    assert_not_nil recipe.errors[:servings]
  end
end
