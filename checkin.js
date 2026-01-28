const today = new Date();
const dateKey = today.toISOString().split('T')[0];
const todayEl = document.getElementById('today');
const btn = document.getElementById('checkBtn');
const statusEl = document.getElementById('status');
const streakEl = document.getElementById('streak');
const historyEl = document.getElementById('history');
const exportBtn = document.getElementById('exportBtn');
const toggleThemeBtn = document.getElementById('toggleTheme');
const bodyEl = document.body;
const userSelect = document.getElementById('userSelect');

todayEl.textContent = `今天是 ${dateKey}`;

let history = JSON.parse(localStorage.getItem('checkin-history') || '[]');

// 計算選擇使用者連續打卡天數
function calcStreak(user){
  const userHistory = history.filter(h=>h.user===user).sort((a,b)=> new Date(a.date)-new Date(b.date));
  if(userHistory.length===0) return 0;
  let streak=0;
  let todayDate=new Date(dateKey);
  for(let i=userHistory.length-1;i>=0;i--){
    let d = new Date(userHistory[i].date);
    if(i===userHistory.length-1){
      if(Math.abs(todayDate-d)/(1000*60*60*24)<=1){ streak++; todayDate = new Date(d); todayDate.setDate(todayDate.getDate()-1); } else break;
    } else {
      let prev = new Date(userHistory[i].date);
      if(Math.abs(todayDate-prev)/(1000*60*60*24)<=1){ streak++; todayDate = new Date(prev); todayDate.setDate(todayDate.getDate()-1); } else break;
    }
  }
  return streak;
}

// 更新 streak
function updateStreak(){
  const streak = calcStreak(userSelect.value);
  streakEl.textContent = `🔥 ${userSelect.options[userSelect.selectedIndex].text} 連續打卡 ${streak} 天`;
}

// 渲染選擇使用者的歷史紀錄
function renderHistory() {
  historyEl.innerHTML = '';
  const userHistory = history.filter(h => h.user === userSelect.value).slice().reverse();
  userHistory.forEach(item => {
    const li = document.createElement('li');
    li.textContent = `✅ ${item.date} ${item.time}`;
    historyEl.appendChild(li);
  });
}

// 檢查今天是否已打卡
function checkToday(){
  const checkedToday = history.find(h=>h.user===userSelect.value && h.date===dateKey);
  if(checkedToday){
    btn.disabled = true;
    statusEl.textContent = `✅ ${userSelect.options[userSelect.selectedIndex].text} 已於 ${checkedToday.time} 打卡`;
  } else {
    btn.disabled = false;
    statusEl.textContent = '';
  }
}

renderHistory();
updateStreak();
checkToday();

// 打卡事件
btn.addEventListener('click',()=>{
  const time = new Date().toLocaleTimeString();
  const user = userSelect.value;
  history.push({user,date:dateKey,time});
  localStorage.setItem('checkin-history',JSON.stringify(history));
  btn.disabled = true;
  statusEl.textContent = `🎉 ${userSelect.options[userSelect.selectedIndex].text} 打卡成功！時間：${time}`;
  renderHistory();
  updateStreak();
});

// 換使用者時更新畫面
userSelect.addEventListener('change',()=>{
  updateStreak();
  checkToday();
  renderHistory();
});

// 匯出 CSV 只匯出選擇使用者的資料
exportBtn.addEventListener('click', () => {
  const userHistory = history.filter(h => h.user === userSelect.value);
  let csvContent = 'data:text/csv;charset=utf-8,';
  csvContent += '日期,時間\n';
  userHistory.forEach(item => {
    csvContent += `${item.date},${item.time}\n`;
  });
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', '打卡紀錄.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// 切換深色模式
toggleThemeBtn.addEventListener('click',()=>{
  bodyEl.classList.toggle('dark-mode');
});
