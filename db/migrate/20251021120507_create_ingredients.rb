class CreateIngredients < ActiveRecord::Migration[8.0]
  def change
    create_table :ingredients do |t|
      t.references :ingredient_group, null: false, foreign_key: true
      t.string :text, null: false

      t.timestamps
    end
  end
end
