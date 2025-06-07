document.addEventListener("DOMContentLoaded", () => {
    // Form submission
    const loginForm = document.getElementById("login-form")
    const submitButton = document.querySelector(".submit")
    const instructionsButton = document.getElementById("leave-button")
    const urlParams = new URLSearchParams(window.location.search)
    const registrationSuccess = urlParams.get("registration")
    const emailField = document.getElementById("email")

    if (instructionsButton) {
        instructionsButton.addEventListener("click", () => {
            window.open("Azul Game Instructions.pdf", "_blank")
        })
    }

    if (registrationSuccess === "success") {
        // Opgeslagen email ophalen
        const registeredEmail = localStorage.getItem("registeredEmail")

        if (registeredEmail) {
            // Email automatisch invullen indien het bestaat
            if (emailField) {
                emailField.value = registeredEmail
            }

            // Opgeslagen Email verwijderen nadat dit gebruikt is
            localStorage.removeItem("registeredEmail")
        }
    }

    submitButton.addEventListener("click", handleSubmitButtonClick)

    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault()

            const email = document.getElementById("email").value.trim()
            const password = document.getElementById("password").value

            // Validate inputs
            let isValid = true

            if (!email) {
                showError("email", "Email address is required!")
                isValid = false
            }

            if (!password) {
                showError("password", "Password is required!")
                isValid = false
            }

            if (isValid) {
                const userData = {
                    email: email,
                    password: password,
                }
                sendRegistration(userData)
            }
        })
    }

    // Leaderboard tabs
    let currentLeaderboardType = "all"
    let leaderboardData = []

    function initializeLeaderboardTabs() {
        const tabButtons = document.querySelectorAll(".tab-btn")

        tabButtons.forEach((button) => {
            button.addEventListener("click", function () {
                // Remove active class from all buttons
                tabButtons.forEach((btn) => btn.classList.remove("active"))

                // Add active class to clicked button
                this.classList.add("active")

                // Update current type and refresh leaderboard
                currentLeaderboardType = this.getAttribute("data-tab")
                createLeaderboard(leaderboardData)
            })
        })
    }

    initializeLeaderboardTabs()

    // Instructions modal
    const instructionsBtn = document.getElementById("instructions-btn")
    const instructionsModal = document.getElementById("instructions-modal")
    const closeInstructions = document.getElementById("close-instructions")
    const closeModalButtons = document.querySelectorAll(".close-modal")

    if (instructionsBtn && instructionsModal) {
        instructionsBtn.addEventListener("click", (e) => {
            e.preventDefault()
            instructionsModal.style.display = "block"
            document.body.style.overflow = "hidden"
        })
    }

    if (closeInstructions) {
        closeInstructions.addEventListener("click", () => {
            instructionsModal.style.display = "none"
            document.body.style.overflow = ""
        })
    }

    // Close all modals with X button
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

    // Initialize leaderboard
    showLeaderboardLoading()

    // Polling for leaderboard data
    setInterval(async () => {
        try {
            const token = sessionStorage.getItem("userToken")
            const res = await fetch("https://azul32.onrender.com/api/Leaderboard")

            if (!res.ok) {
                showLeaderboardError("Failed to load leaderboard data")
                return
            }

            const data = await res.json()
            leaderboardData = data.sort((a, b) => b.highestScore - a.highestScore)
            createLeaderboard(leaderboardData)
        } catch (e) {
            console.error("Poll error:", e)
            showLeaderboardError("Connection error")
        }
    }, 3000)

    function createLeaderboard(data) {
        const container = document.getElementById("leaderboard-container")

        // Clear existing content
        while (container.firstChild) {
            container.removeChild(container.firstChild)
        }

        // Create header with tabs
        const header = document.createElement("div")
        header.innerHTML = `
        <h3><i class="fas fa-trophy"></i> Top Players</h3>
        <div class="leaderboard-tabs">
            <button class="tab-btn ${currentLeaderboardType === "all" ? "active" : ""}" data-tab="all">All Time</button>
            <button class="tab-btn ${currentLeaderboardType === "weekly" ? "active" : ""}" data-tab="weekly">This Week</button>
        </div>
    `
        container.appendChild(header)

        // Re-initialize tab functionality
        initializeLeaderboardTabs()

        if (!data || data.length === 0) {
            const noData = document.createElement("div")
            noData.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No players yet. Be the first!</p>'
            container.appendChild(noData)
            return
        }

        // Filter data based on current tab (for demo purposes, we'll show all data for both tabs)
        // In a real implementation, you'd have different endpoints or date filtering
        let filteredData = data

        if (currentLeaderboardType === "weekly") {
            // For demo purposes, we'll just show the same data
            // In production, you'd filter by date or call a different endpoint
            filteredData = data
        }

        // Create numbered list
        const ol = document.createElement("ol")

        // Add top 5 players with enhanced styling
        filteredData.slice(0, 5).forEach((player, index) => {
            const li = document.createElement("li")

            let rankClass = ""
            if (index === 0) rankClass = "gold"
            else if (index === 1) rankClass = "silver"
            else if (index === 2) rankClass = "bronze"

            li.innerHTML = `
          <div class="player-rank ${rankClass}">${index + 1}</div>
          <div class="player-info">
              <span class="player-name">${escapeHtml(player.userName)}</span>
              <div class="player-stats">
                  <span>Wins: ${player.wins}</span>
                  <span>Games: ${player.gamesPlayed || "N/A"}</span>
              </div>
          </div>
          <div class="player-score">${player.highestScore.toLocaleString()}</div>
      `

            ol.appendChild(li)
        })

        container.appendChild(ol)

        // Add "view more" link
        const link = document.createElement("a")
        link.href = "#"
        link.className = "leaderboard-link"
        link.innerHTML = '<i class="fas fa-external-link-alt"></i> View full leaderboard'
        link.addEventListener("click", (e) => {
            e.preventDefault()
            // Here you could open a modal or navigate to a full leaderboard page
            alert("Full leaderboard feature coming soon!")
        })
        container.appendChild(link)
    }

    function showLeaderboardError(message) {
        const container = document.getElementById("leaderboard-container")

        // Clear existing content
        while (container.firstChild) {
            container.removeChild(container.firstChild)
        }

        const header = document.createElement("div")
        header.innerHTML = '<h3><i class="fas fa-trophy"></i> Top Players</h3>'
        container.appendChild(header)

        const errorDiv = document.createElement("div")
        errorDiv.innerHTML = `
        <div style="text-align: center; padding: 20px; color: #d32f2f;">
            <i class="fas fa-exclamation-triangle" style="font-size: 24px; margin-bottom: 10px;"></i>
            <p>${message}</p>
            <p style="font-size: 12px; color: #666;">Retrying automatically...</p>
        </div>
    `
        container.appendChild(errorDiv)
    }

    function showLeaderboardLoading() {
        const container = document.getElementById("leaderboard-container")

        // Clear existing content
        while (container.firstChild) {
            container.removeChild(container.firstChild)
        }

        const header = document.createElement("div")
        header.innerHTML = '<h3><i class="fas fa-trophy"></i> Top Players</h3>'
        container.appendChild(header)

        const loadingDiv = document.createElement("div")
        loadingDiv.className = "loading-spinner"
        loadingDiv.innerHTML = `
        <i class="fas fa-spinner"></i>
        <p>Loading leaderboard...</p>
    `
        container.appendChild(loadingDiv)
    }

    // Utility function to escape HTML
    function escapeHtml(text) {
        const map = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;",
        }
        return text.replace(/[&<>"']/g, (m) => map[m])
    }

    // Form handling functions
    function handleSubmitButtonClick(event) {
        event.preventDefault()

        const email = document.getElementById("email").value.trim()
        const password = document.getElementById("password").value

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

        if (isValid) {
            const userData = {
                email: email,
                password: password,
            }
            sendRegistration(userData)
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
            const errorElement = document.createElement("div")
            errorElement.className = "error-message"
            errorElement.textContent = message
            errorElement.style.fontSize = "0.8em"
            errorElement.style.marginTop = "5px"
            field.parentNode.appendChild(errorElement)
        }
    }

    function clearErrors() {
        const errorMessages = document.querySelectorAll(".error-message")
        errorMessages.forEach((msg) => msg.remove())
    }

    function sendRegistration(userData) {
        console.log("Sending to backend:", userData)

        // Show loading state
        const submitButton = document.querySelector(".submit")
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
                sessionStorage.setItem("userToken", token)
                window.location.href = "./lobby.html?token=" + token
            })
            .catch((error) => {
                showError("form", error.message)
                console.error("Login failed:", error)
            })
            .finally(() => {
                // Reset button state
                submitButton.textContent = originalText
                submitButton.disabled = false
            })
    }
    // Easter egg functionality
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

    // Helper Functions
    function showNotification(message, type = "info") {
        // Create notification element
        const notification = document.createElement("div")
        notification.className = `notification ${type}`
        notification.textContent = message

        // Add to DOM
        document.body.appendChild(notification)

        // Show with animation
        setTimeout(() => {
            notification.classList.add("show")
        }, 10)

        // Remove after delay
        setTimeout(() => {
            notification.classList.remove("show")
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification)
                }
            }, 300)
        }, 3000)
    }

    // Add notification styles dynamically
    const notificationStyles = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            transform: translateY(-20px);
            opacity: 0;
            transition: all 0.3s ease;
            z-index: 1100;
        }
        .notification.show {
            transform: translateY(0);
            opacity: 1;
        }
        .notification.success {
            background-color: #4CAF50;
        }
        .notification.error {
            background-color: #F44336;
        }
        .notification.info {
            background-color: #4A90E2;
        }
        .notification.warning {
            background-color: #FF9800;
        }
    `

    const styleElement = document.createElement("style")
    styleElement.textContent = notificationStyles
    document.head.appendChild(styleElement)
})
