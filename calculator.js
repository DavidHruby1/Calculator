//
// Variables
//
const numberButtons = Array.from(document.querySelectorAll(".btn.number"));
const basicOperatorButtons = Array.from(document.querySelectorAll(".btn.operator"));
const specOperatorButtons = Array.from(document.querySelectorAll(".btn.spec"));
const logicButtons = Array.from(document.querySelectorAll(".btn.logic"));
const equalsButton = document.getElementById("buttonEq");
const output = document.getElementById("outputContainer");
const suboutput = document.getElementById("outputSubContainer");
let memory = 0;
let buffer = [];
let currentFontSize = 36; 
let flag = 0;
const OUTPUT_MAX_LENGTH = 42;
const BASIC_OPERATORS = ["+", "-", "*", "/", "="];
const SPECIAL_OPERATORS = {
    "x²" : (value) => `${value}^2`,
    "√" : (value => `sqrt(${value})`),
    "e" : "2.718281828459045",
    "π" : "3.141592653589793",
};

//
// Functions
//
function numClick(event) {
    const button = event.currentTarget;
    
    const isDecimal = button.classList.contains("decimal");
    const isSuboutputEmpty = suboutput.innerHTML === "";

    if (output.innerHTML.length >= OUTPUT_MAX_LENGTH) return;

    // Flag check - If the result is being shown and I start typing, the numbers will overwrite the result
    if (flag > 0) {
        if (isDecimal) {
            if (!isSuboutputEmpty) resetCalculator();
            output.innerHTML = "0.";
        } 
        else {
            if (!isSuboutputEmpty) resetCalculator();
            addNumberToOutput(button, outputEmpty = true);
        }
        flag = 0;
    } 
    else if (isDecimal) {   
        handleDecimal(button);
    }
    else {
        handleInteger(button);
    }

    checkOutputLength();
}

function handleInteger(button) {
    if (output.innerHTML === "0") {
        addNumberToOutput(button, outputEmpty = true);
    }
    else if (output.innerHTML !== "0" && !output.innerHTML.includes(".")) {
        addNumberToOutput(button);
        numSpacing(output.innerHTML);
    }
    else {
        addNumberToOutput(button);
    }
}

function handleDecimal(button) {
    const outputHasDecimal = output.innerHTML.includes(".");

    if (outputHasDecimal) return;

    if (output.innerHTML === "") {
        output.innerHTML = "0" + button.innerHTML
    }
    else {
        addNumberToOutput(button)
    }
}

function resetCalculator() {
    buffer.length = 0;
    suboutput.innerHTML = "";
    output.innerHTML = "0";
}

function addNumberToOutput(pressedButton, outputEmpty = false) {
    output.innerHTML = outputEmpty ? pressedButton.innerHTML : output.innerHTML + pressedButton.innerHTML;
}

// + - * /
function basicOperatorClick(event) {
    const button = event.currentTarget;
    const bufferLastElement = buffer.length > 0 && buffer[buffer.length - 1]; // If the buffer is not empty, assign the last number or false
    let cleanedOutput = output.innerHTML.replace(/\s+/g, "");
    flag = 0; // Reseting the flag

    const isOperatorLastElement = bufferLastElement && bufferLastElement.includes("=");
    const isOutputEmpty = output.innerHTML === "";
    const isOutputDecimal = output.innerHTML.includes(".");
    const isOutputExpRoot = output.innerHTML.includes("sqrt") || output.innerHTML.includes("^2");

    if (currentFontSize < 36) resetFontSize();

    if (isOutputEmpty && isOperatorLastElement) {
        switchOperator(button, bufferLastElement);
        suboutput.innerHTML = suboutput.innerHTML.slice(0, -1) + button.innerHTML;
    } 
    else if (!isOutputEmpty && isOperatorLastElement) {
        cleanedOutput = !cleanedOutput.includes(".") ? parseInt(cleanedOutput) : parseFloat(cleanedOutput);
        buffer = [cleanedOutput, button.innerHTML];
        suboutput.innerHTML = cleanedOutput + button.innerHTML;
        output.innerHTML = "";
    } 
    else {
        if (isOutputDecimal) {
            buffer.push(parseFloat(cleanedOutput), button.innerHTML);
        } 
        else if (!isOutputDecimal && !isOutputExpRoot) {
            buffer.push(parseInt(cleanedOutput), button.innerHTML);
        }
        else { // Output obsahuje ExpRoot 
            buffer.push(cleanedOutput, button.innerHTML);
        }

        suboutput.innerHTML += cleanedOutput + button.innerHTML; 
        output.innerHTML = "";
    }
    console.log(buffer);
}

function switchOperator(button, bufferLastElement) {
    if (button.innerHTML === bufferLastElement) return;
    
    buffer.pop();
    buffer.push(button.innerHTML);
}

function equalsClick(event) {
    const button = event.currentTarget;
    const bufferLastElement = buffer[buffer.length - 1];
    const suboutputLastElement = suboutput.innerHTML[suboutput.innerHTML.length - 1];
    let cleanedOutput = output.innerHTML.replace(/\s+/g, ""); // Removes every whitespace

    const isOutputExpRoot = output.innerHTML.includes("^2") || output.innerHTML.includes("sqrt");
    const isOutputEmpty = output.innerHTML === "";

    if (handleDivisionByZero(output, suboutputLastElement)) return; // If you divide by 0 this function activates and returns

    if (bufferLastElement === "=") {
        if (isOutputExpRoot) {
            buffer.length = 0;
            buffer.push(cleanedOutput, button.innerHTML); 
        }
        else if (!isOutputEmpty && typeof buffer[0] === "string") {
            cleanedOutput = !cleanedOutput.includes(".") ? parseInt(cleanedOutput) : parseFloat(cleanedOutput);
            buffer = [cleanedOutput, "="];
        }
        else if (!isOutputEmpty) { // If I click on "=" right after I clicked on it ->
            if (buffer[0] == output.innerHTML) return; // If I press one number and repeatedly click on "=", it ignores

            const [x, y] = buffer.slice(-3, -1); // Getting 2 last numbers without "="
            cleanedOutput = !cleanedOutput.includes(".") ? parseInt(cleanedOutput) : parseFloat(cleanedOutput);
            buffer = [cleanedOutput, x, y, "="];
        }
    }
    else if (isOutputExpRoot) {
        buffer.push(cleanedOutput, button.innerHTML);
    }
    else if (isOutputEmpty) {
        switchOperator(button, bufferLastElement);
    }
    else if (!isOutputEmpty) {
        cleanedOutput = !cleanedOutput.includes(".") ? parseInt(cleanedOutput) : parseFloat(cleanedOutput);
        buffer.push(cleanedOutput, button.innerHTML);
    }
    console.log(buffer);
    getResult();
    checkOutputLength();
}

function getResult() {
    let calculation = math.evaluate(buffer.join("").slice(0, -1)); 
    let result = numSpaceResult(calculation); // Formatting the result
    output.innerHTML = result; 
    suboutput.innerHTML = buffer.join("");
    flag++;
    resetFontSize();
}

function handleDivisionByZero(output, suboutputLastElement) {
    if (output.innerHTML === "0" && suboutputLastElement === "/") {
        output.innerHTML = "Can not divide by zero!";
        suboutput.innerHTML = "";
        buffer.length = 0;
        flag++;
        return true;
    }
    return false;
}

// Functions for square root, squaring and constants
function specOperatorClick(event) {
    const button = event.currentTarget;

    const isOutputEmpty = output.innerHTML === "";
    const hasOutputExpRoot = output.innerHTML.includes("^2") || output.innerHTML.includes("sqrt");

    // Maximum length check - It prevents from pressing "√" or "^2" when the number on the display is too long
    if (output.innerHTML.length >= OUTPUT_MAX_LENGTH - 2) return;

    // Making sure to forbid using "√" or "^2" when the display is empty
    if (["x²", "√"].includes(button.innerHTML) && !isOutputEmpty && !hasOutputExpRoot) {
        output.innerHTML = SPECIAL_OPERATORS[button.innerHTML](output.innerHTML);
    }
    else if (["e", "π"].includes(button.innerHTML) && !hasOutputExpRoot) {
        if (suboutput.innerHTML.includes("=")) suboutput.innerHTML = "";
        output.innerHTML = SPECIAL_OPERATORS[button.innerHTML];
    }

    flag++;
    checkOutputLength();
}

function logicClick(event) {
    const button = event.currentTarget;
    const cleanedOutput = output.innerHTML.replace(/\s+/g, "");

    const isOutputZero = output.innerHTML === "0";
    const isOutputEmpty = output.innerHTML === "";
    const isOutputDecimal = output.innerHTML.includes(".");

    if (button.innerHTML === "CE" && !isOutputZero) {
        if (output.innerHTML.includes("^2")) {
            output.innerHTML = output.innerHTML.split("^")[0];
        }
        else if (output.innerHTML === "sqrt(") { 
            output.innerHTML = "";
        }
        else {
            output.innerHTML = output.innerHTML.slice(0, -1);
        }
        numSpacing(output.innerHTML); // Checking whitespaces when deleting numbers
    }
    else if (button.innerHTML === "C") {
        resetCalculator();
        resetFontSize();
    }
    else if (button.innerHTML === "MS" && !isOutputEmpty && memory != cleanedOutput) {
        memory = isOutputDecimal ? parseFloat(cleanedOutput) : parseInt(cleanedOutput);
        flag++; // Incrementing flag so if I save number to the memory it resets the display after pressing a number
    } 
    else if (button.innerHTML === "MC" && memory !== 0) {
        memory = 0;
    }
    else if (button.innerHTML === "MRC" && memory !== 0 && memory != cleanedOutput) {
        if (suboutput.innerHTML.includes("=")) suboutput.innerHTML = "";
        output.innerHTML = String(memory);
        flag++;
    }
}

function checkOutputLength() {
    const maxwidth = output.offsetWidth - 10;
    const text = output.innerHTML;
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d");
    context.font = `${currentFontSize}px 'roboto flex'`;
    let textWidth = context.measureText(text).width;

    const hasOutputExpRoot = output.innerHTML.includes("sqrt") || output.innerHTML.includes("^2");

    if (output.innerHTML.length < 1) resetFontSize(); // Make sure that font is always set to default

    if (textWidth > maxwidth) {
        if (hasOutputExpRoot) { // Making font even samller then normal after using special operators to make sure it fits
            currentFontSize -= 8;
            output.style.fontSize = currentFontSize;
        } else {
            currentFontSize -= 2;
            output.style.fontSize = currentFontSize;
        }
    }
}

function resetFontSize() {
    currentFontSize = 36;
    output.style.fontSize = currentFontSize;
}

// Function for creating a whitespace after every third number
function numSpacing(string) {
    let counter = 0;
    const cleanedString = string.replace(/\s+/g, ""); 
    
    const formattedString = cleanedString
        .split("")
        .reverse()
        .map(digit => (counter === 3 ? (counter = 1, digit + " ") : (counter++, digit))) // If the counter is 3, set it to 1 and add a whitespace, otherwise icnrement the counhter by 1 
        .reverse()
        .join("");
    
    output.innerHTML = formattedString;
}

// Function for formatting the result
function numSpaceResult(result) {
    let counter = 0;
    const stringResult = String(result);

    // If the result is decimal it splits the result and the part that is not decimal will have whitespaces
    if (stringResult.includes(".")) {
        const [integerPart, decimalPart] = stringResult.split(".");

        let formattedString = integerPart
            .split("")
            .reverse()
            .map(digit => (counter === 3 ? (counter = 1, digit + " ") : (counter++, digit)))
            .reverse()
            .join("");

        formattedString += "." + decimalPart; 
        return formattedString;
    }

    const formattedString = stringResult
        .split("")
        .reverse()
        .map(digit => (counter === 3 ? (counter = 1, digit + " ") : (counter++, digit)))
        .reverse()
        .join("");

    return formattedString;
}

//
// Events 
//
numberButtons.forEach(button => {
    button.addEventListener("click", numClick);
});

basicOperatorButtons.forEach(button => {
    button.addEventListener("click", basicOperatorClick);
});

equalsButton.addEventListener("click", equalsClick);

logicButtons.forEach(button => {
    button.addEventListener("click", logicClick);
});

specOperatorButtons.forEach(button => {
    button.addEventListener("click", specOperatorClick);
});
