let currentEquation = '';
let raw = '';
let variables = new Set();
let equationHistory = [];
let inSuperscriptMode = false;
let isDecimalFormat = true;  
let currentSolution = null;  
let ggbApp = null;  
const SPECIAL_FUNCTIONS = ['sqrt', 'sin', 'cos', 'tan', 'log', 'ln'];

function loadScript(url, callback) {
    const script = document.createElement('script');
    script.src = url;
    script.onload = callback;
    script.onerror = () => {
        console.error(`Failed to load script: ${url}`);
    };
    document.head.appendChild(script);
   }

document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    loadHistory();
    document.getElementById('toggleFormat').addEventListener('click', toggleSolutionFormat);
    document.getElementById('toggleHistory').addEventListener('click', toggleHistory);
    testMathsteps();
    const params = {
        "appName": "graphing",
        "width": 800,
        "height": 400,
        "showToolBar": false,
        "showAlgebraInput": false,
        "showMenuBar": false,
        "showResetIcon": true,
        "enableLabelDrags": false,
        "enableShiftDragZoom": true,
        "enableRightClick": false,
        "borderColor": null,
        "capturingThreshold": null
    };
    
    ggbApp = new GGBApplet(params, true);
    window.addEventListener("load", function() {
        ggbApp.inject('ggb-element');
    });
});

function initEventListeners() {
    const input = document.getElementById('equationInput');
    const symbolButtons = document.querySelectorAll('.symbol-btn');
    
    input.addEventListener('input', handleInput);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') solveEquation();  
    });
    
    symbolButtons.forEach(btn => {
        btn.addEventListener('click', () => insertSymbol(btn.dataset.value));
    });

    document.querySelector('.solve-btn').addEventListener('click', solveEquation);
}


function handleInput(e) {
    const input = e.target;
    let cursorPos = input.selectionStart;
    let equation = input.value;
    
    let newEquation = "";
    let i = 0;
    let exponentDepth = 0;  
    
    while (i < equation.length) {
        if (equation[i] === "^") {
            newEquation += "^";
            
            if (i + 1 < equation.length && equation[i + 1] === "(") {
                exponentDepth++;
                i++;  
                newEquation += "{";  
            }
        } else if (exponentDepth > 0 && equation[i] === "(") {
            newEquation += "{";
            exponentDepth++;
        } else if (exponentDepth > 0 && equation[i] === ")") {
            newEquation += "}";
            exponentDepth--;
        } else {
            newEquation += equation[i];
        }
        i++;
    }
    
    
    while (exponentDepth > 0) {
        newEquation += "}";
        exponentDepth--;
    }
    
    input.value = newEquation;
    input.setSelectionRange(cursorPos, cursorPos);
    
    currentEquation = input.value;
    raw = equation;
    validateEquation(currentEquation);
    updatePreview(currentEquation);
}



function insertSymbol(symbol) {
    const input = document.getElementById('equationInput');
    const pos = input.selectionStart;
    const newValue = input.value.slice(0, pos) + symbol + input.value.slice(pos);
    input.value = newValue;
    input.setSelectionRange(pos + symbol.length, pos + symbol.length);
    handleInput({ target: input });
    input.focus();
}

function updatePreview(equation) {
    if (!equation) {
        document.getElementById('equationPreview').innerHTML = '';
        return;
    }

    const latex = convertToLatex(equation);
    document.getElementById('equationPreview').innerHTML = `\\[ ${latex} \\]`;
    MathJax.typesetPromise();
}

function convertToLatex(equation) {
    return equation
        .replace(/\*/g, ' \\cdot ')
        .replace(/\^\(/g, '^{')
        .replace(/\)/g, '}')
        .replace(/(sin|cos|tan|log|sqrt|pi)/g, '\\$1')
        .replace(/([+\-*/=])/g, ' $1 ')
        .replace(/\s+/g, ' ')
        .trim();
}



function showVariableModal(variables, equation) {
    const modal = document.getElementById('variableModal');
    const varList = document.getElementById('variableList');
    
    
    varList.innerHTML = '';
    
    
    variables.forEach(variable => {
        const btn = document.createElement('button');
        btn.className = 'variable-btn';
        btn.textContent = `Solve for ${variable}`;
        btn.onclick = () => {
            solveForVariable(equation, variable);
            modal.style.display = 'none';
        };
        varList.appendChild(btn);
    });
    
    modal.style.display = 'block';
    
    
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    };
}

function solveForVariable(equation, variable) {
    try {
        let solution;
        
        
        equation = formatSpecialFunctions(equation);
        
        if (!equation.includes('=')) {
            equation = `${equation} = 0`; 
        }
        
        console.log('Processing equation:', equation);
        
        const [left, right] = equation.split('=');
        const nerdamerEq = `${left}-(${right})`;
        solution = nerdamer.solve(nerdamerEq, variable);

        displaySolution(solution, variable, equation);
        console.log("Nerdamer Solution Output:", solution);

        const evaluatedSolution = nerdamer(solution).evaluate().text();
        console.log("Evaluated Solution:", evaluatedSolution);

    } catch (error) {
        console.error('Solve error:', error);

    }
}

function formatSpecialFunctions(equation) {
    
    SPECIAL_FUNCTIONS.forEach(func => {
        const funcRegex = new RegExp(`${func}(?!\\()([\\d.]+|[a-zA-Z][\\d.]*|\\([^)]+\\))`, 'g');
        equation = equation.replace(funcRegex, `${func}($1)`);
    });
    return equation;
}

function validateEquation(equation) {
    const validationMessage = document.getElementById('validationMessage');
    
    
    const bracketBalance = equation.split('(').length === equation.split(')').length;
    const braceBalance = equation.split('{').length === equation.split('}').length;

    if (!bracketBalance || !braceBalance) {
        validationMessage.textContent = 'Unmatched brackets or braces';
        return false;
    }
ElementInternals
    try {
        
        const parsedEq = equation.replace(/\^{([^}]+)}/g, '^($1)');
        const parsed = math.parse(parsedEq);
        variables.clear();
        parsed.traverse((node) => {
            
            if (node.isSymbolNode && !math[node.name] && !SPECIAL_FUNCTIONS.includes(node.name)) {
                variables.add(node.name);
            }
        });

        validationMessage.textContent = '';
        return true;
    } catch (error) {
        return false;
    }
    
}

function solveEquation() {


    try {
        let equation = currentEquation
            .replace(/\^{([^}]+)}/g, '^($1)') 
            .replace(/\s/g, ''); 

        console.log("Processing:", equation);

        
        if (!equation.includes('=')) {
            try {
                console.log("Evaluating expression...");
                const result = nerdamer(equation).evaluate().text();
                console.log("Expression result:", result);
                displaySolution(result, null, equation);
                return; 
            } catch (expressionError) {

                return; 
            }
        }
        
        
        console.log("Processing equation with '='");
        const vars = new Set();
        equation.replace(/[a-zA-Z]+/g, match => {
            if (!SPECIAL_FUNCTIONS.includes(match)) {
                vars.add(match);
            }
        });

        if (vars.size > 1) {
            showVariableModal(Array.from(vars), equation);
            return;
        }

        solveForVariable(equation, Array.from(vars)[0]);
    } catch (error) {

    }
}


document.getElementById('showSteps').addEventListener('click', () => {
    const stepsDiv = document.getElementById('solutionSteps');
    stepsDiv.innerHTML = window.stepsHtml || '<p>No steps available</p>';
    MathJax.typesetPromise();
});


document.getElementById('equationInput').addEventListener('input', () => {
    setTimeout(() => {
        document.getElementById('showSteps').click();
    }, 800);
});


function generateSolutionSteps(equation, variable) {
    let steps = '';
    try {
        if (equation.includes('=')) {
            
            steps = solveEquationWithSteps(equation, variable);
        } else {
            
            steps = simplifyExpressionWithSteps(equation);
        }
    } catch (error) {
        console.error('Error generating steps:', error);
        steps = '<p>Could not generate step-by-step solution.</p>';
    }
    return steps;
}

function testMathsteps() {
    console.log('Testing mathsteps...');
    
    
    const equation = '2x+3^2=7';
    console.log('Test equation:', equation);
    
    try {
        const steps = mathsteps.solveEquation(equation);
        console.log('Steps:', steps);
        
        steps.forEach((step, index) => {
            console.log(`Step ${index + 1}:`);
            console.log('  Before:', step.oldEquation?.ascii());
            console.log('  After:', step.newEquation?.ascii());
            console.log('  Change:', step.changeType);
        });
    } catch (error) {
        console.error('Mathsteps error:', error);
    }
}

function solveEquationWithSteps(equation, variable) {
    console.log('Input equation:', equation);
    let steps = '<div id="solutionSteps"><h4>Solution Steps:</h4>';

    try {
        equation = equation.replace(/\s/g, '');
        const equationSteps = mathsteps.solveEquation(equation);

        if (!equationSteps || equationSteps.length === 0) {
            steps += '<p>No solution steps available</p></div>';
            return steps;
        }

        function getChangeDescription(changeType) {
            const descriptions = {
                'SIMPLIFY_LEFT_SIDE': 'Simplify the left side of the equation',
                'SIMPLIFY_RIGHT_SIDE': 'Simplify the right side of the equation',
                'SUBTRACT_FROM_BOTH_SIDES': 'Subtract from both sides',
                'ADD_TO_BOTH_SIDES': 'Add to both sides',
                'MULTIPLY_BOTH_SIDES': 'Multiply both sides',
                'DIVIDE_FROM_BOTH_SIDES': 'Divide both sides',
                'SIMPLIFY_ARITHMETIC': 'Simplify arithmetic',
                'COLLECT_LIKE_TERMS': 'Combine like terms',
                'DISTRIBUTE': 'Distribute terms',
                'COMBINE_NUMERATORS': 'Combine numerators',
                'BREAK_UP_FRACTION': 'Break up fraction'
            };
            return descriptions[changeType] || changeType.toLowerCase().replace(/_/g, ' ');
        }

        equationSteps.forEach((step, index) => {
            const after = step.newEquation?.ascii() || '';
            const description = getChangeDescription(step.changeType);
            steps += `
                <div class="step-container">
                    <p><strong>Step ${index + 1}:</strong> \\[ ${after} \\]</p>
                    <p class="step-description">${description}</p>
                </div>
            `;
        });

    } catch (err) {
        console.error('Solve steps error:', err);
        steps += `<p>Error: ${err.message}</p>`;
    }

    steps += '</div>';
    return steps;
}

function simplifyExpressionWithSteps(expression) {
    let steps = '<div id="solutionSteps">';
    steps += '<h4>Evaluation Steps:</h4>';

    try {
        expression = formatSpecialFunctions(expression);
        console.log('Formatted expression:', expression);

        
        steps += `
            <div class="step">
                <div class="step-number">Initial Expression</div>
                <div class="step-math">\\[ ${convertToLatex(expression)} \\]</div>
            </div>`;

        
        const result = nerdamer(expression).evaluate();
        steps += `
            <div class="step">
                <div class="step-number">Result</div>
                <div class="step-math">\\[ ${convertToLatex(result.toString())} \\]</div>
            </div>`;

    } catch (error) {
        console.error('Error in expression evaluation:', error);
        steps += '<p>Could not evaluate expression.</p>';
    }

    steps += '</div>';
    return steps;
}

function formatSolution(solution) {
    if (isDecimalFormat) {
        
        if (solution && solution.text instanceof Function) {
            return solution.text('decimals', 6);
        }
        
        return nerdamer(solution).text('decimals', 6);
    } else {
        return solution.toString();
    }
}

function plotGraph(equation, variable) {
    try {
        
        if (!window.ggbApplet) {
            setTimeout(() => plotGraph(equation, variable), 1000);
            return;
        }

        
        window.ggbApplet.reset();

        if (equation.includes('=')) {
            
            const [left, right] = equation.split('=');
            
            const rearrangedEquation = `${left}-(${right})`;
            window.ggbApplet.evalCommand(`f(x)=${rearrangedEquation}`);
        } else {
            
            const cleanEquation = equation
                .replace(/\^{([^}]+)}/g, '^($1)')  
                .replace(/\*/g, '');  
            window.ggbApplet.evalCommand(`f(x)=${cleanEquation}`);
        }
        
        
        window.ggbApplet.setCoordSystem(-10, 10, -10, 10);
        
        
        if (equation.includes('=')) {
            window.ggbApplet.evalCommand("y=0");
            
            window.ggbApplet.evalCommand("Intersect(f,y=0)");
        }
        
    } catch (error) {
        console.error('GeoGebra plotting error:', error);
        document.getElementById('ggb-element').innerHTML = 
            '<p>Could not generate graph for this equation</p>';
    }
}

function displaySolution(solution, variable = null, originalEquation = null) {
    currentSolution = solution;
    const stepsDiv = document.getElementById('solutionSteps');
    let solutionText;

    
    if (!variable && typeof solution === 'string') {
        solutionText = solution;
        console.log("expression");
    }
    
    else if (solution.symbol && solution.symbol.elements) {
        console.log("equation");

        if (Array.isArray(solution.symbol.elements)) {
            const solutions = solution.symbol.elements.map((elem, i) => 
                variable ? `${variable}_${i+1} = ${formatSolution(elem)}` : formatSolution(elem)
            );
            solutionText = solutions.join(',\\ ');
        } else {
            solutionText = variable ? 
                `${variable} = ${formatSolution(solution)}` : 
                formatSolution(solution);
        }
    }

    
    let stepsHtml = `<p>Input: \\[ ${convertToLatex(originalEquation || currentEquation)} \\]</p>`;
    
    if (variable && originalEquation) {
        stepsHtml += generateSolutionSteps(originalEquation, variable);
    }
    
    stepsHtml += `<p>Final Result: \\[ ${convertToLatex(solutionText)} \\]</p>`;
    
    window.stepsHtml = stepsHtml;
    stepsDiv.innerHTML = '';
    saveToHistory(originalEquation || currentEquation, solutionText);
    MathJax.typesetPromise();
    
    if (variable) {
        plotGraph(originalEquation || currentEquation, variable);
    }

    const stepsdiv = document.getElementById('solutionSteps');
    stepsdiv.innerHTML = window.stepsHtml || '<p>No steps available</p>';
    MathJax.typesetPromise();
}
function saveToHistory(equation, solution) {
    equationHistory.push({ equation, solution, timestamp: new Date() });
    localStorage.setItem('equationHistory', JSON.stringify(equationHistory));
    renderHistory();
}

function loadHistory() {
    const history = localStorage.getItem('equationHistory');
    if (history) equationHistory = JSON.parse(history);
    renderHistory();
}

function renderHistory() {
    const historyContainer = document.createElement('div');
    historyContainer.className = 'equation-history';
    
    const titleDiv = document.createElement('div');
    titleDiv.className = 'history-title';
    titleDiv.innerHTML = `
        <h4>Recent Calculations</h4>
        <span class="history-count">${equationHistory.length} items</span>
    `;
    
    historyContainer.appendChild(titleDiv);
    
    equationHistory.slice(-5).reverse().forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `\\[ ${item.equation} \\] → \\[ ${item.solution} \\]`;
        div.onclick = () => {
            document.getElementById('equationInput').value = item.equation;
            handleInput({ target: document.getElementById('equationInput') });
        };
        historyContainer.appendChild(div);
    });
    
    const existing = document.querySelector('.equation-history');
    if (existing) {
        existing.replaceWith(historyContainer);
    } else {
        document.querySelector('.result-section').appendChild(historyContainer);
    }
    
    MathJax.typesetPromise();
}

function toggleHistory() {
    const historyContainer = document.querySelector('.equation-history');
    if (!historyContainer) {
        renderHistory();
        document.querySelector('.equation-history').classList.add('visible');
    } else {
        historyContainer.classList.toggle('visible');
    }
}

function toggleSolutionFormat() {
    if (!currentSolution) return;
    
    isDecimalFormat = !isDecimalFormat;
    displaySolution(currentSolution, false); 
}

function clearEquation() {
    currentEquation = '';
    variables.clear();
    updateEquationDisplay();
    document.getElementById('solutionSteps').innerHTML = '';
    
    
    if (window.ggbApplet) {
        window.ggbApplet.reset();
    }
}