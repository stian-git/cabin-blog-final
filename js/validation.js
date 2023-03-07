// Common functions
function validateEmail(email) {
    const regEx = /\S+@\S+\.\S+/;
    const patternMatches = regEx.test(email);
    return patternMatches;
}

function lengthCheck(string, length) {
    if (string.trim().length >= length) {
        return true;
    } else {
        return false;
    }
}

function textOnlyCheck(string) {
    const regEx = /^[a-zA-ZæøåÆØÅ]+(([',. -][a-zA-ZæøåÆØÅ ])?[a-zA-ZæøåÆØÅ]*)*$/;
    const textOnly = regEx.test(string);
    return textOnly;
}

// Name validation
function validateName(length) {
    if (!lengthCheck(field_name.value.trim(), length) || !textOnlyCheck(field_name.value.trim())) {
        toggleValidation("name", false);
    } else {
        toggleValidation("name", true);
    }
}

// Email validation
function validateEmailAddress(event) {
    if (!validateEmail(field_email.value)) {
        toggleValidation("email", false);
    } else {
        toggleValidation("email", true);
    }
}

// Message validation
function validateText(fieldId, length = 25) {
    const fieldToCheck = document.querySelector(`#${fieldId}`);
    if (!lengthCheck(fieldToCheck.value.trim(), length)) {
        toggleValidation(fieldId, false);
    } else {
        toggleValidation(fieldId, true);
    }
}

// All validations calls toggleValidation to show or hide validation info:
function toggleValidation(fieldID, validateSuccess) {
    const requirementText = document.querySelector(`label[for=${fieldID}]~.requirementinfo`);
    const requirementIcon = document.querySelector(`label[for=${fieldID}]+i`);

    if (validateSuccess == false) {
        requirementText.style.display = "inline-block";
        requirementIcon.classList.remove("fa-check-circle");
        requirementIcon.classList.add("fa-exclamation-circle");
    } else {
        requirementText.style.display = "none";
        requirementIcon.classList.remove("fa-exclamation-circle");
        requirementIcon.classList.add("fa-check-circle");
    }
}

// Check all validations and enable submit-button
function checkAllFields(expectedCount) {
    const validationCorrectCount = document.querySelectorAll(".fa-check-circle").length;
    if (validationCorrectCount == expectedCount) {
        sendButton.disabled = false;
        sendButton.classList.add("cta");
        sendButton.classList.remove("disabledbutton");
    } else {
        sendButton.disabled = true;
        sendButton.classList.remove("cta");
        sendButton.classList.add("disabledbutton");
    }
}
