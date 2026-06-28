const playBtns = document.querySelectorAll(".play-btn");
const modal = document.getElementById("videoModal");
const closeBtn = document.querySelector(".close");

playBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        modal.style.display = "block";
    });
});

closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
});

// show user
const user = JSON.parse(localStorage.getItem("user"));

if (user) {

    document.getElementById("userName").innerText = user.name;

    const loginBtn = document.getElementById("loginBtn");
    const registerBtn = document.getElementById("registerBtn");

    if (loginBtn) loginBtn.style.display = "none";
    if (registerBtn) registerBtn.style.display = "none";

    document.getElementById("userArea").style.display = "block";
}

async function loadHomepageAds() {

    const res =
        await fetch(
            `${API_BASE}/api/ads`
        );

    const ads =
        await res.json();

    const activeAds =
        ads.filter(
            ad => ad.status === "active"
        );

    // Hero Stats
    document.getElementById("heroAds").textContent =
        activeAds.length;

    document.getElementById("heroBusinesses").textContent =
        new Set(
            activeAds.map(ad => ad.sellerId)
        ).size;

    // Category Counts
    document.getElementById("salonCount").textContent =
        activeAds.filter(ad => ad.category === "Salon").length + " Ads";

    document.getElementById("restaurantCount").textContent =
        activeAds.filter(ad => ad.category === "Restaurant").length + " Ads";

    document.getElementById("medicalCount").textContent =
        activeAds.filter(ad => ad.category === "Medical").length + " Ads";

    document.getElementById("jobsCount").textContent =
        activeAds.filter(ad => ad.category === "Jobs").length + " Ads";

    document.getElementById("freelancerCount").textContent =
        activeAds.filter(ad => ad.category === "Freelancer").length + " Ads";

    loadFeaturedAds(activeAds);

    loadLatestAds(activeAds);

}

function loadFeaturedAds(ads) {

    const container =
        document.getElementById(
            "featuredAds"
        );

    if (!container) return;

    container.innerHTML = "";

    if (ads.length === 0) {

        container.innerHTML = `

            <h3>
                No Advertisements Found
            </h3>

        `;

        return;

    }

    ads
        .slice(0, 6)
        .forEach(ad => {

            const image =

                ad.images &&
                    ad.images.length > 0

                    ?

                    `${API_BASE}/uploads/${ad.images[0]}`

                    :

                    "https://via.placeholder.com/400x250";

            container.innerHTML += `

                <div class="ad-card">

                    <div class="video-box">

                        <img
                            src="${image}"
                            alt="${ad.businessName}">

                    </div>

                    <h3>

                        ${ad.businessName}

                    </h3>

                    <p>

                        📍 ${ad.location}

                    </p>

                    <p>

                        🏷 ${ad.category}

                    </p>

                    <span class="verified">

                        ✔ Verified

                    </span>

                    <div class="actions">

                        <button
                            onclick="window.location.href='view-public-ad.html?id=${ad.adId}'">

                            View Details

                        </button>

                    </div>

                </div>

            `;

        });

}

function loadLatestAds(ads) {

    const container =
        document.getElementById(
            "latestAds"
        );

    if (!container) return;

    container.innerHTML = "";

    ads
        .slice()
        .reverse()
        .slice(0, 6)
        .forEach(ad => {

            const image =

                ad.images &&
                    ad.images.length > 0

                    ?

                    `${API_BASE}/uploads/${ad.images[0]}`

                    :

                    "https://via.placeholder.com/400x250";

            const created =
                new Date(ad.createdAt);

            container.innerHTML += `

                <div class="ad-card">

                    <div class="video-box">

                        <img
                            src="${image}">

                    </div>

                    <h3>

                        ${ad.businessName}

                    </h3>

                    <p>

                        📍 ${ad.location}

                    </p>

                    <p>

                        ${created.toLocaleDateString()}

                    </p>

                    <button
                        onclick="window.location.href='view-public-ad.html?id=${ad.adId}'">

                        View Details

                    </button>

                </div>

            `;

        });

}

loadHomepageAds();

// ======================================
// HOMEPAGE SEARCH
// ======================================

const searchButton =
    document.getElementById(
        "searchButton"
    );

if (searchButton) {

    searchButton.addEventListener(
        "click",
        () => {

            const name =
                document
                    .getElementById("searchName")
                    .value
                    .trim();

            const category =
                document
                    .getElementById("searchCategory")
                    .value;

            const location =
                document
                    .getElementById("searchLocation")
                    .value
                    .trim();

            const params =
                new URLSearchParams();

            if (name)
                params.append(
                    "search",
                    name
                );

            if (category)
                params.append(
                    "category",
                    category
                );

            if (location)
                params.append(
                    "location",
                    location
                );

            window.location.href =
                "ads.html?" +
                params.toString();

        }
    );

}

/*==========================================
BOTTOM NAVIGATION
==========================================*/

const currentUser =
    JSON.parse(
        localStorage.getItem("user")
    );

const nav1 = document.getElementById("nav1");
const nav2 = document.getElementById("nav2");
const nav3 = document.getElementById("nav3");
const nav4 = document.getElementById("nav4");

const nav2Icon = document.getElementById("nav2Icon");
const nav3Icon = document.getElementById("nav3Icon");
const nav4Icon = document.getElementById("nav4Icon");

const nav2Text = document.getElementById("nav2Text");
const nav3Text = document.getElementById("nav3Text");
const nav4Text = document.getElementById("nav4Text");

if (
    nav1 &&
    nav2 &&
    nav3 &&
    nav4
) {

    nav1.href = "index.html";

    if (!currentUser) {

        nav2.href = "auth.html";
        nav3.href = "auth.html#register";
        nav4.href = "auth.html";

        nav2Icon.className =
            "fa-solid fa-right-to-bracket";

        nav3Icon.className =
            "fa-solid fa-user-plus";

        nav4Icon.className =
            "fa-solid fa-user";

        nav2Text.textContent =
            "Login";

        nav3Text.textContent =
            "Register";

        nav4Text.textContent =
            "Profile";

    }

    else if (
        currentUser.accountType ===
        "advertiser"
    ) {

        nav2.href =
            "profile.html";

        nav3.href =
            "create-ad.html";

        nav4.href =
            "business-profile.html";

        nav2Icon.className =
            "fa-solid fa-table-columns";

        nav3Icon.className =
            "fa-solid fa-plus";

        nav4Icon.className =
            "fa-solid fa-user";

        nav2Text.textContent =
            "Dashboard";

        nav3Text.textContent =
            "Post Ad";

        nav4Text.textContent =
            "Profile";

    }

    else if (
        currentUser.accountType ===
        "admin"
    ) {

        nav2.href =
            "admin.html";

        nav3.href =
            "admin.html";

        nav4.href =
            "admin.html";

        nav2Icon.className =
            "fa-solid fa-user-shield";

        nav3Icon.className =
            "fa-solid fa-table-columns";

        nav4Icon.className =
            "fa-solid fa-user";

        nav2Text.textContent =
            "Admin";

        nav3Text.textContent =
            "Panel";

        nav4Text.textContent =
            "Profile";

    }

}

/* ACTIVE PAGE */

const page =
    window.location.pathname
        .split("/")
        .pop();

document
    .querySelectorAll(".bottom-item")
    .forEach(item => {

        const href =
            item.getAttribute("href");

        if (
            href &&
            href === page
        ) {

            item.classList.add(
                "active"
            );

        }

    });

/*==========================================
AUTH HELPERS
==========================================*/

function getCurrentUser() {

    return JSON.parse(
        localStorage.getItem("user")
    );

}

function logout() {
    localStorage.removeItem("user");
    window.location.reload();
}

function logoutUser() {

    localStorage.removeItem("user");

    window.location.replace(
        "index.html"
    );

}

function requireAdvertiser() {

    const user =
        getCurrentUser();

    if (
        !user ||
        user.accountType !==
        "advertiser"
    ) {

        localStorage.removeItem(
            "user"
        );

        window.location.replace(
            "auth.html"
        );

    }

    return user;

}

function requireAdmin() {

    const user =
        getCurrentUser();

    if (
        !user ||
        user.accountType !==
        "admin"
    ) {

        localStorage.removeItem(
            "user"
        );

        window.location.replace(
            "auth.html"
        );

    }

    return user;

}