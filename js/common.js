const headerContainer = document.querySelector("header");
const footerContainer = document.querySelector("footer");
const u = "apiuser";
const p = "80mZ 208D b45l 0hGK t0b7 gz3y";
const baseURL = "https://www.tekniskpotet.no/project-exam/wp-json/";

let storage = window.localStorage;

let currentPage = document.location.pathname.replace(/^.*[\\\/]/, "");

// set currentPage to index.html if blank:
if (currentPage == "") {
    currentPage = "index.html";
}

// Retrieve the token
async function getToken() {
    const getTokenURL = baseURL + "jwt-auth/v1/token?username=" + u + "&password=" + p;
    try {
        const data = await fetch(getTokenURL, {
            method: "POST",
        });
        const result = await data.json();
        storage.setItem("currentToken", result.token);
    } catch (error) {
        // Errors caused by an error here are handled in functions that depend on this one.
    }
}

// Create and display the Footer.
function displayFooterHTML() {
    footerContainer.innerHTML = `
    <div>
        <a href="" target="_blank" aria-label="Facebook" title="Facebook-page"><img src="./images/f_logo_RGB-White_58.png" class="some-logo" alt="FaceBook-logo"></a>
        <a href="" target="_blank" aria-label="Instagram" title="Instagram-page"><img src="./images/glyph-logo_May2016-white-small.png" class="some-logo" alt="Instagram-logo" ></a>
    </div>
    <div>Stian Martinsen-Stormyr &copy; 2022</div>`;
}

// Create and display the Header.
function displayHeaderHTML() {
    headerContainer.innerHTML = `
    <div>
        <div class="logo_burger">
            <a href="index.html" aria-label="Logo with link to Home" alt="Logo with link to Home"><img src="./images/logo-orange-small.png" class="image_logo" title="Cabin trips logo" alt="Cabin trips logo"></a>
            <div class="menu" aria-label="Toggle display of main navigation" alt="Toggle main navigation" title="Toggle display of main navigation">
                    <i class="fas fa-bars burgermenu" id="burger"></i>
            </div>
        </div>
        <nav class="top_nav" aria-label="Main navigation">
            <ul>
                <a href="index.html" alt="Home" ><i class="fa-solid fa-house-chimney" aria-label="Home" title="Home"></i><li>Home</li></a>
                <a href="allblogposts.html" alt="Blog"><i class="fa-solid fa-square-pen" aria-label="Blog" title="Blog"></i><li>Blog</li></a>
                <a href="about.html" alt="About"><i class="fa-solid fa-circle-info" aria-label="About" title="About"></i><li>About</li></a>
                <a href="contact.html" alt="Contact"><i class="fa-solid fa-envelope" aria-label="Contact" title="Contact"></i><li>Contact</li></a>
            </ul>
        </nav>
    </div>`;
}

// Adds the .currentPage-class to the current page.
function setCurrentPage() {
    const currentMenuItems = document.querySelectorAll(".top_nav a");
    for (let i = 0; i < currentMenuItems.length; i++) {
        if (currentMenuItems[i].attributes.href.nodeValue == currentPage) {
            currentMenuItems[i].classList.add("currentpage");
            break;
        } else if (currentPage == "blogpost.html") {
            currentMenuItems[1].classList.add("currentpage");
        }
    }
}

// showStatusMessage on some pages.
function showStatusMessage(isError, message) {
    commentsStatus.style.display = "block";
    if (isError) {
        commentsStatus.classList.remove("success");
        setTimeout(() => {
            commentsStatus.style.display = "none";
        }, 10000);
    } else {
        commentsStatus.classList.add("success");
    }
    commentsStatus.innerHTML = `<p>${message}</p>`;
}

// add attention-grabbers on images.
function addMediaAttention() {
    const currentBlogMedia = document.querySelectorAll("figure");
    currentBlogMedia.forEach((element) => {
        if (!element.classList.contains("added_attention")) {
            const postId = element.parentElement.dataset.wpid;
            let mediaIcon = "";
            // In case there are other media types, we just handle the two we know:
            // Other media formats in WP are identified through the classlist.
            if (element.classList.contains("wp-block-video")) {
                mediaIcon = `<i class="fa-solid fa-video" aria-label="Mediatype Video" title="Video"></i>`;
            } else if (element.classList.contains("wp-block-image")) {
                mediaIcon = `<i class="fa-solid fa-camera" aria-label="Mediatype Image" title="Image"></i>`;
            }
            element.classList.add("added_attention");
            switch (currentPage) {
                case "blogpost.html":
                    element.innerHTML += `
                        <div class="enlargercontainer">
                        <div class="circle" alt="Mediatype" title="Mediatype">
                            ${mediaIcon}
                            </div>
                            <div class="circle" alt="Zoomable" title="Zoomable">
                            <i class="fa-solid fa-up-right-and-down-left-from-center" aria-label="Zoomable media"></i>
                            </div>
                        </div>`;
                    break;
                default:
                    element.innerHTML += `
                        <div class="mediaattention">
                            <a href="blogpost.html?q=${postId}">
                                ${mediaIcon}
                            </a>
                        </div>`;
                    break;
            }
        }
    });
    addClickActionsToMediaButtons();
}

// Add eventlisteners to media buttons.
function addClickActionsToMediaButtons() {
    const allEnlargerContainer = document.querySelectorAll(".enlargercontainer");
    allEnlargerContainer.forEach((element) => {
        let parentPath;
        element.addEventListener("click", (event) => {
            switch (event.target.className) {
                case "circle":
                    parentPath = event.target.parentElement.parentElement;
                    break;
                case "enlargercontainer":
                    parentPath = event.target.parentElement;
                    break;
                default:
                    // should be the icon itself.
                    parentPath = event.target.parentElement.parentElement.parentElement;
                    break;
            }

            const mediaUrl = parentPath.firstChild.currentSrc;
            const mediaDesc = parentPath.firstChild.nextSibling.innerText;
            const isVideo = parentPath.classList.contains("wp-block-video");
            displayModal(mediaUrl, mediaDesc, isVideo);
        });
    });
}

// toggleSpinnerStatus
function toggleSpinnerStatus(status = false, id) {
    switch (currentPage) {
        case "contact.html":
            if (status == true) {
                sendButton.innerHTML = `Sending... <i class="fa-solid fa-spinner black"></i>`;
            } else {
                sendButton.innerHTML = `Send`;
            }
            break;
        case "index.html":
            if (status == true) {
                carouselPostContainer.innerHTML = `<i class="fa-solid fa-spinner black"></i>`;
            } else {
                carouselPostContainer.innerHTML = "";
            }
            break;
        case "allblogposts.html":
            if (status == true && id == "tags") {
                tagsContainer.innerHTML = `<i class="fa-solid fa-spinner black"></i>`;
            }
            break;
        case "blogpost.html":
            if (status == true && id == "comment") {
                commentsContainer.innerHTML = `<i class="fa-solid fa-spinner black"></i>`;
                sendButton.innerHTML = `Sending... <i class="fa-solid fa-spinner black" id="smallspinner"></i>`;
            }
            if (status == true && id == "morecomments") {
                commentsContainer.innerHTML += `<i class="fa-solid fa-spinner black"></i>`;
            }
            if (status == false && id == "morecomments") {
                document.querySelector(".comments_read .fa-spinner").remove();
            }
            break;
        default:
            break;
    }
}

// Retrieve tags:
async function getAllTags() {
    toggleSpinnerStatus(true, "tags");
    try {
        const getTagsUrl = baseURL + "wp/v2/tags/?per_page=100";
        const data = await fetch(getTagsUrl);
        result = await data.json();
        return result;
    } catch (error) {
        return [];
    }
}

// // Get posts from API
let totalPages;
async function fetchPosts(callurl) {
    let result;
    try {
        const data = await fetch(callurl);
        result = await data.json();
        totalPages = Number(data.headers.get("X-WP-TotalPages"));
    } catch (error) {
        console.log("Error from fetchPosts() : " + error);
        //return error;
    }
    //console.log(result);
    return result;
}

// Loads common functions:
// getToken();
displayFooterHTML();
displayHeaderHTML();
setCurrentPage();

// Below variables are not present before displayHeaderHTML() is run.
const mobileMenuButton = document.querySelector(".burgermenu");
const mainNavContainer = document.querySelector(".top_nav");

// Eventlisteners (depends on the above):

mobileMenuButton.addEventListener("click", () => {
    mainNavContainer.classList.toggle("display_menu");
});
