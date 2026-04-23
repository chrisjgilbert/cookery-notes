return unless ENV["E2E_FAKE_SERVICES"] == "1"

Rails.application.config.after_initialize do
  Rails.logger.warn "[e2e] Swapping JinaFetcher + RecipeExtractor with fakes"

  JinaFetcher.define_singleton_method(:call) { |_url| "# fake markdown" }

  RecipeExtractor.define_singleton_method(:call) do |_markdown, source_url: nil|
    {
      "title" => "Playwright Pasta",
      "source_url" => source_url,
      "source_site" => (URI(source_url).host rescue nil),
      "description" => "E2E fake",
      "image_url" => nil,
      "prep_time_minutes" => 5,
      "cook_time_minutes" => 15,
      "total_time_minutes" => 20,
      "servings" => 2,
      "cuisine" => "Italian",
      "course" => "Main",
      "difficulty" => "easy",
      "tags" => ["quick", "italian"],
      "notes" => nil,
      "ingredients" => [{ "name" => "pasta", "quantity" => "200", "unit" => "g", "notes" => nil }],
      "instructions" => [{ "step" => 1, "text" => "Boil pasta." }],
    }
  end
end
