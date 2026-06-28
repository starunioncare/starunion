function showRegister() {
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("registerBox").style.display = "block";
}

function showLogin() {
    document.getElementById("registerBox").style.display = "none";
    document.getElementById("loginBox").style.display = "block";
}

function goHome() {
    window.location.href = "index.html";
}

async function registerUser() {

    const inputs =
        document.querySelectorAll("#registerBox input");

    const name = inputs[0].value;
    const email = inputs[1].value;
    const mobile = inputs[2].value;
    const password = inputs[3].value;
    const confirmPassword = inputs[4].value;

    const accountType =
        document.getElementById("accountType").value;

    const referenceId = inputs[5].value;

    if (!accountType) {

        alert("Please select account type");

        return;
    }

    if (password !== confirmPassword) {

        alert("Passwords do not match ❌");

        return;
    }

    const formData = new FormData();

    formData.append("name", name);
    formData.append("email", email);
    formData.append("mobile", mobile);
    formData.append("password", password);
    formData.append("referenceId", referenceId);
    formData.append("accountType", accountType);

    if (accountType === "advertiser") {

        formData.append(
            "selfiePhoto",
            document.getElementById("selfiePhoto").files[0]
        );

        formData.append(
            "aadharFront",
            document.getElementById("aadharFront").files[0]
        );

        formData.append(
            "aadharBack",
            document.getElementById("aadharBack").files[0]
        );

    }

    const res = await fetch(`${API_BASE}/api/register`,
        {
            method: "POST",
            body: formData
        }
    );

    const data = await res.json();

    alert(data.message);

}

async function loginUser() {
    const inputs = document.querySelectorAll("#loginBox input");

    const email = inputs[0].value;
    const password = inputs[1].value;

    const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.user) {
        // save user in browser
        localStorage.setItem("user", JSON.stringify(data.user));

        alert(data.message);

        // redirect to homepage
        //window.location.href = "index.html";
        if (data.user.accountType === "admin") {

            window.location.replace(
                "index.html"
            );

        }
        else if (data.user.accountType === "advertiser") {

            window.location.replace(
                "index.html"
            );

        }
        else {

            window.location.replace(
                "index.html"
            );

        }
    } else {
        alert(data.message);
    }
}

// Open correct form from URL
if (window.location.hash === "#register") {
    showRegister();
} else {
    showLogin();
}

const accountType =
    document.getElementById("accountType");

const advertiserDocs =
    document.getElementById("advertiserDocs");

accountType.addEventListener(
    "change",
    () => {

        if (
            accountType.value === "advertiser"
        ) {

            advertiserDocs.style.display =
                "block";

        } else {

            advertiserDocs.style.display =
                "none";

        }

    }
);