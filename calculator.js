
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
    console.log(flag);

    // Kontrola flagu - pokud je zobrazen výsledek a začnu psát čísla, tak ho přepíšou
    if (flag > 0) {
        if (isDecimal) {
            if (isSuboutputEmpty) resetCalculator();
            output.innerHTML = "0.";
        } 
        else {
            if (isSuboutputEmpty) resetCalculator();
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
    const cleanedOutput = output.innerHTML.replace(/\s+/g, "");
    const bufferLastElement = buffer.length > 0 && buffer[buffer.length - 1]; // Pokud buffer není prázdný, tak mu přiřaď hodnotu, jinak false
    flag = 0; // Flag nastavuji na 0, aby se po zmáčknutí "=" a následného použití operátoru nevymazaly všechny buffery

    const isOperatorLastElement = bufferLastElement && bufferLastElement.includes("="); // Když proměnná bLE je true, zkontroluj druhou podmínku
    const isOutputEmpty = output.innerHTML === "";
    const isOutputDecimal = output.innerHTML.includes(".");

    if (currentFontSize < 36) resetFontSize();

    if (isOutputEmpty && isOperatorLastElement) {
        switchOperator(button, bufferLastElement);
        suboutput.innerHTML = suboutput.innerHTML.slice(0, -1) + button.innerHTML;
    } 
    else if (!isOutputEmpty && isOperatorLastElement) {
        buffer = [cleanedOutput, button.innerHTML];
        suboutput.innerHTML = cleanedOutput + button.innerHTML;
        output.innerHTML = "";
    } 
    else {
        if (isOutputDecimal) {
            buffer.push(parseFloat(cleanedOutput), button.innerHTML);
        } 
        else if (!isOutputDecimal) {
            buffer.push(parseInt(cleanedOutput), button.innerHTML);
        }
        else { 
            buffer.push(cleanedOutput, button.innerHTML);
        }

        suboutput.innerHTML += cleanedOutput + button.innerHTML; 
        output.innerHTML = "";
    }
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
    let cleanedOutput = output.innerHTML.replace(/\s+/g, ""); // Odstranění všech mezer

    console.log(buffer);

    const isOutputExpRoot = output.innerHTML.includes("^2") || output.innerHTML.includes("sqrt");
    const isOutputEmpty = output.innerHTML === "";

    if (handleDivisionByZero(output, suboutputLastElement)) return; // Pokud se dělí nulou, aktivuje se tato funkce a equalsClick skončí

    if (bufferLastElement === "=") {
        if (flag > 0) {
            flag = 0;
            return;
        }
        else if (isOutputExpRoot) { // Když dostanu výsledek a ten umocním nebo odmocním a dám "=", tak se provede výpočet
            buffer.length = 0;
            buffer.push(cleanedOutput, button.innerHTML); 
        }
        else if (!isOutputEmpty) { // Když zmáčknu "=" hned po tom, co jsem ho dal
            if (buffer[0][0] == output.innerHTML[0]) return; // Oštření proti opakovaným "=", když je jen x^2 v bufferu
            if (buffer[0] == output.innerHTML) return; // Když zmáčknu "=" hned po tom, co jsem ho zmáčkl 

            const [x, y] = buffer.slice(-3, -1); // Získám dva poslední prvky z bufferu bez "="
            cleanedOutput = !cleanedOutput.includes(".") ? parseInt(cleanedOutput) : parseFloat(cleanedOutput);
            buffer = [cleanedOutput, x, y];
        }
    }
    else if (isOutputExpRoot) {
        buffer.push(cleanedOutput, button.innerHTML);
    }
    else if (isOutputEmpty) {
        switchOperator(button, bufferLastElement); // Znamená to, že poslední je operátor, který bude vyhozen a nahrazen "="
    }
    else if (!isOutputEmpty) {
        cleanedOutput = !cleanedOutput.includes(".") ? parseInt(cleanedOutput) : parseFloat(cleanedOutput);
        buffer.push(cleanedOutput, button.innerHTML);
    }

    getResult();
    checkOutputLength();
}

function getResult() {
    let calculation = math.evaluate(buffer.join("").slice(0, -1)); 
    let result = numSpaceResult(calculation); // Naformátování výsledku
    output.innerHTML = result; 
    suboutput.innerHTML = buffer.join("");
    flag++;
    resetFontSize();
}

function handleDivisionByZero(output, suboutputLastElement) {
    if (output.innerHTML === "0" && suboutputLastElement === "/") {
        output.innerHTML = "Nelze dělit nulou!";
        suboutput.innerHTML = "";
        buffer.length = 0;
        flag++;
        return true;
    }
    return false;
}

// Funkce na mocniny, odmocniny a konstanty
function specOperatorClick(event) {
    const button = event.currentTarget;

    const isOutputEmpty = output.innerHTML === "";
    const hasOutputExpRoot = output.innerHTML.includes("^2") || output.innerHTML.includes("sqrt");

    // Kontrola, aby nešlo zadávat tyto operátory u extrémně velkých čísel, protože se to nevejde na displej a už nechci znovu zmenšovat font
    if (output.innerHTML.length >= OUTPUT_MAX_LENGTH - 2) return;

    console.log(1);
    // flag zde inkrementuji, abych mohl ve funkci numClick poznat, jestli byl stisknut před tím spec. oper. nebo ne
    // u mocnin zaručuji podmínkami, že nepůjdou zmáčknout, když je prázdný displej
    if (["x²", "√"].includes(button.innerHTML) && !isOutputEmpty && !hasOutputExpRoot) {
        output.innerHTML = SPECIAL_OPERATORS[button.innerHTML](output.innerHTML);
        flag++;
    }
    else if (["e", "π"].includes(button.innerHTML) && !hasOutputExpRoot) {
        if (suboutput.innerHTML.includes("=")) suboutput.innerHTML = "";
        output.innerHTML = SPECIAL_OPERATORS[button.innerHTML];
        flag++;
    }

    checkOutputLength();
}

function logicClick(event) {
    const button = event.currentTarget;
    const cleanedOutput = output.innerHTML.replace(/\s+/g, ""); // Odstranění všech mezer

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
        numSpacing(output.innerHTML); // Opětovná kontrola mezer při mazání
    }
    else if (button.innerHTML === "C") {
        resetCalculator();
        resetFontSize();
    }
    else if (button.innerHTML === "MS" && !isOutputEmpty && memory != cleanedOutput) {
        memory = isOutputDecimal ? parseFloat(cleanedOutput) : parseInt(cleanedOutput);
        flag++; // flag přidávám, protože když po uložení zmáčknu číslo -> output se vyresetuje
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

    if (output.innerHTML.length < 1) resetFontSize(); // Zajišťuje, že font je vždy výchozí

    if (textWidth > maxwidth) {
        if (hasOutputExpRoot) { // Pokud přidám spec. oper., tak se font zmenší více, aby se to vešlo na displej
            currentFontSize -= 8;
            output.style.fontSize = currentFontSize;
        } else {
            currentFontSize -= 2;
            output.style.fontSize = currentFontSize;
        }
    }
}

// Pomocná funkce, abych nemusel pořád duplikovat kód
function resetFontSize() {
    currentFontSize = 36;
    output.style.fontSize = currentFontSize;
}

// Funkce na tvorbu mezer po třech číslech
function numSpacing(string) {
    let counter = 0; // Pomocná proměnná, díky které poznám, kdy přidat mezeru
    const cleanedString = string.replace(/\s+/g, ""); // Odstranění všech mezer   
    
    const formattedString = cleanedString
        .split("")
        .reverse()
        .map(digit => (counter === 3 ? (counter = 1, digit + " ") : (counter++, digit))) // když counter je 3, tak ho nastav na 1 a přidej mezeru, jinak zvyš counter o 1 
        .reverse()
        .join("");
    
    output.innerHTML = formattedString;
}

// Funkce na formátování výsledku -> Přidání mezer za každou třetí číslici
function numSpaceResult(result) {
    let counter = 0;
    const stringResult = String(result);

    // Pokud výsledek obsahuje des. tečku, tak rozdělí string na dvě části a na celou část použije spacing
    if (stringResult.includes(".")) {
        const [integerPart, decimalPart] = stringResult.split(".");

        let formattedString = integerPart
            .split("")
            .reverse()
            .map(digit => (counter === 3 ? (counter = 1, digit + " ") : (counter++, digit))) // když counter je 3, tak ho nastav na 1 a přidej mezeru, jinak zvyš counter o 1 
            .reverse()
            .join("");

        formattedString += "." + decimalPart; // Nakonec připojí k upravené celé části zbytek
        return formattedString;
    }

    const formattedString = stringResult
        .split("")
        .reverse()
        .map(digit => (counter === 3 ? (counter = 1, digit + " ") : (counter++, digit))) // když counter je 3, tak ho nastav na 1 a přidej mezeru, jinak zvyš counter o 1 
        .reverse()
        .join("");

    return formattedString;
}

//
// Inits & Event listeners
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
