class RecipesController < ApplicationController
  before_action :set_recipe, only: [:show, :edit, :update]

  def index
    @recipes = Recipe.all
  end

  def new
    @recipe = Recipe.new

    # Build a main ingredient group with a few empty ingredients
    ingredient_group = @recipe.ingredient_groups.build(name: "main")
    3.times { ingredient_group.ingredients.build }

    # Build a few empty steps
    3.times { @recipe.steps.build }
  end

  def create
    @recipe = Recipe.new(recipe_params)
    @recipe.status = :published

    if @recipe.save
      redirect_to @recipe
    else
      render :new
    end
  end

  def show
  end

  private

  def set_recipe
    @recipe = Recipe.find(params[:id])
  end

  def recipe_params
    params.require(:recipe).permit(
      :title, :servings, :prep_time_mins, :cook_time_mins, :source, :status,
      ingredient_groups_attributes: [:id, :name, :_destroy, ingredients_attributes: [:id, :text, :_destroy]],
      steps_attributes: [:id, :description, :_destroy]
    )
  end
end
