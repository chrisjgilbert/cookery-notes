# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_10_21_120541) do
  create_table "ingredients", force: :cascade do |t|
    t.integer "recipe_part_id", null: false
    t.string "name", null: false
    t.string "quantity"
    t.string "unit"
    t.string "notes"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["recipe_part_id"], name: "index_ingredients_on_recipe_part_id"
  end

  create_table "instructions", force: :cascade do |t|
    t.integer "recipe_part_id", null: false
    t.text "text", null: false
    t.integer "order", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["recipe_part_id"], name: "index_instructions_on_recipe_part_id"
  end

  create_table "recipe_parts", force: :cascade do |t|
    t.integer "recipe_id", null: false
    t.string "title", null: false
    t.integer "prep_time_mins"
    t.integer "cook_time_mins"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["recipe_id"], name: "index_recipe_parts_on_recipe_id"
  end

  create_table "recipes", force: :cascade do |t|
    t.string "title", null: false
    t.string "servings"
    t.integer "prep_time_mins"
    t.integer "cook_time_mins"
    t.string "description"
    t.string "source_url"
    t.string "source_name"
    t.text "notes"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_foreign_key "ingredients", "recipe_parts"
  add_foreign_key "instructions", "recipe_parts"
  add_foreign_key "recipe_parts", "recipes"
end
