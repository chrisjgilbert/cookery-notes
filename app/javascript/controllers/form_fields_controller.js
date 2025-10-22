import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["ingredientsContainer", "stepsContainer"]
  static values = { 
    ingredientCount: Number, 
    stepCount: Number
  }

  connect() {
    this.ingredientCountValue = this.countExistingIngredients()
    this.stepCountValue = this.countExistingSteps()
    this.setupEventListeners()
  }

  countExistingIngredients() {
    return this.ingredientsContainerTarget.querySelectorAll('[data-ingredient]').length
  }

  countExistingSteps() {
    return this.stepsContainerTarget.querySelectorAll('[data-step]').length
  }

  setupEventListeners() {
    // Add ingredient button
    const addIngredientBtn = document.getElementById('add-ingredient')
    if (addIngredientBtn) {
      addIngredientBtn.addEventListener('click', () => this.addIngredient())
    }

    // Add step button
    const addStepBtn = document.getElementById('add-step')
    if (addStepBtn) {
      addStepBtn.addEventListener('click', () => this.addStep())
    }

    // Remove buttons (event delegation)
    this.element.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-ingredient')) {
        this.removeIngredient(e)
      } else if (e.target.classList.contains('remove-step')) {
        this.removeStep(e)
      }
    })
  }

  addIngredient() {
    const template = document.querySelector('.ingredient-template')
    const newIngredient = template.cloneNode(true)
    newIngredient.classList.remove('ingredient-template', 'hidden')
    
    // Update the input name with the correct index
    const input = newIngredient.querySelector('input')
    input.name = input.name.replace('INDEX', this.ingredientCountValue)
    
    // Find the ingredient group container
    const groupContainer = this.ingredientsContainerTarget.querySelector('[data-ingredient-group]')
    groupContainer.appendChild(newIngredient)
    
    this.ingredientCountValue++
  }

  addStep() {
    const template = document.querySelector('.step-template')
    const newStep = template.cloneNode(true)
    newStep.classList.remove('step-template', 'hidden')
    
    // Update the textarea name with the correct index
    const textarea = newStep.querySelector('textarea')
    textarea.name = textarea.name.replace('INDEX', this.stepCountValue)
    
    this.stepsContainerTarget.appendChild(newStep)
    this.stepCountValue++
    this.updateStepNumbers()
  }

  removeIngredient(event) {
    event.preventDefault()
    const ingredientDiv = event.target.closest('[data-ingredient]')
    ingredientDiv.remove()
  }

  removeStep(event) {
    event.preventDefault()
    const stepDiv = event.target.closest('[data-step]')
    stepDiv.remove()
    this.updateStepNumbers()
  }

  updateStepNumbers() {
    const steps = this.stepsContainerTarget.querySelectorAll('[data-step]')
    steps.forEach((step, index) => {
      const numberSpan = step.querySelector('.step-number')
      if (numberSpan) {
        numberSpan.textContent = index + 1
      }
    })
  }
}