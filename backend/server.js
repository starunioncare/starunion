const express = require("express");
const cors = require("cors");

const app = express();
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, "uploads/");

    },

    filename: (req, file, cb) => {

        cb(
            null,
            Date.now() + "-" + file.originalname
        );

    }

});

const upload = multer({

    storage,

    limits: {

        fileSize:
            100 * 1024 * 1024

    }

});

app.use(cors());
app.use(express.json());

app.use(
    "/uploads",
    express.static("uploads")
);

// TEMP DATABASE (for now)
const usersFile =
    path.join(__dirname,
        "data",
        "users.json");

let users = [];

if (fs.existsSync(usersFile)) {

    const data =
        fs.readFileSync(usersFile);

    users =
        JSON.parse(data);

}

const adsFile =
    path.join(__dirname, "data", "ads.json");

let ads = [];

if (fs.existsSync(adsFile)) {

    const data =
        fs.readFileSync(adsFile);

    ads = JSON.parse(data);

}

function saveUsers() {

    fs.writeFileSync(
        usersFile,
        JSON.stringify(
            users,
            null,
            2
        )
    );

}

function saveAds() {

    fs.writeFileSync(
        adsFile,
        JSON.stringify(ads, null, 2)
    );

}

// TEST ROUTE
app.get("/", (req, res) => {
    res.send("StarUnion Backend Running 🚀");
});


// ✅ REGISTER API
app.post(
    "/api/register",

    upload.fields([
        {
            name: "selfiePhoto",
            maxCount: 1
        },
        {
            name: "aadharFront",
            maxCount: 1
        },
        {
            name: "aadharBack",
            maxCount: 1
        }
    ]),

    (req, res) => {

        const {
            name,
            email,
            mobile,
            password,
            referenceId,
            accountType
        } = req.body;

        const selfiePhoto =
            req.files?.selfiePhoto?.[0]?.filename || null;

        const aadharFront =
            req.files?.aadharFront?.[0]?.filename || null;

        const aadharBack =
            req.files?.aadharBack?.[0]?.filename || null;

        const existingUser =
            users.find(user => user.email === email);

        if (existingUser) {

            return res.json({
                message: "User already exists"
            });

        }

        const newUser = {

            id: Date.now(),

            sellerId:
                accountType === "advertiser"
                    ? "SEL" + Date.now()
                    : null,

            name,
            email,
            mobile,
            password,

            selfiePhoto,
            aadharFront,
            aadharBack,

            referenceId: referenceId || null,

            accountType:
                accountType || "user",

            status:
                accountType === "advertiser"
                    ? "pending"
                    : "active"

        };

        users.push(newUser);

        saveUsers();

        const adminExists =
            users.find(
                u =>
                    u.email ===
                    "atozvehiclecare@gmail.com"
            );

        if (!adminExists) {

            users.push({

                id: 1,

                name: "Admin",

                email:
                    "atozvehiclecare@gmail.com",

                mobile:
                    "7434004841",

                password:
                    "Admin123",

                accountType:
                    "admin",

                status:
                    "active"

            });

            saveUsers();

        }

        res.json({

            message:
                "User registered successfully",

            user: newUser

        });

    }
);

// ✅ LOGIN API
app.post("/api/login", (req, res) => {

    const { email, password } = req.body;

    const user = users.find(
        user =>
            user.email === email &&
            user.password === password
    );

    if (!user) {

        return res.json({
            message: "Invalid email or password"
        });

    }

    if (user.status === "banned") {

        return res.json({
            message: "Your account has been banned"
        });

    }

    if (
        user.accountType === "advertiser" &&
        user.status === "pending"
    ) {

        return res.json({
            message:
                "Your seller account is waiting for admin approval"
        });

    }

    if (
        user.accountType === "advertiser" &&
        user.status === "rejected"
    ) {

        return res.json({
            message:
                "Your seller account was rejected by admin"
        });

    }

    res.json({

        message: "Login successful ✅",

        user

    });

});

app.post(

    "/api/create-ad",

    upload.fields([
        {
            name: "video",
            maxCount: 1
        },
        {
            name: "images",
            maxCount: 10
        }
    ]),

    (req, res) => {

        const {
            businessName,
            category,
            location,
            description,
            phone,
            whatsapp,
            sellerId
        } = req.body;

        const seller =
            users.find(
                user =>
                    user.sellerId === sellerId
            );

        if (!seller) {

            return res.json({
                success: false,
                message: "Seller not found"
            });

        }

        if (seller.status !== "approved") {

            return res.json({
                success: false,
                message:
                    "Seller account is not approved"
            });

        }

        const video =

            req.files?.video?.[0]?.filename ||

            null;

        const images =

            req.files?.images

                ? req.files.images.map(
                    file => file.filename
                )

                : [];

        const ad = {

            adId:
                "AD" + Date.now(),

            sellerId,

            businessName,
            category,
            location,
            description,
            phone,
            whatsapp,

            video,

            images,

            createdAt:
                new Date(),

            status:
                "active"

        };

        ads.push(ad);

        saveAds();

        res.json({

            success: true,

            ad

        });

    }

);

app.get("/api/ads", (req, res) => {

    res.json(ads);

});

app.get("/api/users", (req, res) => {

    res.json(users);

});

app.delete("/api/delete-ad/:id", (req, res) => {

    const adId =
        req.params.id;

    ads =
        ads.filter(
            ad =>
                ad.adId !== adId
        );

    saveAds();

    res.json({
        success: true
    });

});

app.put("/api/ban-ad/:id", (req, res) => {

    const ad =
        ads.find(
            ad =>
                ad.adId ===
                req.params.id
        );

    if (!ad) {

        return res.json({
            success: false
        });

    }

    ad.status = "banned";

    saveAds();

    res.json({
        success: true
    });

});

app.put("/api/restore-ad/:id", (req, res) => {

    const ad =
        ads.find(
            ad =>
                ad.adId ===
                req.params.id
        );

    if (!ad) {

        return res.json({
            success: false
        });

    }

    ad.status = "active";

    saveAds();

    res.json({
        success: true
    });

});

app.put("/api/approve-seller/:id", (req, res) => {

    const seller =
        users.find(
            user =>
                user.id ==
                req.params.id
        );

    if (!seller) {

        return res.json({
            success: false
        });

    }

    seller.status = "approved";

    ads.forEach(ad => {

        if (
            ad.sellerId ===
            seller.sellerId
        ) {

            ad.status = "active";

        }

    });

    saveAds();

    seller.approvedAt =
        new Date();

    seller.rejectedAt =
        null;

    seller.rejectionReason =
        null;

    saveUsers();

    res.json({
        success: true
    });

});

app.put("/api/reject-seller/:id", (req, res) => {

    const seller =
        users.find(
            user =>
                user.id ==
                req.params.id
        );

    if (!seller) {

        return res.json({
            success: false
        });

    }

    seller.status = "rejected";

    ads.forEach(ad => {

        if (
            ad.sellerId ===
            seller.sellerId
        ) {

            ad.status =
                "banned";

        }

    });

    saveAds();

    seller.rejectedAt =
        new Date();

    seller.rejectionReason =
        req.body.reason ||
        "No reason provided";

    saveUsers();

    res.json({
        success: true
    });

});

app.put("/api/ban-user/:id", (req, res) => {

    const seller =
        users.find(
            user =>
                user.id ==
                req.params.id
        );

    if (!seller) {

        return res.json({
            success: false
        });

    }

    seller.status = "banned";

    ads.forEach(ad => {

        if (
            ad.sellerId ===
            seller.sellerId
        ) {

            ad.status = "banned";

        }

    });

    saveAds();

    saveUsers();

    res.json({
        success: true
    });

});

app.put("/api/unban-user/:id", (req, res) => {

    const user =
        users.find(
            user =>
                user.id ==
                req.params.id
        );

    if (!user) {

        return res.json({
            success: false
        });

    }

    user.status = "active";

    saveUsers();

    res.json({
        success: true
    });

});

app.put("/api/update-ad/:id", (req, res) => {

    const ad =
        ads.find(
            ad =>
                ad.adId ===
                req.params.id
        );

    if (!ad) {

        return res.json({
            success: false,
            message: "Advertisement not found"
        });

    }

    ad.businessName =
        req.body.businessName;

    ad.category =
        req.body.category;

    ad.location =
        req.body.location;

    ad.description =
        req.body.description;

    ad.phone =
        req.body.phone;

    ad.whatsapp =
        req.body.whatsapp;

    saveAds();

    res.json({
        success: true,
        ad
    });

});

// UPDATE BUSINESS PROFILE

app.put("/api/update-business-profile/:id", (req, res) => {

    const seller =
        users.find(
            user =>
                user.id ==
                req.params.id
        );

    if (!seller) {

        return res.json({
            success: false,
            message: "Seller not found"
        });

    }

    seller.businessName =
        req.body.businessName;

    seller.businessCategory =
        req.body.businessCategory;

    seller.businessLocation =
        req.body.businessLocation;

    seller.businessDescription =
        req.body.businessDescription;

    saveUsers();

    res.json({

        success: true,

        message:
            "Business profile updated successfully"

    });

});

// START SERVER
app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});