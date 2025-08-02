// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getDatabase, ref, set, get, update, remove, push } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

// Import jsPDF
const { jsPDF } = window.jspdf;

// Initialize EmailJS
emailjs.init("CjamtUH0QUbF9fmgs");

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC7m26-S8weeb0aSC_DwtFd_w5ONXIX70c",
    authDomain: "nzbdc-8c044.firebaseapp.com",
    projectId: "nzbdc-8c044",
    storageBucket: "nzbdc-8c044.appspot.com",
    messagingSenderId: "856989031416",
    appId: "1:856989031416:web:abf277e22c13cf07fb540d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getDatabase();

// Global Variables
let editDonorId = null;
let currentPage = 1;
let searchCurrentPage = 1;
let approvedCurrentPage = 1;
let pendingCurrentPage = 1;
const itemsPerPage = 10;
const approvedItemsPerPage = 10;
const pendingItemsPerPage = 10;
let currentUserRole = null;
let currentUserInfo = null;
let searchResultsData = [];
const adminEmail = "mdraduanislamriyaz@gmail.com";

// DOM Elements
const loginPage = document.getElementById("loginPage");
const loginForm = document.getElementById("loginForm");
const registerPage = document.getElementById("registerPage");
const registerForm = document.getElementById("registerForm");
const loginLink = document.getElementById("loginLink");
const registerLink = document.getElementById("registerLink");
const forgotPasswordLink = document.getElementById("forgotPasswordLink");
const passwordResetModal = document.getElementById("passwordResetModal");
const passwordResetForm = document.getElementById("passwordResetForm");
const homePage = document.getElementById("homePage");
const profilePage = document.getElementById("profilePage");
const profileInfo = document.getElementById("profileInfo");
const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const profileMobile = document.getElementById("profileMobile");
const profileAccess = document.getElementById("profileAccess");
const profileBtn = document.getElementById("profileBtn");
const donorInfoBtn = document.getElementById("donorInfoBtn");
const viewDonorsBtn = document.getElementById("viewDonorsBtn");
const searchDonorBtn = document.getElementById("searchDonorBtn");
const donorInfoPage = document.getElementById("donorInfoPage");
const donorForm = document.getElementById("donorForm");
const donorTableBody = document.getElementById("donorTableBody");
const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const currentPageLabel = document.getElementById("currentPage");
const searchDonorPage = document.getElementById("searchDonorPage");
const searchBtn = document.getElementById("searchBtn");
const searchName = document.getElementById("searchName");
const searchBloodGroup = document.getElementById("searchBloodGroup");
const searchResultsPage = document.getElementById("searchResultsPage");
const searchResultsBody = document.getElementById("searchResultsBody");
const searchPrevPageBtn = document.getElementById("searchPrevPageBtn");
const searchNextPageBtn = document.getElementById("searchNextPageBtn");
const searchCurrentPageLabel = document.getElementById("searchCurrentPage");
const aboutUsPage = document.getElementById("aboutUsPage");
const aboutUsBtn = document.getElementById("aboutUsBtn");
const logoutBtn = document.getElementById("logoutBtn");
const adminPanel = document.getElementById("adminPanel");
const logoutAdminBtn = document.getElementById("logoutAdminBtn");
const managePendingUsersBtn = document.getElementById("managePendingUsersBtn");
const manageApprovedUsersBtn = document.getElementById("manageApprovedUsersBtn");
const dashboardBtn = document.getElementById("dashboardBtn");
const donorDownloadBtn = document.getElementById("donorDownloadBtn");
const pendingUsersPage = document.getElementById("pendingUsersPage");
const pendingUsersTableBody = document.getElementById("pendingUsersTableBody");
const pendingPrevPageBtn = document.getElementById("pendingPrevPageBtn");
const pendingNextPageBtn = document.getElementById("pendingNextPageBtn");
const pendingCurrentPageLabel = document.getElementById("pendingCurrentPage");
const approvedUsersPage = document.getElementById("approvedUsersPage");
const approvedUsersTableBody = document.getElementById("approvedUsersTableBody");
const approvedPrevPageBtn = document.getElementById("approvedPrevPageBtn");
const approvedNextPageBtn = document.getElementById("approvedNextPageBtn");
const approvedCurrentPageLabel = document.getElementById("approvedCurrentPage");
const dashboardPage = document.getElementById("dashboardPage");
const totalDonorsElem = document.getElementById("totalDonors");
const totalUsersElem = document.getElementById("totalUsers");
const fullAccessCountElem = document.getElementById("fullAccessCount");
const userAccessCountElem = document.getElementById("userAccessCount");
const donorDownloadPage = document.getElementById("donorDownloadPage");
const downloadDonorBtn = document.getElementById("downloadDonorBtn");
const viewNotificationsBtn = document.getElementById("viewNotificationsBtn");
const notificationsList = document.getElementById("notificationsList");
const notificationsBackBtn = document.getElementById("notificationsBackBtn");
const bloodDonationRulesBtn = document.getElementById("bloodDonationRulesBtn");
const bloodDonationRulesSection = document.getElementById("bloodDonationRulesSection");
const bloodDonationBenefitsBtn = document.getElementById("bloodDonationBenefitsBtn");
const bloodDonationBenefitsSection = document.getElementById("bloodDonationBenefitsSection");
const backToProfileBtn = document.querySelectorAll("#backToProfileBtn");

// Navigation Function
function navigateTo(pageId) {
    document.querySelectorAll('.page').forEach(page => page.style.display = 'none');
    document.getElementById(pageId).style.display = 'block';
    history.pushState({ page: pageId }, null);
    if (pageId === 'profilePage') {
        showProfileInfo(); // প্রোফাইল পেজে গেলে প্রোফাইল তথ্য দেখান
    }
}

// Handle Browser Back Button
window.addEventListener('popstate', event => {
    const state = event.state || { page: 'loginPage' };
    document.querySelectorAll('.page').forEach(page => page.style.display = 'none');
    document.getElementById(state.page).style.display = 'block';
    if (state.page === 'profilePage') {
        showProfileInfo(); // ব্রাউজার ব্যাক করলে প্রোফাইল তথ্য দেখান
    }
});

// Initial Setup
history.replaceState({ page: 'loginPage' }, null);
loginPage.style.display = "block";

// Role-Based Feature Activation
function enableUserAccessFeatures() {
    currentUserRole = 'userAccess';
}

function enableFullAccessFeatures() {
    currentUserRole = 'fullAccess';
}

// Load User Profile Data
function loadUserProfile(userId) {
    get(ref(db, `approvedUsers/${userId}`))
        .then(snapshot => {
            if (snapshot.exists()) {
                const userData = snapshot.val();
                currentUserInfo = userData;
                profileName.textContent = `Name: ${userData.name}`;
                profileEmail.textContent = `Email: ${userData.email}`;
                profileMobile.textContent = `Mobile: ${userData.mobile}`;
                profileAccess.textContent = `Access: ${userData.role}`;
            }
        })
        .catch(error => console.error("Error loading profile: " + error.message));
}

// Show Profile Info and Hide Sections
function showProfileInfo() {
    profileInfo.style.display = 'block';
    bloodDonationRulesSection.style.display = 'none';
    bloodDonationBenefitsSection.style.display = 'none';
}

// Registration Handler with EmailJS Notification
registerForm.addEventListener("submit", e => {
    e.preventDefault();
    const name = document.getElementById("registerName").value;
    const mobile = document.getElementById("registerMobile").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;

    createUserWithEmailAndPassword(auth, email, password)
        .then(userCredential => {
            const user = userCredential.user;
            set(ref(db, `pendingUsers/${user.uid}`), { name, mobile, email })
                .then(() => {
                    emailjs.send('service_oh4gimt', 'template_mvugtpg', {
                        name: name,
                        email: email,
                        mobile: mobile,
                        userId: user.uid,
                        to_email: adminEmail
                    })
                    .then(() => {
                        console.log('Notification email sent to admin successfully');
                        alert("Registration request sent! Waiting for admin approval.");
                        signOut(auth);
                        navigateTo('loginPage');
                    })
                    .catch(error => {
                        console.error('Error sending email:', error);
                        alert(`Registration successful, but failed to notify admin. Error: ${error.text || error.message}`);
                    });
                })
                .catch(error => {
                    console.error("Error saving to database:", error);
                    alert("Error saving registration data: " + error.message);
                });
        })
        .catch(error => alert("Error during registration: " + error.message));
});

// Login Handler
loginForm.addEventListener("submit", e => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    signInWithEmailAndPassword(auth, email, password)
        .then(userCredential => {
            const user = userCredential.user;
            if (email === adminEmail) {
                navigateTo('adminPanel');
            } else {
                checkUserRole(user.uid).then(role => {
                    if (role === "fullAccess") {
                        enableFullAccessFeatures();
                    } else if (role === "userAccess") {
                        enableUserAccessFeatures();
                    } else {
                        alert("Your account is not approved yet.");
                        signOut(auth);
                        return;
                    }
                    navigateTo('homePage');
                    loadUserProfile(user.uid);
                })
                .catch(error => {
                    alert("Error: " + error.message);
                    signOut(auth);
                });
            }
        })
        .catch(error => alert("Error: " + error.message));
});

// Check User Role
function checkUserRole(userId) {
    return get(ref(db, `approvedUsers/${userId}`))
        .then(snapshot => {
            if (snapshot.exists()) return snapshot.val().role;
            else throw new Error("User role not found");
        });
}

// Logout Handlers
logoutBtn.addEventListener("click", () => {
    signOut(auth).then(() => navigateTo('loginPage'));
});

logoutAdminBtn.addEventListener("click", () => {
    signOut(auth).then(() => navigateTo('loginPage'));
});

// Home Page Navigation
profileBtn.addEventListener("click", () => navigateTo('profilePage'));
donorInfoBtn.addEventListener("click", () => navigateTo('donorInfoPage'));
viewDonorsBtn.addEventListener("click", () => { navigateTo('donorListPage'); loadDonorList(); });
searchDonorBtn.addEventListener("click", () => navigateTo('searchDonorPage'));
aboutUsBtn.addEventListener("click", () => navigateTo('aboutUsPage'));

// Donor Info Form Handler
donorForm.addEventListener("submit", e => {
    e.preventDefault();
    e.stopPropagation();

    if (!auth.currentUser) {
        alert("Please log in to add donor information.");
        return;
    }

    const donorMobileInput = document.querySelector("#donorForm #donorMobile");
    if (!donorMobileInput) {
        console.error("donorMobile input not found in DOM");
        alert("Error: Mobile input field not found!");
        return;
    }

    const mobileValue = donorMobileInput.value.trim();
    const mobileRegex = /^\d{10,13}$/;
    if (!mobileRegex.test(mobileValue)) {
        alert("Please enter a valid mobile number (10-13 digits).");
        return;
    }

    const donorData = {
        name: document.getElementById("donorName").value.trim(),
        age: document.getElementById("donorAge").value,
        gender: document.getElementById("donorGender").value,
        location: document.getElementById("donorLocation").value.trim(),
        mobile: mobileValue,
        bloodGroup: document.getElementById("donorBloodGroup").value,
        lastDonationDate: document.getElementById("donorLastDonationDate").value,
        nextDonationDate: calculateNextDonationDate(document.getElementById("donorLastDonationDate").value),
        userId: auth.currentUser.uid
    };

    if (editDonorId) {
        // Fetch old donor data before updating
        get(ref(db, `donors/${editDonorId}`))
            .then(snapshot => {
                if (snapshot.exists()) {
                    const oldData = snapshot.val();
                    update(ref(db, `donors/${editDonorId}`), donorData)
                        .then(() => {
                            alert("Donor information updated successfully!");
                            const notification = {
                                timestamp: Date.now(),
                                userId: auth.currentUser.uid,
                                userName: currentUserInfo.name,
                                userEmail: currentUserInfo.email,
                                action: "edit",
                                donorId: editDonorId,
                                donorName: donorData.name,
                                oldData: oldData, // Store old donor data
                                newData: donorData // Store new donor data
                            };
                            push(ref(db, "notifications"), notification);
                            editDonorId = null;
                            donorForm.reset();
                            navigateTo('donorListPage');
                            loadDonorList();
                        })
                        .catch(error => alert("Error updating donor: " + error.message));
                }
            })
            .catch(error => alert("Error fetching old donor data: " + error.message));
    } else {
        const newDonorRef = push(ref(db, "donors"));
        set(newDonorRef, donorData)
            .then(() => {
                alert("Donor information saved successfully!");
                const notification = {
                    timestamp: Date.now(),
                    userId: auth.currentUser.uid,
                    userName: currentUserInfo.name,
                    userEmail: currentUserInfo.email,
                    action: "add",
                    donorId: newDonorRef.key,
                    donorName: donorData.name,
                    newData: donorData
                };
                push(ref(db, "notifications"), notification);
                donorForm.reset();
                navigateTo('homePage');
            })
            .catch(error => alert("Error saving donor: " + error.message));
    }
});

// Calculate Next Donation Date
function calculateNextDonationDate(lastDonationDate) {
    const lastDate = new Date(lastDonationDate);
    lastDate.setMonth(lastDate.getMonth() + 3);
    return lastDate.toISOString().split('T')[0];
}

// রক্তদানের যোগ্যতা চেক করার ফাংশন
function isEligibleForDonation(lastDonationDate) {
    if (!lastDonationDate) return false;
    const lastDate = new Date(lastDonationDate);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 90; // ৩ মাস = ৯০ দিন
}

// Load Donor List with Pagination
function loadDonorList(page = 1) {
    get(ref(db, "donors/"))
        .then(snapshot => {
            donorTableBody.innerHTML = "";
            if (snapshot.exists()) {
                const donors = Object.entries(snapshot.val());
                const totalPages = Math.ceil(donors.length / itemsPerPage);
                currentPage = page;
                currentPageLabel.textContent = `Page: ${currentPage}`;
                prevPageBtn.disabled = currentPage === 1;
                nextPageBtn.disabled = currentPage === totalPages;
                const startIndex = (currentPage - 1) * itemsPerPage;
                const donorsToShow = donors.slice(startIndex, startIndex + itemsPerPage);
                let donorNumber = startIndex + 1;
                let content = "";
                donorsToShow.forEach(([donorId, donor]) => {
                    const deleteButton = currentUserRole === 'fullAccess' ? `<button onclick="deleteDonor('${donorId}')">Delete</button>` : '';
                    content += `
                        <div style="border: 1px solid #ccc; padding: 10px; margin-bottom: 20px;">
                            <h3>Donor ${donorNumber}</h3>
                            <p><strong>Name:</strong> ${donor.name}</p>
                            <p><strong>Age:</strong> ${donor.age}</p>
                            <p><strong>Gender:</strong> ${donor.gender || '-'}</p>
                            <p><strong>Location:</strong> ${donor.location || '-'}</p>
                            <p><strong>Mobile:</strong> ${donor.mobile || '-'}</p>
                            <p><strong>Blood Group:</strong> ${donor.bloodGroup}</p>
                            <p><strong>Last Donation:</strong> ${donor.lastDonationDate}</p>
                            <p><strong>Next Donation:</strong> ${donor.nextDonationDate}</p>
                            <p>${deleteButton}</p>
                        </div>
                    `;
                    donorNumber++;
                });
                donorTableBody.innerHTML = content || "<p>No donors found.</p>";
            } else {
                donorTableBody.innerHTML = "<p>No donors found.</p>";
            }
        })
        .catch(error => alert("Error: " + error.message));
}

// Donor List Pagination Buttons
prevPageBtn.addEventListener("click", () => {
    if (currentPage > 1) loadDonorList(currentPage - 1);
});

nextPageBtn.addEventListener("click", () => {
    get(ref(db, "donors/"))
        .then(snapshot => {
            if (snapshot.exists()) {
                const donors = Object.entries(snapshot.val());
                const totalPages = Math.ceil(donors.length / itemsPerPage);
                if (currentPage < totalPages) loadDonorList(currentPage + 1);
            }
        });
});

// Search Functionality
searchBtn.addEventListener("click", () => {
    const bloodGroup = searchBloodGroup.value.trim();
    const donorName = searchName.value.trim().toLowerCase();
    get(ref(db, "donors"))
        .then(snapshot => {
            searchResultsData = [];
            if (snapshot.exists()) {
                snapshot.forEach(childSnapshot => {
                    const donor = childSnapshot.val();
                    const donorId = childSnapshot.key;
                    if ((bloodGroup ? donor.bloodGroup === bloodGroup : true) &&
                        (donorName ? donor.name.toLowerCase().includes(donorName) : true) &&
                        isEligibleForDonation(donor.lastDonationDate)) {
                        searchResultsData.push({ donorId, ...donor });
                    }
                });
            }
            searchCurrentPage = 1;
            displaySearchResults();
            navigateTo('searchResultsPage');
        })
        .catch(error => alert("Error: " + error.message));
});

// Display Search Results
function displaySearchResults() {
    const startIndex = (searchCurrentPage - 1) * itemsPerPage;
    const paginatedData = searchResultsData.slice(startIndex, startIndex + itemsPerPage);
    const totalPages = Math.ceil(searchResultsData.length / itemsPerPage);
    searchCurrentPageLabel.textContent = `${searchCurrentPage} of ${totalPages}`;
    searchPrevPageBtn.disabled = searchCurrentPage === 1;
    searchNextPageBtn.disabled = searchCurrentPage === totalPages;
    let donorNumber = startIndex + 1;
    let content = "";
    paginatedData.forEach(donor => {
        const actions = currentUserRole === 'fullAccess' ? `
            <button onclick="editDonor('${donor.donorId}')">Edit</button>
            <button onclick="deleteDonor('${donor.donorId}')">Delete</button>
        ` : '';
        content += `
            <div style="border: 1px solid #ccc; padding: 10px; margin-bottom: 20px;">
                <h3>Donor ${donorNumber}</h3>
                <p><strong>Name:</strong> ${donor.name}</p>
                <p><strong>Age:</strong> ${donor.age}</p>
                <p><strong>Location:</strong> ${donor.location || '-'}</p>
                <p><strong>Mobile:</strong> ${donor.mobile || '-'}</p>
                <p><strong>Blood Group:</strong> ${donor.bloodGroup}</p>
                <p><strong>Last Donation:</strong> ${donor.lastDonationDate}</p>
                <p><strong>Next Donation:</strong> ${donor.nextDonationDate}</p>
                <p>${actions}</p>
            </div>
        `;
        donorNumber++;
    });
    searchResultsBody.innerHTML = content || "<p>No eligible donors found.</p>";
}

searchPrevPageBtn.addEventListener("click", () => {
    if (searchCurrentPage > 1) {
        searchCurrentPage--;
        displaySearchResults();
    }
});

searchNextPageBtn.addEventListener("click", () => {
    const totalPages = Math.ceil(searchResultsData.length / itemsPerPage);
    if (searchCurrentPage < totalPages) {
        searchCurrentPage++;
        displaySearchResults();
    }
});

// Edit Donor
window.editDonor = function(donorId) {
    get(ref(db, `donors/${donorId}`))
        .then(snapshot => {
            if (snapshot.exists()) {
                const donor = snapshot.val();
                document.getElementById("donorName").value = donor.name;
                document.getElementById("donorAge").value = donor.age;
                document.getElementById("donorGender").value = donor.gender;
                document.getElementById("donorLocation").value = donor.location;
                document.getElementById("donorMobile").value = donor.mobile;
                document.getElementById("donorBloodGroup").value = donor.bloodGroup;
                document.getElementById("donorLastDonationDate").value = donor.lastDonationDate;
                editDonorId = donorId;
                navigateTo('donorInfoPage');
            }
        })
        .catch(error => alert("Error: " + error.message));
};

// Delete Donor
window.deleteDonor = function(donorId) {
    if (confirm("Are you sure you want to delete this donor?")) {
        get(ref(db, `donors/${donorId}`))
            .then(snapshot => {
                if (snapshot.exists()) {
                    const donor = snapshot.val();
                    remove(ref(db, `donors/${donorId}`))
                        .then(() => {
                            alert("Donor deleted successfully!");
                            loadDonorList(currentPage);
                            const notification = {
                                timestamp: Date.now(),
                                userId: auth.currentUser.uid,
                                userName: currentUserInfo.name,
                                userEmail: currentUserInfo.email,
                                action: "delete",
                                donorId: donorId,
                                donorName: donor.name
                            };
                            push(ref(db, "notifications"), notification);
                        })
                        .catch(error => alert("Error: " + error.message));
                }
            })
            .catch(error => alert("Error: " + error.message));
    }
};

// Delete Notification
window.deleteNotification = function(notificationId) {
    if (confirm("Are you sure you want to delete this notification?")) {
        remove(ref(db, `notifications/${notificationId}`))
            .then(() => {
                alert("Notification deleted successfully!");
                loadNotifications();
            })
            .catch(error => alert("Error: " + error.message));
    }
};

// Admin Functions
function loadPendingUsers(page = 1) {
    get(ref(db, "pendingUsers"))
        .then(snapshot => {
            pendingUsersTableBody.innerHTML = "";
            if (snapshot.exists()) {
                const pendingUsers = Object.entries(snapshot.val());
                const totalPages = Math.ceil(pendingUsers.length / pendingItemsPerPage);
                pendingCurrentPage = page;
                pendingCurrentPageLabel.textContent = `Page: ${pendingCurrentPage}`;
                pendingPrevPageBtn.disabled = pendingCurrentPage === 1;
                pendingNextPageBtn.disabled = pendingCurrentPage === totalPages;
                const startIndex = (pendingCurrentPage - 1) * pendingItemsPerPage;
                const usersToShow = pendingUsers.slice(startIndex, startIndex + pendingItemsPerPage);
                let userNumber = startIndex + 1;
                let content = "";
                usersToShow.forEach(([userId, user]) => {
                    content += `
                        <div style="border: 1px solid #ccc; padding: 10px; margin-bottom: 20px;">
                            <h3>User ${userNumber}</h3>
                            <p><strong>Name:</strong> ${user.name}</p>
                            <p><strong>Mobile:</strong> ${user.mobile}</p>
                            <p><strong>Email:</strong> ${user.email}</p>
                            <p><strong>Actions:</strong>
                                <button onclick="approveUser('${userId}', 'userAccess')">User Access</button>
                                <button onclick="approveUser('${userId}', 'fullAccess')">Full Access</button>
                                <button onclick="denyUser('${userId}')">Delete</button>
                            </p>
                        </div>
                    `;
                    userNumber++;
                });
                pendingUsersTableBody.innerHTML = content || "<p>No pending users.</p>";
            } else {
                pendingUsersTableBody.innerHTML = "<p>No pending users.</p>";
            }
        })
        .catch(error => alert("Error: " + error.message));
}

window.approveUser = function(userId, role) {
    get(ref(db, `pendingUsers/${userId}`))
        .then(snapshot => {
            if (snapshot.exists()) {
                const user = snapshot.val();
                set(ref(db, `approvedUsers/${userId}`), { name: user.name, mobile: user.mobile, email: user.email, role })
                    .then(() => remove(ref(db, `pendingUsers/${userId}`)))
                    .then(() => {
                        alert("User approved successfully with " + role + " access.");
                        loadPendingUsers(pendingCurrentPage);
                    })
                    .catch(error => alert("Error: " + error.message));
            }
        })
        .catch(error => alert("Error: " + error.message));
};

window.denyUser = function(userId) {
    remove(ref(db, `pendingUsers/${userId}`))
        .then(() => {
            alert("Pending user deleted successfully.");
            loadPendingUsers(pendingCurrentPage);
        })
        .catch(error => alert("Error: " + error.message));
};

function loadApprovedUsers(page = 1) {
    get(ref(db, 'approvedUsers'))
        .then(snapshot => {
            approvedUsersTableBody.innerHTML = "";
            if (snapshot.exists()) {
                const users = Object.entries(snapshot.val());
                const totalPages = Math.ceil(users.length / approvedItemsPerPage);
                approvedCurrentPage = page;
                approvedCurrentPageLabel.textContent = `Page: ${approvedCurrentPage}`;
                approvedPrevPageBtn.disabled = approvedCurrentPage === 1;
                approvedNextPageBtn.disabled = approvedCurrentPage === totalPages;
                const startIndex = (approvedCurrentPage - 1) * approvedItemsPerPage;
                const usersToShow = users.slice(startIndex, startIndex + approvedItemsPerPage);
                let userNumber = startIndex + 1;
                let content = "";
                usersToShow.forEach(([userId, user]) => {
                    content += `
                        <div style="border: 1px solid #ccc; padding: 10px; margin-bottom: 20px;">
                            <h3>User ${userNumber}</h3>
                            <p><strong>Name:</strong> ${user.name}</p>
                            <p><strong>Mobile:</strong> ${user.mobile}</p>
                            <p><strong>Email:</strong> ${user.email}</p>
                            <p><strong>Current Access:</strong> ${user.role}</p>
                            <p><strong>Change Access:</strong>
                                <select class="accessSelect" data-userid="${userId}">
                                    <option value="userAccess" ${user.role === 'userAccess' ? 'selected' : ''}>User Access</option>
                                    <option value="fullAccess" ${user.role === 'fullAccess' ? 'selected' : ''}>Full Access</option>
                                </select>
                            </p>
                            <p><strong>Actions:</strong>
                                <button onclick="removeUserAccess('${userId}')">Remove</button>
                            </p>
                        </div>
                    `;
                    userNumber++;
                });
                approvedUsersTableBody.innerHTML = content;
                document.querySelectorAll('.accessSelect').forEach(select => {
                    select.addEventListener('change', e => {
                        const userId = e.target.dataset.userid;
                        const newRole = e.target.value;
                        updateUserAccess(userId, newRole);
                    });
                });
            } else {
                approvedUsersTableBody.innerHTML = "<p>No approved users.</p>";
            }
        })
        .catch(error => alert("Error: " + error.message));
}

approvedPrevPageBtn.addEventListener("click", () => {
    if (approvedCurrentPage > 1) loadApprovedUsers(approvedCurrentPage - 1);
});

approvedNextPageBtn.addEventListener("click", () => {
    get(ref(db, 'approvedUsers'))
        .then(snapshot => {
            if (snapshot.exists()) {
                const users = Object.entries(snapshot.val());
                const totalPages = Math.ceil(users.length / approvedItemsPerPage);
                if (approvedCurrentPage < totalPages) loadApprovedUsers(approvedCurrentPage + 1);
            }
        });
});

window.removeUserAccess = function(userId) {
    if (confirm("Are you sure you want to remove this user's access?")) {
        remove(ref(db, `approvedUsers/${userId}`))
            .then(() => {
                alert("User access removed successfully!");
                loadApprovedUsers();
            })
            .catch(error => alert("Error: " + error.message));
    }
};

function updateUserAccess(userId, newRole) {
    update(ref(db, `approvedUsers/${userId}`), { role: newRole })
        .then(() => {
            alert("Access updated successfully!");
            loadApprovedUsers(approvedCurrentPage);
        })
        .catch(error => alert("Error: " + error.message));
}

// Load Dashboard Data
function loadDashboard() {
    get(ref(db, "donors")).then(donorSnapshot => {
        const totalDonors = donorSnapshot.exists() ? Object.keys(donorSnapshot.val()).length : 0;
        totalDonorsElem.textContent = totalDonors;
    });
    get(ref(db, "approvedUsers")).then(userSnapshot => {
        let totalUsers = 0, fullAccessCount = 0, userAccessCount = 0;
        if (userSnapshot.exists()) {
            totalUsers = Object.keys(userSnapshot.val()).length;
            Object.values(userSnapshot.val()).forEach(user => {
                if (user.role === "fullAccess") fullAccessCount++;
                else if (user.role === "userAccess") userAccessCount++;
            });
        }
        totalUsersElem.textContent = totalUsers;
        fullAccessCountElem.textContent = fullAccessCount;
        userAccessCountElem.textContent = userAccessCount;
    });
}

// Download Donor List as PDF
downloadDonorBtn.addEventListener("click", () => {
    get(ref(db, "donors")).then(snapshot => {
        if (snapshot.exists()) {
            const donors = snapshot.val();
            const doc = new jsPDF();
            let y = 10;
            doc.text("Donor List", 10, y);
            y += 10;
            Object.values(donors).forEach((donor, index) => {
                doc.text(`${index + 1}. Name: ${donor.name}, Blood Group: ${donor.bloodGroup}, Mobile: ${donor.mobile || '-'}`, 10, y);
                y += 10;
                if (y > 280) {
                    doc.addPage();
                    y = 10;
                }
            });
            doc.save("donor_list.pdf");
        } else {
            alert("No donors available to download.");
        }
    });
});

// Load Notifications
function loadNotifications() {
    get(ref(db, "notifications"))
        .then(snapshot => {
            notificationsList.innerHTML = "";
            if (snapshot.exists()) {
                const notifications = Object.entries(snapshot.val()).sort((a, b) => b[1].timestamp - a[1].timestamp);
                notifications.forEach(([notificationId, notif]) => {
                    const date = new Date(notif.timestamp).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: true
                    });
                    let message = `<strong>সময়:</strong> ${date}<br>`;
                    message += `<strong>এডিটকারী:</strong> ${notif.userName} (${notif.userEmail})<br>`;
                    if (notif.action === "edit") {
                        message += `<strong>ডোনার:</strong> ${notif.donorName}<br>`;
                        message += `<strong>পরিবর্তিত তথ্য:</strong><br>`;
                        const changes = [];
                        const fields = ['name', 'age', 'gender', 'location', 'mobile', 'bloodGroup', 'lastDonationDate'];
                        const fieldNames = {
                            name: 'নাম',
                            age: 'বয়স',
                            gender: 'লিঙ্গ',
                            location: 'অবস্থান',
                            mobile: 'মোবাইল',
                            bloodGroup: 'রক্তের গ্রুপ',
                            lastDonationDate: 'সর্বশেষ দান'
                        };
                        fields.forEach(field => {
                            if (notif.oldData[field] !== notif.newData[field]) {
                                changes.push(`${fieldNames[field]}: ${notif.oldData[field] || '-'} থেকে ${notif.newData[field] || '-'} এ পরিবর্তিত`);
                            }
                        });
                        message += changes.length > 0 ? changes.join('<br>') : 'কোনো তথ্য পরিবর্তিত হয়নি।';
                    } else if (notif.action === "add") {
                        message += `<strong>ডোনার যুক্ত হয়েছে:</strong> ${notif.donorName}<br>`;
                        message += `<strong>তথ্য:</strong><br>`;
                        message += `নাম: ${notif.newData.name || '-'}, বয়স: ${notif.newData.age || '-'}, লিঙ্গ: ${notif.newData.gender || '-'}, অবস্থান: ${notif.newData.location || '-'}, মোবাইল: ${notif.newData.mobile || '-'}, রক্তের গ্রুপ: ${notif.newData.bloodGroup || '-'}, সর্বশেষ দান: ${notif.newData.lastDonationDate || '-'}<br>`;
                    } else if (notif.action === "delete") {
                        message += `<strong>ডোনার মুছে ফেলা হয়েছে:</strong> ${notif.donorName}<br>`;
                    }
                    notificationsList.innerHTML += `
                        <p>
                            ${message}
                            <button onclick="deleteNotification('${notificationId}')">মুছুন</button>
                        </p>
                    `;
                });
            } else {
                notificationsList.innerHTML = "<p>কোনো নোটিফিকেশন নেই।</p>";
            }
        })
        .catch(error => alert("ত্রুটি: " + error.message));
}

// Admin Panel Navigation
managePendingUsersBtn.addEventListener("click", () => {
    navigateTo('pendingUsersPage');
    loadPendingUsers();
});

manageApprovedUsersBtn.addEventListener("click", () => {
    navigateTo('approvedUsersPage');
    loadApprovedUsers();
});

dashboardBtn.addEventListener("click", () => {
    navigateTo('dashboardPage');
    loadDashboard();
});

donorDownloadBtn.addEventListener("click", () => navigateTo('donorDownloadPage'));

viewNotificationsBtn.addEventListener("click", () => {
    navigateTo('notificationsPage');
    loadNotifications();
});

notificationsBackBtn.addEventListener("click", () => navigateTo('adminPanel'));

pendingPrevPageBtn.addEventListener("click", () => {
    if (pendingCurrentPage > 1) loadPendingUsers(pendingCurrentPage - 1);
});

pendingNextPageBtn.addEventListener("click", () => {
    get(ref(db, 'pendingUsers'))
        .then(snapshot => {
            if (snapshot.exists()) {
                const users = Object.entries(snapshot.val());
                const totalPages = Math.ceil(users.length / pendingItemsPerPage);
                if (pendingCurrentPage < totalPages) loadPendingUsers(pendingCurrentPage + 1);
            }
        });
});

// Password Reset Handler
forgotPasswordLink.addEventListener("click", (e) => {
    e.preventDefault();
    console.log("Forgot Password link clicked"); // Debugging
    navigateTo('passwordResetModal');
});

passwordResetForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("resetEmail").value.trim();
    console.log("Password reset requested for email:", email); // Debugging

    if (!email) {
        alert("দয়া করে ইমেইল প্রবেশ করান।");
        return;
    }

    sendPasswordResetEmail(auth, email)
        .then(() => {
            alert("পাসওয়ার্ড রিসেট লিঙ্ক আপনার ইমেইলে পাঠানো হয়েছে!");
            console.log("Password reset email sent successfully");
            navigateTo('loginPage');
        })
        .catch(error => {
            console.error("পাসওয়ার্ড রিসেটে ত্রুটি:", error.code, error.message);
            let errorMessage = "পাসওয়ার্ড রিসেটে ত্রুটি ঘটেছে।";
            if (error.code === 'auth/user-not-found') {
                errorMessage = "এই ইমেইলের সাথে কোনো অ্যাকাউন্ট পাওয়া যায়নি।";
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "অবৈধ ইমেইল ঠিকানা। দয়া করে সঠিক ইমেইল প্রবেশ করান।";
            }
            alert(errorMessage);
        });
});

loginLink.addEventListener("click", (e) => {
    e.preventDefault();
    navigateTo('loginPage');
});

registerLink.addEventListener("click", (e) => {
    e.preventDefault();
    navigateTo('registerPage');
});

// রক্তদানের নিয়মাবলী টগল করার জন্য ইভেন্ট লিসেনার
bloodDonationRulesBtn.addEventListener("click", () => {
    profileInfo.style.display = 'none';
    bloodDonationRulesSection.style.display = 'block';
    bloodDonationBenefitsSection.style.display = 'none';
});

// রক্তদানের সুবিধা টগল করার জন্য ইভেন্ট লিসেনার
bloodDonationBenefitsBtn.addEventListener("click", () => {
    profileInfo.style.display = 'none';
    bloodDonationRulesSection.style.display = 'none';
    bloodDonationBenefitsSection.style.display = 'block';
});

// প্রোফাইলে ফিরে যাওয়ার জন্য ইভেন্ট লিসেনার
backToProfileBtn.forEach(btn => {
    btn.addEventListener("click", () => {
        showProfileInfo();
    });
});