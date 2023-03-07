const pageCounter = document.querySelector(".latestposts");
const mobileleftButton = document.querySelector(".mobile_nav .leftbutton");
const mobilerightButton = document.querySelector(".mobile_nav .rightbutton");
const carouselPostContainer = document.querySelector(".latestposts");

const leftButton = document.querySelector(".leftbutton");
const rightButton = document.querySelector(".rightbutton");
// hide navigation buttons by default:
leftButton.style.display = "none";
rightButton.style.display = "none";

async function nextPosts(showNextPage = true) {
    leftButton.style.display = "none";
    rightButton.style.display = "none";
    toggleSpinnerStatus(true);
    if (showNextPage == false) {
        pageCounter.dataset.page = Number(pageCounter.dataset.page) - 2;
    }
    const latestPostPage = pageCounter.dataset.page;
    const latestPostUrl = baseURL + "wp/v2/posts/?per_page=4&page=" + latestPostPage + "&_embed";
    // old function:
    //const newPosts = await getPosts(latestPostUrl);
    const newPosts = await fetchPosts(latestPostUrl);

    // Error-handling:
    if (newPosts != undefined && newPosts.length != undefined) {
        displayCarouselPosts(newPosts);
        toggleSpinnerStatus(false);
        //console.log("totalPages = " + totalPages);
        // displaying nav-buttons:
        if (totalPages <= Number(pageCounter.dataset.page)) {
            rightButton.style.display = "none";
            mobilerightButton.style.display = "none";
        }
        if (Number(pageCounter.dataset.page) > 1) {
            leftButton.style.display = "block";
            mobileleftButton.style.display = "block";
        }
        if (Number(pageCounter.dataset.page) <= 1) {
            leftButton.style.display = "none";
            mobileleftButton.style.display = "none";
        }
        if (totalPages > Number(pageCounter.dataset.page)) {
            rightButton.style.display = "block";
            mobilerightButton.style.display = "block";
        }
    } else {
        toggleSpinnerStatus(false);
        carouselPostContainer.innerHTML = `<p class="error">An error accoured loading the posts. Please try to reload the page.</p>`;
        leftButton.style.display = "none";
        rightButton.style.display = "none";
    }
    pageCounter.dataset.page++;
}

async function displayCarouselPosts(postsArr) {
    const allTags = await getAllTags();
    postsArr.forEach((post) => {
        const postTitle = post.title.rendered;
        // sets the default tagString to an error message, which will be replaced later on if successful:
        let tagString = `<i class="error">Failed to load tags. Please reload page.</i>`;
        if (allTags.length != 0) {
            const tagIDs = post.tags;
            let tagNames = [];
            tagIDs.forEach((id) => {
                tagNames.push(getTagName(id, allTags));
            });
            tagString = "#" + tagNames.join(", #");
        }
        const tempImgElement = document.createElement("temp");
        tempImgElement.innerHTML = post.content.rendered;
        let postImage = tempImgElement.querySelector("figure img");
        if (postImage == null) {
            // disable video controls if it`s a video.
            postImage = tempImgElement.querySelector("figure video");
            postImage.controls = false;
        }

        carouselPostContainer.innerHTML += `
        <a href="blogpost.html?q=${post.id}" alt="Read the full blog post: ${postTitle}" aria-label="Read the full blog post: ${postTitle}">
            <div class="post id-${post.id}">
                <div class="image"></div>
                <h3>${postTitle}</h3>
                <p class="tagnames">${tagString}</p>
                <div class="excerpt">
                    ${post.excerpt.rendered}
                </div>
                <p class="readmore cta" aria-label="Read the full blog post: ${postTitle}">Read post...</p>
            </div>
        </a>`;

        const currentImageContainer = document.querySelector(`.id-${post.id} .image`);
        currentImageContainer.insertAdjacentElement("afterbegin", postImage);
    });
}

// translates tag-IDs to tag-names
function getTagName(id, allTagsArr) {
    let result = "";
    for (let i = 0; i < allTagsArr.length; i++) {
        if (allTagsArr[i].id == id) {
            result = allTagsArr[i].name;
            break;
        }
    }
    return result;
}

// Event listeners:

leftButton.addEventListener("click", () => {
    nextPosts(false);
});
rightButton.addEventListener("click", () => {
    nextPosts(true);
});
mobileleftButton.addEventListener("click", () => {
    nextPosts(false);
});
mobilerightButton.addEventListener("click", () => {
    nextPosts(true);
});

// Retrieve posts.
nextPosts();
