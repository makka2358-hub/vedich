const API_URL = 'https://script.google.com/macros/s/AKfycbyox9bA8M85rlMtEYgKTcrjOyASAVSFdSNRl0rWnHnBCyMc8pz1NB41g8jkWtxU7DLX/exec';
const REFRESH_INTERVAL = 20000; // 20 giây
const laytop = 7;

const leaderboardEl = document.getElementById('leaderboard');
const statusEl = document.getElementById('status');
let previousData = [];
let isInitialLoad = true;

async function fetchData() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        statusEl.textContent = `Cập nhật lần cuối: ${new Date().toLocaleTimeString()}`;
        
        updateLeaderboard(data);

        previousData = data;
    } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        statusEl.textContent = 'Lỗi khi tải dữ liệu. Vui lòng kiểm tra lại.';
    }
}

function updateLeaderboard(newData) {
    if (isInitialLoad) {
        renderLeaderboard(newData);
        isInitialLoad = false;
        return;
    }

    // So sánh dữ liệu chỉ với top 5
    const hasChanges = 
        (newData.length < laytop && previousData.length >= laytop) || 
        (newData.length >= laytop && previousData.length < laytop) ||
        newData.slice(0, laytop).some((newItem, index) => {
            const oldItem = previousData.slice(0, laytop)[index];
            return !oldItem || oldItem.name !== newItem.name || oldItem.score !== newItem.score;
        });

    if (hasChanges) {
        renderLeaderboardWithAnimation(newData);
    } else {
        console.log("Không có sự thay đổi thứ hạng trong top 5.");
    }
}

function renderLeaderboard(data) {
    leaderboardEl.innerHTML = '';
    // Chỉ lặp qua 5 người đầu tiên
    data.slice(0, laytop).forEach((player, index) => {
        const li = document.createElement('li');
        li.className = 'leaderboard-item';
        li.dataset.name = player.name;
        li.innerHTML = `
            <span class="rank">${index + 1}</span>
            <span class="name">${player.name}</span>
            <span class="score">${player.score}</span>
        `;
        leaderboardEl.appendChild(li);
    });
}

function renderLeaderboardWithAnimation(data) {
    const oldItems = new Map(
        Array.from(leaderboardEl.children).map(item => [item.dataset.name, item.getBoundingClientRect().top])
    );

    leaderboardEl.innerHTML = '';

    // Chỉ lặp qua 5 người đầu tiên
    data.slice(0, 5).forEach(player => {
        const li = document.createElement('li');
        li.className = 'leaderboard-item';
        li.dataset.name = player.name;
        li.innerHTML = `
            <span class="rank"></span>
            <span class="name">${player.name}</span>
            <span class="score">${player.score}</span>
        `;
        leaderboardEl.appendChild(li);
    });

    Array.from(leaderboardEl.children).forEach((newItem, index) => {
        const newRect = newItem.getBoundingClientRect();
        const oldTop = oldItems.get(newItem.dataset.name);

        newItem.querySelector('.rank').textContent = index + 1;

        if (oldTop !== undefined) {
            const deltaY = oldTop - newRect.top;
            
            newItem.style.transform = `translateY(${deltaY}px)`;
            
            newItem.offsetHeight; 
            
            newItem.style.transform = `translateY(0)`;
        } else {
            newItem.style.opacity = '0';
            newItem.style.transform = 'translateY(20px)';
            newItem.offsetHeight;
            newItem.style.opacity = '1';
            newItem.style.transform = 'translateY(0)';
        }
    });
}

fetchData();

setInterval(fetchData, REFRESH_INTERVAL);

