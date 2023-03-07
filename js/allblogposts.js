// Requirement:
const numberOfPostsToLoad = 10;

const mainContainer = document.querySelector(".blogs");
const asideContainer = document.querySelector(".filters");
const pageCounter = document.querySelector(".pagenav .cta");
const tagsContainer = document.querySelector(".tags");
const filterContainer = document.querySelector(".allfilters");
const searchButton = document.querySelector("#searchbutton");
const toggleFilterButton = document.querySelector(".filterbutton");

const nextPostsButton = document.querySelector(".pagenav .cta");
// Hide navigation-button and filter by default.
nextPostsButton.style.display = "none";
asideContainer.style.display = "none";

// add spinner:
mainContainer.innerHTML += `<i class="fa-solid fa-spinner black"></i>`;

// Display the posts.
function displayPosts(arr) {
    if (arr != undefined && arr.length != undefined) {
        if (document.querySelector("main .fa-spinner")) {
            const allSpinner = document.querySelectorAll("main .fa-spinner");
            allSpinner.forEach((element) => {
                element.remove();
            });
        }
        arr.forEach((post) => {
            mainContainer.innerHTML += `
            <div id="post_container">
                <div class="postbox">
                    <h2>${post.title.rendered}</h2>
                        <div class="buttons_container">
                        <a href="blogpost.html?q=${post.id}" aria-label="Subject" title="Read post: ${post.title.rendered}">
                            <button class="cta">Read post</button>
                        </a>
                        <p id="viewpost_toggler" class="cta" title="Show or Hide post body" aria-label="Show or Hide post body"><i class="fa-solid fa-angles-up" alt="Show or Hide button"></i></p>
                    </div>
                </div>
                <div class="post" data-wpid="${post.id}">${post.content.rendered}</div>
            </div>
            `;
        });
        // addMediaAttention need to be run before the video controls to avoid restarting videos.
        addMediaAttention();
        const allVideos = document.querySelectorAll("figure video");
        allVideos.forEach((element) => {
            if (element.hasAttribute("controls")) {
                element.setAttribute("autoplay", "true");
                element.removeAttribute("controls");
            }
            // Make sure we always pause the video. (putting it inside the if will start the video when loading more posts).
            element.pause();
        });
        // Adding eventlisteners
        const displayBlogToggleButtons = document.querySelectorAll("#viewpost_toggler");
        displayBlogToggleButtons.forEach((button) => {
            button.addEventListener("click", (event) => {
                toggleShowPost(event);
            });
        });
    } else {
        mainContainer.innerHTML = `<i class="error">Unable to load posts. Please try again.</i>`;
    }
}

// Displays the tags retrieved.
function displayTags(tagsArr) {
    tagsArr.forEach((tag) => {
        tagsContainer.innerHTML += `
            <input type="checkbox" name="${tag.name}" id="${tag.name}" value="${tag.id}"/><label for="${tag.name}" class="cta" aria-label="Show posts with tag: ${tag.name}" title="Show posts with tag: ${tag.name}">${tag.name}</label>`;
    });
}

// Filter the search.
function filterPosts() {
    let searchString = "";
    const checkedTags = document.querySelectorAll(".allfilters input[type=checkbox]:checked");
    if (checkedTags.length > 0) {
        searchString = "&tags=";
        checkedTags.forEach((tag) => {
            searchString += "," + tag.value;
        });
    }
    // set pageCounter to 1, because this function is only run when filter is changed:
    pageCounter.dataset.page = 1;
    searchString = searchString.replace(searchString.charAt(6), "");
    const searchValue = document.querySelector("#search").value;
    const searchUrl = baseURL + "wp/v2/posts/?search=" + searchValue + searchString + "&per_page=" + numberOfPostsToLoad + "&page=" + pageCounter.dataset.page;
    pageCounter.dataset.searchurl = searchUrl;
    fetchPosts(searchUrl).then((arr) => {
        if (arr.length == 0) {
            mainContainer.innerHTML = "<p>There are no posts matching your filter/search.</p>";
            if (checkedTags.length > 0 && searchValue != "") {
                mainContainer.innerHTML += `<p>Try without filtering tags maybe?</p>`;
            }
        } else {
            mainContainer.innerHTML = "";
            displayPosts(arr);
        }
        pageChecker();
    });
}

// Enables the user to hide or view the post:
function toggleShowPost(event) {
    let classlistElement = event.srcElement;
    let postElement = event.target.parentElement.parentElement.parentElement.parentElement.children[1];
    let postContainer = event.target.parentElement.parentElement.parentElement.parentElement;
    // handle click on the parent element:
    if (event.srcElement.classList.contains("cta")) {
        postElement = event.target.parentElement.parentElement.parentElement.children[1];
        classlistElement = event.srcElement.children[0];
        postContainer = event.target.parentElement.parentElement.parentElement;
    }

    // Toggle depending on the previous state:
    if (postElement.style.display == "none") {
        postElement.style.display = "block";
        classlistElement.classList.add("fa-angles-up");
        classlistElement.classList.remove("fa-angles-down");
        postContainer.style.marginBottom = "20%";
    } else {
        postElement.style.display = "none";
        classlistElement.classList.remove("fa-angles-up");
        classlistElement.classList.add("fa-angles-down");
        postContainer.style.marginBottom = "2%";
    }
}

// Eventlisteners

filterContainer.addEventListener("change", filterPosts);
searchButton.addEventListener("click", (event) => {
    event.preventDefault();
    filterPosts();
});

nextPostsButton.addEventListener("click", (event) => {
    const nextURL = getURL();
    fetchPosts(nextURL).then((postsArr) => {
        displayPosts(postsArr);
        pageChecker();
    });
});

toggleFilterButton.addEventListener("click", () => {
    const isShowing = toggleFilterButton.dataset.showingfilters === "true";
    if (!isShowing) {
        toggleFilterButton.innerHTML = `Hide search options <i class="fa-solid fa-angles-up" alt="Hide searchfilter-button"></i>`;
        toggleFilterButton.dataset.showingfilters = "true";
        asideContainer.style.display = "block";
    } else {
        toggleFilterButton.innerHTML = `Show search options <i class="fa-solid fa-angles-down" alt="Show searchfilter-button"></i>`;
        toggleFilterButton.dataset.showingfilters = "false";
        asideContainer.style.display = "none";
    }
});

// url to use for search:
function getURL() {
    if (!pageCounter.dataset.searchurl) {
        // Default behaviour (no filters)
        return baseURL + "wp/v2/posts/?per_page=" + numberOfPostsToLoad + "&page=" + pageCounter.dataset.page;
    } else {
        // If filters is used, we build the url from the previous search:
        const nextSearchUrl = pageCounter.dataset.searchurl.split("&page=")[0] + "&page=" + pageCounter.dataset.page;
        return nextSearchUrl;
    }
}
// checks pagecounter and hide nextPosts-button if needed:
function pageChecker() {
    if (totalPages <= Number(pageCounter.dataset.page)) {
        // Hide the next Button if last page is loaded.
        nextPostsButton.style.display = "none";
    } else {
        // Shows the next Button if there are more pages available.
        nextPostsButton.style.display = "block";
    }
    pageCounter.dataset.page++;
}

// Load page by retrieving and display posts and tags.
const postURL = getURL();
fetchPosts(postURL).then((postsArr) => {
    displayPosts(postsArr);
    pageChecker();
});

getAllTags().then((arr) => {
    tagsContainer.innerHTML = "";
    if (arr.length > 0) {
        displayTags(arr);
    } else {
        tagsContainer.innerHTML = `<i class="error">Unable to load tags. Try reloading the page.</i>`;
    }
});
