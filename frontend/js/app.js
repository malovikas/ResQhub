// ============================================================
// ResQhub Frontend
// Citizen + Admin Portal
// API Gateway: http://127.0.0.1:5000/api
// ============================================================

const API_BASE_URL = "http://127.0.0.1:5000/api";


// ============================================================
// CURRENT USER
// ============================================================

let CURRENT_USER = null;


function loadCurrentUser() {

    try {

        const savedUser =
            localStorage.getItem("resqhub_user");

        if (!savedUser) {
            CURRENT_USER = null;
            return;
        }

        const user = JSON.parse(savedUser);

        if (!user || !user.id) {
            throw new Error("Invalid saved user");
        }

        CURRENT_USER = user;

    } catch (error) {

        console.error("Invalid saved user:", error);

        CURRENT_USER = null;

        localStorage.removeItem("resqhub_user");
        localStorage.removeItem("resqhub_user_id");
    }
}


loadCurrentUser();


// ============================================================
// HELPERS
// ============================================================

async function getResponseData(response) {

    try {
        return await response.json();
    } catch {
        return {};
    }
}


function getErrorMessage(data, fallback) {

    return (
        data?.message ||
        data?.error ||
        fallback
    );
}


function isAdmin() {

    return (
        CURRENT_USER &&
        CURRENT_USER.role === "admin"
    );
}


function isUser() {

    return (
        CURRENT_USER &&
        CURRENT_USER.role === "user"
    );
}


// ============================================================
// CUSTOM POPUP
// ============================================================

function showPopup(
    title,
    message,
    type = "info",
    callback = null,
    showCancel = false
) {

    const existing =
        document.getElementById("resqhub-popup");

    if (existing) {
        existing.remove();
    }

    const popup =
        document.createElement("div");

    popup.id = "resqhub-popup";

    popup.innerHTML = `

        <div class="popup-overlay">

            <div class="popup-box">

                <div class="popup-icon ${type}">
                    ${
                        type === "success"
                            ? "✓"
                            : type === "error"
                            ? "!"
                            : "?"
                    }
                </div>

                <h3>${title}</h3>

                <p>${message}</p>

                <div class="popup-actions">

                    ${
                        showCancel
                            ? `
                                <button
                                    type="button"
                                    class="popup-cancel"
                                    id="popup-cancel">

                                    Cancel

                                </button>
                              `
                            : ""
                    }

                    <button
                        type="button"
                        class="popup-ok"
                        id="popup-ok">

                        ${showCancel ? "Confirm" : "OK"}

                    </button>

                </div>

            </div>

        </div>
    `;

    document.body.appendChild(popup);

    document
        .getElementById("popup-ok")
        ?.addEventListener("click", () => {

            popup.remove();

            if (callback) {
                callback(true);
            }
        });

    document
        .getElementById("popup-cancel")
        ?.addEventListener("click", () => {

            popup.remove();

            if (callback) {
                callback(false);
            }
        });
}


function showConfirm(title, message, callback) {

    showPopup(
        title,
        message,
        "info",
        callback,
        true
    );
}


// ============================================================
// SERVICE HEALTH
// ADMIN ONLY
// ============================================================

async function checkAllServices() {

    if (!isAdmin()) {
        return;
    }

    const serviceElements = {

        "user-service":
            "user-status",

        "incident-service":
            "incident-status",

        "rescue-service":
            "rescue-status",

        "resource-service":
            "resource-status",

        "notification-service":
            "notification-status"
    };

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/health/services`
            );

        const data =
            await getResponseData(response);

        if (!response.ok) {
            throw new Error(
                getErrorMessage(
                    data,
                    "Gateway health request failed"
                )
            );
        }

        const services =
            data.services || [];

        Object.values(serviceElements)
            .forEach(id => {

                const element =
                    document.getElementById(id);

                if (element) {

                    element.textContent =
                        "Offline";

                    element.classList.remove(
                        "online"
                    );

                    element.classList.add(
                        "offline"
                    );
                }
            });

        services.forEach(service => {

            const elementId =
                serviceElements[
                    service.service
                ];

            if (!elementId) {
                return;
            }

            const element =
                document.getElementById(
                    elementId
                );

            if (!element) {
                return;
            }

            if (service.status === "online") {

                element.textContent =
                    "Online";

                element.classList.remove(
                    "offline"
                );

                element.classList.add(
                    "online"
                );

            } else {

                element.textContent =
                    "Offline";

                element.classList.remove(
                    "online"
                );

                element.classList.add(
                    "offline"
                );
            }
        });

    } catch (error) {

        console.error(
            "Health check failed:",
            error
        );
    }
}


// ============================================================
// LOGIN FORM
// ============================================================

function showLoginForm() {

    hideRegistrationForm();

    const section =
        document.getElementById(
            "login-section"
        );

    if (!section) {
        return;
    }

    section.classList.remove("hidden");

    section.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}


function hideLoginForm() {

    document
        .getElementById("login-section")
        ?.classList.add("hidden");
}


// ============================================================
// REGISTRATION FORM
// ============================================================

function showRegistrationForm() {

    hideLoginForm();

    const section =
        document.getElementById(
            "registration-section"
        );

    if (!section) {
        return;
    }

    section.classList.remove("hidden");

    section.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}


function hideRegistrationForm() {

    document
        .getElementById(
            "registration-section"
        )
        ?.classList.add("hidden");
}


// ============================================================
// INCIDENT FORM
// ============================================================

function showIncidentForm() {

    if (!CURRENT_USER) {

        showPopup(
            "Login Required",
            "Please login before reporting an emergency.",
            "error"
        );

        showLoginForm();

        return;
    }

    const section =
        document.getElementById(
            "incident-form-section"
        );

    if (!section) {
        return;
    }

    section.classList.remove("hidden");

    section.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}


function hideIncidentForm() {

    document
        .getElementById(
            "incident-form-section"
        )
        ?.classList.add("hidden");
}


// ============================================================
// UPDATE HEADER
// ============================================================

function updateLoginUI() {

    const loginButton =
        document.getElementById(
            "login-button"
        );

    const registerButton =
        document.getElementById(
            "register-button"
        );

    const userSection =
        document.getElementById(
            "current-user-section"
        );

    const userName =
        document.getElementById(
            "current-user-name"
        );

    const userDetails =
        document.getElementById(
            "current-user-details"
        );

    if (CURRENT_USER) {

        if (loginButton) {
            loginButton.classList.add("hidden");
        }

        if (registerButton) {
            registerButton.classList.add("hidden");
        }

        if (userSection) {
            userSection.classList.remove("hidden");
        }

        if (userName) {

            userName.textContent =
                CURRENT_USER.name ||
                "User";
        }

        if (userDetails) {

            userDetails.textContent =
                `${
                    CURRENT_USER.role === "admin"
                        ? "Administrator"
                        : "Citizen"
                } • ${
                    CURRENT_USER.email || ""
                }`;
        }

    } else {

        if (loginButton) {
            loginButton.classList.remove("hidden");
        }

        if (registerButton) {
            registerButton.classList.remove("hidden");
        }

        if (userSection) {
            userSection.classList.add("hidden");
        }
    }
}


// ============================================================
// ROLE BASED UI
// ============================================================

function updateRoleUI() {

    const adminOnly =
        document.querySelectorAll(
            ".admin-only"
        );

    const userOnly =
        document.querySelectorAll(
            ".user-only"
        );

    const adminSections =
        document.querySelectorAll(
            ".admin-section"
        );

    const notificationSection =
        document.getElementById(
            "notifications"
        );

    const serviceSection =
        document.getElementById(
            "service-status-section"
        );

    const dashboardSection =
        document.getElementById(
            "admin-dashboard"
        );

    // --------------------------------------------------------
    // LOGGED OUT
    // --------------------------------------------------------

    if (!CURRENT_USER) {

        adminOnly.forEach(element =>
            element.classList.add("hidden")
        );

        userOnly.forEach(element =>
            element.classList.add("hidden")
        );

        adminSections.forEach(element =>
            element.classList.add("hidden")
        );

        if (notificationSection) {
            notificationSection.classList.add(
                "hidden"
            );
        }

        if (serviceSection) {
            serviceSection.classList.add(
                "hidden"
            );
        }

        if (dashboardSection) {
            dashboardSection.classList.add(
                "hidden"
            );
        }

        return;
    }
    updateIncidentHeading()

    // --------------------------------------------------------
    // USER
    // --------------------------------------------------------

    if (isUser()) {

        adminOnly.forEach(element =>
            element.classList.add("hidden")
        );

        adminSections.forEach(element =>
            element.classList.add("hidden")
        );

        userOnly.forEach(element =>
            element.classList.remove("hidden")
        );

        if (notificationSection) {
            notificationSection.classList.remove(
                "hidden"
            );
        }

        if (serviceSection) {
            serviceSection.classList.add(
                "hidden"
            );
        }

        if (dashboardSection) {
            dashboardSection.classList.add(
                "hidden"
            );
        }

        return;
    }


    // --------------------------------------------------------
    // ADMIN
    // --------------------------------------------------------

    if (isAdmin()) {

        adminOnly.forEach(element =>
            element.classList.remove("hidden")
        );

        adminSections.forEach(element =>
            element.classList.remove("hidden")
        );

        userOnly.forEach(element =>
            element.classList.remove("hidden")
        );

        if (notificationSection) {
            notificationSection.classList.remove(
                "hidden"
            );
        }

        if (serviceSection) {
            serviceSection.classList.remove(
                "hidden"
            );
        }

        if (dashboardSection) {
            dashboardSection.classList.remove(
                "hidden"
            );
        }
    }
}


// ============================================================
// LOGIN
// ============================================================

async function loginUser(event) {

    event.preventDefault();

    const emailInput =
        document.getElementById(
            "login-email"
        );

    const phoneInput =
        document.getElementById(
            "login-phone"
        );

    const roleInput =
        document.getElementById(
            "login-role"
        );

    const message =
        document.getElementById(
            "login-message"
        );

    if (
        !emailInput ||
        !phoneInput ||
        !roleInput ||
        !message
    ) {
        return;
    }

    const email =
        emailInput.value.trim();

    const phone =
        phoneInput.value.trim();

    const selectedRole =
        roleInput.value;

    message.innerHTML = "";

    if (!selectedRole) {

        message.innerHTML = `
            <p class="error-message">
                Please select your role.
            </p>
        `;

        return;
    }

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/users/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        email,
                        phone
                    })
                }
            );

        const data =
            await getResponseData(response);

        if (!response.ok) {

            message.innerHTML = `
                <p class="error-message">
                    ${getErrorMessage(
                        data,
                        "Invalid email or phone."
                    )}
                </p>
            `;

            return;
        }

        const user =
            data.user ||
            data.data;

        if (!user) {

            message.innerHTML = `
                <p class="error-message">
                    Login succeeded but user data was not returned.
                </p>
            `;

            return;
        }


        // ----------------------------------------------------
        // CLEAR OLD USER
        // ----------------------------------------------------

        CURRENT_USER = null;

        localStorage.removeItem(
            "resqhub_user"
        );

        localStorage.removeItem(
            "resqhub_user_id"
        );


        // ----------------------------------------------------
        // SAVE NEW USER
        // ----------------------------------------------------

        CURRENT_USER = {

            id:
                user.id,

            name:
                user.name || "",

            email:
                user.email || "",

            phone:
                user.phone || "",

            role:
                selectedRole
        };


        localStorage.setItem(
            "resqhub_user",
            JSON.stringify(
                CURRENT_USER
            )
        );

        localStorage.setItem(
            "resqhub_user_id",
            String(
                CURRENT_USER.id
            )
        );


        message.innerHTML = `
            <p class="success-message">
                Login successful. Welcome,
                ${CURRENT_USER.name}!
            </p>
        `;


        updateLoginUI();
        updateRoleUI();


        // Load correct data
        await loadIncidents();
        await loadNotifications();

        if (isAdmin()) {

            await Promise.all([
                loadRescueTeams(),
                loadResources(),
                checkAllServices()
            ]);
        }


        setTimeout(() => {

            hideLoginForm();

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }, 700);

    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        message.innerHTML = `
            <p class="error-message">
                Cannot connect to API Gateway.
            </p>
        `;
    }
}


// ============================================================
// REGISTER
// ============================================================

async function registerUser(event) {

    event.preventDefault();

    const nameInput =
        document.getElementById(
            "register-name"
        );

    const emailInput =
        document.getElementById(
            "register-email"
        );

    const phoneInput =
        document.getElementById(
            "register-phone"
        );

    const roleInput =
        document.getElementById(
            "register-role"
        );

    const message =
        document.getElementById(
            "registration-message"
        );

    if (
        !nameInput ||
        !emailInput ||
        !phoneInput ||
        !roleInput ||
        !message
    ) {
        return;
    }

    const name =
        nameInput.value.trim();

    const email =
        emailInput.value.trim();

    const phone =
        phoneInput.value.trim();

    const role =
        roleInput.value;

    if (!role) {

        message.innerHTML = `
            <p class="error-message">
                Please select an account type.
            </p>
        `;

        return;
    }

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/users/register`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        name,
                        email,
                        phone
                    })
                }
            );

        const data =
            await getResponseData(response);

        if (!response.ok) {

            message.innerHTML = `
                <p class="error-message">
                    ${getErrorMessage(
                        data,
                        "Registration failed."
                    )}
                </p>
            `;

            return;
        }

        const user =
            data.user ||
            data.data;


        // Store role for this user.
        // Backend role persistence will be
        // added in the database step.

        if (user) {

            const registeredRole = {

                id:
                    user.id,

                name:
                    user.name,

                email:
                    user.email,

                phone:
                    user.phone,

                role:
                    role
            };

            // Keep role separately for now
            localStorage.setItem(
                `resqhub_role_${user.id}`,
                role
            );

            localStorage.removeItem(
                "resqhub_user"
            );

            localStorage.removeItem(
                "resqhub_user_id"
            );
        }


        message.innerHTML = `
            <p class="success-message">
                Registration successful!
                Please login using your new account.
            </p>
        `;


        document
            .getElementById(
                "registration-form"
            )
            ?.reset();


        setTimeout(() => {

            hideRegistrationForm();

            showLoginForm();

            const loginEmail =
                document.getElementById(
                    "login-email"
                );

            if (
                loginEmail &&
                user?.email
            ) {

                loginEmail.value =
                    user.email;
            }

        }, 1000);

    } catch (error) {

        console.error(
            "Registration error:",
            error
        );

        message.innerHTML = `
            <p class="error-message">
                Cannot connect to API Gateway.
            </p>
        `;
    }
}


// ============================================================
// LOGOUT
// ============================================================

function logoutUser() {

    CURRENT_USER = null;

    localStorage.removeItem(
        "resqhub_user"
    );

    localStorage.removeItem(
        "resqhub_user_id"
    );


    // Hide everything that belongs
    // to authenticated users

    updateLoginUI();
    updateRoleUI();


    // Reset dashboard counts

    [
        "incident-count",
        "team-count",
        "resource-count",
        "notification-count"
    ].forEach(id => {

        const element =
            document.getElementById(id);

        if (element) {
            element.textContent = "0";
        }
    });


    // Clear displayed data

    [
        "incident-list",
        "rescue-list",
        "resource-list",
        "notification-list"
    ].forEach(id => {

        const element =
            document.getElementById(id);

        if (element) {

            element.innerHTML = `
                <p class="empty-message">
                    Please login to view this information.
                </p>
            `;
        }
    });


    showPopup(
        "Logged Out",
        "You have been logged out successfully.",
        "success"
    );


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ============================================================
// CREATE INCIDENT
// ============================================================

async function createIncident(event) {

    event.preventDefault();

    if (!CURRENT_USER) {

        showPopup(
            "Login Required",
            "Please login before reporting an emergency.",
            "error"
        );

        showLoginForm();

        return;
    }

    const type =
        document
            .getElementById(
                "incident-type"
            )
            ?.value.trim();

    const location =
        document
            .getElementById(
                "incident-location"
            )
            ?.value.trim();

    const description =
        document
            .getElementById(
                "incident-description"
            )
            ?.value.trim();

    const priority =
        document
            .getElementById(
                "incident-priority"
            )
            ?.value || "MEDIUM";

    const message =
        document.getElementById(
            "form-message"
        );

    if (!type || !location || !description) {

        message.innerHTML = `
            <p class="error-message">
                Please fill in all required fields.
            </p>
        `;

        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/incidents`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        user_id:
                            Number(
                                CURRENT_USER.id
                            ),

                        title:
                            type,

                        description:
                            description,

                        location:
                            location,

                        priority:
                            priority
                    })
                }
            );

        const data =
            await getResponseData(response);

        if (!response.ok) {

            message.innerHTML = `
                <p class="error-message">
                    ${getErrorMessage(
                        data,
                        "Failed to report emergency."
                    )}
                </p>
            `;

            return;
        }


        message.innerHTML = `
            <p class="success-message">
                Emergency reported successfully.
            </p>
        `;


        document
            .getElementById(
                "incident-form"
            )
            ?.reset();


        await loadIncidents();
        await loadNotifications();


        showPopup(
            "Emergency Reported",
            "Your emergency has been submitted successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "Create incident error:",
            error
        );

        message.innerHTML = `
            <p class="error-message">
                Cannot connect to Incident Service.
            </p>
        `;
    }
}


// ============================================================
// LOAD INCIDENTS
// ============================================================

async function loadIncidents() {

    const container =
        document.getElementById(
            "incident-list"
        );

    if (!container) {
        return;
    }


    // Logged out

    if (!CURRENT_USER) {

        container.innerHTML = `
            <p class="empty-message">
                Please login to view incidents.
            </p>
        `;

        const count =
            document.getElementById(
                "incident-count"
            );

        if (count) {
            count.textContent = "0";
        }

        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/incidents`
            );

        const data =
            await getResponseData(response);

        if (!response.ok) {
            throw new Error(
                getErrorMessage(
                    data,
                    "Unable to load incidents"
                )
            );
        }

        let incidents =
            data.incidents ||
            data.data ||
            [];


        // ----------------------------------------------------
        // USER SEES ONLY THEIR INCIDENTS
        // ----------------------------------------------------

        if (isUser()) {

            incidents =
                incidents.filter(
                    incident =>
                        Number(
                            incident.user_id
                        ) ===
                        Number(
                            CURRENT_USER.id
                        )
                );
        }


        // ----------------------------------------------------
        // ADMIN SEES EVERYTHING
        // ----------------------------------------------------

        const count =
            document.getElementById(
                "incident-count"
            );

        if (
            count &&
            isAdmin()
        ) {

            count.textContent =
                incidents.length;
        }


        if (incidents.length === 0) {

            container.innerHTML = `
                <p class="empty-message">
                    ${
                        isAdmin()
                            ? "No incidents reported."
                            : "You have not reported any incidents yet."
                    }
                </p>
            `;

            return;
        }


        container.innerHTML =
            incidents.map(
                incident => {

                    const title =
                        incident.title ||
                        incident.type ||
                        "Emergency";

                    return `

                        <div
                            class="data-card"
                            data-id="${incident.id}">

                            <h3>
                                ${title}
                            </h3>

                            <p>
                                <strong>Location:</strong>
                                ${
                                    incident.location ||
                                    "Unknown"
                                }
                            </p>

                            <p>
                                <strong>Description:</strong>
                                ${
                                    incident.description ||
                                    ""
                                }
                            </p>

                            <p>
                                <strong>Priority:</strong>
                                ${
                                    incident.priority ||
                                    "MEDIUM"
                                }
                            </p>

                            ${
                                isAdmin()
                                    ? `
                                        <p>
                                            <strong>User ID:</strong>
                                            ${
                                                incident.user_id ??
                                                "N/A"
                                            }
                                        </p>
                                      `
                                    : ""
                            }

                            <span class="status-badge">
                                ${
                                    incident.status ||
                                    "REPORTED"
                                }
                            </span>

                            ${
                                isAdmin()
                                    ? `
                                        <div class="card-actions">

                                            <button
                                                type="button"
                                                class="edit-button"
                                                onclick="editIncident('${incident.id}')">

                                                Edit

                                            </button>

                                            <button
                                                type="button"
                                                class="delete-button"
                                                onclick="deleteIncident('${incident.id}')">

                                                Delete

                                            </button>

                                        </div>
                                      `
                                    : ""
                            }

                        </div>
                    `;
                }
            ).join("");

    } catch (error) {

        console.error(
            "Load incidents error:",
            error
        );

        container.innerHTML = `
            <p class="empty-message">
                Unable to connect to Incident Service.
            </p>
        `;
    }
}


// ============================================================
// EDIT INCIDENT
// ADMIN
// ============================================================

async function editIncident(incidentId) {

    if (!isAdmin()) {
        return;
    }


    const title =
        prompt(
            "Enter new emergency title:"
        );

    if (title === null) {
        return;
    }


    const location =
        prompt(
            "Enter new location:"
        );

    if (location === null) {
        return;
    }


    const description =
        prompt(
            "Enter new description:"
        );

    if (description === null) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/incidents/${encodeURIComponent(
                    incidentId
                )}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        title,
                        location,
                        description
                    })
                }
            );

        const data =
            await getResponseData(response);

        if (!response.ok) {

            showPopup(
                "Update Failed",
                getErrorMessage(
                    data,
                    "Unable to update incident."
                ),
                "error"
            );

            return;
        }


        await loadIncidents();

        showPopup(
            "Updated",
            "Incident updated successfully.",
            "success"
        );

    } catch (error) {

        showPopup(
            "Connection Error",
            "Unable to connect to API Gateway.",
            "error"
        );
    }
}


// ============================================================
// DELETE INCIDENT
// ADMIN
// ============================================================

async function deleteIncident(incidentId) {

    if (!isAdmin()) {
        return;
    }


    showConfirm(
        "Delete Incident?",
        "Are you sure you want to delete this incident?",
        async confirmed => {

            if (!confirmed) {
                return;
            }


            try {

                const response =
                    await fetch(
                        `${API_BASE_URL}/incidents/${encodeURIComponent(
                            incidentId
                        )}`,
                        {
                            method: "DELETE"
                        }
                    );

                const data =
                    await getResponseData(response);

                if (!response.ok) {

                    showPopup(
                        "Delete Failed",
                        getErrorMessage(
                            data,
                            "Unable to delete incident."
                        ),
                        "error"
                    );

                    return;
                }


                await loadIncidents();

                showPopup(
                    "Deleted",
                    "Incident deleted successfully.",
                    "success"
                );

            } catch {

                showPopup(
                    "Connection Error",
                    "Unable to connect to API Gateway.",
                    "error"
                );
            }
        }
    );
}


// ============================================================
// LOAD RESCUE TEAMS
// ADMIN
// ============================================================

async function loadRescueTeams() {

    if (!isAdmin()) {
        return;
    }

    const container =
        document.getElementById(
            "rescue-list"
        );

    if (!container) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/rescue-teams`
            );

        const data =
            await getResponseData(response);

        if (!response.ok) {

            throw new Error(
                getErrorMessage(
                    data,
                    "Unable to load rescue teams"
                )
            );
        }


        const teams =
            data.teams ||
            data.rescue_teams ||
            data.data ||
            [];


        const count =
            document.getElementById(
                "team-count"
            );

        if (count) {
            count.textContent =
                teams.length;
        }


        if (teams.length === 0) {

            container.innerHTML = `
                <p class="empty-message">
                    No rescue teams available.
                </p>
            `;

            return;
        }


        container.innerHTML =
            teams.map(
                team => `

                    <div
                        class="data-card">

                        <h3>
                            ${
                                team.name ||
                                "Rescue Team"
                            }
                        </h3>

                        <p>
                            <strong>Leader:</strong>
                            ${
                                team.leader ||
                                "N/A"
                            }
                        </p>

                        <p>
                            <strong>Members:</strong>
                            ${
                                team.members ??
                                0
                            }
                        </p>

                        <p>
                            <strong>Location:</strong>
                            ${
                                team.location ||
                                "Unavailable"
                            }
                        </p>

                        <span class="status-badge">
                            ${
                                team.status ||
                                "AVAILABLE"
                            }
                        </span>

                        <div class="card-actions">

                            <button
                                type="button"
                                class="edit-button"
                                onclick="editRescueTeam(${team.id})">

                                Edit

                            </button>

                        </div>

                    </div>

                `
            ).join("");

    } catch (error) {

        console.error(
            "Load rescue teams error:",
            error
        );

        container.innerHTML = `
            <p class="empty-message">
                Unable to connect to Rescue Service.
            </p>
        `;
    }
}


// ============================================================
// EDIT RESCUE TEAM
// ============================================================

async function editRescueTeam(teamId) {

    if (!isAdmin()) {
        return;
    }


    const status =
        prompt(
            "Enter status: AVAILABLE / BUSY / OFF_DUTY"
        );

    if (status === null) {
        return;
    }


    const normalized =
        status
            .trim()
            .toUpperCase();


    if (
        ![
            "AVAILABLE",
            "BUSY",
            "OFF_DUTY"
        ].includes(normalized)
    ) {

        showPopup(
            "Invalid Status",
            "Use AVAILABLE, BUSY or OFF_DUTY.",
            "error"
        );

        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/rescue-teams/${teamId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        status: normalized
                    })
                }
            );

        const data =
            await getResponseData(response);

        if (!response.ok) {

            showPopup(
                "Update Failed",
                getErrorMessage(
                    data,
                    "Unable to update rescue team."
                ),
                "error"
            );

            return;
        }


        await loadRescueTeams();

        showPopup(
            "Updated",
            "Rescue team updated successfully.",
            "success"
        );

    } catch {

        showPopup(
            "Connection Error",
            "Unable to connect to Rescue Service.",
            "error"
        );
    }
}


// ============================================================
// LOAD RESOURCES
// ADMIN
// ============================================================

async function loadResources() {

    if (!isAdmin()) {
        return;
    }


    const container =
        document.getElementById(
            "resource-list"
        );

    if (!container) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/resources`
            );

        const data =
            await getResponseData(response);

        if (!response.ok) {

            throw new Error(
                getErrorMessage(
                    data,
                    "Unable to load resources"
                )
            );
        }


        const resources =
            data.resources ||
            data.data ||
            [];


        const count =
            document.getElementById(
                "resource-count"
            );

        if (count) {
            count.textContent =
                resources.length;
        }


        if (resources.length === 0) {

            container.innerHTML = `
                <p class="empty-message">
                    No resources available.
                </p>
            `;

            return;
        }


        container.innerHTML =
            resources.map(
                resource => `

                    <div
                        class="data-card">

                        <h3>
                            ${
                                resource.name ||
                                "Resource"
                            }
                        </h3>

                        <p>
                            <strong>Type:</strong>
                            ${
                                resource.type ||
                                "Unknown"
                            }
                        </p>

                        <p>
                            <strong>Quantity:</strong>
                            ${
                                resource.quantity ??
                                0
                            }
                        </p>

                        <p>
                            <strong>Location:</strong>
                            ${
                                resource.location ||
                                "Unknown"
                            }
                        </p>

                        <span class="status-badge">
                            ${
                                resource.status ||
                                "available"
                            }
                        </span>

                        <div class="card-actions">

                            <button
                                type="button"
                                class="edit-button"
                                onclick="editResource(${resource.id})">

                                Edit

                            </button>

                            <button
                                type="button"
                                class="delete-button"
                                onclick="deleteResource(${resource.id})">

                                Delete

                            </button>

                        </div>

                    </div>
                `
            ).join("");

    } catch (error) {

        console.error(
            "Load resources error:",
            error
        );

        container.innerHTML = `
            <p class="empty-message">
                Unable to connect to Resource Service.
            </p>
        `;
    }
}


// ============================================================
// EDIT RESOURCE
// ============================================================

async function editResource(resourceId) {

    if (!isAdmin()) {
        return;
    }


    const quantity =
        prompt(
            "Enter new quantity:"
        );

    if (quantity === null) {
        return;
    }


    const number =
        Number(quantity);


    if (
        !Number.isInteger(number) ||
        number <= 0
    ) {

        showPopup(
            "Invalid Quantity",
            "Quantity must be a positive whole number.",
            "error"
        );

        return;
    }


    const status =
        prompt(
            "Enter status: available / assigned / maintenance / unavailable"
        );

    if (status === null) {
        return;
    }


    const normalized =
        status
            .trim()
            .toLowerCase();


    if (
        ![
            "available",
            "assigned",
            "maintenance",
            "unavailable"
        ].includes(normalized)
    ) {

        showPopup(
            "Invalid Status",
            "Please enter a valid resource status.",
            "error"
        );

        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/resources/${resourceId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        quantity:
                            number,

                        status:
                            normalized
                    })
                }
            );

        const data =
            await getResponseData(response);

        if (!response.ok) {

            showPopup(
                "Update Failed",
                getErrorMessage(
                    data,
                    "Unable to update resource."
                ),
                "error"
            );

            return;
        }


        await loadResources();

        showPopup(
            "Updated",
            "Resource updated successfully.",
            "success"
        );

    } catch {

        showPopup(
            "Connection Error",
            "Unable to connect to Resource Service.",
            "error"
        );
    }
}


// ============================================================
// DELETE RESOURCE
// ============================================================

async function deleteResource(resourceId) {

    if (!isAdmin()) {
        return;
    }


    showConfirm(
        "Delete Resource?",
        "Are you sure you want to delete this resource?",
        async confirmed => {

            if (!confirmed) {
                return;
            }


            try {

                const response =
                    await fetch(
                        `${API_BASE_URL}/resources/${resourceId}`,
                        {
                            method: "DELETE"
                        }
                    );

                const data =
                    await getResponseData(response);

                if (!response.ok) {

                    showPopup(
                        "Delete Failed",
                        getErrorMessage(
                            data,
                            "Unable to delete resource."
                        ),
                        "error"
                    );

                    return;
                }


                await loadResources();

                showPopup(
                    "Deleted",
                    "Resource deleted successfully.",
                    "success"
                );

            } catch {

                showPopup(
                    "Connection Error",
                    "Unable to connect to Resource Service.",
                    "error"
                );
            }
        }
    );
}


// ============================================================
// LOAD NOTIFICATIONS
// ============================================================

async function loadNotifications() {

    const container =
        document.getElementById(
            "notification-list"
        );

    if (!container) {
        return;
    }


    if (!CURRENT_USER) {

        container.innerHTML = `
            <p class="empty-message">
                Please login to view notifications.
            </p>
        `;

        return;
    }


    try {

        let url =
            `${API_BASE_URL}/notifications`;


        if (isUser()) {

            url +=
                `?user_id=${encodeURIComponent(
                    CURRENT_USER.id
                )}`;
        }


        const response =
            await fetch(url);

        const data =
            await getResponseData(response);


        if (!response.ok) {

            throw new Error(
                getErrorMessage(
                    data,
                    "Unable to load notifications"
                )
            );
        }


        let notifications =
            data.notifications ||
            data.data ||
            [];


        const count =
            document.getElementById(
                "notification-count"
            );


        if (count && isAdmin()) {

            count.textContent =
                notifications.length;
        }


        if (
            notifications.length ===
            0
        ) {

            container.innerHTML = `
                <p class="empty-message">
                    No notifications available.
                </p>
            `;

            return;
        }


        container.innerHTML =
            notifications.map(
                notification => `

                    <div class="data-card">

                        <h3>
                            ${
                                notification.type ||
                                "Notification"
                            }
                        </h3>

                        <p>
                            ${
                                notification.message ||
                                notification.description ||
                                ""
                            }
                        </p>

                        ${
                            notification.user_id
                                ? `
                                    <p>
                                        <strong>User ID:</strong>
                                        ${notification.user_id}
                                    </p>
                                  `
                                : ""
                        }

                        <span class="status-badge">
                            ${
                                notification.status ||
                                "UNREAD"
                            }
                        </span>

                    </div>
                `
            ).join("");

    } catch (error) {

        console.error(
            "Load notifications error:",
            error
        );

        container.innerHTML = `
            <p class="empty-message">
                Unable to connect to Notification Service.
            </p>
        `;
    }
}



function updateIncidentHeading() {

    const heading =
        document.getElementById(
            "incident-heading"
        );

    if (!heading) {
        return;
    }

    heading.textContent =
        isAdmin()
            ? "All Incidents"
            : "My Incidents";
}






// ============================================================
// INITIALIZE
// ============================================================

async function initializeDashboard() {

    updateLoginUI();
    updateRoleUI();


    // Logged out:
    // DO NOT load any dashboard records.

    if (!CURRENT_USER) {
        return;
    }


    await loadIncidents();
    await loadNotifications();


    if (isAdmin()) {

        await Promise.all([
            loadRescueTeams(),
            loadResources(),
            checkAllServices()
        ]);
    }
}


// ============================================================
// DOM READY
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const incidentForm =
            document.getElementById(
                "incident-form"
            );

        if (incidentForm) {

            incidentForm.addEventListener(
                "submit",
                createIncident
            );
        }


        const loginForm =
            document.getElementById(
                "login-form"
            );

        if (loginForm) {

            loginForm.addEventListener(
                "submit",
                loginUser
            );
        }


        const registrationForm =
            document.getElementById(
                "registration-form"
            );

        if (registrationForm) {

            registrationForm.addEventListener(
                "submit",
                registerUser
            );
        }


        initializeDashboard();
    }
);


// ============================================================
// MAKE FUNCTIONS AVAILABLE TO HTML
// ============================================================

window.showLoginForm =
    showLoginForm;

window.hideLoginForm =
    hideLoginForm;

window.showRegistrationForm =
    showRegistrationForm;

window.hideRegistrationForm =
    hideRegistrationForm;

window.showIncidentForm =
    showIncidentForm;

window.hideIncidentForm =
    hideIncidentForm;

window.logoutUser =
    logoutUser;

window.editIncident =
    editIncident;

window.deleteIncident =
    deleteIncident;

window.editRescueTeam =
    editRescueTeam;

window.editResource =
    editResource;

window.deleteResource =
    deleteResource;