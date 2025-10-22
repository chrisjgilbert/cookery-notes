import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = [
    "ingredientsContainer",
    "stepsContainer",
    "ingredient",
    "step",
    "ingredientTemplate",
    "stepTemplate",
    "ingredientGroup",
    "stepNumber",
  ];
  static values = {
    ingredientCount: Number,
    stepCount: Number,
  };

  connect() {
    this.ingredientCountValue = this.countExistingIngredients();
    this.stepCountValue = this.countExistingSteps();
  }

  countExistingIngredients() {
    return this.ingredientTargets.filter(
      (ingredient) =>
        !ingredient.closest("[data-form-fields-target='ingredientTemplate']")
    ).length;
  }

  countExistingSteps() {
    return this.stepTargets.filter(
      (step) => !step.closest("[data-form-fields-target='stepTemplate']")
    ).length;
  }

  addIngredient() {
    const template = this.ingredientTemplateTarget;
    const newIngredient = template.cloneNode(true);
    newIngredient.classList.remove("hidden");

    // Update the input name with the correct index
    const input = newIngredient.querySelector("input");
    input.name = input.name.replace("INDEX", this.ingredientCountValue);

    // Add to the ingredient group container
    this.ingredientGroupTarget.appendChild(newIngredient);

    this.ingredientCountValue++;
  }

  addStep() {
    const template = this.stepTemplateTarget;
    const newStep = template.cloneNode(true);
    newStep.classList.remove("hidden");

    // Update the textarea name with the correct index
    const textarea = newStep.querySelector("textarea");
    textarea.name = textarea.name.replace("INDEX", this.stepCountValue);

    // Update the step number to the correct value
    const stepNumber = newStep.querySelector(
      "[data-form-fields-target='stepNumber']"
    );
    if (stepNumber) {
      stepNumber.textContent = this.stepCountValue + 1;
    }

    this.stepsContainerTarget.appendChild(newStep);
    this.stepCountValue++;
    this.updateStepNumbers();
  }

  removeIngredient(event) {
    event.preventDefault();
    const ingredientDiv = event.target.closest(
      "[data-form-fields-target='ingredient']"
    );
    ingredientDiv.remove();
  }

  removeStep(event) {
    event.preventDefault();
    const stepDiv = event.target.closest("[data-form-fields-target='step']");
    stepDiv.remove();
    this.updateStepNumbers();
  }

  updateStepNumbers() {
    const actualSteps = this.stepTargets.filter(
      (step) => !step.closest("[data-form-fields-target='stepTemplate']")
    );
    actualSteps.forEach((step, index) => {
      const stepNumber = step.querySelector(
        "[data-form-fields-target='stepNumber']"
      );
      if (stepNumber) {
        stepNumber.textContent = index + 1;
      }
    });
  }
}
