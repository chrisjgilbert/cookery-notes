class IngredientGroup < ApplicationRecord
  belongs_to :recipe
  has_many :ingredients, dependent: :destroy

  accepts_nested_attributes_for :ingredients, allow_destroy: true, reject_if: :all_blank
end
