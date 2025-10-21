class CreateRecipes < ActiveRecord::Migration[8.0]
  def change
    create_table :recipes do |t|
      t.string :title, null: false
      t.string :servings
      t.integer :prep_time_mins
      t.integer :cook_time_mins
      t.string :description
      t.string :source_url
      t.string :source_name
      t.text :notes

      t.timestamps
    end
  end
end
