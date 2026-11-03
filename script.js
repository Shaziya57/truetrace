/**
 * Modern Beginner-Friendly Calculator
 *
 * Features:
 * - Basic arithmetic: Addition (+), Subtraction (-), Multiplication (×), Division (÷)
 * - Number inputs: 0-9 and decimal (.)
 * - Clear (C) and Delete (⌫)
 * - Division by zero error handling
 * - Decimal precision handling to prevent floating point quirks (e.g., 0.1 + 0.2 = 0.3)
 * - Responsive UI and Keyboard support
 */

class Calculator {
  constructor(previousOperandElement, currentOperandElement) {
    this.previousOperandElement = previousOperandElement;
    this.currentOperandElement = currentOperandElement;
    this.clear();
  }

  /**
   * Resets calculator to its initial state
   */
  clear() {
    this.currentOperand = '0';
    this.previousOperand = '';
    this.operation = undefined;
    this.isError = false;
    this.justCalculated = false;
  }

  /**
   * Deletes the last character from current input
   */
  delete() {
    if (this.isError) {
      this.clear();
      return;
    }

    if (this.justCalculated) {
      // If user presses delete right after a calculation, reset current to 0
      this.currentOperand = '0';
      this.justCalculated = false;
      return;
    }

    if (this.currentOperand === '0' || this.currentOperand === '') return;

    if (this.currentOperand.length === 1 || (this.currentOperand.length === 2 && this.currentOperand.startsWith('-'))) {
      this.currentOperand = '0';
    } else {
      this.currentOperand = this.currentOperand.slice(0, -1);
    }
  }

  /**
   * Appends a number or decimal point
   */
  appendNumber(number) {
    if (this.isError) {
      this.clear();
    }

    // If starting fresh after pressing equals, overwrite current operand
    if (this.justCalculated) {
      this.currentOperand = number === '.' ? '0.' : number;
      this.justCalculated = false;
      return;
    }

    // Only allow one decimal point
    if (number === '.' && this.currentOperand.includes('.')) return;

    // Prevent multiple leading zeros (e.g., "00")
    if (this.currentOperand === '0' && number !== '.') {
      this.currentOperand = number;
      return;
    }

    // Limit maximum length to prevent overflow
    if (this.currentOperand.replace('-', '').length >= 15) return;

    this.currentOperand = this.currentOperand.toString() + number.toString();
  }

  /**
   * Chooses an operation (+, -, ×, ÷)
   */
  chooseOperation(operation) {
    if (this.isError) return;

    if (this.currentOperand === '' && this.previousOperand === '') return;

    // If operator is chosen right after equals, continue chain using the result
    if (this.justCalculated) {
      this.justCalculated = false;
    }

    // If previous operand already exists and user types another operator, compute first
    if (this.previousOperand !== '' && this.currentOperand !== '') {
      this.compute();
      if (this.isError) return;
    }

    this.operation = operation;
    if (this.currentOperand !== '') {
      this.previousOperand = this.currentOperand;
      this.currentOperand = '';
    }
  }

  /**
   * Computes the result based on operands and selected operator
   */
  compute() {
    if (this.isError) return;
    if (this.operation === undefined || this.previousOperand === '') return;

    // If current operand is empty, default it to previousOperand (e.g. 5 + = 10)
    const prev = parseFloat(this.previousOperand);
    const current = this.currentOperand === '' ? prev : parseFloat(this.currentOperand);

    if (isNaN(prev) || isNaN(current)) return;

    let computation;
    switch (this.operation) {
      case '+':
        computation = prev + current;
        break;
      case '-':
        computation = prev - current;
        break;
      case '×':
      case '*':
        computation = prev * current;
        break;
      case '÷':
      case '/':
        if (current === 0) {
          this.currentOperand = 'Cannot divide by zero';
          this.previousOperand = '';
          this.operation = undefined;
          this.isError = true;
          return;
        }
        computation = prev / current;
        break;
      default:
        return;
    }

    // Format computation result to avoid precision issues like 0.1 + 0.2 = 0.30000000000000004
    this.currentOperand = this.formatCalculationResult(computation);
    this.operation = undefined;
    this.previousOperand = '';
    this.justCalculated = true;
  }

  /**
   * Formats numbers to avoid precision floating point artifacts and limits display digits
   */
  formatCalculationResult(num) {
    if (!isFinite(num)) {
      this.isError = true;
      return 'Error';
    }

    // Round small floating inaccuracies to 10 decimal places max
    const rounded = Number(Math.round(Number(num + 'e+10')) + 'e-10');

    // Check if exponent representation is needed for very large or tiny numbers
    if (Math.abs(rounded) >= 1e14 || (Math.abs(rounded) > 0 && Math.abs(rounded) < 1e-6)) {
      return rounded.toExponential(6).replace(/\+?0*(\d+)$/, '$1');
    }

    return rounded.toString();
  }

  /**
   * Formats numbers with commas for thousands in display
   */
  getDisplayNumber(number) {
    if (this.isError) return number;

    const stringNumber = number.toString();
    const integerDigits = parseFloat(stringNumber.split('.')[0]);
    const decimalDigits = stringNumber.split('.')[1];

    let integerDisplay;
    if (isNaN(integerDigits)) {
      integerDisplay = stringNumber.startsWith('-') ? '-' : '';
    } else {
      integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
    }

    if (decimalDigits != null) {
      return `${integerDisplay}.${decimalDigits}`;
    } else {
      return integerDisplay;
    }
  }

  /**
   * Updates HTML elements with current calculator state
   */
  updateDisplay() {
    if (this.isError) {
      this.currentOperandElement.innerText = this.currentOperand;
      this.currentOperandElement.classList.add('error');
      this.previousOperandElement.innerText = '';
      return;
    }

    this.currentOperandElement.classList.remove('error');

    if (this.currentOperand === '') {
      this.currentOperandElement.innerText = '0';
    } else {
      this.currentOperandElement.innerText = this.getDisplayNumber(this.currentOperand);
    }

    // Dynamically adjust font size if text is long
    const textLen = this.currentOperandElement.innerText.length;
    if (textLen > 11) {
      this.currentOperandElement.style.fontSize = '1.6rem';
    } else if (textLen > 8) {
      this.currentOperandElement.style.fontSize = '1.9rem';
    } else {
      this.currentOperandElement.style.fontSize = '';
    }

    if (this.operation != null && this.previousOperand !== '') {
      this.previousOperandElement.innerText = `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
    } else {
      this.previousOperandElement.innerText = '';
    }
  }
}

// Initialise elements and listeners on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  const previousOperandElement = document.getElementById('previous-operand');
  const currentOperandElement = document.getElementById('current-operand');

  const calculator = new Calculator(previousOperandElement, currentOperandElement);

  // Number & Decimal buttons
  const numberButtons = document.querySelectorAll('[data-number]');
  numberButtons.forEach(button => {
    button.addEventListener('click', () => {
      calculator.appendNumber(button.getAttribute('data-number'));
      calculator.updateDisplay();
    });
  });

  const decimalButton = document.querySelector('[data-action="decimal"]');
  if (decimalButton) {
    decimalButton.addEventListener('click', () => {
      calculator.appendNumber('.');
      calculator.updateDisplay();
    });
  }

  // Operator buttons
  const operatorButtons = document.querySelectorAll('[data-operator]');
  operatorButtons.forEach(button => {
    button.addEventListener('click', () => {
      calculator.chooseOperation(button.getAttribute('data-operator'));
      calculator.updateDisplay();
    });
  });

  // Action buttons
  const clearButton = document.getElementById('btn-clear');
  if (clearButton) {
    clearButton.addEventListener('click', () => {
      calculator.clear();
      calculator.updateDisplay();
    });
  }

  const deleteButton = document.getElementById('btn-delete');
  if (deleteButton) {
    deleteButton.addEventListener('click', () => {
      calculator.delete();
      calculator.updateDisplay();
    });
  }

  const equalsButton = document.getElementById('btn-equals');
  if (equalsButton) {
    equalsButton.addEventListener('click', () => {
      calculator.compute();
      calculator.updateDisplay();
    });
  }

  // Keyboard navigation support
  window.addEventListener('keydown', (e) => {
    let handled = false;

    if ((e.key >= '0' && e.key <= '9')) {
      calculator.appendNumber(e.key);
      highlightButton(`[data-number="${e.key}"]`);
      handled = true;
    } else if (e.key === '.') {
      calculator.appendNumber('.');
      highlightButton('[data-action="decimal"]');
      handled = true;
    } else if (e.key === '+' || e.key === '-') {
      calculator.chooseOperation(e.key);
      highlightButton(`[data-operator="${e.key}"]`);
      handled = true;
    } else if (e.key === '*') {
      calculator.chooseOperation('×');
      highlightButton('[data-operator="×"]');
      handled = true;
    } else if (e.key === '/') {
      e.preventDefault(); // prevent browser quick find
      calculator.chooseOperation('÷');
      highlightButton('[data-operator="÷"]');
      handled = true;
    } else if (e.key === 'Enter' || e.key === '=') {
      e.preventDefault();
      calculator.compute();
      highlightButton('#btn-equals');
      handled = true;
    } else if (e.key === 'Backspace') {
      calculator.delete();
      highlightButton('#btn-delete');
      handled = true;
    } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
      calculator.clear();
      highlightButton('#btn-clear');
      handled = true;
    }

    if (handled) {
      calculator.updateDisplay();
    }
  });

  function highlightButton(selector) {
    const btn = document.querySelector(selector);
    if (btn) {
      btn.classList.add('active');
      setTimeout(() => btn.classList.remove('active'), 150);
    }
  }

  // Expose calculator instance globally for testing convenience
  window.calculator = calculator;
});
