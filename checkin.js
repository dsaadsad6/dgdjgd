const KEY = "checkin_days";
const NAME_KEY = "checkin_username";
const DAYS = 112;

const nameInput = document.getElementById("username");
const grid = document.getElementById("grid");
const streakEl = document.getElementById("streak");

// 資料
function load() {
  return JSON.parse(localStorage.getItem(KEY)) || [];
}
function save(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}
function today() {
  return new Date().toISOString().split("T")[0];
}

// 名字
nameInput.value = localStorage.getItem(NAME_KEY) || "";
nameInput.oninput = () =>
  localStorage.setItem(NAME_KEY, nameInput.value);

// 打卡
document.getElementById("checkinBtn").onclick = () => {
  const data = load();
  const t = today();
  if (!data.includes(t)) {
    data.push(t);
    save(data);
    render();
  } else {
    alert("今天已經打過卡了");
  }
};

// 連續天數
function calcStreak(data) {
  let streak = 0;
  let d = new Date();
  while (data.includes(d.toISOString().split("T")[0])) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

// 顏色深淺
function getLevel(date, data) {
  let count = 0;
  for (let i = 0; i < 4; i++) {
    const d = new Date(date);
    d.setDate(d.getDate() - i);
    if (data.includes(d.toISOString().split("T")[0])) count++;
  }
  return Math.min(count, 4);
}

// 畫格子
function render() {
  const data = load();
  grid.innerHTML = "";

  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const div = document.createElement("div");
    div.className = `day lvl${getLevel(d, data)}`;
    grid.appendChild(div);
  }

  streakEl.textContent = `🔥 連續打卡 ${calcStreak(data)} 天`;
}

// 匯出 CSV
document.getElementById("exportBtn").onclick = () => {
  const name = localStorage.getItem(NAME_KEY) || "未填姓名";
  const data = load();

  let csv = "姓名,日期,是否打卡\n";
  data.forEach(d => csv += `${name},${d},是\n`);

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}_打卡紀錄.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

render();
