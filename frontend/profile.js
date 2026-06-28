const user =
    requireAdvertiser();

// =====================================
// SELLER INFORMATION
// =====================================

document.getElementById(
    "sellerName"
).textContent =
    user.name;

document.getElementById(
    "sellerId"
).textContent =
    user.sellerId;

document.getElementById(
    "sellerStatus"
).textContent =
    user.status;

document.getElementById(
    "sellerStatusCard"
).textContent =
    user.status;

// =====================================
// DASHBOARD STATS
// =====================================

async function loadStats() {

    const res =
        await fetch(
            `${API_BASE}/api/ads`
        );

    const ads =
        await res.json();

    const myAds =
        ads.filter(
            ad =>
                ad.sellerId ===
                user.sellerId
        );

    const activeAds =
        myAds.filter(
            ad =>
                ad.status ===
                "active"
        );

    const bannedAds =
        myAds.filter(
            ad =>
                ad.status ===
                "banned"
        );

    document.getElementById(
        "totalAds"
    ).textContent =
        myAds.length;

    document.getElementById(
        "activeAds"
    ).textContent =
        activeAds.length;

    document.getElementById(
        "bannedAds"
    ).textContent =
        bannedAds.length;

    loadRecentAds(myAds);

}

// =====================================
// RECENT ADS
// =====================================

function loadRecentAds(
    myAds
) {

    const container =
        document.getElementById(
            "recentAds"
        );

    container.innerHTML = "";

    if (
        myAds.length === 0
    ) {

        container.innerHTML = `

        <div class="empty-box">

            No advertisements yet.

        </div>

        `;

        return;

    }

    myAds
        .slice()
        .reverse()
        .slice(0, 3)
        .forEach(ad => {

            const image =

                ad.images &&
                    ad.images.length > 0

                    ?

                    `${API_BASE}/uploads/${ad.images[0]}`

                    :

                    "https://via.placeholder.com/400x250";

            container.innerHTML += `

            <div class="market-card">

                <div class="market-image">

                    <img
                        src="${image}"
                        alt="${ad.businessName}">

                </div>

                <div class="market-body">

                    <h2>

                        ${ad.businessName}

                    </h2>

                    <p>

                        📍 ${ad.location}

                    </p>

                    <p>

                        🏷 ${ad.category}

                    </p>

                    <p>

                        Status :
                        ${ad.status}

                    </p>

                    <button
                        class="details-btn"
                        onclick="window.location.href='edit-ad.html?id=${ad.adId}'">

                        Edit Advertisement

                    </button>

                </div>

            </div>

            `;

        });

}

// =====================================

loadStats();