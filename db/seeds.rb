# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

Recipe.create(
  title: "Spaghetti Carbonara",
  description: "A classic Italian dish made with spaghetti, eggs, cheese, and bacon.",
  source_url: "https://www.allrecipes.com/recipe/23600/worlds-best-spaghetti-carbonara/",
  source_name: "All Recipes",
  notes: "A classic Italian dish made with spaghetti, eggs, cheese, and bacon."
)

Recipe.create(
  title: "Roast Chicken",
  description: "A classic dish made with a whole chicken roasted in the oven.",
  source_url: "https://www.bbcgoodfood.com/recipes/roast-chicken",
  source_name: "BBC Good Food",
  notes: "A classic dish made with a whole chicken roasted in the oven with herbs and lemon."
)
