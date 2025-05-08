document.addEventListener("DOMContentLoaded", function () {
    const searchButton = document.getElementById("search-btn");
    const usernameInput = document.getElementById("user-input");

    const statsContainer = document.querySelector(".stats-container");
    const easyProgessCircle = document.querySelector(".easy-progress");
    const mediumProgessCircle = document.querySelector(".medium-progress");
    const hardProgessCircle = document.querySelector(".hard-progress");

    const easyLabel = document.getElementById("easy-label");
    const mediumLabel = document.getElementById("medium-label");
    const hardLabel = document.getElementById("hard-label");

    const cardStatsContainer = document.querySelector(".stats-card");

    // User profile DOM elements
    const profileSection = document.getElementById("user-profile");
    const avatarImg = document.getElementById("user-avatar");
    const displayUsername = document.getElementById("display-username");

    // Total & acceptance display
    const totalSolvedText = document.getElementById("total-solved");
    const acceptanceRateText = document.getElementById("acceptance-rate");

    function validateUsername(username) {
        if (username.trim() === "") {
            alert("Please enter a username.");
            return false;
        }
        const regex = /^(?![_-])(?!.*[_-]{2})[a-zA-Z0-9_-]{4,16}(?<![_-])$/;
        const isMatching = regex.test(username);
        if (!isMatching) {
            alert("Invalid username.");
        }
        return isMatching;
    }

    async function fetchUserDetails(username) {
        const query = `
        query getUserProfile($username: String!) {
          allQuestionsCount {
            difficulty
            count
          }
          matchedUser(username: $username) {
            username
            profile {
              userAvatar
            }
            submitStats {
              acSubmissionNum {
                difficulty
                count
              }
              totalSubmissionNum {
                difficulty
                count
              }
            }
          }
        }
      `;

        const variables = { username };

        try {
            searchButton.textContent = "Searching...";
            searchButton.disabled = true;

            const response = await fetch("https://cors-anywhere.herokuapp.com/https://leetcode.com/graphql", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ query, variables })
            });

            if (!response.ok) {
                throw new Error("Network response was not ok " + response.statusText);
            }

            const result = await response.json();
            const userData = result.data.matchedUser;

            if (!userData) {
                statsContainer.innerHTML = "<p>No user found</p>";
                profileSection.style.display = "none";
                return;
            }

            // Profile data
            avatarImg.src = userData.profile.userAvatar || "";
            displayUsername.innerText = userData.username;
            profileSection.style.display = "flex";

            // Problem stats
            const acData = userData.submitStats.acSubmissionNum;
            const totalData = result.data.allQuestionsCount;

            const easySolved = acData.find(d => d.difficulty === "Easy").count;
            const mediumSolved = acData.find(d => d.difficulty === "Medium").count;
            const hardSolved = acData.find(d => d.difficulty === "Hard").count;

            const easyTotal = totalData.find(d => d.difficulty === "Easy").count;
            const mediumTotal = totalData.find(d => d.difficulty === "Medium").count;
            const hardTotal = totalData.find(d => d.difficulty === "Hard").count;

            const easyProgress = Math.round((easySolved / easyTotal) * 100);
            const mediumProgress = Math.round((mediumSolved / mediumTotal) * 100);
            const hardProgress = Math.round((hardSolved / hardTotal) * 100);

            easyLabel.innerText = `${easyProgress}% (${easySolved}/${easyTotal})`;
            mediumLabel.innerText = `${mediumProgress}% (${mediumSolved}/${mediumTotal})`;
            hardLabel.innerText = `${hardProgress}% (${hardSolved}/${hardTotal})`;

            easyProgessCircle.style.setProperty("--progress-degree", `${easyProgress}%`);
            mediumProgessCircle.style.setProperty("--progress-degree", `${mediumProgress}%`);
            hardProgessCircle.style.setProperty("--progress-degree", `${hardProgress}%`);

            // Total solved / total
            const totalSolved = easySolved + mediumSolved + hardSolved;
            const totalQuestions = easyTotal + mediumTotal + hardTotal;
            totalSolvedText.innerText = `Solved: ${totalSolved} / ${totalQuestions}`;

            // Acceptance rate
            const totalSubmissionData = userData.submitStats.totalSubmissionNum;
            const totalAttempts = totalSubmissionData.reduce((sum, d) => sum + d.count, 0);

            const acceptanceRate = totalAttempts > 0
                ? ((totalSolved / totalAttempts) * 100).toFixed(2)
                : "0.00";

            acceptanceRateText.innerText = `Acceptance Rate: ${acceptanceRate}%`;

        } catch (error) {
            statsContainer.innerHTML = "<p>No data found</p>";
            profileSection.style.display = "none";
            console.error("Error fetching user data:", error);
        } finally {
            searchButton.textContent = "Search";
            searchButton.disabled = false;
        }
    }

    searchButton.addEventListener("click", function () {
        const username = usernameInput.value;
        console.log("Login username:", username);

        if (validateUsername(username)) {
            fetchUserDetails(username);
        }
    });
});
