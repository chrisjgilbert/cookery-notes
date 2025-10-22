class CreateIngredientGroups < ActiveRecord::Migration[8.0]
  def change
    create_table :ingredient_groups do |t|
      t.references :recipe, null: false, foreign_key: true
      t.string :name, null: false

      t.timestamps
    end
  end
end
