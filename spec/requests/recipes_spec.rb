require "rails_helper"

RSpec.describe "Recipes", type: :request do
  before do
    ENV["APP_PASSWORD_HASH"] = nil
    ENV["APP_PASSWORD"] = "letmein"
    post "/login", params: { password: "letmein" }
  end

  def sample_attrs(overrides = {})
    {
      title: "Sample",
      ingredients: [{ name: "salt" }],
      instructions: [{ step: 1, text: "cook" }],
      tags: ["quick"],
    }.merge(overrides)
  end

  it "lists recipes" do
    Recipe.create!(sample_attrs)
    get "/"
    expect(response).to be_successful
    expect(response.body).to include("Recipes/Index")
    expect(response.body).to include("Sample")
  end

  it "creates a recipe" do
    expect {
      post "/recipes", params: { recipe: sample_attrs(title: "New") }
    }.to change(Recipe, :count).by(1)
    expect(response).to redirect_to(recipe_path(Recipe.last))
  end

  it "updates a recipe" do
    recipe = Recipe.create!(sample_attrs)
    patch "/recipes/#{recipe.id}", params: { recipe: { title: "Renamed" } }
    expect(recipe.reload.title).to eq("Renamed")
  end

  it "deletes a recipe" do
    recipe = Recipe.create!(sample_attrs)
    expect { delete "/recipes/#{recipe.id}" }.to change(Recipe, :count).by(-1)
    expect(response).to redirect_to("/")
  end
end
