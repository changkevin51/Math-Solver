function SpawnElement(caller) {
	var element = document.getElementById("custom_amount");
	if (caller.id != "option4") {
		element.style.display = "none";
		element.required = false;
	}
	else {
		element.style.display = "block";
		element.required = true;
	}
}
function DropDownText(string) {
	var element = document.getElementById("dropdownMenu1");
	if (string == "male")
		element.textContent = "Male";
	else if (string == "female")
		element.textContent = "Female";
	else
		element.textContent = "Prefer not to answer";
}