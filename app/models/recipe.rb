class Recipe < ApplicationRecord
  has_many :ingredient_groups, dependent: :destroy
  has_many :steps, dependent: :destroy
end
