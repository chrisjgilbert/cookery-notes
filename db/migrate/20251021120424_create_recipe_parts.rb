class CreateRecipeParts < ActiveRecord::Migration[8.0]
  def change
    create_table :recipe_parts do |t|
      t.references :recipe, null: false, foreign_key: true
      t.string :title, null: false
      t.integer :prep_time_mins
      t.integer :cook_time_mins

      t.timestamps
    end
  end
end
