//Requirements:
const minNameLength = 5;
const minSubjectLength = 15;
const minMessageLength = 25;

const field_name_requirement = document.querySelector("label[for=name]~.requirementinfo");
const field_subject_requirement = document.querySelector("label[for=subject]~.requirementinfo");
const field_text_requirement = document.querySelector("label[for=message]~.requirementinfo");
field_name_requirement.innerHTML = `${minNameLength} characters required`;
field_subject_requirement.innerHTML = `${minSubjectLength} characters required`;
field_text_requirement.innerHTML = `${minMessageLength} characters required`;

const field_name = document.querySelector("#name");
const field_email = document.querySelector("#email");
const field_subject = document.querySelector("#subject");
const field_text = document.querySelector("#message");

const contactForm = document.querySelector(".contact_form");
const sendButton = document.querySelector(".form_container button");
// Disable sendButton by default.
sendButton.disabled = true;

const contactModalHTML = document.querySelector(".modal_messagesent");
contactModalHTML.style.display = "none";

const commentsStatus = document.querySelector(".comment_status");
commentsStatus.style.display = "none";

// Functions

async function addComment(name, email, subject, text) {
    const addCommentURL = baseURL + "wp/v2/comments/";
    const bodyJson = JSON.stringify({
        post: 65,
        author_name: name,
        author_email: email,
        content: `<h3>${subject}</h3><p>${text}</p>`,
        status: "approved",
    });
    try {
        const data = await fetch(addCommentURL, {
            method: "post",
            headers: {
                "content-type": "application/json",
                Authorization: "Bearer " + storage.getItem("currentToken"),
            },
            body: bodyJson,
        }).then((response) => {
            if (response.ok === true) {
                displayContactFormModal();
                //reset fields and button on success:
                field_name.value = "";
                field_email.value = "";
                field_subject.value = "";
                field_text.value = "";
                const validationIcons = document.querySelectorAll(".fa-check-circle");
                validationIcons.forEach((icon) => {
                    icon.classList.remove("fa-check-circle");
                });
                sendButton.classList.add("disabledbutton");
                sendButton.disabled = true;
            } else {
                // We use switch to easily add additional error-handling in the future.
                switch (response.status) {
                    case 409:
                        showStatusMessage(true, "Error: Your message already exists. Write something else.");
                        sendButton.innerHTML = "Send";
                        break;

                    default:
                        showStatusMessage(true, "Error: Sending your message failed. Please try again.");
                        sendButton.innerHTML = "Send";
                        break;
                }
            }
        });
    } catch (error) {
        displayContactFormModal(false);
    }
}

// displaying modal when message is successfully sent.
function displayContactFormModal(success = true) {
    toggleSpinnerStatus(false);
    if (success) {
        contactModalHTML.innerHTML = `<div>
        <p>Thank you.</p>
        <p>Your message have now been successfully sent.</p>
        <p class="cta">Go Back</p>
    </div>`;
    } else {
        contactModalHTML.innerHTML = `<div>
        <p style="color: red;">ERROR!</p>
        <p>Try resending the message.</p>
        <p class="cta">Go Back</p>
    </div>`;
    }
    contactModalHTML.style.display = "grid";
    const contactModalButton = document.querySelector(".modal_messagesent .cta");
    contactModalButton.onclick = () => {
        contactModalHTML.style.display = "none";
    };
}

// Eventlisteners:

field_name.addEventListener("input", () => {
    validateName(minNameLength);
    field_name_requirement.innerText = `${minNameLength - field_name.value.trim().length} more characters needed`;
});

field_email.addEventListener("input", () => {
    validateEmailAddress();
});

field_subject.addEventListener("input", () => {
    validateText("subject", minSubjectLength);
    field_subject_requirement.innerText = `${minSubjectLength - field_subject.value.trim().length} more characters needed`;
});
field_text.addEventListener("input", () => {
    validateText("message", minMessageLength);
    field_text_requirement.innerText = `${minMessageLength - field_text.value.trim().length} more characters needed`;
});

contactForm.addEventListener("input", () => {
    checkAllFields(4);
});

sendButton.onclick = (event) => {
    event.preventDefault();
    toggleSpinnerStatus(true);
    const form_name = field_name.value;
    const form_email = field_email.value;
    const form_subject = field_subject.value;
    const form_text = field_text.value;
    addComment(form_name, form_email, form_subject, form_text);
};

// Retrieve token needed to send contact form.
getToken();
