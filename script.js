// ======================================
// 1. PENGATURAN DAN PENYIMPANAN DATA
// ======================================

const STORAGE_KEY = "studentTaskManager";

let tasks = [];

try {
    const savedTasks = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
    );

    tasks = Array.isArray(savedTasks) ? savedTasks : [];
} catch (error) {
    tasks = [];
}

let currentChart = null;

// Menyimpan data ke LocalStorage
function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Membuat ID unik
function createId() {
    return Date.now().toString() + Math.random().toString(36).slice(2, 7);
}

// Mencegah teks pengguna dibaca sebagai HTML
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}

// ======================================
// 2. NAVIGASI HALAMAN
// ======================================

const pageNames = {
    dashboard: "Dashboard",
    tasks: "Semua Tugas",
    add: "Tambah Tugas",
    statistics: "Statistik"
};

function showPage(pageName) {
    if (!pageNames[pageName]) return;

    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    document.getElementById(pageName).classList.add("active");

    document.querySelectorAll(".nav-link").forEach(link => {
        link.classList.toggle(
            "active",
            link.dataset.page === pageName
        );
    });

    document.getElementById("breadcrumbTitle").textContent =
        pageNames[pageName];

    document.getElementById("sidebar").classList.remove("open");

    if (pageName === "statistics") {
        renderStatistics();
    }

    if (pageName === "dashboard") {
        renderDashboard();
    }

    if (pageName === "tasks") {
        renderTasks();
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
}

// Navigasi sidebar
document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", () => {
        if (link.dataset.page === "add") {
            resetForm();
        }

        showPage(link.dataset.page);
    });
});

// Tombol navigasi lainnya
document.querySelectorAll("[data-go]").forEach(button => {
    button.addEventListener("click", () => {
        resetForm();
        showPage(button.dataset.go);
    });
});

// Menu mobile
document.getElementById("menuToggle").addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("open");
});

// Tombol batal
document.getElementById("cancelForm").addEventListener("click", () => {
    resetForm();
    showPage("tasks");
});

// ======================================
// 3. TANGGAL HARI INI
// ======================================

function updateDate() {
    const today = new Date();

    document.getElementById("todayDate").textContent =
        today.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
}

// ======================================
// 4. NOTIFIKASI TOAST
// ======================================

function showToast(message) {
    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(showToast.timer);

    showToast.timer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

// ======================================
// 5. FORM TAMBAH DAN EDIT TUGAS
// ======================================

const taskForm = document.getElementById("taskForm");

function resetForm() {
    taskForm.reset();

    document.getElementById("taskId").value = "";
    document.getElementById("formTitle").textContent =
        "Tambah Tugas Baru";

    document.getElementById("priority").value = "Sedang";
    document.getElementById("status").value = "Belum Dikerjakan";
}

taskForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const id = document.getElementById("taskId").value;

    const taskData = {
        name: document.getElementById("taskName").value.trim(),
        subject: document.getElementById("subject").value.trim(),
        description: document.getElementById("description").value.trim(),
        deadline: document.getElementById("deadline").value,
        priority: document.getElementById("priority").value,
        status: document.getElementById("status").value
    };

    if (!taskData.name || !taskData.subject || !taskData.deadline) {
        showToast("Mohon lengkapi data tugas!");
        return;
    }

    if (id) {
        // Mengedit tugas yang sudah ada
        const index = tasks.findIndex(task => task.id === id);

        if (index !== -1) {
            tasks[index] = {
                ...tasks[index],
                ...taskData
            };

            showToast("Tugas berhasil diperbarui!");
        }

    } else {
        // Menambahkan tugas baru
        const newTask = {
            id: createId(),
            ...taskData,
            createdAt: new Date().toISOString()
        };

        tasks.push(newTask);

        showToast("Tugas berhasil ditambahkan!");
    }

    saveTasks();
    resetForm();
    renderAll();

    showPage("tasks");
});

// ======================================
// 6. MENGEDIT TUGAS
// ======================================

function editTask(id) {
    const task = tasks.find(item => item.id === id);

    if (!task) return;

    document.getElementById("taskId").value = task.id;
    document.getElementById("taskName").value = task.name;
    document.getElementById("subject").value = task.subject;
    document.getElementById("description").value = task.description;
    document.getElementById("deadline").value = task.deadline;
    document.getElementById("priority").value = task.priority;
    document.getElementById("status").value = task.status;

    document.getElementById("formTitle").textContent =
        "Edit Tugas";

    showPage("add");
}

// ======================================
// 7. MENGHAPUS TUGAS
// ======================================

function deleteTask(id) {
    const task = tasks.find(item => item.id === id);

    if (!task) return;

    const confirmation = confirm(
        `Apakah kamu yakin ingin menghapus tugas "${task.name}"?`
    );

    if (!confirmation) return;

    tasks = tasks.filter(item => item.id !== id);

    saveTasks();
    renderAll();

    showToast("Tugas berhasil dihapus!");
}

// ======================================
// 8. MENGUBAH STATUS TUGAS
// ======================================

function changeStatus(id, newStatus) {
    const task = tasks.find(item => item.id === id);

    if (!task) return;

    task.status = newStatus;

    saveTasks();
    renderAll();

    showToast("Status tugas berhasil diperbarui!");
}

// ======================================
// 9. FORMAT TANGGAL
// ======================================

function formatDate(dateString) {
    if (!dateString) return "-";

    const [year, month, day] = dateString.split("-");

    const date = new Date(
        Number(year),
        Number(month) - 1,
        Number(day)
    );

    return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

// ======================================
// 10. STATUS DAN PRIORITAS
// ======================================

function getStatusClass(status) {
    if (status === "Selesai") {
        return "status-completed";
    }

    if (status === "Sedang Dikerjakan") {
        return "status-progress";
    }

    return "status-pending";
}

function getPriorityClass(priority) {
    if (priority === "Tinggi") {
        return "priority-high";
    }

    if (priority === "Rendah") {
        return "priority-low";
    }

    return "priority-medium";
}

// ======================================
// 11. TAMPILAN ITEM TUGAS
// ======================================

function taskTemplate(task) {
    return `
        <div class="task-item">

            <input
                type="checkbox"
                class="task-check"
                ${task.status === "Selesai" ? "checked" : ""}
                onchange="changeStatus(
                    '${escapeHTML(task.id)}',
                    this.checked ? 'Selesai' : 'Belum Dikerjakan'
                )"
                aria-label="Tandai tugas selesai"
            >

            <div class="task-info">
                <h4>${escapeHTML(task.name)}</h4>
                <p>
                    <i class="fa-solid fa-book-open"></i>
                    ${escapeHTML(task.subject)}
                    &nbsp; • &nbsp;
                    <i class="fa-regular fa-calendar"></i>
                    ${formatDate(task.deadline)}
                </p>
            </div>

            <div class="task-meta">
                <span class="badge ${getPriorityClass(task.priority)}">
                    ${escapeHTML(task.priority)}
                </span>

                <span class="badge ${getStatusClass(task.status)}">
                    ${escapeHTML(task.status)}
                </span>
            </div>

            <div class="task-actions">
                <button
                    class="icon-button"
                    onclick="editTask('${escapeHTML(task.id)}')"
                    title="Edit tugas"
                    aria-label="Edit tugas"
                >
                    <i class="fa-solid fa-pen"></i>
                </button>

                <button
                    class="icon-button delete"
                    onclick="deleteTask('${escapeHTML(task.id)}')"
                    title="Hapus tugas"
                    aria-label="Hapus tugas"
                >
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>

        </div>
    `;
}

// ======================================
// 12. TAMPILAN JIKA TUGAS KOSONG
// ======================================

function emptyState() {
    return `
        <div class="empty-state">
            <i class="fa-solid fa-clipboard-list"></i>
            <h4>Belum Ada Tugas</h4>
            <p>Tambahkan tugas pertamamu untuk memulai.</p>
        </div>
    `;
}

// ======================================
// 13. DASHBOARD
// ======================================

function renderDashboard() {
    const total = tasks.length;

    const pending = tasks.filter(
        task => task.status === "Belum Dikerjakan"
    ).length;

    const progress = tasks.filter(
        task => task.status === "Sedang Dikerjakan"
    ).length;

    const completed = tasks.filter(
        task => task.status === "Selesai"
    ).length;

    document.getElementById("totalTasks").textContent = total;
    document.getElementById("pendingTasks").textContent = pending;
    document.getElementById("progressTasks").textContent = progress;
    document.getElementById("completedTasks").textContent = completed;

    const percent = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    document.getElementById("completionPercent").textContent =
        percent + "%";

    document.getElementById("progressCircle").style.background =
        `conic-gradient(#25b82f ${percent}%, #EEEFF5 ${percent}%)`;

    document.getElementById("progressDescription").textContent =
        total === 0
            ? "Belum ada tugas yang diselesaikan."
            : `${completed} dari ${total} tugas telah selesai.`;

    const recent = [...tasks]
        .sort((a, b) => a.deadline.localeCompare(b.deadline))
        .slice(0, 5);

    document.getElementById("recentTasks").innerHTML =
        recent.length
            ? recent.map(taskTemplate).join("")
            : emptyState();
}

// ======================================
// 14. SEMUA TUGAS DAN FILTER
// ======================================

function renderTasks() {
    const search = document
        .getElementById("searchInput")
        .value.toLowerCase()
        .trim();

    const status = document.getElementById("filterStatus").value;
    const priority = document.getElementById("filterPriority").value;

    const filtered = tasks.filter(task => {

        const matchesSearch =
            task.name.toLowerCase().includes(search) ||
            task.subject.toLowerCase().includes(search);

        const matchesStatus =
            status === "all" || task.status === status;

        const matchesPriority =
            priority === "all" || task.priority === priority;

        return matchesSearch && matchesStatus && matchesPriority;
    });

    const sorted = filtered.sort(
        (a, b) => a.deadline.localeCompare(b.deadline)
    );

    document.getElementById("allTasks").innerHTML =
        sorted.length
            ? sorted.map(taskTemplate).join("")
            : emptyState();
}

// Event pencarian
document.getElementById("searchInput").addEventListener(
    "input",
    renderTasks
);

// Event filter
document.getElementById("filterStatus").addEventListener(
    "change",
    renderTasks
);

document.getElementById("filterPriority").addEventListener(
    "change",
    renderTasks
);

// ======================================
// 15. STATISTIK
// ======================================

function renderStatistics() {
    const total = tasks.length;

    const completed = tasks.filter(
        task => task.status === "Selesai"
    ).length;

    const unfinished = total - completed;

    document.getElementById("statTotal").textContent = total;
    document.getElementById("statCompleted").textContent = completed;
    document.getElementById("statUnfinished").textContent = unfinished;

    renderChart();
    renderPriorityStats();
}

// ======================================
// 16. GRAFIK STATUS
// ======================================

function renderChart() {
    const canvas = document.getElementById("taskChart");
    const ctx = canvas.getContext("2d");

    const values = [
        tasks.filter(t => t.status === "Belum Dikerjakan").length,
        tasks.filter(t => t.status === "Sedang Dikerjakan").length,
        tasks.filter(t => t.status === "Selesai").length
    ];

    const labels = [
        "Belum Dikerjakan",
        "Sedang Dikerjakan",
        "Selesai"
    ];

    const colors = ["#F2A64B", "#2f4db0", "#27AE79"];

    const width = canvas.clientWidth || 400;
    const height = 270;
    const ratio = window.devicePixelRatio || 1;

    canvas.width = width * ratio;
    canvas.height = height * ratio;

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const maxValue = Math.max(...values, 1);
    const left = 20;
    const bottom = 215;
    const chartHeight = 165;
    const barWidth = Math.min(65, width / 7);
    const gap = (width - left * 2 - barWidth * 3) / 4;

    ctx.font = "11px Inter";
    ctx.textAlign = "center";

    values.forEach((value, index) => {
        const x = left + gap + index * (barWidth + gap);
        const barHeight = (value / maxValue) * chartHeight;
        const y = bottom - barHeight;

        ctx.fillStyle = colors[index];
        ctx.beginPath();

        const radius = 7;
        ctx.roundRect(x, y, barWidth, Math.max(barHeight, 2), radius);
        ctx.fill();

        ctx.fillStyle = "#555";
        ctx.fillText(value, x + barWidth / 2, y - 9);

        ctx.fillStyle = "#888";
        ctx.font = width < 350 ? "8px Inter" : "9px Inter";

        ctx.fillText(
            labels[index],
            x + barWidth / 2,
            bottom + 20
        );

        ctx.font = "11px Inter";
    });
}

// ======================================
// 17. STATISTIK PRIORITAS
// ======================================

function renderPriorityStats() {
    const priorities = [
        { name: "Tinggi", color: "#E65D70" },
        { name: "Sedang", color: "#F39C45" },
        { name: "Rendah", color: "#27AE79" }
    ];

    const container = document.getElementById("priorityStats");

    container.innerHTML = priorities.map(item => {

        const count = tasks.filter(
            task => task.priority === item.name
        ).length;

        const percentage = tasks.length
            ? Math.round((count / tasks.length) * 100)
            : 0;

        return `
            <div class="priority-row">
                <div class="priority-label">
                    <strong>${item.name}</strong>
                    <span>${count} tugas (${percentage}%)</span>
                </div>

                <div class="priority-bar">
                    <div
                        class="priority-fill"
                        style="width:${percentage}%; background:${item.color}"
                    ></div>
                </div>
            </div>
        `;
    }).join("");
}

// ======================================
// 18. UPDATE SEMUA HALAMAN
// ======================================

function renderAll() {
    renderDashboard();
    renderTasks();
    renderStatistics();
}

// ======================================
// 19. INISIALISASI APLIKASI
// ======================================

function initApp() {
    updateDate();
    renderAll();

    // Daftarkan service worker
    if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
            navigator.serviceWorker.register("./service-worker.js")
                .then(() => {
                    console.log("Service Worker berhasil didaftarkan.");
                })
                .catch(error => {
                    console.error("Service Worker gagal:", error);
                });
        });
    }
}

initApp();