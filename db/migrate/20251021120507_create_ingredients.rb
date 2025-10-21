class CreateIngredients < ActiveRecord::Migration[8.0]
  def change
    create_table :ingredients do |t|
      t.references :recipe_part, null: false, foreign_key: true
      t.string :name, null: false
      t.string :quantity
      t.string :unit
      t.string :notes

      t.timestamps
    end
  end
end
