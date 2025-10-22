import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = [
    "ingredientsContainer",
    "stepsContainer",
    "ingredient",
    "step",
    "ingredientTemplate",
    "stepTemplate",
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
      (ingredient) => !ingredient.closest(".ingredient-template")
    ).length;
  }

  countExistingSteps() {
    return this.stepTargets.filter((step) => !step.closest(".step-template"))
      .length;
  }

  addIngredient() {
    const template = document.querySelector(".ingredient-template");
    const newIngredient = template.cloneNode(true);
    newIngredient.classList.remove("ingredient-template", "hidden");

    // Update the input name with the correct index
    const input = newIngredient.querySelector("input");
    input.name = input.name.replace("INDEX", this.ingredientCountValue);

    // Find the ingredient group container
    const groupContainer = this.ingredientsContainerTarget.querySelector(
      "[data-ingredient-group]"
    );
    groupContainer.appendChild(newIngredient);

    this.ingredientCountValue++;
  }

  addStep() {
    const template = document.querySelector(".step-template");
    const newStep = template.cloneNode(true);
    newStep.classList.remove("step-template", "hidden");

    // Update the textarea name with the correct index
    const textarea = newStep.querySelector("textarea");
    console.log(this.stepCountValue);
    textarea.name = textarea.name.replace("INDEX", this.stepCountValue);

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
      (step) => !step.closest(".step-template")
    );
    actualSteps.forEach((step, index) => {
      const numberSpan = step.querySelector(".step-number");
      if (numberSpan) {
        numberSpan.textContent = index + 1;
      }
    });
  }
}
