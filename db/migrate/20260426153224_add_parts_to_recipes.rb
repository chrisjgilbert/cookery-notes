class AddPartsToRecipes < ActiveRecord::Migration[8.1]
  def change
    add_column :recipes, :parts, :jsonb, null: false, default: []
  end
end
