class Recipe < ApplicationRecord
  has_many :ingredient_groups, dependent: :destroy
  has_many :steps, dependent: :destroy

  accepts_nested_attributes_for :ingredient_groups, allow_destroy: true, reject_if: :all_blank
  accepts_nested_attributes_for :steps, allow_destroy: true, reject_if: :all_blank

  enum :status, {draft: 0, published: 1}
end
