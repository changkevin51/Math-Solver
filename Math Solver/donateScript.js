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
function DropDownText(object) {
	var element = document.getElementById("dropdownMenu1");
	if (object.innerHTML == "Male")
		element.textContent = "Male";
	else if (object.innerHTML == "Female")
		element.textContent = "Female";
	else
		element.textContent = "Prefer not to answer";
}