document.addEventListener("DOMContentLoaded", () => {

    


    // Form elements
    const loginForm = document.querySelector(".form")
    const submitButton = document.querySelector(".submit")
    const instructionsButton = document.getElementById("leave-button")
    const togglePasswordButton = document.getElementById("toggle-password")
    const passwordInput = document.getElementById("password")
    const emailInput = document.getElementById("email")

    // Leaderboard elements
    const leaderboardBtn = document.getElementById("leaderboard-btn")
    const floatingLeaderboardBtn = document.getElementById("floating-leaderboard")
    const leaderboardModal = document.getElementById("leaderboard-modal")

    // Check for registration success
    const urlParams = new URLSearchParams(window.location.search)
    const registrationSuccess = urlParams.get("registration")

    const rememberedEmail = localStorage.getItem("rememberEmail");
    const rememberedPassword = localStorage.getItem("rememberPassword");

    if (rememberedEmail && rememberedPassword) {
        sendLogin({ email: rememberedEmail, password: rememberedPassword });
    }

    if (registrationSuccess === "success") {
        const registeredEmail = localStorage.getItem("registeredEmail")
        if (registeredEmail && emailInput) {
            emailInput.value = registeredEmail
            localStorage.removeItem("registeredEmail")
            showNotification("Registration successful! Please log in.", "success")
        }
    }

    // Toggle password visibility
    if (togglePasswordButton && passwordInput) {
        togglePasswordButton.addEventListener("click", () => {
            const type = passwordInput.getAttribute("type") === "password" ? "text" : "password"
            passwordInput.setAttribute("type", type)

            const icon = togglePasswordButton.querySelector("i")
            icon.classList.toggle("fa-eye")
            icon.classList.toggle("fa-eye-slash")
        })
    }

    // Leaderboard button handlers
    if (leaderboardBtn) {
        leaderboardBtn.addEventListener("click", () => {
            openLeaderboardModal()
        })
    }

    if (floatingLeaderboardBtn) {
        floatingLeaderboardBtn.addEventListener("click", () => {
            openLeaderboardModal()
        })
    }

    function openLeaderboardModal() {
        if (leaderboardModal) {
            leaderboardModal.style.display = "block"
            document.body.style.overflow = "hidden"
            fetchLeaderboardData()
        }
    }

    // Instructions button
    if (instructionsButton) {
        instructionsButton.addEventListener("click", () => {
            const instructionsModal = document.getElementById("instructions-modal")
            if (instructionsModal) {
                instructionsModal.style.display = "block"
                document.body.style.overflow = "hidden"
            } else {
                window.open("Azul Game Instructions.pdf", "_blank")
            }
        })
    }

    // Close modal buttons
    const closeModalButtons = document.querySelectorAll(".close-modal")
    if (closeModalButtons.length) {
        closeModalButtons.forEach((button) => {
            button.addEventListener("click", function () {
                const modal = this.closest(".modal")
                if (modal) {
                    modal.style.display = "none"
                    document.body.style.overflow = ""
                }
            })
        })
    }

    // Close modals when clicking outside
    window.addEventListener("click", (e) => {
        if (e.target.classList.contains("modal")) {
            e.target.style.display = "none"
            document.body.style.overflow = ""
        }
    })

    // Close instructions button
    const closeInstructions = document.getElementById("close-instructions")
    if (closeInstructions) {
        closeInstructions.addEventListener("click", () => {
            const modal = document.getElementById("instructions-modal")
            if (modal) {
                modal.style.display = "none"
                document.body.style.overflow = ""
            }
        })
    }

    // Form submission
    if (submitButton) {
        submitButton.addEventListener("click", handleSubmitButtonClick)
    }
    // Easter egg
    ; (() => {
        const sequence = ["a", "z", "u", "l"]
        let position = 0
        const modal = document.getElementById("easter-egg-modal")

        document.addEventListener("keydown", (e) => {
            const key = e.key.toLowerCase()
            if (key === sequence[position]) {
                position++
                if (position === sequence.length) {
                    modal.style.display = "block"
                    setTimeout(() => {
                        modal.style.display = "none"
                    }, 2000)
                    position = 0
                }
            } else {
                position = key === sequence[0] ? 1 : 0
            }
        })
    })()

    // Initialize leaderboard tabs
    initializeLeaderboardTabs()

    // Helper Functions
    function handleSubmitButtonClick(event) {
        event.preventDefault()
        

        const email = emailInput.value.trim()
        const password = passwordInput.value

        clearErrors()

        let isValid = true

        if (!email) {
            showError("email", "Email address is required!")
            isValid = false
        }

        if (!password) {
            showError("password", "Password is required!")
            isValid = false
        }
        const rememberMe = document.getElementById("remember-me").checked;
        if (rememberMe) {
            localStorage.setItem("rememberEmail", email);
            localStorage.setItem("rememberPassword", password);
        } else {
            localStorage.removeItem("rememberEmail");
            localStorage.removeItem("rememberPassword");
        }

        if (isValid) {
            const userData = {
                email: email,
                password: password,
            }
            sendLogin(userData)
        }
    }

    function showError(fieldId, message) {
        if (fieldId === "form") {
            const form = document.querySelector(".form")
            const errorElement = document.createElement("div")
            errorElement.className = "error-message"
            errorElement.textContent = message
            form.prepend(errorElement)
        } else {
            const field = document.getElementById(fieldId)
            if (field) {
                const errorElement = document.createElement("div")
                errorElement.className = "error-message"
                errorElement.textContent = message
                field.parentNode.appendChild(errorElement)
            }
        }
    }

    function clearErrors() {
        const errorMessages = document.querySelectorAll(".error-message")
        errorMessages.forEach((msg) => msg.remove())
    }

    function sendLogin(userData) {
        const originalText = submitButton.textContent
        submitButton.textContent = "Signing in..."
        submitButton.disabled = true

        fetch("https://azul32.onrender.com/api/authentication/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "text/plain",
            },
            body: JSON.stringify(userData),
        })
            .then(async (response) => {
                const text = await response.text()
                try {
                    const data = text ? JSON.parse(text) : {}
                    if (!response.ok) {
                        throw new Error(data.message || data.title || `Server error: ${response.status} ${response.statusText}`)
                    }
                    return data
                } catch (e) {
                    throw new Error(text || `Request failed with status ${response.status}`)
                }
            })
            .then((data) => {
                const token = data.token
                rememberMe = document.getElementById("remember-me").checked;
                if (rememberMe) {
                    localStorage.setItem("userToken", token);
                } else {
                    sessionStorage.setItem("userToken", token);
                }
                sessionStorage.setItem("userToken", token)
                window.location.href = "./lobby.html?token=" + token
            })
            .catch((error) => {
                showError("form", error.message)
                console.error("Login failed:", error)
            })
            .finally(() => {
                submitButton.textContent = originalText
                submitButton.disabled = false
            })
    }

    function initializeLeaderboardTabs() {
        const tabButtons = document.querySelectorAll(".tab-btn")
        tabButtons.forEach((button) => {
            button.addEventListener("click", function () {
                tabButtons.forEach((btn) => btn.classList.remove("active"))
                this.classList.add("active")
                fetchLeaderboardData()
            })
        })
    }

    function fetchLeaderboardData() {
        const container = document.getElementById("leaderboard-container")
        if (!container) return

        showLeaderboardLoading()

        try {
            fetch("https://azul32.onrender.com/api/Leaderboard")
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`Server responded with status: ${response.status}`)
                    }
                    return response.json()
                })
                .then((data) => {
                    data.sort((a, b) => b.highestScore - a.highestScore)
                    createLeaderboard(data)
                })
                .catch((error) => {
                    console.error("Leaderboard fetch error:", error)
                    showLeaderboardError("Could not load leaderboard data")
                })
        } catch (e) {
            console.error("Poll error:", e)
        }
    }

    function createLeaderboard(data) {
        const container = document.getElementById("leaderboard-container")
        if (!container) return

        container.innerHTML = ""

        if (!data || data.length === 0) {
            container.innerHTML = `
        <div style="text-align: center; padding: 20px; color: #666;">
          <p>No players found</p>
        </div>
      `
            return
        }

        const playerList = document.createElement("div")
        playerList.className = "leaderboard-players"

        data.slice(0, 10).forEach((player, index) => {
            const playerItem = document.createElement("div")
            playerItem.className = "leaderboard-item"

            let rankClass = ""
            if (index === 0) rankClass = "gold"
            else if (index === 1) rankClass = "silver"
            else if (index === 2) rankClass = "bronze"

            playerItem.innerHTML = `
        <div class="player-rank ${rankClass}">${index + 1}</div>
        <div class="player-info">
          <span class="player-name">${escapeHtml(player.userName)}</span>
          <div class="player-stats">
            <span>Wins: ${player.wins}</span>
            <span>Losses: ${player.losses || "N/A"}</span>
          </div>
        </div>
        <div class="player-score">${player.highestScore}</div>
      `

            playerList.appendChild(playerItem)
        })

        container.appendChild(playerList)
    }

    function showLeaderboardLoading() {
        const container = document.getElementById("leaderboard-container")
        if (!container) return

        container.innerHTML = `
      <div class="loading-spinner">
        <i class="fas fa-spinner"></i>
        <p>Loading leaderboard...</p>
      </div>
    `
    }

    function showLeaderboardError(message) {
        const container = document.getElementById("leaderboard-container")
        if (!container) return

        container.innerHTML = `
      <div style="text-align: center; padding: 20px; color: #d32f2f;">
        <i class="fas fa-exclamation-triangle" style="font-size: 24px; margin-bottom: 10px;"></i>
        <p>${message}</p>
        <button class="retry-btn" style="margin-top: 10px; padding: 5px 10px; background: #1d7cb6; color: white; border: none; border-radius: 5px; cursor: pointer;">
          Retry
        </button>
      </div>
    `

        const retryBtn = container.querySelector(".retry-btn")
        if (retryBtn) {
            retryBtn.addEventListener("click", () => {
                fetchLeaderboardData()
            })
        }
    }

    function showNotification(message, type = "info") {
        const notification = document.createElement("div")
        notification.className = `notification ${type}`
        notification.textContent = message

        document.body.appendChild(notification)

        setTimeout(() => {
            notification.classList.add("show")
        }, 10)

        setTimeout(() => {
            notification.classList.remove("show")
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification)
                }
            }, 300)
        }, 3000)
    }

    function escapeHtml(text) {
        if (!text) return ""
        const map = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;",
        }
        return text.toString().replace(/[&<>"']/g, (m) => map[m])
    }
})
