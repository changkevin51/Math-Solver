function SolveQEquation() {
    var a = document.getElementById("a").value;
    var b = document.getElementById("b").value;
    var c = document.getElementById("c").value;
    var resultElement = document.getElementById("calculation_placeholder");
    if (a == 0) {
        resultElement.innerHTML = "x = " + (-c/b).toFixed(5);
	}
    else if (Math.pow(b, 2) - 4 * a * c < 0) {
        var real = -b / (2 * a);
        var imag = Math.sqrt(-Math.pow(b, 2) + 4 * a * c) / (2 * a);
        resultElement.innerHTML = "x<sub>1</sub> = " + real.toFixed(5) + " + " + imag.toFixed(5) + "i" +
            "    x<sub>2</sub> = " + real.toFixed(5) + " - " + imag.toFixed(5) + "i";
    }
    else if (Math.pow(b, 2) - 4 * a * c == 0) {
        resultElement.innerHTML = "x<sub>1</sub> = x<sub>2</sub> = " + (-b / (2 * a)).toFixed(5);
	}
    else {
        var x1 = (-b + Math.sqrt(Math.pow(b, 2) - 4 * a * c)) / (2 * a);
        var x2 = (-b - Math.sqrt(Math.pow(b, 2) - 4 * a * c)) / (2 * a);
        resultElement.innerHTML = "x<sub>1</sub> = " + x1.toFixed(5) + "    x<sub>2</sub> = " + x2.toFixed(5);
	}
}
function Toggle(element) {
    document.getElementById('div0').style.display = 'none';
    document.getElementById('div1').style.display = 'none';
    document.getElementById('div2').style.display = 'none';
    document.getElementById('div3').style.display = 'none';
    var x = document.getElementById(element);
    if (x.style.display === "block")
        x.style.display = "none";
    else
        x.style.display = "block";
}
function SetDimension(element, targetID) {
    var target = document.getElementById(targetID);
    target.value = element.value;
}
function GenerateMatrices() {
    var Acols = parseInt(document.getElementById("A_cols").value);
    var Arows = parseInt(document.getElementById("A_rows").value);
    var Bcols = parseInt(document.getElementById("B_cols").value);
    var Brows = parseInt(document.getElementById("B_rows").value);
    p = document.getElementById("matrix_placeholder");
    var string = "<span>A = </span><table>";
    for (var i = 0; i < Acols; i++) {
        string += "<tr>";
        for (var j = 0; j < Arows; j++) {
            string += "<td><input type='number'class='matrix' id='Ainput_" + i*Arows + j + "'/></td>";
        }
        string += "</tr>";
	}
    string += "</table ><br/><br/>";
    string += "<span>B = </span><table>";
    for (var i = 0; i < Bcols; i++) {
        string += "<tr>";
        for (var j = 0; j < Brows; j++) {
            string += "<td><input type='number'class='matrix' id='Binput_" + i*Brows + j + "'/></td>";
        }
        string += "</tr>";
    }
    string += "</table >";
    p.innerHTML = string;
}
function Calculate() {
    var Acols = parseInt(document.getElementById("A_cols").value);
    var Arows = parseInt(document.getElementById("A_rows").value);
    var Bcols = parseInt(document.getElementById("B_cols").value);
    var Brows = parseInt(document.getElementById("B_rows").value);
    var p = document.getElementById("solution_placeholder");
    var A = new Array();
    var B = new Array();
    for (var i = 0; i < Acols; i++)
        for (var j = 0; j < Arows; j++) {
            if (document.getElementById("Ainput_" + i * Arows + j).value == "") {
                alert("Please, fill the matrix first!");
                return;
			}
            A.push(document.getElementById("Ainput_" + i * Arows + j).value);
		}
    for (var i = 0; i < Bcols; i++)
        for (var j = 0; j < Brows; j++) {
            if (document.getElementById("Binput_" + i * Brows + j).value == "") {
                alert("Please, fill all the cells of a matrix first!");
                return;
            }
            B.push(document.getElementById("Binput_" + i * Brows + j).value);
		}
    //matrix multiplication
    var C = new Array();
    for (i = 0; i < Acols; i++)
        for (j = 0; j < Brows; j++) {
            C[i * Brows + j] = 0;
            for (k = 0; k < Arows; k++)
                C[i*Brows + j] += A[i*Arows + k] * B[k*Brows + j];
		}
    var string = "<br/><span>A x B = </span><table>";
    for (var i = 0; i < Acols; i++) {
        string += "<tr>";
        for (var j = 0; j < Brows; j++) {
            string += "<td><input type='number'class='matrix' value='"+C[i*Brows + j]+"' disabled/></td>";
        }
        string += "</tr>";
    }
    string += "</table>";
    p.innerHTML = string;
}
function CalculateSum() {
    var input = document.getElementById("equation_input").value;
    var upper = parseInt(document.getElementById("upper_limit").value);
    var lower = parseInt(document.getElementById("lower_limit").value);
    var p = document.getElementById("sum_result");
    if (lower > upper) {
        var temp = lower;
        lower= upper;
        upper= temp;
    }
    input = input.toLowerCase();
    input = input.replace(/x/g, 'i');
    var sum = 0;
    for (var i = lower; i <= upper; i++) {
		try {
            sum += parseFloat(eval(input));
        } catch (e) {
            alert("Invalid expression, unable to evaulate!");
            return;
        }
    }
    p.innerHTML = "Result: " + sum;
}