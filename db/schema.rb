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

ActiveRecord::Schema[8.0].define(version: 2025_10_22_120511) do
  create_table "ingredient_groups", force: :cascade do |t|
    t.integer "recipe_id", null: false
    t.string "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["recipe_id"], name: "index_ingredient_groups_on_recipe_id"
  end

  create_table "ingredients", force: :cascade do |t|
    t.integer "ingredient_group_id", null: false
    t.string "text", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["ingredient_group_id"], name: "index_ingredients_on_ingredient_group_id"
  end

  create_table "recipes", force: :cascade do |t|
    t.string "title", null: false
    t.string "servings"
    t.integer "prep_time_mins"
    t.integer "cook_time_mins"
    t.string "source"
    t.text "notes"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "status", default: 0, null: false
  end

  create_table "steps", force: :cascade do |t|
    t.integer "recipe_id", null: false
    t.string "description", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["recipe_id"], name: "index_steps_on_recipe_id"
  end

  add_foreign_key "ingredient_groups", "recipes"
  add_foreign_key "ingredients", "ingredient_groups"
  add_foreign_key "steps", "recipes"
end
