class Recipe < ApplicationRecord
  has_many :ingredient_groups, dependent: :destroy
  has_many :steps, dependent: :destroy

  accepts_nested_attributes_for :ingredient_groups, allow_destroy: true, reject_if: :all_blank
  accepts_nested_attributes_for :steps, allow_destroy: true, reject_if: :all_blank

  enum :status, {draft: 0, published: 1}

  validates :title, presence: true
  validates :cook_time_mins, numericality: {greater_than: 0}, allow_nil: true
  validates :prep_time_mins, numericality: {greater_than: 0}, allow_nil: true
  validates :servings, numericality: {greater_than: 0}, allow_nil: true
end
