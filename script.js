const API_URL = 'https://script.google.com/macros/s/AKfycbyox9bA8M85rlMtEYgKTcrjOyASAVSFdSNRl0rWnHnBCyMc8pz1NB41g8jkWtxU7DLX/exec';
const REFRESH_INTERVAL = 20000; // 20 giây

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

    const hasChanges = newData.length !== previousData.length || 
        newData.some((newItem, index) => {
            const oldItem = previousData[index];
            return !oldItem || oldItem.name !== newItem.name || oldItem.score !== newItem.score;
        });

    if (hasChanges) {
        renderLeaderboardWithAnimation(newData);
    } else {
        console.log("Không có sự thay đổi thứ hạng.");
    }
}

function renderLeaderboard(data) {
    leaderboardEl.innerHTML = '';
    data.forEach((player, index) => {
        const li = document.createElement('li');
        li.className = 'leaderboard-item';
        li.dataset.name = player.name; // Lưu tên để dễ dàng tìm kiếm
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

    leaderboardEl.innerHTML = ''; // Xóa toàn bộ danh sách cũ

    // Tạo các mục mới và thêm vào DOM
    data.forEach(player => {
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

    // Lấy vị trí mới và áp dụng hiệu ứng
    Array.from(leaderboardEl.children).forEach((newItem, index) => {
        const newRect = newItem.getBoundingClientRect();
        const oldTop = oldItems.get(newItem.dataset.name);

        // Cập nhật lại rank
        newItem.querySelector('.rank').textContent = index + 1;

        if (oldTop !== undefined) {
            const deltaY = oldTop - newRect.top;
            
            // Di chuyển phần tử về vị trí cũ
            newItem.style.transform = `translateY(${deltaY}px)`;
            
            // Đảm bảo trình duyệt nhận ra sự thay đổi
            newItem.offsetHeight; 
            
            // Chuyển về vị trí mới
            newItem.style.transform = `translateY(0)`;
        } else {
            // Phần tử mới, cho nó hiệu ứng fade-in và bay lên từ dưới
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