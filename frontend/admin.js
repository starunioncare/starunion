let currentFilter = "all";

async function loadAds() {

    const res =
        await fetch(`${API_BASE}/api/ads`);

    const ads =
        await res.json();

    const container =
        document.getElementById("adsContainer");

    container.innerHTML = "";

    ads.forEach(ad => {

        container.innerHTML += `

        <tr>

            <td>

                ${ad.adId}

            </td>

            <td>

                ${ad.businessName}

            </td>

            <td>

                ${ad.category}

            </td>

            <td>

                ${ad.location}

            </td>

            <td>

                ${ad.status || "Active"}

            </td>

            <td>

                <button
                    onclick="window.open('view-public-ad.html?id=${ad.adId}','_blank')">

                    View

                </button>

                <button
                    class="reject"
                    onclick="deleteAd('${ad.adId}')">

                    Remove

                </button>

            </td>

        </tr>

       `;

    });

}

async function loadPendingSellers() {

    const res =
        await fetch(
            `${API_BASE}/api/users`
        );

    const users =
        await res.json();

    const container =
        document.getElementById(
            "verificationContainer"
        );

    if (!container) return;

    container.innerHTML = "";

    const sellers =
        users.filter(
            user =>
                user.accountType === "advertiser"
                &&
                user.status === "pending"
        );

    sellers.forEach(seller => {

        container.innerHTML += `

        <div class="verification-card">

            <h3>${seller.name}</h3>

            <p>
                Seller ID:
                ${seller.sellerId}
            </p>

            <p>
                Mobile:
                ${seller.mobile}
            </p>

            <p>
                Status:
                ${seller.status}
            </p>

            <div class="document-grid">

                <div class="document-box">

                    <h4>Selfie</h4>

                    <img
                    src="${API_BASE}/uploads/${seller.selfiePhoto}"
                    width="200">

                </div>

                <div class="document-box">

                    <h4>Aadhar Front</h4>

                    <img
                    src="${API_BASE}/uploads/${seller.aadharFront}"
                    width="200">

                </div>

                <div class="document-box">

                    <h4>Aadhar Back</h4>

                    <img
                    src="${API_BASE}/uploads/${seller.aadharBack}"
                    width="200">

                </div>

            </div>

            <br>

            <button
            onclick="approveSeller('${seller.id}')">

            Approve

            </button>

            <button
            onclick="rejectSeller('${seller.id}')">

            Reject

            </button>

            <button
            onclick="banSeller('${seller.id}')">

            Ban

            </button>

        </div>

        `;

    });

}

async function deleteAd(adId) {

    const confirmDelete =
        confirm("Delete this advertisement?");

    if (!confirmDelete) return;

    await fetch(
        `${API_BASE}/api/delete-ad/${adId}`,
        {
            method: "DELETE"
        }
    );

    await loadAds();

    await loadDashboardStats();

    showSection(currentSection);

}

async function approveSeller(id) {

    await fetch(
        `${API_BASE}/api/approve-seller/${id}`,
        {
            method: "PUT"
        }
    );

    await loadPendingSellers();

    await loadUsers();

    await loadDashboardStats();

    showSection(currentSection);

}

async function rejectSeller(id) {

    const reason =
        prompt(
            "Reason for rejection:"
        );

    await fetch(
        `${API_BASE}/api/reject-seller/${id}`,
        {
            method: "PUT",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({
                reason
            })

        }
    );

    await loadPendingSellers();

    await loadUsers();

    await loadDashboardStats();

    showSection(currentSection);

}

async function banSeller(id) {

    await fetch(
        `${API_BASE}/api/ban-user/${id}`,
        {
            method: "PUT"
        }
    );

    await loadPendingSellers();

    await loadUsers();

    await loadBannedUsers();

    await loadDashboardStats();

    showSection(currentSection);

}

async function unbanSeller(id) {

    await fetch(
        `${API_BASE}/api/unban-user/${id}`,
        {
            method: "PUT"
        }
    );

    await loadPendingSellers();

    await loadUsers();

    await loadBannedUsers();

    await loadDashboardStats();

    showSection(currentSection);

}

async function loadUsers() {

    const res =
        await fetch(
            `${API_BASE}/api/users`
        );

    const users =
        await res.json();

    const search =
        document
            .getElementById("searchInput")
            ?.value
            .toLowerCase() || "";

    const table =
        document.getElementById(
            "usersTable"
        );

    if (!table) return;

    table.innerHTML = "";

    users
        .filter(user => {

            if (
                currentFilter === "user" &&
                user.accountType !== "user"
            ) {
                return false;
            }

            if (
                currentFilter === "advertiser" &&
                user.accountType !== "advertiser"
            ) {
                return false;
            }

            if (
                currentFilter === "pending" &&
                user.status !== "pending"
            ) {
                return false;
            }

            if (
                currentFilter === "approved" &&
                user.status !== "approved"
            ) {
                return false;
            }

            if (
                currentFilter === "banned" &&
                user.status !== "banned"
            ) {
                return false;
            }

            const id =
                (user.sellerId ||
                    ("USR" + user.id))
                    .toLowerCase();

            const name =
                (user.name || "")
                    .toLowerCase();

            const mobile =
                (user.mobile || "")
                    .toLowerCase();

            const email =
                (user.email || "")
                    .toLowerCase();

            return (
                id.includes(search) ||
                name.includes(search) ||
                mobile.includes(search) ||
                email.includes(search)
            );

        })
        .forEach(user => {

            table.innerHTML += `

        <tr>

            <td>
                ${user.sellerId || "USR" + user.id}
            </td>

            <td>
                ${user.name}
            </td>

            <td>
                ${user.accountType}
            </td>

            <td>
                ${user.mobile}
            </td>

            <td>

                <span
                    class="status-badge status-${user.status}">

                    ${user.status}

                </span>

            </td>

            <td>

                <button
                onclick="viewUser('${user.id}')">

                View

                </button>

                ${user.status === "banned"
                    ?
                    `<button
                        onclick="unbanSeller('${user.id}')">
                        Unban
                    </button>`
                    :
                    `<button
                        onclick="banSeller('${user.id}')">
                        Ban
                    </button>`
                }

            </td>

        </tr>

        `;

        });

}

function setFilter(filter) {

    currentFilter = filter;

    loadUsers();

}

function viewUser(id) {

    window.location.href =
        `seller-details.html?id=${id}`;

}

async function loadDashboardStats() {

    const usersRes =
        await fetch(
            `${API_BASE}/api/users`
        );

    const users =
        await usersRes.json();

    const adsRes =
        await fetch(
            `${API_BASE}/api/ads`
        );

    const ads =
        await adsRes.json();

    const totalUsers =
        users.length;

    const totalSellers =
        users.filter(
            user =>
                user.accountType ===
                "advertiser"
        ).length;

    const pendingSellers =
        users.filter(
            user =>
                user.status ===
                "pending"
        ).length;

    const totalAds =
        ads.length;

    document.getElementById(
        "totalUsers"
    ).textContent =
        totalUsers;

    document.getElementById(
        "totalSellers"
    ).textContent =
        totalSellers;

    document.getElementById(
        "pendingSellers"
    ).textContent =
        pendingSellers;

    document.getElementById(
        "totalAds"
    ).textContent =
        totalAds;

}

loadAds();

loadPendingSellers();

loadUsers();

loadDashboardStats();

/*==========================================
ADMIN SECTION NAVIGATION
==========================================*/

let currentSection =
    sessionStorage.getItem("adminSection") ||
    "dashboard";

const sections = {

    dashboard: document.getElementById(
        "dashboardSection"
    ),

    users: document.getElementById(
        "usersSection"
    ),

    verification: document.getElementById(
        "verificationSection"
    ),

    ads: document.getElementById(
        "adsSection"
    ),

    banned: document.getElementById(
        "bannedSection"
    ),

    settings: document.getElementById(
        "settingsSection"
    )

};

const menuItems = {

    dashboard: document.getElementById(
        "menuDashboard"
    ),

    users: document.getElementById(
        "menuUsers"
    ),

    verification: document.getElementById(
        "menuVerification"
    ),

    ads: document.getElementById(
        "menuAds"
    ),

    banned: document.getElementById(
        "menuBanned"
    ),

    settings: document.getElementById(
        "menuSettings"
    )

};

function showSection(name) {

    currentSection = name;

    sessionStorage.setItem(
        "adminSection",
        name
    );

    Object.values(sections).forEach(section => {

        if (section) {

            section.style.display = "none";

        }

    });

    Object.values(menuItems).forEach(item => {

        if (item) {

            item.classList.remove("active");

        }

    });

    if (sections[name]) {

        sections[name].style.display = "block";

    }

    if (menuItems[name]) {

        menuItems[name].classList.add("active");

    }

}

menuItems.dashboard.onclick = () => {

    showSection("dashboard");

};

menuItems.users.onclick = () => {

    showSection("users");

};

menuItems.verification.onclick = () => {

    showSection("verification");

};

menuItems.ads.onclick = () => {

    showSection("ads");

};

menuItems.banned.onclick = () => {

    showSection("banned");

};

menuItems.settings.onclick = () => {

    showSection("settings");

};

showSection(currentSection);

/*==========================================
LOAD BANNED USERS
==========================================*/

async function loadBannedUsers() {

    const res =
        await fetch(
            `${API_BASE}/api/users`
        );

    const users =
        await res.json();

    const bannedUsers =
        users.filter(
            user =>
                user.status === "banned"
        );

    const table =
        document.getElementById(
            "bannedUsersTable"
        );

    table.innerHTML = "";

    if (
        bannedUsers.length === 0
    ) {

        table.innerHTML = `

        <tr>

            <td colspan="6">

                No banned accounts found.

            </td>

        </tr>

        `;

        return;

    }

    bannedUsers.forEach(user => {

        table.innerHTML += `

        <tr>

            <td>

                ${user.sellerId || user.userId}

            </td>

            <td>

                ${user.name}

            </td>

            <td>

                ${user.accountType}

            </td>

            <td>

                ${user.mobile}

            </td>

            <td>

                <span class="status-badge status-banned">

                    Banned

                </span>

            </td>

            <td>

                <button
                    onclick="unbanUser('${user.id || user.userId}')">

                    Unban

                </button>

            </td>

        </tr>

        `;

    });

}

loadBannedUsers();

/*==========================================
UNBAN USER
==========================================*/

async function unbanUser(userId) {

    const confirmAction =
        confirm(
            "Unban this account?"
        );

    if (!confirmAction) {

        return;

    }

    const res =
        await fetch(

            `${API_BASE}/api/update-status/${userId}`,

            {

                method: "PUT",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify({

                    status: "approved"

                })

            }

        );

    const data =
        await res.json();

    if (data.success) {

        alert(
            "Account Unbanned Successfully."
        );

        loadUsers();

        loadBannedUsers();

        loadDashboardStats();

    }
    else {

        alert(
            data.message
        );

    }

}