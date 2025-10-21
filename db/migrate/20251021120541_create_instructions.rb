class CreateInstructions < ActiveRecord::Migration[8.0]
  def change
    create_table :instructions do |t|
      t.references :recipe_part, null: false, foreign_key: true
      t.text :text, null: false
      t.integer :order, null: false

      t.timestamps
    end
  end
end
