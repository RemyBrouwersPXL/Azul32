document.addEventListener("DOMContentLoaded", () => {
    // Form elements
    const loginForm = document.querySelector(".form")
    const submitButton = document.querySelector(".submit")
    const instructionsButton = document.getElementById("leave-button")
    const togglePasswordButton = document.getElementById("toggle-password")
    const passwordInput = document.getElementById("password")
    const emailInput = document.getElementById("email")

    // Check for registration success
    const urlParams = new URLSearchParams(window.location.search)
    const registrationSuccess = urlParams.get("registration")

    if (registrationSuccess === "success") {
        // Get saved email from localStorage
        const registeredEmail = localStorage.getItem("registeredEmail")

        if (registeredEmail && emailInput) {
            emailInput.value = registeredEmail
            // Remove email after using it
            localStorage.removeItem("registeredEmail")
            // Show success notification
            showNotification("Registration successful! Please log in.", "success")
        }
    }

    // Toggle password visibility
    if (togglePasswordButton && passwordInput) {
        togglePasswordButton.addEventListener("click", () => {
            const type = passwordInput.getAttribute("type") === "password" ? "text" : "password"
            passwordInput.setAttribute("type", type)

            // Toggle icon
            const icon = togglePasswordButton.querySelector("i")
            icon.classList.toggle("fa-eye")
            icon.classList.toggle("fa-eye-slash")
        })
    }

    // Instructions button
    if (instructionsButton) {
        instructionsButton.addEventListener("click", () => {
            // Check if modal exists, otherwise open PDF
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

    // Leaderboard functionality
    initializeLeaderboard()

    // Poll for leaderboard updates
    setInterval(fetchLeaderboardData, 3000)

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
        // Show loading state
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

    function initializeLeaderboard() {
        const leaderboardContainer = document.getElementById("leaderboard-container")
        if (!leaderboardContainer) return

        // Initialize tabs if they don't exist yet
        if (!leaderboardContainer.querySelector(".leaderboard-tabs")) {
            const tabsDiv = document.createElement("div")
            tabsDiv.className = "leaderboard-tabs"
            tabsDiv.innerHTML = `
        <button class="tab-btn active" data-tab="all">All Time</button>
        <button class="tab-btn" data-tab="weekly">This Week</button>
      `

            // Add after the title
            const title = leaderboardContainer.querySelector("h3")
            if (title) {
                title.insertAdjacentElement("afterend", tabsDiv)
            } else {
                leaderboardContainer.prepend(tabsDiv)
            }
        }

        // Add tab functionality
        const tabButtons = leaderboardContainer.querySelectorAll(".tab-btn")
        tabButtons.forEach((button) => {
            button.addEventListener("click", function () {
                tabButtons.forEach((btn) => btn.classList.remove("active"))
                this.classList.add("active")
                fetchLeaderboardData()
            })
        })

        // Show loading initially
        showLeaderboardLoading()
    }

    function fetchLeaderboardData() {
        try {
            const token = sessionStorage.getItem("userToken")
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

        // Keep the title and tabs
        const title = container.querySelector("h3")
        const tabs = container.querySelector(".leaderboard-tabs")

        // Get active tab
        const activeTab = container.querySelector(".tab-btn.active")
        const tabType = activeTab ? activeTab.getAttribute("data-tab") : "all"

        // Clear content area
        const contentArea = container.querySelector(".leaderboard-content")
        if (contentArea) {
            contentArea.innerHTML = ""
        } else {
            const newContentArea = document.createElement("div")
            newContentArea.className = "leaderboard-content"
            container.appendChild(newContentArea)
        }

        // Get reference to content area
        const leaderboardContent = container.querySelector(".leaderboard-content")

        if (!data || data.length === 0) {
            leaderboardContent.innerHTML = `
        <div style="text-align: center; padding: 20px; color: #666;">
          <p>No players found</p>
        </div>
      `
            return
        }

        // Create player list
        const playerList = document.createElement("div")
        playerList.className = "leaderboard-players"

        // Add top 5 players
        data.slice(0, 5).forEach((player, index) => {
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
            <span>Games: ${player.gamesPlayed || "N/A"}</span>
          </div>
        </div>
        <div class="player-score">${player.highestScore}</div>
      `

            playerList.appendChild(playerItem)
        })

        leaderboardContent.appendChild(playerList)

        // Add view all link
        const viewAllLink = document.createElement("a")
        viewAllLink.href = "#"
        viewAllLink.className = "leaderboard-link"
        viewAllLink.innerHTML = '<i class="fas fa-external-link-alt"></i> View full leaderboard'
        leaderboardContent.appendChild(viewAllLink)
    }

    function showLeaderboardLoading() {
        const container = document.getElementById("leaderboard-container")
        if (!container) return

        const contentArea = container.querySelector(".leaderboard-content")
        if (contentArea) {
            contentArea.innerHTML = `
        <div class="loading-spinner">
          <i class="fas fa-spinner"></i>
          <p>Loading leaderboard...</p>
        </div>
      `
        }
    }

    function showLeaderboardError(message) {
        const container = document.getElementById("leaderboard-container")
        if (!container) return

        const contentArea = container.querySelector(".leaderboard-content")
        if (contentArea) {
            contentArea.innerHTML = `
        <div style="text-align: center; padding: 20px; color: #d32f2f;">
          <i class="fas fa-exclamation-triangle" style="font-size: 24px; margin-bottom: 10px;"></i>
          <p>${message}</p>
          <button class="retry-btn" style="margin-top: 10px; padding: 5px 10px; background: #1d7cb6; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Retry
          </button>
        </div>
      `

            // Add retry functionality
            const retryBtn = contentArea.querySelector(".retry-btn")
            if (retryBtn) {
                retryBtn.addEventListener("click", () => {
                    showLeaderboardLoading()
                    fetchLeaderboardData()
                })
            }
        }
    }

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

    // Utility function to escape HTML
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
