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

  def edit
    # Ensure there's a main ingredient group if none exist
    if @recipe.ingredient_groups.empty?
      ingredient_group = @recipe.ingredient_groups.build(name: "main")
      3.times { ingredient_group.ingredients.build }
    else
      # Build a few extra ingredient fields for existing groups
      @recipe.ingredient_groups.each do |group|
        2.times { group.ingredients.build }
      end
    end

    # Build a few extra steps if needed
    if @recipe.steps.empty?
      3.times { @recipe.steps.build }
    else
      2.times { @recipe.steps.build }
    end
  end

  def update
    if @recipe.update(recipe_params)
      redirect_to @recipe
    else
      render :edit
    end
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
