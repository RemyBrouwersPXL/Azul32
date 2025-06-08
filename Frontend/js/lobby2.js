document.addEventListener("DOMContentLoaded", () => {
    // Initialize the lobby
    initializeLobby()

    // Form submission
    const gameForm = document.querySelector(".game-form")
    if (gameForm) {
        gameForm.addEventListener("submit", handleSubmitButtonClick)
    }

    // Player/bot selection updates
    const playerSelect = document.getElementById("player")
    const botsSelect = document.getElementById("bots")

    if (playerSelect && botsSelect) {
        playerSelect.addEventListener("change", updateGamePreview)
        botsSelect.addEventListener("change", updateGamePreview)
        updateGamePreview() // Initial update
    }
})

// Update the initializeLobby function to avoid duplicate API calls

async function initializeLobby() {
    try {
        // Load user profile data (which now also loads stats)
        await loadUserProfile()

        // Load recent activity
        loadRecentActivity()
    } catch (error) {
        console.error("Error initializing lobby:", error)
    }
}

// Also update the loadUserProfile function to avoid making a duplicate API call

async function loadUserProfile() {
    try {
        const userId = getUserIdFromToken()
        const userToken = sessionStorage.getItem("userToken")

        if (!userId || !userToken) {
            console.warn("No user token found")
            return
        }

        const response = await fetch(`https://azul32.onrender.com/api/Player/${userId}`, {
            method: "GET",
            headers: {
                Authorization: "Bearer " + userToken,
                "Content-Type": "application/json",
                Accept: "text/plain",
            },
        })

        if (response.ok) {
            const userData = await response.json()

            // Update header with user name
            const playerNameElement = document.getElementById("player-name")
            if (playerNameElement && userData.userName) {
                playerNameElement.textContent = userData.userName
            }

            // Store the user data for other functions to use
            sessionStorage.setItem("userData", JSON.stringify(userData))

            // Since we already have the data, update stats directly
            updateStatElement("total-wins", userData.wins || 0)
            updateStatElement("games-played", userData.totalGamesPlayed || 0)
            updateStatElement("highest-score", userData.highestScore || 0)

            // Calculate win rate
            const winRate = userData.totalGamesPlayed > 0 ? Math.round((userData.wins / userData.totalGamesPlayed) * 100) : 0
            updateStatElement("win-rate", `${winRate}%`)
        }
    } catch (error) {
        console.error("Error loading user profile:", error)
    }
}

// Replace the loadUserStats function with this updated version that uses the real API data

async function loadUserStats() {
    try {
        const userId = getUserIdFromToken()
        const userToken = sessionStorage.getItem("userToken")

        if (!userId || !userToken) return

        // Fetch player data from the API
        const response = await fetch(`https://azul32.onrender.com/api/Player/${userId}`, {
            method: "GET",
            headers: {
                Authorization: "Bearer " + userToken,
                "Content-Type": "application/json",
                Accept: "text/plain",
            },
        })

        if (!response.ok) {
            throw new Error("Failed to load player stats")
        }

        const playerData = await response.json()

        // Update stats in UI with real data
        updateStatElement("total-wins", playerData.wins || 0)
        updateStatElement("games-played", playerData.totalGamesPlayed || 0)
        updateStatElement("highest-score", playerData.highestScore || 0)

        // Calculate win rate
        const winRate =
            playerData.totalGamesPlayed > 0 ? Math.round((playerData.wins / playerData.totalGamesPlayed) * 100) : 0
        updateStatElement("win-rate", `${winRate}%`)

        // If we have lastPlayed data, we could show it somewhere
        if (playerData.lastPlayed) {
            const lastPlayed = new Date(playerData.lastPlayed)
            console.log("Last played:", lastPlayed.toLocaleDateString())
        }
    } catch (error) {
        console.error("Error loading user stats:", error)
        // Show fallback stats if API fails
        updateStatElement("total-wins", 0)
        updateStatElement("games-played", 0)
        updateStatElement("highest-score", 0)
        updateStatElement("win-rate", "0%")
    }
}

function updateStatElement(id, value) {
    const element = document.getElementById(id)
    if (element) {
        // Animate the number counting up
        animateNumber(element, 0, Number.parseInt(value) || 0, 1000)
    }
}

function animateNumber(element, start, end, duration) {
    const startTime = performance.now()
    const isPercentage = element.id === "win-rate"

    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)

        const current = Math.floor(start + (end - start) * progress)
        element.textContent = isPercentage ? `${current}%` : current

        if (progress < 1) {
            requestAnimationFrame(updateNumber)
        }
    }

    requestAnimationFrame(updateNumber)
}

// Update the loadRecentActivity function to use real data if available

function loadRecentActivity() {
    const activityList = document.getElementById("activity-list")
    if (!activityList) return

    // Try to get user data from sessionStorage
    const userDataString = sessionStorage.getItem("userData")
    let lastPlayed = null

    if (userDataString) {
        try {
            const userData = JSON.parse(userDataString)
            if (userData.lastPlayed) {
                lastPlayed = new Date(userData.lastPlayed)
            }
        } catch (e) {
            console.error("Error parsing user data:", e)
        }
    }

    // Create activities array with at least one real activity if available
    const activities = []

    if (lastPlayed) {
        // Format the time difference
        const timeDiff = getTimeDifference(lastPlayed)

        activities.push({
            type: "game",
            title: "Last game played",
            description: "You played a game of Azul",
            time: timeDiff,
        })
    }

    // Add some mock activities if we don't have enough real ones
    if (activities.length < 3) {
        if (activities.length === 0) {
            activities.push({
                type: "game",
                title: "Welcome to Azul",
                description: "Start your first game to track activity",
                time: "Just now",
            })
        }

        activities.push({
            type: "info",
            title: "Game activity will appear here",
            description: "Play more games to see your history",
            time: "",
        })
    }

    activityList.innerHTML = activities
        .map(
            (activity) => `
        <div class="activity-item">
            <div class="activity-icon ${activity.type}">
                <i class="fas fa-${activity.type === "win" ? "trophy" : activity.type === "loss" ? "medal" : activity.type === "info" ? "info-circle" : "gamepad"}"></i>
            </div>
            <div class="activity-info">
                <h4>${activity.title}</h4>
                <p>${activity.description}</p>
            </div>
            <div class="activity-time">${activity.time}</div>
        </div>
    `,
        )
        .join("")
}

// Helper function to format time difference
function getTimeDifference(date) {
    const now = new Date()
    const diffMs = now - date
    const diffSec = Math.round(diffMs / 1000)
    const diffMin = Math.round(diffSec / 60)
    const diffHour = Math.round(diffMin / 60)
    const diffDay = Math.round(diffHour / 24)

    if (diffSec < 60) {
        return "Just now"
    } else if (diffMin < 60) {
        return `${diffMin} minute${diffMin !== 1 ? "s" : ""} ago`
    } else if (diffHour < 24) {
        return `${diffHour} hour${diffHour !== 1 ? "s" : ""} ago`
    } else if (diffDay < 30) {
        return `${diffDay} day${diffDay !== 1 ? "s" : ""} ago`
    } else {
        return date.toLocaleDateString()
    }
}

function updateGamePreview() {
    const players = Number.parseInt(document.getElementById("player").value)
    const bots = Number.parseInt(document.getElementById("bots").value)
    const total = players + bots

    // Update total players text
    const totalPlayersElement = document.getElementById("total-players")
    if (totalPlayersElement) {
        totalPlayersElement.textContent = total
    }

    // Update player icons
    const playerIconsContainer = document.getElementById("player-icons")
    if (playerIconsContainer) {
        playerIconsContainer.innerHTML = ""

        // Add human player icons
        for (let i = 0; i < players; i++) {
            const icon = document.createElement("div")
            icon.className = "player-icon human"
            icon.innerHTML = '<i class="fas fa-user"></i>'
            icon.title = `Player ${i + 1}`
            playerIconsContainer.appendChild(icon)
        }

        // Add bot icons
        for (let i = 0; i < bots; i++) {
            const icon = document.createElement("div")
            icon.className = "player-icon bot"
            icon.innerHTML = '<i class="fas fa-robot"></i>'
            icon.title = `Bot ${i + 1}`
            playerIconsContainer.appendChild(icon)
        }
    }

    // Update bot options based on player count
    updateBotOptions()
}

function updateBotOptions() {
    const selectedPlayers = Number.parseInt(document.getElementById("player").value)
    const botsSelect = document.getElementById("bots")
    const botOptions = botsSelect.options

    for (let i = 0; i < botOptions.length; i++) {
        if (botOptions[i].value === "2") {
            if (selectedPlayers === 2) {
                botOptions[i].disabled = true
                if (botsSelect.value === "2") {
                    botsSelect.value = "1"
                }
            } else {
                botOptions[i].disabled = false
            }
        }
    }
}

async function handleSubmitButtonClick(event) {
    event.preventDefault()
    console.log("Game search clicked")

    const players = document.getElementById("player").value.trim()
    const bots = document.getElementById("bots").value

    clearErrors()

    const player = Number.parseInt(players)
    const bot = Number.parseInt(bots)

    const isValid = true

    if (isValid) {
        // Hide the form and show loader
        const gameSection = document.querySelector(".game-section")
        if (gameSection) {
            gameSection.style.opacity = "0.5"
            gameSection.style.pointerEvents = "none"
        }

        await showLoader()

        const userData = {
            numberOfPlayers: players,
            numberOfArtificialPlayers: bots,
        }

        try {
            await sendRegistration(userData)
        } catch (error) {
            showError("form", error.message)
            console.error("Registration failed:", error)

            // Restore form
            if (gameSection) {
                gameSection.style.opacity = "1"
                gameSection.style.pointerEvents = "auto"
            }
        } finally {
            hideLoader()
        }
    }
}

// Profile Modal Functions
function openModal() {
    try {
        const userId = getUserIdFromToken()
        const userToken = sessionStorage.getItem("userToken")

        fetch(`https://azul32.onrender.com/api/Player/${userId}`, {
            method: "GET",
            headers: {
                Authorization: "Bearer " + userToken,
                "Content-Type": "application/json",
                Accept: "text/plain",
            },
        })
            .then((response) => response.json())
            .then((data) => {
                document.getElementById("name").value = data.userName || ""
                if (data.color !== null) {
                    const colorInput = document.querySelector(`input[name="color"][value="${data.color}"]`)
                    if (colorInput) {
                        colorInput.checked = true
                    }
                }
                document.getElementById("bio").value = data.bio || ""
                document.getElementById("profileModal").style.display = "block"
                document.body.style.overflow = "hidden"
            })
            .catch((error) => {
                console.error("Error fetching profile:", error)
                showNotification("Error loading profile", "error")
            })
    } catch (error) {
        console.error("Error opening modal:", error)
        showNotification("Something went wrong", "error")
    }
}

function closeModal() {
    document.getElementById("profileModal").style.display = "none"
    document.body.style.overflow = ""
}

// Profile form submission
document.getElementById("profileForm").addEventListener("submit", async (e) => {
    e.preventDefault()

    const data = {
        userName: document.getElementById("name").value,
        color: document.querySelector('input[name="color"]:checked')?.value,
        bio: document.getElementById("bio").value,
        avatarUrl: `https://www.pngkey.com/png/full/115-1150420_avatar-png-pic-male-avatar-icon-png.png`,
    }

    const userId = getUserIdFromToken()
    const userToken = sessionStorage.getItem("userToken")

    try {
        const response = await fetch(`https://azul32.onrender.com/api/Player/${userId}`, {
            method: "PATCH",
            headers: {
                Authorization: "Bearer " + userToken,
                "Content-Type": "application/json",
                Accept: "text/plain",
            },
            body: JSON.stringify(data),
        })

        if (response.ok) {
            showNotification("Profile saved successfully!", "success")
            closeModal()

            // Update the header name if it changed
            const playerNameElement = document.getElementById("player-name")
            if (playerNameElement && data.userName) {
                playerNameElement.textContent = data.userName
            }
        } else {
            showNotification("Error saving profile", "error")
        }
    } catch (error) {
        console.error("Error:", error)
        showNotification("Server error", "error")
    }
})

// Quick Action Functions
function showLeaderboard() {
    const modal = document.getElementById("leaderboardModal")
    if (modal) {
        modal.style.display = "block"
        document.body.style.overflow = "hidden"
        fetchLeaderboardData()
    }
}

function closeLeaderboardModal() {
    const modal = document.getElementById("leaderboardModal")
    if (modal) {
        modal.style.display = "none"
        document.body.style.overflow = ""
    }
}

function showInstructions() {
    // You can implement this to show game instructions
    showNotification("Instructions feature coming soon!", "info")
}

function showHistory() {
    // You can implement this to show game history
    showNotification("Game history feature coming soon!", "info")
}

function logout() {
    if (confirm("Are you sure you want to logout?")) {
        sessionStorage.clear()
        window.location.href = "index.html"
    }
}

// Utility Functions
function getUserIdFromToken() {
    const token = sessionStorage.getItem("userToken")
    if (!token) {
        return null
    }
    try {
        const base64Url = token.split(".")[1]
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join(""),
        )

        const payload = JSON.parse(jsonPayload)
        return payload.nameid
    } catch (error) {
        console.error("Error decoding JWT token:", error)
        return null
    }
}

function showError(fieldId, message) {
    const errorElement = document.createElement("div")
    errorElement.className = "error-message"
    errorElement.textContent = message
    errorElement.style.color = "#f44336"
    errorElement.style.marginBottom = "15px"
    errorElement.style.padding = "10px"
    errorElement.style.backgroundColor = "rgba(244, 67, 54, 0.1)"
    errorElement.style.borderRadius = "8px"

    if (fieldId === "form") {
        const form = document.querySelector(".game-form")
        if (form) {
            form.prepend(errorElement)
        }
    }
}

function clearErrors() {
    const errorMessages = document.querySelectorAll(".error-message")
    errorMessages.forEach((msg) => msg.remove())
}

async function sendRegistration(userData) {
    const userToken = sessionStorage.getItem("userToken")
    console.log("Sending to backend:", userToken)

    const response = await fetch("https://azul32.onrender.com/api/Tables/join-or-create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + userToken,
            Accept: "text/plain",
        },
        body: JSON.stringify(userData),
    })

    if (!response.ok) {
        throw new Error("Failed to find or create game")
    }

    const result = await response.json()
    console.log("Table created/joined:", result)

    const tableId = result.id
    await fetchTableDetails(tableId)
    sessionStorage.setItem("hasAvailableSeat", result.hasAvailableSeat)
    sessionStorage.setItem("aantal", result.seatedPlayers)

    window.location.href = `table.html?tableId=${tableId}`
    return result
}

async function fetchTableDetails(tableId) {
    const userToken = sessionStorage.getItem("userToken")

    try {
        const response = await fetch(`https://azul32.onrender.com/api/Tables/${tableId}`, {
            method: "GET",
            headers: {
                Authorization: "Bearer " + userToken,
                Accept: "text/plain",
            },
        })

        if (!response.ok) {
            console.warn("Failed to fetch table details, but continuing anyway")
            return
        }

        const tableDetails = await response.json()
        console.log("Table details:", tableDetails)
        sessionStorage.setItem("currentTable", JSON.stringify(tableDetails))
    } catch (error) {
        console.error("Error fetching table details:", error)
    }
}

async function fetchLeaderboardData() {
    const container = document.getElementById("leaderboard-container")
    if (!container) return

    container.innerHTML =
        '<div style="text-align: center; padding: 20px;"><i class="fas fa-spinner fa-spin"></i> Loading...</div>'

    try {
        const response = await fetch("https://azul32.onrender.com/api/Leaderboard")
        if (!response.ok) throw new Error("Failed to fetch leaderboard")

        const data = await response.json()
        data.sort((a, b) => b.highestScore - a.highestScore)

        container.innerHTML = data
            .slice(0, 10)
            .map((player, index) => {
                let rankClass = ""
                if (index === 0) rankClass = "gold"
                else if (index === 1) rankClass = "silver"
                else if (index === 2) rankClass = "bronze"

                return `
                <div class="leaderboard-item" style="display: flex; align-items: center; padding: 12px; margin-bottom: 8px; border-radius: 8px; background: rgba(255,255,255,0.5);">
                    <div class="player-rank ${rankClass}" style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: #f0f0f0; border-radius: 50%; margin-right: 12px; font-weight: bold;">${index + 1}</div>
                    <div style="flex: 1;">
                        <div style="font-weight: bold; color: var(--azul-blue);">${escapeHtml(player.userName)}</div>
                        <div style="font-size: 12px; color: #666;">Wins: ${player.wins} | Games: ${player.gamesPlayed || "N/A"}</div>
                    </div>
                    <div style="font-weight: bold; color: var(--azul-blue);">${player.highestScore}</div>
                </div>
            `
            })
            .join("")
    } catch (error) {
        console.error("Error fetching leaderboard:", error)
        container.innerHTML =
            '<div style="text-align: center; padding: 20px; color: #f44336;">Failed to load leaderboard</div>'
    }
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

// Loader functions
function getRandomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

async function showLoader() {
    const overlay = document.getElementById("loaderOverlay")
    const loadingMsg = document.getElementById("loading_msg")

    overlay.style.display = "flex"
    loadingMsg.style.display = "block"

    const delayTime = getRandomDelay(3000, 5000)
    await delay(delayTime)
}

function hideLoader() {
    const overlay = document.getElementById("loaderOverlay")
    const loadingMsg = document.getElementById("loading_msg")

    overlay.style.display = "none"
    loadingMsg.style.display = "none"
}

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

function showNotification(message, type = "info") {
    const notification = document.createElement("div")
    notification.className = `notification ${type}`
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 1100;
        transform: translateY(-20px);
        opacity: 0;
        transition: all 0.3s ease;
    `

    switch (type) {
        case "success":
            notification.style.backgroundColor = "#4caf50"
            break
        case "error":
            notification.style.backgroundColor = "#f44336"
            break
        case "warning":
            notification.style.backgroundColor = "#ff9800"
            break
        default:
            notification.style.backgroundColor = "var(--azul-blue)"
            break
    }

    notification.textContent = message
    document.body.appendChild(notification)

    setTimeout(() => {
        notification.style.transform = "translateY(0)"
        notification.style.opacity = "1"
    }, 10)

    setTimeout(() => {
        notification.style.transform = "translateY(-20px)"
        notification.style.opacity = "0"
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification)
            }
        }, 300)
    }, 3000)
}

// Close modals when clicking outside
window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) {
        e.target.style.display = "none"
        document.body.style.overflow = ""
    }
})
