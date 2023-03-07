// Attributes:
const commentsPerPage = 3;
const minimumCommentLength = 5;
const dateOptions = { year: "numeric", month: "short", day: "numeric" };

// Retrieve the blogpost-ID from URL:
const queryString = document.location.search;
const params = new URLSearchParams(queryString);
const postId = params.get("q");
let postURL = "";
if (postId != 65) {
    postURL = baseURL + "wp/v2/posts/" + postId + "?_embed";
}

const mainContainer = document.querySelector(".post_container");
const asideContainer = document.querySelector(".aside_metadata");
const commentsContainer = document.querySelector(".comments_read");
const commentForm = document.querySelector("#comment_form");
const writeCommentsContainer = document.querySelector("#comment_form");
const commentsStatus = document.querySelector(".comment_status");
const loadMoreButton = document.querySelector(".morecomments .cta");
const sendButton = document.querySelector(".comments_write button");
const field_email = document.querySelector("#email");
const field_text = document.querySelector("#message");
const modalContainer = document.querySelector(".modal_container");
const metaDescription = document.querySelector("head meta[name=description]");

sendButton.disabled = true;
commentsStatus.style.display = "none";
modalContainer.style.display = "none";

// start spinner while loading:
mainContainer.innerHTML = `<i class="fa-solid fa-spinner black"></i>`;

// set the requirement text:
const commentrequirementText = document.querySelector(".message_info .requirementinfo");
commentrequirementText.innerHTML = `${minimumCommentLength} characters required`;

// Functions

// Display the post
function displayBlogPost(postObject) {
    document.title += " " + postObject.title.rendered;
    mainContainer.innerHTML = `
            <h1 class="desktop_title">${postObject.title.rendered}</h1>
            <div>${postObject.content.rendered}</div>`;
    let categoryString = "";
    const postCategories = postObject._embedded["wp:term"][0];
    postCategories.forEach((category, index) => {
        categoryString += category.name.charAt(0).toUpperCase() + category.name.slice(1);
        if (index < postCategories.length - 1) {
            categoryString += ", ";
        }
    });
    let tagsString = "";
    const postTags = postObject._embedded["wp:term"][1];
    postTags.forEach((tag, index) => {
        tagsString += "#" + tag.name.charAt(0).toUpperCase() + tag.name.slice(1);
        if (index < postTags.length - 1) {
            tagsString += ", ";
        }
    });

    let modifiedDateHtml = "";
    if (postObject.date != postObject.modified) {
        modifiedDateHtml = `<p>Post Modified:</p>
        <p>${new Date(postObject.modified).toLocaleDateString("en", dateOptions)}, ${new Date(postObject.modified).toLocaleTimeString()}</p>`;
    }
    metaDescription.content = `Cabin Trips Blog | Title: ${postObject.title.rendered} | Tags: ${tagsString}`;
    // Also builds the meta data for the aside:
    const asideHtml = `
        <h1 class="mobile_title">${postObject.title.rendered}</h1>
    <div>
        <p>Post Published:</p>
        <p>${new Date(postObject.date).toLocaleDateString("en", dateOptions)}, ${new Date(postObject.date).toLocaleTimeString()}</p>
        ${modifiedDateHtml}
        <p>Author:</p>
        <p>${postObject._embedded.author[0].name}</p>
        <p>Categories:</p>
        <p>${categoryString}</p>
        <p>Tags:</p>
        <p>${tagsString}</p>

    </div>`;
    asideContainer.innerHTML = asideHtml;
}

// Display Modal with enlarged media.
function displayModal(media, desc, isVideo = false) {
    modalContainer.style.display = "grid";
    let mediaHtml;
    if (isVideo) {
        mediaHtml = `<video controls="" autoplay src="${media}" alt="Video: ${desc}" aria-label="Video: ${desc}"></video>`;
        const videosToStop = document.querySelectorAll(".wp-block-video video");
        videosToStop.forEach((video) => {
            video.pause();
            // Need to use a timeout, because video is not started yet when we click.
            setTimeout(() => {
                video.pause();
                video.currentTime = 0;
            }, 500);
        });
    } else {
        mediaHtml = `<img src="${media}" alt="Image: ${desc}" aria-label="Image: ${desc}"></img>`;
    }
    modalContainer.innerHTML = `
    <div class="mediamodal">
        ${mediaHtml}
        <p class="imagedesc">${desc}</p>
    </div>`;
    modalContainer.onclick = () => {
        modalContainer.style.display = "none";
        modalContainer.innerHTML = "";
    };
}

// Retrieve comments from the API
async function getComments(page = 1) {
    if (postId == 65) {
        return [];
    }
    const getCommentsUrl = baseURL + "wp/v2/comments?post=" + postId + "&per_page=" + commentsPerPage + "&page=" + page;
    let result;
    try {
        const data = await fetch(getCommentsUrl);
        result = await data.json();
        const totalComments = Number(data.headers.get("X-WP-Total"));
        const totalPages = Number(data.headers.get("X-WP-TotalPages"));
        storage.setItem("currentCommentsCount", totalComments);

        // Hides load-more-button if max is reached:
        if (totalPages <= Number(loadMoreButton.dataset.commentpage)) {
            loadMoreButton.style.display = "none";
        } else {
            loadMoreButton.style.display = "block";
        }
        loadMoreButton.dataset.commentpage = Number(loadMoreButton.dataset.commentpage) + 1;
        return result;
    } catch (error) {
        displayCommentLoadError();
    }
}

// Error handling for comment loading
function displayCommentLoadError() {
    commentsContainer.innerHTML = `<i class="error">Unable to load comments. Please reload the page to try again.</i>`;
    loadMoreButton.style.display = "none";
}

// Display retrieved comments
function displayComments(commentsArr) {
    commentsArr.forEach((comment) => {
        const commentAuthor = comment.author_name;
        const commentTimestamp = new Date(comment.date).toLocaleDateString("en", dateOptions) + ", " + new Date(comment.date).toLocaleTimeString();
        const commentText = comment.content.rendered;
        commentsContainer.innerHTML += `
        <div class="comment">
            <div class="author">
                <p>Author:</p>
                <p>${commentAuthor}</p>
            </div>
            <div class="timestamp">
                <p>When:</p>
                <p>${commentTimestamp}</p>
            </div>
            <div class="text">
                <p>Comment:</p>
                <p>${commentText}</p>
            </div>
        </div>`;
    });
}

// Send a comment to the current blog post
async function sendComment() {
    toggleSpinnerStatus(true, "comment");
    const sendCommentUrl = baseURL + "wp/v2/comments";
    const bodyJson = JSON.stringify({
        post: postId,
        author_name: field_email.value,
        author_email: field_email.value,
        content: field_text.value,
        status: "approved",
    });
    try {
        const data = await fetch(sendCommentUrl, {
            method: "post",
            headers: {
                "content-type": "application/json",
                Authorization: "Bearer " + storage.getItem("currentToken"),
            },
            body: bodyJson,
        }).then((response) => {
            if (response.ok === true) {
                writeCommentsContainer.style.display = "none";
                showStatusMessage(false, "Comment saved. Your post will be visible in a few seconds.");
                findNewComment();
            } else {
                // Use switch to easily add additional error-handling in the future.
                switch (response.status) {
                    case 409:
                        showStatusMessage(true, "Error: Your comment already exists. Write something else.");
                        toggleSpinnerStatus(false, "morecomments");
                        break;

                    default:
                        showStatusMessage(true, "Error: Failed to send comment. Try reloading the page and try again.");
                        toggleSpinnerStatus(false, "morecomments");
                        break;
                }
            }
        });
    } catch (error) {
        showStatusMessage(true, "Error: Failed to send comment. Try reloading the page and try again.");
        toggleSpinnerStatus(false, "morecomments");
    } finally {
        sendButton.innerHTML = "Send";
    }
}

// Find the new comment after sending one:
function findNewComment() {
    const expectedCommentsCount = Number(storage.getItem("currentCommentsCount")) + 1;
    const commentCounter = setInterval(() => {
        loadMoreButton.dataset.commentpage = 1;
        if (expectedCommentsCount > Number(storage.getItem("currentCommentsCount"))) {
            getComments();
        } else {
            getComments().then((comments) => {
                commentsContainer.innerHTML = "";
                displayComments(comments);
            });
            clearInterval(commentCounter);
            writeCommentsContainer.style.display = "grid";
            commentsStatus.style.display = "none";
            field_email.value = "";
            field_text.value = "";
            const emailStatusIcon = document.querySelector("label[for=email]+i");
            const messageStatusIcon = document.querySelector("label[for=message]+i");
            emailStatusIcon.classList.remove("fa-check-circle");
            messageStatusIcon.classList.remove("fa-check-circle");
            commentsStatus.style.display = "none";
        }
    }, 3000);
}

// Eventlisteners:

loadMoreButton.addEventListener("click", () => {
    toggleSpinnerStatus(true, "morecomments");
    const commentPageToLoad = Number(loadMoreButton.dataset.commentpage);
    getComments(commentPageToLoad).then((comments) => {
        toggleSpinnerStatus(false, "morecomments");
        displayComments(comments);
    });
});

sendButton.addEventListener("click", (event) => {
    event.preventDefault();
    sendComment();
});

field_email.addEventListener("input", () => {
    validateEmailAddress();
});

field_text.addEventListener("input", () => {
    validateText("message", minimumCommentLength);
    commentrequirementText.innerText = `${minimumCommentLength - field_text.value.trim().length} more characters needed`;
});

commentForm.addEventListener("input", () => {
    commentsStatus.style.display = "none";
    checkAllFields(2);
});

// Add eventlisteners to buttons inside media
function addClickActionsToMedia() {
    const allPhotos = document.querySelectorAll("figure img");
    const allVideos = document.querySelectorAll("figure video");
    allVideos.forEach((element) => {
        // Disable videocontrols (causing bugs on firefox and iphones without)
        if (element.hasAttribute("controls")) {
            element.setAttribute("autoplay", "true");
            element.removeAttribute("controls");
            element.pause();
        }

        element.addEventListener("click", (event) => {
            const videoUrl = event.target.currentSrc;
            const videoDesc = event.target.nextSibling.innerText;
            displayModal(videoUrl, videoDesc, true);
        });
    });

    allPhotos.forEach((element) => {
        element.addEventListener("click", (event) => {
            const imageDesc = event.target.nextSibling.innerText;
            const imageUrl = event.target.currentSrc;
            displayModal(imageUrl, imageDesc);
        });
    });
}

// Initial Load and display of post and comments
fetchPosts(postURL).then((postData) => {
    if (postData != undefined && postData.id != undefined) {
        displayBlogPost(postData);
        addMediaAttention();
        addClickActionsToMedia();
    } else {
        mainContainer.innerHTML = `<p><i class="error">Failed to load post. Please reload page to try again.</i></p>`;
        asideContainer.innerHTML = `<div><i class="error">Failed to load additional data. Please reload page to try again.</i></div>`;
    }
});

getComments().then((comments) => {
    if (comments != undefined && comments.length != undefined) {
        if (comments.length > 0) {
            commentsContainer.innerHTML = "";
            displayComments(comments);
        }
    } else {
        displayCommentLoadError();
    }
});

// Retrieve token needed to send contact form.
getToken();
