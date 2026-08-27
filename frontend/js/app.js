// ============================================================
// ResQhub Frontend
// FINAL APP.JS
// Citizen + Admin Portal
// API Gateway: http://127.0.0.1:5000/api
// ============================================================

const API_BASE_URL = "http://a1c4f6994904545f1b6942971d492798-1616174479.us-east-1.elb.amazonaws.com:5000/api";

let CURRENT_USER = null;


// ============================================================
// CURRENT USER
// ============================================================

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
// FORM POPUP
// ============================================================

function createFormPopup(title, formHTML, submitCallback) {

    const existing =
        document.getElementById("resqhub-form-popup");

    if (existing) {
        existing.remove();
    }

    const popup =
        document.createElement("div");

    popup.id = "resqhub-form-popup";

    popup.innerHTML = `

        <div class="popup-overlay">

            <div class="popup-box popup-form-box">

                <h3>${title}</h3>

                <form id="resqhub-dynamic-form">

                    ${formHTML}

                    <div class="popup-actions">

                        <button
                            type="button"
                            class="popup-cancel"
                            id="dynamic-popup-cancel">

                            Cancel

                        </button>

                        <button
                            type="submit"
                            class="popup-ok">

                            Save

                        </button>

                    </div>

                </form>

            </div>

        </div>
    `;

    document.body.appendChild(popup);

    document
        .getElementById("dynamic-popup-cancel")
        ?.addEventListener("click", () => {

            popup.remove();

        });

    document
        .getElementById("resqhub-dynamic-form")
        ?.addEventListener("submit", async event => {

            event.preventDefault();

            await submitCallback(
                new FormData(event.target),
                popup
            );

        });
}


// ============================================================
// SERVICE HEALTH
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

            if (
                service.status === "online" ||
                service.status === "healthy"
            ) {

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
        document.getElementById("login-section");

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
// REGISTRATION
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

    if (isAdmin()) {
        return;
    }

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
// HEADER
// ============================================================

function updateLoginUI() {

    const loginButton =
        document.getElementById("login-button");

    const registerButton =
        document.getElementById("register-button");

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

        loginButton?.classList.add("hidden");

        registerButton?.classList.add("hidden");

        userSection?.classList.remove("hidden");

        if (userName) {

            userName.textContent =
                CURRENT_USER.name ||
                "User";
        }

        if (userDetails) {

            userDetails.textContent =
                `${
                    isAdmin()
                        ? "Administrator"
                        : "Citizen"
                } • ${
                    CURRENT_USER.email || ""
                }`;
        }

    } else {

        loginButton?.classList.remove("hidden");

        registerButton?.classList.remove("hidden");

        userSection?.classList.add("hidden");
    }
}


// ============================================================
// ROLE UI
// ============================================================

function updateRoleUI() {

    const adminOnly =
        document.querySelectorAll(".admin-only");

    const userOnly =
        document.querySelectorAll(".user-only");

    const adminSections =
        document.querySelectorAll(".admin-section");

    const notificationSection =
        document.getElementById("notifications");

    const serviceSection =
        document.getElementById(
            "service-status-section"
        );

    const dashboardSection =
        document.getElementById(
            "admin-dashboard"
        );

    const reportButtons =
        document.querySelectorAll(
            ".report-emergency-button"
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

        notificationSection?.classList.add(
            "hidden"
        );

        serviceSection?.classList.add(
            "hidden"
        );

        dashboardSection?.classList.add(
            "hidden"
        );

        reportButtons.forEach(button =>
            button.classList.remove("hidden")
        );

        updateIncidentHeading();

        return;
    }


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

        notificationSection?.classList.remove(
            "hidden"
        );

        serviceSection?.classList.add(
            "hidden"
        );

        dashboardSection?.classList.add(
            "hidden"
        );

        reportButtons.forEach(button =>
            button.classList.remove("hidden")
        );

        updateIncidentHeading();

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

        notificationSection?.classList.remove(
            "hidden"
        );

        serviceSection?.classList.remove(
            "hidden"
        );

        dashboardSection?.classList.remove(
            "hidden"
        );

        reportButtons.forEach(button =>
            button.classList.add("hidden")
        );

        hideIncidentForm();

        updateIncidentHeading();
    }
}


// ============================================================
// LOGIN
// ============================================================

async function loginUser(event) {

    event.preventDefault();

    const email =
        document
            .getElementById("login-email")
            ?.value.trim();

    const phone =
        document
            .getElementById("login-phone")
            ?.value.trim();

    const role =
        document
            .getElementById("login-role")
            ?.value;

    const message =
        document.getElementById(
            "login-message"
        );

    if (!email || !phone || !role) {

        if (message) {

            message.innerHTML = `
                <p class="error-message">
                    Please enter email, phone and role.
                </p>
            `;

        }

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

            if (message) {

                message.innerHTML = `
                    <p class="error-message">
                        ${getErrorMessage(
                            data,
                            "Invalid email or phone."
                        )}
                    </p>
                `;

            }

            return;
        }

        const user =
            data.user ||
            data.data;

        if (!user) {

            if (message) {

                message.innerHTML = `
                    <p class="error-message">
                        Login succeeded but user data was not returned.
                    </p>
                `;

            }

            return;
        }


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
                role
        };


        localStorage.setItem(
            "resqhub_user",
            JSON.stringify(CURRENT_USER)
        );

        localStorage.setItem(
            "resqhub_user_id",
            String(CURRENT_USER.id)
        );


        if (message) {

            message.innerHTML = `
                <p class="success-message">
                    Login successful. Welcome,
                    ${CURRENT_USER.name}!
                </p>
            `;

        }


        updateLoginUI();
        updateRoleUI();


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

        if (message) {

            message.innerHTML = `
                <p class="error-message">
                    Cannot connect to API Gateway.
                </p>
            `;

        }
    }
}


// ============================================================
// REGISTER
// ============================================================

async function registerUser(event) {

    event.preventDefault();

    const name =
        document
            .getElementById("register-name")
            ?.value.trim();

    const email =
        document
            .getElementById("register-email")
            ?.value.trim();

    const phone =
        document
            .getElementById("register-phone")
            ?.value.trim();

    const role =
        document
            .getElementById("register-role")
            ?.value;

    const message =
        document.getElementById(
            "registration-message"
        );

    if (!name || !email || !phone || !role) {

        if (message) {

            message.innerHTML = `
                <p class="error-message">
                    Please fill in all fields.
                </p>
            `;

        }

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

            if (message) {

                message.innerHTML = `
                    <p class="error-message">
                        ${getErrorMessage(
                            data,
                            "Registration failed."
                        )}
                    </p>
                `;

            }

            return;
        }

        const user =
            data.user ||
            data.data;


        if (user) {

            localStorage.setItem(
                `resqhub_role_${user.id}`,
                role
            );
        }


        if (message) {

            message.innerHTML = `
                <p class="success-message">
                    Registration successful!
                    Please login using your new account.
                </p>
            `;

        }


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

        if (message) {

            message.innerHTML = `
                <p class="error-message">
                    Cannot connect to API Gateway.
                </p>
            `;

        }
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


    updateLoginUI();
    updateRoleUI();


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


    hideNotificationForm();


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

    if (!CURRENT_USER || isAdmin()) {
        return;
    }


    const type =
        document
            .getElementById("incident-type")
            ?.value.trim();

    const location =
        document
            .getElementById("incident-location")
            ?.value.trim();

    const description =
        document
            .getElementById("incident-description")
            ?.value.trim();

    const priority =
        document
            .getElementById("incident-priority")
            ?.value || "MEDIUM";

    const message =
        document.getElementById(
            "form-message"
        );


    if (!type || !location || !description) {

        if (message) {

            message.innerHTML = `
                <p class="error-message">
                    Please fill in all required fields.
                </p>
            `;

        }

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

            if (message) {

                message.innerHTML = `
                    <p class="error-message">
                        ${getErrorMessage(
                            data,
                            "Failed to report emergency."
                        )}
                    </p>
                `;

            }

            return;
        }


        if (message) {

            message.innerHTML = `
                <p class="success-message">
                    Emergency reported successfully.
                </p>
            `;

        }


        document
            .getElementById("incident-form")
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

        if (message) {

            message.innerHTML = `
                <p class="error-message">
                    Cannot connect to Incident Service.
                </p>
            `;

        }
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


    if (!CURRENT_USER) {

        container.innerHTML = `
            <p class="empty-message">
                Please login to view incidents.
            </p>
        `;

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


        const count =
            document.getElementById(
                "incident-count"
            );

        if (count && isAdmin()) {

            count.textContent =
                incidents.length;
        }


        if (incidents.length === 0) {

            container.innerHTML = `
                <p class="empty-message">
                    ${
                        isAdmin()
                            ? "No emergency reports available."
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


                    const assignedRescue =
                        incident.rescue_team ||
                        incident.assigned_rescue_team ||
                        incident.assigned_team;


                    const assignedResource =
                        incident.resource ||
                        incident.assigned_resource;


                    return `

                        <div
                            class="data-card"
                            data-id="${incident.id}">

                            <h3>
                                ${title}
                            </h3>

                            <p>
                                <strong>Incident ID:</strong>
                                ${incident.id}
                            </p>

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

                            <p>
                                <strong>Status:</strong>
                                ${
                                    incident.status ||
                                    "REPORTED"
                                }
                            </p>


                            ${
                                assignedRescue
                                    ? `
                                        <div class="assignment-info">

                                            <strong>
                                                Rescue Team:
                                            </strong>

                                            ${
                                                assignedRescue.name ||
                                                assignedRescue.team_name ||
                                                assignedRescue
                                            }

                                        </div>
                                      `
                                    : `
                                        ${
                                            isAdmin()
                                                ? `
                                                    <div class="assignment-info pending">
                                                        Rescue team not assigned yet.
                                                    </div>
                                                  `
                                                : ""
                                        }
                                      `
                            }


                            ${
                                assignedResource
                                    ? `
                                        <div class="assignment-info">

                                            <strong>
                                                Resource:
                                            </strong>

                                            ${
                                                assignedResource.name ||
                                                assignedResource.resource_name ||
                                                assignedResource
                                            }

                                        </div>
                                      `
                                    : `
                                        ${
                                            isAdmin()
                                                ? `
                                                    <div class="assignment-info pending">
                                                        Resource not assigned yet.
                                                    </div>
                                                  `
                                                : ""
                                        }
                                      `
                            }


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

                                            <button
                                                type="button"
                                                class="primary-button"
                                                onclick="openRescueAssignment('${incident.id}')">

                                                Assign Rescue

                                            </button>

                                            <button
                                                type="button"
                                                class="secondary-button"
                                                onclick="openResourceAssignment('${incident.id}')">

                                                Assign Resource

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
// ============================================================

async function editIncident(incidentId) {

    if (!isAdmin()) {
        return;
    }


    createFormPopup(
        "Edit Emergency",
        `

            <div class="form-group">

                <label>Emergency Title</label>

                <input
                    type="text"
                    name="title"
                    required>

            </div>

            <div class="form-group">

                <label>Location</label>

                <input
                    type="text"
                    name="location"
                    required>

            </div>

            <div class="form-group">

                <label>Description</label>

                <textarea
                    name="description"
                    required></textarea>

            </div>

        `,
        async (formData, popup) => {

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

                                title:
                                    formData.get("title"),

                                location:
                                    formData.get("location"),

                                description:
                                    formData.get("description")
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

                popup.remove();

                await loadIncidents();

                showPopup(
                    "Updated",
                    "Incident updated successfully.",
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
// DELETE INCIDENT
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
// CREATE RESCUE TEAM
// ============================================================

function showCreateRescueTeamForm() {

    if (!isAdmin()) {
        return;
    }


    createFormPopup(
        "Create Rescue Team",
        `

            <div class="form-group">

                <label>Team Name</label>

                <input
                    type="text"
                    name="name"
                    placeholder="e.g. Rescue Alpha"
                    required>

            </div>


            <div class="form-group">

                <label>Team Leader</label>

                <input
                    type="text"
                    name="leader"
                    placeholder="Enter team leader name"
                    required>

            </div>


            <div class="form-group">

                <label>Members</label>

                <input
                    type="number"
                    name="members"
                    min="1"
                    placeholder="Number of members"
                    required>

            </div>


            <div class="form-group">

                <label>Location</label>

                <input
                    type="text"
                    name="location"
                    placeholder="Team location"
                    required>

            </div>

        `,
        async (formData, popup) => {

            const members =
                Number(
                    formData.get("members")
                );


            if (
                !Number.isInteger(members) ||
                members <= 0
            ) {

                showPopup(
                    "Invalid Members",
                    "Members must be a positive whole number.",
                    "error"
                );

                return;
            }


            try {

                const response =
                    await fetch(
                        `${API_BASE_URL}/rescue-teams`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                name:
                                    formData.get("name"),

                                leader:
                                    formData.get("leader"),

                                members:
                                    members,

                                location:
                                    formData.get("location")
                            })
                        }
                    );

                const data =
                    await getResponseData(response);


                if (!response.ok) {

                    showPopup(
                        "Create Team Failed",
                        getErrorMessage(
                            data,
                            "Unable to create rescue team."
                        ),
                        "error"
                    );

                    return;
                }


                popup.remove();

                await loadRescueTeams();

                showPopup(
                    "Rescue Team Created",
                    "The rescue team has been created successfully.",
                    "success"
                );

            } catch (error) {

                console.error(
                    "Create rescue team error:",
                    error
                );

                showPopup(
                    "Connection Error",
                    "Unable to connect to Rescue Service.",
                    "error"
                );
            }
        }
    );
}


// ============================================================
// LOAD RESCUE TEAMS
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

                    <div class="data-card">

                        <h3>
                            ${
                                team.name ||
                                "Rescue Team"
                            }
                        </h3>

                        <p>
                            <strong>Team ID:</strong>
                            ${team.id}
                        </p>

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

                        ${
                            team.assigned_incident
                                ? `
                                    <p>
                                        <strong>
                                            Assigned Incident:
                                        </strong>

                                        ${team.assigned_incident}
                                    </p>
                                  `
                                : ""
                        }

                        <div class="card-actions">

                            <button
                                type="button"
                                class="edit-button"
                                onclick="editRescueTeam(${team.id})">

                                Edit

                            </button>

                            ${
                                team.status === "BUSY"
                                    ? `
                                        <button
                                            type="button"
                                            class="secondary-button"
                                            onclick="releaseRescueTeam(${team.id})">

                                            Release

                                        </button>
                                      `
                                    : ""
                            }

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


    createFormPopup(
        "Edit Rescue Team",
        `

            <div class="form-group">

                <label>Status</label>

                <select name="status" required>

                    <option value="AVAILABLE">
                        AVAILABLE
                    </option>

                    <option value="BUSY">
                        BUSY
                    </option>

                    <option value="OFF_DUTY">
                        OFF_DUTY
                    </option>

                </select>

            </div>

        `,
        async (formData, popup) => {

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
                                status:
                                    formData.get("status")
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

                popup.remove();

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
    );
}


// ============================================================
// RELEASE RESCUE TEAM
// ============================================================

async function releaseRescueTeam(teamId) {

    if (!isAdmin()) {
        return;
    }


    showConfirm(
        "Release Rescue Team?",
        "Release this team and make it available again?",
        async confirmed => {

            if (!confirmed) {
                return;
            }


            try {

                const response =
                    await fetch(
                        `${API_BASE_URL}/rescue-teams/${teamId}/release`,
                        {
                            method: "POST"
                        }
                    );

                const data =
                    await getResponseData(response);

                if (!response.ok) {

                    showPopup(
                        "Release Failed",
                        getErrorMessage(
                            data,
                            "Unable to release rescue team."
                        ),
                        "error"
                    );

                    return;
                }


                await loadRescueTeams();
                await loadIncidents();

                showPopup(
                    "Team Released",
                    "Rescue team is available again.",
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
    );
}


// ============================================================
// ASSIGN RESCUE TEAM TO INCIDENT
// ============================================================

async function openRescueAssignment(incidentId) {

    if (!isAdmin()) {
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
                    "Unable to load rescue teams."
                )
            );
        }


        const teams =
            data.teams ||
            data.rescue_teams ||
            data.data ||
            [];


        const availableTeams =
            teams.filter(
                team =>
                    String(
                        team.status ||
                        "AVAILABLE"
                    ).toUpperCase() ===
                    "AVAILABLE"
            );


        if (availableTeams.length === 0) {

            showPopup(
                "No Rescue Team Available",
                "There is currently no available rescue team.",
                "error"
            );

            return;
        }


        createFormPopup(
            "Assign Rescue Team",
            `

                <p>
                    <strong>Incident ID:</strong>
                    ${incidentId}
                </p>

                <div class="form-group">

                    <label>Select Rescue Team</label>

                    <select
                        name="team_id"
                        required>

                        <option value="">
                            Select available team
                        </option>

                        ${
                            availableTeams.map(
                                team => `
                                    <option value="${team.id}">
                                        ${team.name || "Rescue Team"}
                                        — ${team.location || "Unknown"}
                                    </option>
                                `
                            ).join("")
                        }

                    </select>

                </div>

            `,
            async (formData, popup) => {

                const teamId =
                    formData.get("team_id");


                if (!teamId) {

                    showPopup(
                        "Select Team",
                        "Please select a rescue team.",
                        "error"
                    );

                    return;
                }


                try {

                    const response =
                        await fetch(
                            `${API_BASE_URL}/rescue-teams/${teamId}/assign`,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({
                                    incident_id:
                                        incidentId
                                })
                            }
                        );

                    const result =
                        await getResponseData(response);


                    if (!response.ok) {

                        showPopup(
                            "Assignment Failed",
                            getErrorMessage(
                                result,
                                "Unable to assign rescue team."
                            ),
                            "error"
                        );

                        return;
                    }


                    popup.remove();

                    await loadRescueTeams();
                    await loadIncidents();


                    showPopup(
                        "Rescue Team Assigned",
                        "The rescue team has been assigned to this emergency.",
                        "success"
                    );

                } catch (error) {

                    console.error(
                        "Assign rescue team error:",
                        error
                    );

                    showPopup(
                        "Connection Error",
                        "Unable to connect to Rescue Service.",
                        "error"
                    );
                }
            }
        );

    } catch (error) {

        console.error(
            "Load rescue teams error:",
            error
        );

        showPopup(
            "Connection Error",
            "Unable to load rescue teams.",
            "error"
        );
    }
}


// ============================================================
// CREATE RESOURCE
// ============================================================

function showCreateResourceForm() {

    if (!isAdmin()) {
        return;
    }


    createFormPopup(
        "Create Emergency Resource",
        `

            <div class="form-group">

                <label>Resource Name</label>

                <input
                    type="text"
                    name="name"
                    placeholder="e.g. Ambulance"
                    required>

            </div>


            <div class="form-group">

                <label>Resource Type</label>

                <input
                    type="text"
                    name="type"
                    placeholder="e.g. Medical"
                    required>

            </div>


            <div class="form-group">

                <label>Quantity</label>

                <input
                    type="number"
                    name="quantity"
                    min="1"
                    required>

            </div>


            <div class="form-group">

                <label>Location</label>

                <input
                    type="text"
                    name="location"
                    placeholder="Resource location"
                    required>

            </div>

        `,
        async (formData, popup) => {

            const quantity =
                Number(
                    formData.get("quantity")
                );


            if (
                !Number.isInteger(quantity) ||
                quantity <= 0
            ) {

                showPopup(
                    "Invalid Quantity",
                    "Quantity must be a positive whole number.",
                    "error"
                );

                return;
            }


            try {

                const response =
                    await fetch(
                        `${API_BASE_URL}/resources`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                name:
                                    formData.get("name"),

                                type:
                                    formData.get("type"),

                                quantity:
                                    quantity,

                                location:
                                    formData.get("location")
                            })
                        }
                    );

                const data =
                    await getResponseData(response);


                if (!response.ok) {

                    showPopup(
                        "Create Resource Failed",
                        getErrorMessage(
                            data,
                            "Unable to create resource."
                        ),
                        "error"
                    );

                    return;
                }


                popup.remove();

                await loadResources();

                showPopup(
                    "Resource Created",
                    "The emergency resource has been created successfully.",
                    "success"
                );

            } catch (error) {

                console.error(
                    "Create resource error:",
                    error
                );

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
// LOAD RESOURCES
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

                    <div class="data-card">

                        <h3>
                            ${
                                resource.name ||
                                "Resource"
                            }
                        </h3>

                        <p>
                            <strong>Resource ID:</strong>
                            ${resource.id}
                        </p>

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

                        ${
                            resource.assigned_incident
                                ? `
                                    <p>
                                        <strong>
                                            Assigned Incident:
                                        </strong>
                                        ${resource.assigned_incident}
                                    </p>
                                  `
                                : ""
                        }

                        <div class="card-actions">

                            <button
                                type="button"
                                class="edit-button"
                                onclick="editResource(${resource.id})">

                                Edit

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


    createFormPopup(
        "Edit Resource",
        `

            <div class="form-group">

                <label>Quantity</label>

                <input
                    type="number"
                    name="quantity"
                    min="1"
                    required>

            </div>


            <div class="form-group">

                <label>Status</label>

                <select name="status" required>

                    <option value="available">
                        Available
                    </option>

                    <option value="assigned">
                        Assigned
                    </option>

                    <option value="maintenance">
                        Maintenance
                    </option>

                    <option value="unavailable">
                        Unavailable
                    </option>

                </select>

            </div>

        `,
        async (formData, popup) => {

            const quantity =
                Number(
                    formData.get("quantity")
                );


            if (
                !Number.isInteger(quantity) ||
                quantity <= 0
            ) {

                showPopup(
                    "Invalid Quantity",
                    "Quantity must be a positive whole number.",
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
                                    quantity,

                                status:
                                    formData.get("status")
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


                popup.remove();

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
    );
}


// ============================================================
// ASSIGN RESOURCE
// ============================================================

async function openResourceAssignment(incidentId) {

    if (!isAdmin()) {
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
                    "Unable to load resources."
                )
            );
        }


        const resources =
            data.resources ||
            data.data ||
            [];


        const availableResources =
            resources.filter(
                resource =>
                    String(
                        resource.status ||
                        "available"
                    ).toLowerCase() ===
                    "available" &&
                    Number(resource.quantity) > 0
            );


        if (availableResources.length === 0) {

            showPopup(
                "No Resource Available",
                "There is currently no available emergency resource.",
                "error"
            );

            return;
        }


        createFormPopup(
            "Assign Resource",
            `

                <p>
                    <strong>Incident ID:</strong>
                    ${incidentId}
                </p>

                <div class="form-group">

                    <label>Select Resource</label>

                    <select
                        name="resource_id"
                        required>

                        <option value="">
                            Select available resource
                        </option>

                        ${
                            availableResources.map(
                                resource => `
                                    <option value="${resource.id}">
                                        ${resource.name || "Resource"}
                                        — ${resource.location || "Unknown"}
                                        — Qty: ${resource.quantity}
                                    </option>
                                `
                            ).join("")
                        }

                    </select>

                </div>

            `,
            async (formData, popup) => {

                const resourceId =
                    formData.get("resource_id");


                if (!resourceId) {

                    showPopup(
                        "Select Resource",
                        "Please select a resource.",
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
                                    status: "assigned",
                                    assigned_incident:
                                        incidentId
                                })
                            }
                        );

                    const result =
                        await getResponseData(response);


                    if (!response.ok) {

                        showPopup(
                            "Assignment Failed",
                            getErrorMessage(
                                result,
                                "Unable to assign resource."
                            ),
                            "error"
                        );

                        return;
                    }


                    popup.remove();

                    await loadResources();
                    await loadIncidents();


                    showPopup(
                        "Resource Assigned",
                        "The resource has been assigned to this emergency.",
                        "success"
                    );

                } catch (error) {

                    console.error(
                        "Assign resource error:",
                        error
                    );

                    showPopup(
                        "Connection Error",
                        "Unable to connect to Resource Service.",
                        "error"
                    );
                }
            }
        );

    } catch (error) {

        console.error(
            "Load resources error:",
            error
        );

        showPopup(
            "Connection Error",
            "Unable to load resources.",
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
// NOTIFICATIONS
// ============================================================

function showNotifications() {

    const section =
        document.getElementById("notifications");

    if (!section) {
        return;
    }

    section.classList.remove("hidden");

    section.scrollIntoView({
        behavior: "smooth"
    });

    loadNotifications();
}


function hideNotifications() {

    const section =
        document.getElementById("notifications");

    if (section) {
        section.classList.add("hidden");
    }

    hideNotificationForm();
}


// ============================================================
// SHOW CREATE NOTIFICATION FORM
// ============================================================

function showNotificationForm() {

    if (!CURRENT_USER) {

        showPopup(
            "Login Required",
            "Please login first.",
            "error"
        );

        showLoginForm();

        return;
    }


    if (!isAdmin()) {

        showPopup(
            "Access Denied",
            "Only an administrator can create notifications.",
            "error"
        );

        return;
    }


    const formSection =
        document.getElementById(
            "notification-form-section"
        );

    if (!formSection) {

        console.error(
            "notification-form-section not found in HTML"
        );

        showPopup(
            "Notification Form Missing",
            "The notification form could not be found in the page.",
            "error"
        );

        return;
    }


    formSection.classList.remove("hidden");

    formSection.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });


    /*
     * Automatically focus User ID field.
     */

    setTimeout(() => {

        document
            .getElementById(
                "notification-user-id"
            )
            ?.focus();

    }, 100);
}


// ============================================================
// HIDE CREATE NOTIFICATION FORM
// ============================================================

function hideNotificationForm() {

    const formSection =
        document.getElementById(
            "notification-form-section"
        );

    if (formSection) {

        formSection.classList.add("hidden");

    }


    const form =
        document.getElementById(
            "notification-form"
        );

    if (form) {
        form.reset();
    }


    const message =
        document.getElementById(
            "notification-form-message"
        );

    if (message) {
        message.innerHTML = "";
    }
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

        const count =
            document.getElementById(
                "notification-count"
            );

        if (count) {
            count.textContent = "0";
        }

        return;
    }


    try {

        let url =
            `${API_BASE_URL}/notifications`;


        /*
         * USER:
         * Only own notifications.
         *
         * ADMIN:
         * All notifications.
         */

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
            Array.isArray(data)
                ? data
                : data.notifications ||
                  data.data ||
                  [];


        /*
         * Safety filter for USER.
         */

        if (isUser()) {

            notifications =
                notifications.filter(
                    notification =>
                        Number(
                            notification.user_id
                        ) ===
                        Number(
                            CURRENT_USER.id
                        )
                );

        }


        /*
         * Notification count.
         *
         * For users, count unread notifications.
         */

        const count =
            document.getElementById(
                "notification-count"
            );


        if (count) {

            if (isUser()) {

                const unreadCount =
                    notifications.filter(
                        notification =>
                            String(
                                notification.status ||
                                "UNREAD"
                            ).toUpperCase() !==
                            "READ"
                    ).length;

                count.textContent =
                    unreadCount;

            } else {

                count.textContent =
                    notifications.length;

            }

        }


        /*
         * No notifications.
         */

        if (notifications.length === 0) {

            container.innerHTML = `
                <p class="empty-message">
                    No notifications available.
                </p>
            `;

            return;
        }


        /*
         * Display notifications.
         */

        container.innerHTML =
            notifications
                .map(notification => {

                    const status =
                        String(
                            notification.status ||
                            "UNREAD"
                        ).toUpperCase();


                    const isUnread =
                        status !== "READ";


                    return `

                        <div
                            class="data-card notification-card ${
                                isUnread
                                    ? "unread-notification"
                                    : ""
                            }">

                            <h3>
                                ${
                                    notification.type ||
                                    "Notification"
                                }
                            </h3>


                            ${
                                isAdmin()
                                    ? `
                                        <p>
                                            <strong>
                                                User ID:
                                            </strong>

                                            ${
                                                notification.user_id ??
                                                "N/A"
                                            }
                                        </p>
                                      `
                                    : ""
                            }


                            <p>
                                ${
                                    notification.message ||
                                    ""
                                }
                            </p>


                            <p>
                                <strong>
                                    Status:
                                </strong>

                                <span class="status-badge">

                                    ${status}

                                </span>

                            </p>


                            <p class="notification-time">

                                ${
                                    notification.created_at ||
                                    ""
                                }

                            </p>


                            ${
                                isUnread
                                    ? `
                                        <button
                                            type="button"
                                            class="secondary-button"
                                            onclick="markNotificationRead(${notification.id})">

                                            Mark as Read

                                        </button>
                                      `
                                    : `
                                        <span class="status-badge">
                                            READ
                                        </span>
                                      `
                            }

                        </div>

                    `;

                })
                .join("");


    } catch (error) {

        console.error(
            "Load notifications error:",
            error
        );


        container.innerHTML = `
            <p class="error-message">
                Unable to load notifications.
            </p>
        `;


        const count =
            document.getElementById(
                "notification-count"
            );


        if (count) {
            count.textContent = "0";
        }

    }

}


// ============================================================
// CREATE NOTIFICATION
// IMPORTANT:
// THIS FUNCTION IS CALLED FROM DOMContentLoaded
// ============================================================

async function createNotification(event) {

    event.preventDefault();


    if (!CURRENT_USER) {

        showPopup(
            "Login Required",
            "Please login first.",
            "error"
        );

        return;
    }


    if (!isAdmin()) {

        showPopup(
            "Access Denied",
            "Only an administrator can create notifications.",
            "error"
        );

        return;
    }


    const userIdInput =
        document.getElementById(
            "notification-user-id"
        );

    const typeInput =
        document.getElementById(
            "notification-type"
        );

    const messageInput =
        document.getElementById(
            "notification-message"
        );

    const resultMessage =
        document.getElementById(
            "notification-form-message"
        );


    if (
        !userIdInput ||
        !typeInput ||
        !messageInput
    ) {

        console.error(
            "Notification form fields not found."
        );

        showPopup(
            "Form Error",
            "Notification form fields are missing from the HTML.",
            "error"
        );

        return;
    }


    const userId =
        userIdInput.value.trim();

    const type =
        typeInput.value.trim();

    const message =
        messageInput.value.trim();


    /*
     * Validate.
     */

    if (!userId) {

        if (resultMessage) {

            resultMessage.innerHTML = `
                <p class="error-message">
                    Please enter User ID.
                </p>
            `;

        }

        userIdInput.focus();

        return;
    }


    if (!type) {

        if (resultMessage) {

            resultMessage.innerHTML = `
                <p class="error-message">
                    Please enter notification type.
                </p>
            `;

        }

        typeInput.focus();

        return;
    }


    if (!message) {

        if (resultMessage) {

            resultMessage.innerHTML = `
                <p class="error-message">
                    Please enter notification message.
                </p>
            `;

        }

        messageInput.focus();

        return;
    }


    /*
     * User ID must be a number.
     */

    const numericUserId =
        Number(userId);


    if (
        !Number.isInteger(numericUserId) ||
        numericUserId <= 0
    ) {

        if (resultMessage) {

            resultMessage.innerHTML = `
                <p class="error-message">
                    User ID must be a valid positive number.
                </p>
            `;

        }

        userIdInput.focus();

        return;
    }


    try {

        /*
         * Disable submit button while sending.
         */

        const form =
            document.getElementById(
                "notification-form"
            );

        const submitButton =
            form?.querySelector(
                'button[type="submit"]'
            );


        if (submitButton) {

            submitButton.disabled = true;

            submitButton.textContent =
                "Sending...";

        }


        const response =
            await fetch(
                `${API_BASE_URL}/notifications`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        user_id:
                            numericUserId,

                        type:
                            type,

                        message:
                            message
                    })
                }
            );


        const data =
            await getResponseData(response);


        if (!response.ok) {

            throw new Error(
                getErrorMessage(
                    data,
                    "Failed to create notification."
                )
            );

        }


        /*
         * Success.
         */

        if (resultMessage) {

            resultMessage.innerHTML = `
                <p class="success-message">
                    Notification sent successfully.
                </p>
            `;

        }


        /*
         * Reset form.
         */

        if (form) {
            form.reset();
        }


        /*
         * Reload notifications.
         */

        await loadNotifications();


        /*
         * Show popup.
         */

        showPopup(
            "Notification Sent",
            `Notification successfully sent to User ID ${numericUserId}.`,
            "success"
        );


        /*
         * Hide notification form.
         */

        setTimeout(() => {

            hideNotificationForm();

        }, 700);


    } catch (error) {

        console.error(
            "Create notification error:",
            error
        );


        if (resultMessage) {

            resultMessage.innerHTML = `
                <p class="error-message">
                    ${
                        error.message ||
                        "Unable to create notification."
                    }
                </p>
            `;

        }

    } finally {

        /*
         * Restore submit button.
         */

        const form =
            document.getElementById(
                "notification-form"
            );

        const submitButton =
            form?.querySelector(
                'button[type="submit"]'
            );


        if (submitButton) {

            submitButton.disabled = false;

            submitButton.textContent =
                "Send Notification";

        }

    }

}


// ============================================================
// MARK NOTIFICATION AS READ
// ============================================================

async function markNotificationRead(
    notificationId
) {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/notifications/${notificationId}/read`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    }
                }
            );


        const data =
            await getResponseData(response);


        if (!response.ok) {

            throw new Error(
                getErrorMessage(
                    data,
                    "Unable to mark notification as read"
                )
            );

        }


        await loadNotifications();


        showPopup(
            "Notification Updated",
            "Notification marked as read.",
            "success"
        );


    } catch (error) {

        console.error(
            "Mark notification read error:",
            error
        );


        showPopup(
            "Update Failed",
            error.message ||
                "Unable to mark notification as read.",
            "error"
        );

    }

}


// ============================================================
// INCIDENT HEADING
// ============================================================

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
            ? "ALL EMERGENCY REPORTS"
            : "MY INCIDENTS";
}


// ============================================================
// INITIALIZE DASHBOARD
// ============================================================

async function initializeDashboard() {

    updateLoginUI();
    updateRoleUI();


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

        console.log(
            "ResQhub frontend loaded."
        );


        // ----------------------------------------------------
        // INCIDENT FORM
        // ----------------------------------------------------

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


        // ----------------------------------------------------
        // LOGIN FORM
        // ----------------------------------------------------

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


        // ----------------------------------------------------
        // REGISTRATION FORM
        // ----------------------------------------------------

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


        // ====================================================
        // NOTIFICATION FORM LISTENER
        // ====================================================
        //
        // THIS IS THE IMPORTANT FIX.
        //
        // Previously your notification listener was outside
        // DOMContentLoaded. Therefore:
        //
        // document.getElementById("notification-form")
        //
        // returned null because HTML had not loaded yet.
        //
        // NOW the listener is registered AFTER HTML loads.
        // ====================================================

        const notificationForm =
            document.getElementById(
                "notification-form"
            );


        if (notificationForm) {

            console.log(
                "Notification form found. Listener attached."
            );


            notificationForm.addEventListener(
                "submit",
                createNotification
            );

        } else {

            console.warn(
                "Notification form not found on this page."
            );

        }


        // ----------------------------------------------------
        // INITIALIZE
        // ----------------------------------------------------

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

window.showCreateRescueTeamForm =
    showCreateRescueTeamForm;

window.editRescueTeam =
    editRescueTeam;

window.releaseRescueTeam =
    releaseRescueTeam;

window.openRescueAssignment =
    openRescueAssignment;

window.showCreateResourceForm =
    showCreateResourceForm;

window.editResource =
    editResource;

window.openResourceAssignment =
    openResourceAssignment;

window.deleteResource =
    deleteResource;

window.loadIncidents =
    loadIncidents;

window.loadNotifications =
    loadNotifications;

window.showNotifications =
    showNotifications;

window.hideNotifications =
    hideNotifications;

window.showNotificationForm =
    showNotificationForm;

window.hideNotificationForm =
    hideNotificationForm;

window.createNotification =
    createNotification;

window.markNotificationRead =
    markNotificationRead;
