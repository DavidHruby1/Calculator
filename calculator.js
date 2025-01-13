// - BUG: Lze zmáčknout několikrát ^2 a sqrt()

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

//
// Functions
//
function numClick(event) {
    const button = event.currentTarget;
    const bufferLastElement = buffer[buffer.length - 1];

    // Kontrola, jestli délka čísel na displeji nedosahuje maxima - pokud ano, tak neumožní dál psát    
    if (output.innerHTML.length === 42) {
        return;
    }

    // Kontrola flagu - pokud je zobrazen výsledek a začnu psát čísla, tak ho přepíšou
    if (flag > 0) {
        if (button.classList.contains("decimal")) {
            suboutput.innerHTML = "";
            output.innerHTML = "0" + button.innerHTML;
        } else {
            suboutput.innerHTML = "";
            buffer.length = 0;
            addNumberToOutput(button, outputEmpty = true);
        }
        flag = 0;
    } else if (!button.classList.contains("decimal")) { // Když zmáčknuté tlačítko není des. tečka  
        if (output.innerHTML === "0") { // Počáteční stav displeje
            addNumberToOutput(button, outputEmpty = true);
        } else if (output.innerHTML !== "0" && !output.innerHTML.includes(".")) { // Displej není 0 a není des. tečka v čísle
            addNumberToOutput(button);
            numSpacing(output.innerHTML); 
        } else { // Pokud zmáčknu číslo a už jsem napsal des. tečku, tak se přestává aplikovat numSpacing()
            addNumberToOutput(button);
        }
    } else { // zmáčknu des. tečku
        if (output.innerHTML.includes(".")) {
            return; // Vyskočí z funkce, když je des. tečka v čísle a zmáčkne se znovu
        } else if (output.innerHTML === "") { 
            output.innerHTML += "0" + button.innerHTML; // Přidá automaticky 0 před des. tečku, když je prázdný output.innerHTML a na konci bufferu je operator
        } else {
            addNumberToOutput(button); // Des. tečka se pouze přidá a už se neaplikuje numSpacing()
        }
    }

    checkLength();
}

// Funkce na přidání čísla do outputu
function addNumberToOutput(pressedButton, outputEmpty = false) {
    output.innerHTML = outputEmpty ? pressedButton.innerHTML : output.innerHTML + pressedButton.innerHTML;
}

// Stisknutí základního operátoru, což je pro mě +, -, *, /
function basicOperatorClick(event) {
    const button = event.currentTarget;
    const bufferLastElement = buffer[buffer.length - 1];
    const cleanedOutput = output.innerHTML.replace(/\s+/g, "");
    flag = 0; // Flag nastavuji na 0, aby se po zmáčknutí "=" a následného použití operátoru nevymazaly všechny buffery

    // Pokud dosáhnu limitu displeje, tak je fontSize 18px - tímto ho vyresetujina výchozí 36px
    if (currentFontSize < 36) {
        resetFontSize();
    }

    // Pokud je displej prázdný a v bufferu je poslední operátor
    if (output.innerHTML === "" && ["+", "-", "*", "/"].includes(bufferLastElement)) {
        // Když operátor, který zmáčknu je stejný jako ten poslední v bufferu, tak skončí, protože nechci zbytečně provádět pop a push 
        if (button.innerHTML === bufferLastElement) {
            return;
        }
        // V jiném případě se v bufferu poseldní operátor změní na toho, který se stiskne
        buffer.pop();
        buffer.push(button.innerHTML);
        suboutput.innerHTML = suboutput.innerHTML.slice(0, -1) + button.innerHTML;
    } else if (buffer.includes("=") && output.innerHTML.length > 0) {
        buffer = [cleanedOutput, button.innerHTML];
        suboutput.innerHTML = cleanedOutput + button.innerHTML;
        output.innerHTML = "";
    } else {
        // Když je des. tečka na displeji a zmáčknu operátor, tak se do bufferu přidá číslo jako float
        if (output.innerHTML.includes(".")) {
            buffer.push(parseFloat(cleanedOutput), button.innerHTML);
        } else if (output.innerHTML.includes("^2") || output.innerHTML.includes("sqrt")) { // Pokud output obsahuje ^2 nebo sqrt
            buffer.push(cleanedOutput, button.innerHTML);
        } else { // V opačném případě se přidá jako numbe
            buffer.push(parseInt(cleanedOutput), button.innerHTML);
        }

        suboutput.innerHTML += cleanedOutput + button.innerHTML; // Update displeje bufferu
        output.innerHTML = "";
    }
}

// Funkce na zpracování tlačítka "rovná se" =
function equalsClick(event) {
    const button = event.currentTarget;
    const bufferLastElement = buffer[buffer.length - 1];
    let cleanedOutput = output.innerHTML.replace(/\s+/g, ""); // Odstranění všech mezer
    let calculation = 0;
    let result = 0;

    if (currentFontSize < 18) {
        resetFontSize();
    }

    // Když buffer obsahuje =
    if (bufferLastElement === "=" && (output.innerHTML.includes("^2") || output.innerHTML.includes("sqrt"))) { 
        buffer.length = 0;
        buffer.push(cleanedOutput, button.innerHTML); 
    } else if (bufferLastElement === "=" && output.innerHTML.length > 0) { // Pokud zmačknu "=" hned po tom, co jsem ho dal a dostal výsledek
        const lastTwo = buffer.slice(-3, -1); // Získám dva poslední prvky z bufferu bez "="
        cleanedOutput = !cleanedOutput.includes(".") ? parseInt(cleanedOutput) : parseFloat(cleanedOutput);
        buffer = [cleanedOutput, lastTwo[0], lastTwo[1], "="];
    } else if (output.innerHTML.includes("^2") || output.innerHTML.includes("sqrt")) {
        buffer.push(cleanedOutput, button.innerHTML);
    } else if (output.innerHTML === "") {
        buffer.pop(); // Znamená to, že poslední je operátor, který bude vyhozen a nahrazen "=" 
        buffer.push(button.innerHTML);
    } else if (output.innerHTML !== "") {
        cleanedOutput = !cleanedOutput.includes(".") ? parseInt(cleanedOutput) : parseFloat(cleanedOutput);
        buffer.push(cleanedOutput, button.innerHTML);
    }

    suboutput.innerHTML = buffer.join(""); // Zobrazení bufferu v suboutputu
    calculation = math.evaluate(buffer.join("").slice(0, -1)); // Provedení výpočtu z bufferu 
    result = numSpaceResult(calculation); // Naformátování výsledku
    output.innerHTML = result; // Update displeje
    flag++;
    currentFontSize = 36;
    output.style.fontSize = currentFontSize;

    checkLength();
}

// Funkce na mocniny, odmocniny a konstanty
function specOperatorClick(event) {
    const button = event.currentTarget;

    // Kontrola, aby nešlo zadávat tyto operátory u extrémně velkých čísel, protože se to nevejde na displej a už nechci znovu zmenšovat font
    if (output.innerHTML.length > 40) {
        return;
    }

    // flag zde inkrementuji, abych mohl ve funkci numClick poznat, jestli byl stisknut před tím spec. oper. nebo ne
    // u mocnin zaručuji podmínkami, že nepůjdou zmáčknout, když je prázdný displej
    if (button.innerHTML === "x²" && output.innerHTML !== "" && output.innerHTML !== "0" && !output.innerHTML.includes("^2")) {
        output.innerHTML += "^2";
        flag++;
    } else if (button.innerHTML === "√" && output.innerHTML !== "" && output.innerHTML !== "0" && !output.innerHTML.includes("sqrt")) {
        const tempValue = output.innerHTML;
        output.innerHTML = "sqrt(" + tempValue + ")";
        flag++;
    } else if (button.innerHTML === "e") {
        if (suboutput.innerHTML.includes("=")) { // Ošetření, že pokud jsem dostal výsledek a zmáčknu konstantu, tak vše přepíše a vymaže suboutput
            output.innerHTML = "2.718281828459045";
            suboutput.innerHTML = "";
        } else { // V jiném případě (když je v suboutputu číslo a "+" třeba), tak se přepíše jen displej
            output.innerHTML = "2.718281828459045"
        }
        flag++;
    } else if (button.innerHTML === "π") {
        if (suboutput.innerHTML === "=") { 
            output.innerHTML = "3.141592653589793";
            suboutput.innerHTML = "";
        } else {
            output.innerHTML = "3.141592653589793";
        }
        flag++;
    }

    checkLength();
}

// Funkce pro tlačítka, co operují s pamětí a tlačítka na mazání
function logicClick(event) {
    const button = event.currentTarget;
    const cleanedOutput = output.innerHTML.replace(/\s+/g, ""); // Odstranění všech mezer

    if (button.innerHTML === "CE" && output.innerHTML !== "0") {
        if (output.innerHTML.includes("^2")) { // Pokud zmáčknu CE a na displeji je mocnina na druhou
            output.innerHTML = output.innerHTML.split("^")[0]; // Tak se output rozdělí v "^" a vypíše se jen první půlka
        } else if (output.innerHTML === "sqrt(") { // Pokud je na displeji odmocnina
            output.innerHTML = "";
        } else {
            output.innerHTML = output.innerHTML.slice(0, -1);
        }
        numSpacing(output.innerHTML);
    } else if (button.innerHTML === "C") {
        output.innerHTML = "0";
        suboutput.innerHTML = "";
        buffer.length = 0;
        resetFontSize();
    } else if (button.innerHTML === "MS" && output.innerHTML !== "" && memory != cleanedOutput) {
        if (output.innerHTML.includes(".")) {
            memory = parseFloat(cleanedOutput);
        } else {
            memory = parseInt(cleanedOutput);
        }
        flag++; // flag přidávám, protože když po uložení zmáčknu číslo -> output se vyresetuje
    } else if (button.innerHTML === "MC" && memory !== 0) {
        memory = 0;
    } else if (button.innerHTML === "MRC" && memory !== 0 && memory != cleanedOutput) {
        if (suboutput.innerHTML.includes("=")) {
            suboutput.innerHTML = "";
            output.innerHTML = String(memory);
        } else {
            output.innerHTML = String(memory);
        }
        flag++;
    }
}

function checkLength() {
    const maxwidth = output.offsetWidth - 10;
    const text = output.innerHTML;
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d");

    context.font = `${currentFontSize}px 'roboto flex'`;
    let textWidth = context.measureText(text).width;

    if (output.innerHTML.length < 1) {
        resetFontSize();
    }

    if (textWidth > maxwidth) {
        if (output.innerHTML.includes("sqrt") || output.innerHTML.includes("^2")) { // Pokud přidám spec. oper., tak se font zmenší více, aby se to vešlo na displej
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
        const stringResultSplit = stringResult.split(".");

        let formattedString = stringResultSplit[0]
            .split("")
            .reverse()
            .map(digit => (counter === 3 ? (counter = 1, digit + " ") : (counter++, digit))) // když counter je 3, tak ho nastav na 1 a přidej mezeru, jinak zvyš counter o 1 
            .reverse()
            .join("");

        formattedString += "." + stringResultSplit[1]; // Nakonec připojí k upravené celé části zbytek
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
