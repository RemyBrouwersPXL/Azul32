document.addEventListener("DOMContentLoaded", () => {
    // Form submission
    const loginForm = document.getElementById("login-form")
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault()

            const email = document.getElementById("email").value
            const password = document.getElementById("password").value

            // Validate inputs
            if (!email || !password) {
                showNotification("Please fill in all fields", "error")
                return
            }

            // Here you would normally send the data to your backend
            console.log("Login attempt:", { email, password })

            // Simulate login process
            showNotification("Logging in...", "info")

            // Simulate API call
            setTimeout(() => {
                // For demo purposes, always succeed
                // In production, this would be based on server response
                window.location.href = "lobby.html" // Redirect to game page on success
            }, 1500)
        })
    }

    // Password visibility toggle
    const togglePassword = document.getElementById("toggle-password")
    if (togglePassword) {
        togglePassword.addEventListener("click", () => {
            const passwordInput = document.getElementById("password")
            if (passwordInput.type === "password") {
                passwordInput.type = "text"
                togglePassword.classList.remove("fa-eye-slash")
                togglePassword.classList.add("fa-eye")
            } else {
                passwordInput.type = "password"
                togglePassword.classList.remove("fa-eye")
                togglePassword.classList.add("fa-eye-slash")
            }
        })
    }

    // Leaderboard tabs
    const tabButtons = document.querySelectorAll(".tab-btn")
    if (tabButtons.length) {
        tabButtons.forEach((button) => {
            button.addEventListener("click", function () {
                // Remove active class from all buttons
                tabButtons.forEach((btn) => btn.classList.remove("active"))

                // Add active class to clicked button
                this.classList.add("active")

                // Here you would fetch different leaderboard data based on the tab
                const tabType = this.getAttribute("data-tab")
                fetchLeaderboardData(tabType)
            })
        })
    }

    // Instructions modal
    const instructionsBtn = document.getElementById("instructions-btn")
    const instructionsModal = document.getElementById("instructions-modal")
    const closeInstructions = document.getElementById("close-instructions")
    const closeModalButtons = document.querySelectorAll(".close-modal")

    if (instructionsBtn && instructionsModal) {
        instructionsBtn.addEventListener("click", (e) => {
            e.preventDefault()
            instructionsModal.style.display = "block"
            document.body.style.overflow = "hidden" // Prevent scrolling
        })
    }

    if (closeInstructions) {
        closeInstructions.addEventListener("click", () => {
            instructionsModal.style.display = "none"
            document.body.style.overflow = "" // Re-enable scrolling
        })
    }

    // Close all modals with X button
    if (closeModalButtons.length) {
        closeModalButtons.forEach((button) => {
            button.addEventListener("click", function () {
                const modal = this.closest(".modal")
                if (modal) {
                    modal.style.display = "none"
                    document.body.style.overflow = "" // Re-enable scrolling
                }
            })
        })
    }

    // Close modals when clicking outside
    window.addEventListener("click", (e) => {
        if (e.target.classList.contains("modal")) {
            e.target.style.display = "none"
            document.body.style.overflow = "" // Re-enable scrolling
        }
    })

    // Easter egg
    // Trigger when a specific key combination is pressed or after certain actions
    let easterEggCounter = 0
    const easterEggModal = document.getElementById("easter-egg-modal")
    const claimRewardBtn = document.getElementById("claim-reward")

    // Example: Clicking the logo 5 times triggers easter egg
    const logo = document.querySelector(".welcome-logo")
    if (logo) {
        logo.addEventListener("click", () => {
            easterEggCounter++
            if (easterEggCounter >= 5) {
                showEasterEgg()
                easterEggCounter = 0
            }
        })
    }

    if (claimRewardBtn) {
        claimRewardBtn.addEventListener("click", () => {
            easterEggModal.style.display = "none"
            document.body.style.overflow = "" // Re-enable scrolling
            showNotification("Reward claimed! 500 points added to your account.", "success")
        })
    }

    // Konami code easter egg (up, up, down, down, left, right, left, right, b, a)
    const konamiCode = [
        "ArrowUp",
        "ArrowUp",
        "ArrowDown",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "ArrowLeft",
        "ArrowRight",
        "b",
        "a",
    ]
    let konamiIndex = 0

    document.addEventListener("keydown", (e) => {
        if (e.key === konamiCode[konamiIndex]) {
            konamiIndex++
            if (konamiIndex === konamiCode.length) {
                showEasterEgg()
                konamiIndex = 0
            }
        } else {
            konamiIndex = 0
        }
    })

    // Initialize leaderboard
    fetchLeaderboardData("weekly")

    // Helper Functions
    function fetchLeaderboardData(type) {
        const leaderboardList = document.getElementById("leaderboard-list")
        if (!leaderboardList) return

        // Show loading state
        leaderboardList.innerHTML = `
            <div class="leaderboard-loading">
                <div class="spinner"></div>
                <p>Loading ${type} leaderboard...</p>
            </div>
        `

        // In a real app, you would fetch data from your API
        // For demo purposes, we'll simulate an API call
        setTimeout(() => {
            // Sample data - in production this would come from your backend
            let leaderboardData

            if (type === "weekly") {
                leaderboardData = [
                    { rank: 1, name: "TileMaster", wins: 152, rating: 2450, score: 9840 },
                    { rank: 2, name: "AzulQueen", wins: 128, rating: 2380, score: 8720 },
                    { rank: 3, name: "TileWizard", wins: 115, rating: 2310, score: 7950 },
                    { rank: 4, name: "PatternKing", wins: 98, rating: 2280, score: 7340 },
                    { rank: 5, name: "MosaicMaster", wins: 87, rating: 2210, score: 6890 },
                ]
            } else {
                leaderboardData = [
                    { rank: 1, name: "LegendaryTiler", wins: 1024, rating: 2780, score: 68420 },
                    { rank: 2, name: "TileMaster", wins: 982, rating: 2720, score: 65340 },
                    { rank: 3, name: "AzulLegend", wins: 876, rating: 2690, score: 59870 },
                    { rank: 4, name: "PatternGod", wins: 812, rating: 2650, score: 57240 },
                    { rank: 5, name: "TileWizard", wins: 795, rating: 2610, score: 54980 },
                ]
            }

            // Render leaderboard
            renderLeaderboard(leaderboardData)
        }, 1000)
    }

    function renderLeaderboard(data) {
        const leaderboardList = document.getElementById("leaderboard-list")
        if (!leaderboardList) return

        leaderboardList.innerHTML = ""

        data.forEach((player) => {
            const listItem = document.createElement("li")
            listItem.className = "leaderboard-item"

            listItem.innerHTML = `
                <span class="rank">${player.rank}</span>
                <div class="player-info">
                    <span class="player-name">${player.name}</span>
                    <div class="player-stats">
                        <span class="wins">${player.wins} wins</span>
                        <span class="rating">Rating: ${player.rating}</span>
                    </div>
                </div>
                <span class="score">${player.score.toLocaleString()}</span>
            `

            leaderboardList.appendChild(listItem)
        })
    }

    function showEasterEgg() {
        if (easterEggModal) {
            easterEggModal.style.display = "block"
            document.body.style.overflow = "hidden" // Prevent scrolling
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
                document.body.removeChild(notification)
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
            border-radius: 4px;
            color: white;
            font-weight: 500;
            box-shadow: 0 3px 6px rgba(0,0,0,0.16);
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
            background-color: #4caf50;
        }
        .notification.error {
            background-color: #f44336;
        }
        .notification.info {
            background-color: #2196f3;
        }
        .notification.warning {
            background-color: #ff9800;
        }
    `

    const styleElement = document.createElement("style")
    styleElement.textContent = notificationStyles
    document.head.appendChild(styleElement)
})
