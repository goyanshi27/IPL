/* =============================================
   IPL ANALYTICS DASHBOARD — script.js
   Professional Sports Analytics Platform
   ============================================= */

"use strict";

// ──────────────────────────────────────────────
// GLOBAL STATE
// ──────────────────────────────────────────────
let rawData = [];
let filteredData = [];
let charts = {};
let dtPlayer, dtTeam, dtMatch;
let playerCompareChart, teamCompareChartObj;

const TEAM_COLORS = {
  "CSK":  { bg: "#FFC72C", border: "#C8A000", label: "#1A1A1A" },
  "MI":   { bg: "#004BA0", border: "#003070", label: "#FFFFFF" },
  "RCB":  { bg: "#D4001B", border: "#A50015", label: "#FFFFFF" },
  "KKR":  { bg: "#3A225D", border: "#251445", label: "#FFD700" },
  "SRH":  { bg: "#FF6E00", border: "#C84F00", label: "#FFFFFF" },
  "DC":  { bg: "#0066CC", border: "#004499", label: "#FFFFFF" },
  "PBKS": { bg: "#ED1B24", border: "#B5141C", label: "#FFFFFF" },
  "RR":   { bg: "#E91E8C", border: "#C0006E", label: "#FFFFFF" },
  "GT":   { bg: "#1D2951", border: "#111B38", label: "#D4AF37" },
  "LSG":  { bg: "#00B4D8", border: "#0077A8", label: "#FFFFFF" },
};

const TEAMS = Object.keys(TEAM_COLORS);

const PLAYERS = {
  CSK:  ["MS Dhoni","Ruturaj Gaikwad","Ravindra Jadeja","Devon Conway","Shivam Dube","Deepak Chahar","Moeen Ali","Mitchell Santner","Tushar Deshpande","Matheesha Pathirana"],
  MI:   ["Rohit Sharma","Suryakumar Yadav","Ishan Kishan","Hardik Pandya","Jasprit Bumrah","Tilak Varma","Tim David","Piyush Chawla","Shams Mulani","Dewald Brevis"],
  RCB:  ["Virat Kohli","Faf du Plessis","Glenn Maxwell","Mohammed Siraj","Dinesh Karthik","Shahbaz Ahmed","Harshal Patel","Wanindu Hasaranga","Anuj Rawat","Suyash Prabhudessai"],
  KKR:  ["Shreyas Iyer","Andre Russell","Sunil Narine","Rinku Singh","Venkatesh Iyer","Pat Cummins","Varun Chakravarthy","Shardul Thakur","Phil Salt","Nitish Rana"],
  SRH:  ["Heinrich Klaasen","Travis Head","Pat Cummins","Abhishek Sharma","Abdul Samad","Bhuvneshwar Kumar","Rahul Tripathi","Washington Sundar","Marco Jansen","Natarajan T"],
  DC:   ["David Warner","Axar Patel","Prithvi Shaw","Rishabh Pant","Kuldeep Yadav","Anrich Nortje","Mitchell Marsh","Manish Pandey","Rovman Powell","Khaleel Ahmed"],
  PBKS: ["Shikhar Dhawan","Liam Livingstone","Sam Curran","Jonny Bairstow","Rishi Dhawan","Arshdeep Singh","Shahrukh Khan","Kagiso Rabada","Chris Gayle","Bhanuka Rajapaksa"],
  RR:   ["Sanju Samson","Jos Buttler","Yuzvendra Chahal","Shimron Hetmyer","Trent Boult","Dhruv Jurel","Devdutt Padikkal","Riyan Parag","Sandeep Sharma","Ravichandran Ashwin"],
  GT:   ["Shubman Gill","Hardik Pandya","Mohammed Shami","David Miller","Rashid Khan","Vijay Shankar","Matthew Wade","Wriddhiman Saha","Noor Ahmad","Sai Sudharsan"],
  LSG:  ["KL Rahul","Quinton de Kock","Marcus Stoinis","Ravi Bishnoi","Avesh Khan","Nicholas Pooran","Deepak Hooda","Mohsin Khan","Krunal Pandya","Ayush Badoni"],
};

const VENUES = [
  "Wankhede Stadium, Mumbai",
  "M. Chinnaswamy Stadium, Bangalore",
  "Eden Gardens, Kolkata",
  "MA Chidambaram Stadium, Chennai",
  "Narendra Modi Stadium, Ahmedabad",
  "Arun Jaitley Stadium, Delhi",
  "Rajiv Gandhi Intl. Stadium, Hyderabad",
  "Sawai Mansingh Stadium, Jaipur",
  "Punjab Cricket Association Stadium, Mohali",
  "BRSABV Ekana Stadium, Lucknow",
];

const SEASONS = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];
const ROLES    = ["Batsman","Bowler","All-Rounder","Wicket-Keeper"];

// ──────────────────────────────────────────────
// DATASET GENERATION
// ──────────────────────────────────────────────
function generateDataset(n = 2200) {
  const data = [];
  let matchId = 1;

  for (let i = 0; i < n; i++) {
    const season   = SEASONS[i % SEASONS.length];
    const teamIdx  = i % TEAMS.length;
    const oppIdx   = (teamIdx + 1 + (i % (TEAMS.length - 1))) % TEAMS.length;
    const team     = TEAMS[teamIdx];
    const opponent = TEAMS[oppIdx === teamIdx ? (oppIdx + 1) % TEAMS.length : oppIdx];
    const venue    = VENUES[i % VENUES.length];
    const players  = PLAYERS[team];
    const player   = players[i % players.length];
    const role     = ROLES[i % ROLES.length];

    // Batting stats
    const isBatter  = role === "Batsman" || role === "Wicket-Keeper";
    const isAllRound = role === "All-Rounder";
    const isBowler  = role === "Bowler";

    const runs = isBatter  ? rndInt(5, 120) :
                 isAllRound ? rndInt(2, 80)  :
                 rndInt(0, 20);

    const balls = Math.max(runs, rndInt(runs + 1, runs + 40));
    const sr    = balls > 0 ? +((runs / balls) * 100).toFixed(1) : 0;
    const fours = Math.floor(runs * 0.12);
    const sixes = Math.floor(runs * 0.07);

    // Bowling stats
    const wickets  = isBowler   ? rndInt(0, 5) :
                     isAllRound ? rndInt(0, 3) : 0;
    const overs    = isBowler   ? +(rndInt(10, 40) / 10).toFixed(1) :
                     isAllRound ? +(rndInt(5, 25) / 10).toFixed(1) : 0;
    const economy  = overs > 0  ? +(rndFloat(5.5, 12)).toFixed(1) : 0;

    const catches   = rndInt(0, 2);
    const won       = Math.random() > 0.48 ? "Won" : "Lost";
    const potmPool  = PLAYERS[team];
    const potm      = potmPool[rndInt(0, potmPool.length - 1)];

    // Match date
    const month = rndInt(3, 5);
    const day   = rndInt(1, 28);
    const date  = `${season}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;

    data.push({
      "Match ID":          matchId++,
      "Season":            season,
      "Team":              team,
      "Opponent":          opponent,
      "Venue":             venue,
      "Match Date":        date,
      "Player Name":       player,
      "Role":              role,
      "Runs":              runs,
      "Balls Faced":       balls,
      "Strike Rate":       sr,
      "Fours":             fours,
      "Sixes":             sixes,
      "Wickets":           wickets,
      "Overs":             overs,
      "Economy Rate":      economy,
      "Catches":           catches,
      "Match Result":      won,
      "Player of the Match": potm,
    });
  }
  return data;
}

function rndInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function rndFloat(min, max) { return Math.random() * (max - min) + min; }

// ──────────────────────────────────────────────
// INIT
// ──────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", () => {
  simulateLoading(() => {
    rawData = generateDataset(2200);
    filteredData = [...rawData];
    buildFilters();
    renderAll();
    initDataTables();
    showAlert("Sample IPL dataset loaded with 2,200+ records. Upload your own CSV/Excel to replace.", "info");
  });
});

function simulateLoading(cb) {
  const bar = document.getElementById("loadProgress");
  const overlay = document.getElementById("loadingOverlay");
  let pct = 0;
  const iv = setInterval(() => {
    pct += rndInt(5, 15);
    if (pct >= 100) {
      pct = 100;
      bar.style.width = "100%";
      clearInterval(iv);
      setTimeout(() => {
        overlay.classList.add("hidden");
        cb();
      }, 500);
    } else {
      bar.style.width = pct + "%";
    }
  }, 120);
}

// ──────────────────────────────────────────────
// FILTERS
// ──────────────────────────────────────────────
function buildFilters() {
  const seasons = [...new Set(rawData.map(d => d["Season"]))].sort();
  const teams   = [...new Set(rawData.map(d => d["Team"]))].sort();
  const players = [...new Set(rawData.map(d => d["Player Name"]))].sort();
  const venues  = [...new Set(rawData.map(d => d["Venue"]))].sort();

  populateSelect("filterSeason",  seasons);
  populateSelect("filterTeam",    teams);
  populateSelect("filterPlayer",  players);
  populateSelect("filterVenue",   venues);

  // Comparison dropdowns
  players.forEach(p => {
    ["compareP1","compareP2"].forEach(id => {
      const opt = new Option(p, p);
      document.getElementById(id).append(opt);
    });
  });
  teams.forEach(t => {
    ["compareT1","compareT2"].forEach(id => {
      const opt = new Option(t, t);
      document.getElementById(id).append(opt);
    });
  });
}

function populateSelect(id, values) {
  const sel = document.getElementById(id);
  values.forEach(v => {
    const o = document.createElement("option");
    o.value = v; o.textContent = v;
    sel.appendChild(o);
  });
}

function applyFilters() {
  const s  = val("filterSeason");
  const t  = val("filterTeam");
  const p  = val("filterPlayer");
  const v  = val("filterVenue");
  const r  = val("filterResult");

  filteredData = rawData.filter(d =>
    (s === "all" || String(d["Season"]) === s) &&
    (t === "all" || d["Team"] === t) &&
    (p === "all" || d["Player Name"] === p) &&
    (v === "all" || d["Venue"] === v) &&
    (r === "all" || d["Match Result"] === r)
  );

  renderAll();
  refreshTables();
}

function resetFilters() {
  ["filterSeason","filterTeam","filterPlayer","filterVenue","filterResult"].forEach(id => {
    document.getElementById(id).value = "all";
  });
  filteredData = [...rawData];
  renderAll();
  refreshTables();
}

function val(id) { return document.getElementById(id).value; }

// ──────────────────────────────────────────────
// RENDER ALL
// ──────────────────────────────────────────────
function renderAll() {
  renderKPIs();
  renderTeamRunsChart();
  renderWinPieChart();
  renderSeasonTrendChart();
  renderTopBattersChart();
  renderTopBowlersChart();
  renderBoundaryChart();
  renderResultPieChart();
  renderVenueChart();
  renderScatterChart();
  renderEconomyChart();
  renderPlayerAnalytics();
  renderTeamAnalytics();
  renderInsights();
  renderPredictions();
}

// ──────────────────────────────────────────────
// KPI CARDS
// ──────────────────────────────────────────────
function renderKPIs() {
  const d = filteredData;
  const totalMatches  = new Set(d.map(r => r["Match ID"])).size;
  const totalTeams    = new Set(d.map(r => r["Team"])).size;
  const totalPlayers  = new Set(d.map(r => r["Player Name"])).size;
  const totalRuns     = d.reduce((a, r) => a + (+r["Runs"] || 0), 0);
  const totalWickets  = d.reduce((a, r) => a + (+r["Wickets"] || 0), 0);
  const highScore     = Math.max(...d.map(r => (+r["Runs"] || 0)));
  const avgSR         = d.filter(r => +r["Strike Rate"] > 0).reduce((a, r, _, arr) => a + (+r["Strike Rate"] || 0) / arr.length, 0);
  const avgEcon       = d.filter(r => +r["Economy Rate"] > 0).reduce((a, r, _, arr) => a + (+r["Economy Rate"] || 0) / arr.length, 0);

  animateCount("kpiMatchesVal",  totalMatches);
  animateCount("kpiTeamsVal",    totalTeams);
  animateCount("kpiPlayersVal",  totalPlayers);
  animateCount("kpiRunsVal",     totalRuns);
  animateCount("kpiWicketsVal",  totalWickets);
  animateCount("kpiHighScoreVal",highScore);
  setKPI("kpiSRVal",   avgSR.toFixed(1));
  setKPI("kpiEconVal", avgEcon.toFixed(1));
}

function animateCount(id, target) {
  const el = document.getElementById(id);
  const start = 0;
  const dur = 1200;
  const t0 = performance.now();
  const formatted = target > 9999 ? fmtNum(target) : target;
  function step(t) {
    const p = Math.min((t - t0) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    const cur = Math.round(ease * target);
    el.textContent = cur > 9999 ? fmtNum(cur) : cur;
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = target > 9999 ? fmtNum(target) : target;
  }
  requestAnimationFrame(step);
}

function setKPI(id, val) {
  document.getElementById(id).textContent = val;
}

function fmtNum(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n;
}

// ──────────────────────────────────────────────
// CHART HELPERS
// ──────────────────────────────────────────────
function destroyChart(key) {
  if (charts[key]) { charts[key].destroy(); delete charts[key]; }
}

const CHART_DEFAULTS = {
  plugins: {
    legend: {
      labels: { color: "#a0a0c0", font: { size: 11 }, padding: 15 }
    },
    tooltip: {
      backgroundColor: "rgba(10,10,26,0.95)",
      titleColor: "#FFD700",
      bodyColor: "#a0a0c0",
      borderColor: "rgba(255,107,53,0.3)",
      borderWidth: 1,
      padding: 10,
      cornerRadius: 8,
    }
  },
  scales: {
    x: {
      ticks: { color: "#6060a0", font: { size: 10 } },
      grid: { color: "rgba(255,255,255,0.04)" },
      border: { color: "rgba(255,255,255,0.06)" },
    },
    y: {
      ticks: { color: "#6060a0", font: { size: 10 } },
      grid: { color: "rgba(255,255,255,0.04)" },
      border: { color: "rgba(255,255,255,0.06)" },
    }
  }
};

function ipl_gradient(ctx, colors) {
  const g = ctx.createLinearGradient(0, 0, 0, 300);
  g.addColorStop(0, colors[0]);
  g.addColorStop(1, colors[1]);
  return g;
}

// ──────────────────────────────────────────────
// CHART 1 — TEAM-WISE TOTAL RUNS (Bar)
// ──────────────────────────────────────────────
function renderTeamRunsChart() {
  destroyChart("teamRuns");
  const map = {};
  filteredData.forEach(d => {
    map[d["Team"]] = (map[d["Team"]] || 0) + (+d["Runs"] || 0);
  });
  const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);
  const labels = sorted.map(x => x[0]);
  const values = sorted.map(x => x[1]);
  const bgColors = labels.map(t => (TEAM_COLORS[t] || {}).bg || "#FF6B35");

  const ctx = document.getElementById("teamRunsChart").getContext("2d");
  charts["teamRuns"] = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Total Runs",
        data: values,
        backgroundColor: bgColors.map(c => c + "bb"),
        borderColor: bgColors,
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { ...CHART_DEFAULTS.plugins, legend: { display: false } },
      scales: CHART_DEFAULTS.scales,
      animation: { duration: 900, easing: "easeOutQuart" },
    }
  });
}

// ──────────────────────────────────────────────
// CHART 2 — TEAM WIN % (Pie)
// ──────────────────────────────────────────────
function renderWinPieChart() {
  destroyChart("winPie");
  const wins = {}, total = {};
  filteredData.forEach(d => {
    total[d["Team"]] = (total[d["Team"]] || 0) + 1;
    if (d["Match Result"] === "Won")
      wins[d["Team"]] = (wins[d["Team"]] || 0) + 1;
  });
  const teams = Object.keys(total);
  const pcts  = teams.map(t => +((( wins[t] || 0) / total[t]) * 100).toFixed(1));
  const bgColors = teams.map(t => (TEAM_COLORS[t] || {}).bg || "#FF6B35");

  const ctx = document.getElementById("winPieChart").getContext("2d");
  charts["winPie"] = new Chart(ctx, {
    type: "pie",
    data: {
      labels: teams,
      datasets: [{ data: pcts, backgroundColor: bgColors, borderWidth: 2, borderColor: "#0a0a1a" }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { ...CHART_DEFAULTS.plugins, tooltip: {
        ...CHART_DEFAULTS.plugins.tooltip,
        callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw}% wins` }
      }},
      animation: { duration: 900 }
    }
  });
}

// ──────────────────────────────────────────────
// CHART 3 — SEASON TREND (Line)
// ──────────────────────────────────────────────
function renderSeasonTrendChart() {
  destroyChart("seasonTrend");
  const map = {};
  filteredData.forEach(d => {
    map[d["Season"]] = (map[d["Season"]] || 0) + (+d["Runs"] || 0);
  });
  const seasons = Object.keys(map).sort();
  const values  = seasons.map(s => map[s]);

  const ctx = document.getElementById("seasonTrendChart").getContext("2d");
  const grad = ipl_gradient(ctx, ["rgba(255,107,53,0.5)", "rgba(255,107,53,0.02)"]);

  charts["seasonTrend"] = new Chart(ctx, {
    type: "line",
    data: {
      labels: seasons,
      datasets: [{
        label: "Total Runs",
        data: values,
        borderColor: "#FF6B35",
        backgroundColor: grad,
        fill: true,
        tension: 0.45,
        pointBackgroundColor: "#FFD700",
        pointBorderColor: "#FF6B35",
        pointRadius: 5,
        pointHoverRadius: 8,
        borderWidth: 3,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { ...CHART_DEFAULTS.plugins, legend: { display: false } },
      scales: CHART_DEFAULTS.scales,
      animation: { duration: 1000, easing: "easeInOutQuart" },
    }
  });
}

// ──────────────────────────────────────────────
// CHART 4 — TOP 10 BATTERS (Horizontal Bar)
// ──────────────────────────────────────────────
function renderTopBattersChart() {
  destroyChart("topBatters");
  const map = {};
  filteredData.forEach(d => {
    map[d["Player Name"]] = (map[d["Player Name"]] || 0) + (+d["Runs"] || 0);
  });
  const top = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const labels = top.map(x => x[0]);
  const values = top.map(x => x[1]);

  const ctx = document.getElementById("topBattersChart").getContext("2d");
  charts["topBatters"] = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Runs",
        data: values,
        backgroundColor: values.map((_, i) => `hsl(${30 + i * 15}, 80%, 55%)`),
        borderRadius: 6,
        borderSkipped: false,
      }]
    },
    options: {
      indexAxis: "y",
      responsive: true, maintainAspectRatio: false,
      plugins: { ...CHART_DEFAULTS.plugins, legend: { display: false } },
      scales: {
        x: { ...CHART_DEFAULTS.scales.x },
        y: {
          ticks: { color: "#a0a0c0", font: { size: 10 } },
          grid: { display: false },
        }
      },
      animation: { duration: 900 }
    }
  });
}

// ──────────────────────────────────────────────
// CHART 5 — TOP 10 BOWLERS (Horizontal Bar)
// ──────────────────────────────────────────────
function renderTopBowlersChart() {
  destroyChart("topBowlers");
  const map = {};
  filteredData.forEach(d => {
    if (+d["Wickets"] > 0)
      map[d["Player Name"]] = (map[d["Player Name"]] || 0) + (+d["Wickets"] || 0);
  });
  const top = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const labels = top.map(x => x[0]);
  const values = top.map(x => x[1]);

  const ctx = document.getElementById("topBowlersChart").getContext("2d");
  charts["topBowlers"] = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Wickets",
        data: values,
        backgroundColor: values.map((_, i) => `hsl(${200 + i * 12}, 75%, 55%)`),
        borderRadius: 6,
        borderSkipped: false,
      }]
    },
    options: {
      indexAxis: "y",
      responsive: true, maintainAspectRatio: false,
      plugins: { ...CHART_DEFAULTS.plugins, legend: { display: false } },
      scales: {
        x: { ...CHART_DEFAULTS.scales.x },
        y: {
          ticks: { color: "#a0a0c0", font: { size: 10 } },
          grid: { display: false },
        }
      },
      animation: { duration: 900 }
    }
  });
}

// ──────────────────────────────────────────────
// CHART 6 — BOUNDARY ANALYSIS (Doughnut)
// ──────────────────────────────────────────────
function renderBoundaryChart() {
  destroyChart("boundary");
  const totalFours = filteredData.reduce((a, d) => a + (+d["Fours"] || 0), 0);
  const totalSixes = filteredData.reduce((a, d) => a + (+d["Sixes"] || 0), 0);
  const totalDots  = Math.max(0, filteredData.reduce((a, d) => a + ((+d["Balls Faced"] || 0) - (+d["Fours"] || 0) - (+d["Sixes"] || 0)), 0));

  const ctx = document.getElementById("boundaryChart").getContext("2d");
  charts["boundary"] = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Fours", "Sixes", "Other"],
      datasets: [{
        data: [totalFours, totalSixes, totalDots],
        backgroundColor: ["#FFD700bb", "#FF6B35bb", "#4FC3F7bb"],
        borderColor: ["#FFD700", "#FF6B35", "#4FC3F7"],
        borderWidth: 2,
        hoverOffset: 8,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      cutout: "65%",
      plugins: { ...CHART_DEFAULTS.plugins },
      animation: { duration: 900 }
    }
  });
}

// ──────────────────────────────────────────────
// CHART 7 — VENUE PERFORMANCE (Bar)
// ──────────────────────────────────────────────
function renderVenueChart() {
  destroyChart("venue");
  const map = {};
  filteredData.forEach(d => {
    const v = d["Venue"].split(",")[0].trim();
    map[v] = (map[v] || 0) + (+d["Runs"] || 0);
  });
  const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const labels = sorted.map(x => x[0].replace(" Stadium","").replace(" Cricket",""));
  const values = sorted.map(x => x[1]);

  const ctx = document.getElementById("venueChart").getContext("2d");
  charts["venue"] = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Total Runs",
        data: values,
        backgroundColor: "rgba(79,195,247,0.7)",
        borderColor: "#4FC3F7",
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { ...CHART_DEFAULTS.plugins, legend: { display: false } },
      scales: CHART_DEFAULTS.scales,
      animation: { duration: 900 }
    }
  });
}

// ──────────────────────────────────────────────
// CHART 8 — SCATTER (Strike Rate vs Runs)
// ──────────────────────────────────────────────
function renderScatterChart() {
  destroyChart("scatter");
  const pts = filteredData
    .filter(d => +d["Runs"] > 5 && +d["Strike Rate"] > 0)
    .map(d => ({ x: +d["Runs"], y: +d["Strike Rate"], player: d["Player Name"] }))
    .slice(0, 300);

  const ctx = document.getElementById("scatterChart").getContext("2d");
  charts["scatter"] = new Chart(ctx, {
    type: "scatter",
    data: {
      datasets: [{
        label: "Players",
        data: pts,
        backgroundColor: "rgba(255,107,53,0.5)",
        borderColor: "#FF6B35",
        pointRadius: 4,
        pointHoverRadius: 7,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        ...CHART_DEFAULTS.plugins,
        legend: { display: false },
        tooltip: {
          ...CHART_DEFAULTS.plugins.tooltip,
          callbacks: {
            label: ctx => `${ctx.raw.player} — Runs: ${ctx.raw.x}, SR: ${ctx.raw.y}`
          }
        }
      },
      scales: {
        x: { ...CHART_DEFAULTS.scales.x, title: { display: true, text: "Runs", color: "#6060a0" } },
        y: { ...CHART_DEFAULTS.scales.y, title: { display: true, text: "Strike Rate", color: "#6060a0" } }
      },
      animation: { duration: 800 }
    }
  });
}

// ──────────────────────────────────────────────
// CHART 9 — ECONOMY RATE BY TEAM (Bar)
// ──────────────────────────────────────────────
function renderEconomyChart() {
  destroyChart("economy");
  const map = {}, cnt = {};
  filteredData.forEach(d => {
    if (+d["Economy Rate"] > 0) {
      map[d["Team"]] = (map[d["Team"]] || 0) + (+d["Economy Rate"]);
      cnt[d["Team"]] = (cnt[d["Team"]] || 0) + 1;
    }
  });
  const teams = Object.keys(map);
  const avgs  = teams.map(t => +(map[t] / cnt[t]).toFixed(2));
  const sorted = teams.map((t, i) => [t, avgs[i]]).sort((a, b) => a[1] - b[1]);

  const ctx = document.getElementById("economyChart").getContext("2d");
  charts["economy"] = new Chart(ctx, {
    type: "bar",
    data: {
      labels: sorted.map(x => x[0]),
      datasets: [{
        label: "Avg Economy",
        data: sorted.map(x => x[1]),
        backgroundColor: sorted.map(x => (TEAM_COLORS[x[0]] || {}).bg + "bb" || "#CE93D8bb"),
        borderColor: sorted.map(x => (TEAM_COLORS[x[0]] || {}).bg || "#CE93D8"),
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { ...CHART_DEFAULTS.plugins, legend: { display: false } },
      scales: CHART_DEFAULTS.scales,
      animation: { duration: 900 }
    }
  });
}

// ──────────────────────────────────────────────
// CHART 10 — MATCH RESULT PIE
// ──────────────────────────────────────────────
function renderResultPieChart() {
  destroyChart("resultPie");
  const wins  = filteredData.filter(d => d["Match Result"] === "Won").length;
  const losses = filteredData.filter(d => d["Match Result"] === "Lost").length;

  const ctx = document.getElementById("resultPieChart").getContext("2d");
  charts["resultPie"] = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Wins", "Losses"],
      datasets: [{
        data: [wins, losses],
        backgroundColor: ["rgba(102,187,106,0.8)","rgba(239,83,80,0.8)"],
        borderColor: ["#66BB6A","#EF5350"],
        borderWidth: 2,
        hoverOffset: 8,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      cutout: "60%",
      plugins: { ...CHART_DEFAULTS.plugins },
      animation: { duration: 900 }
    }
  });
}

// ──────────────────────────────────────────────
// PLAYER ANALYTICS SECTION
// ──────────────────────────────────────────────
function renderPlayerAnalytics() {
  const d = filteredData;

  // Orange Cap Leader (most runs)
  const runMap = {};
  d.forEach(r => { runMap[r["Player Name"]] = (runMap[r["Player Name"]] || 0) + (+r["Runs"] || 0); });
  const orangeCap = topEntry(runMap);

  // Purple Cap (most wickets)
  const wktMap = {};
  d.forEach(r => { wktMap[r["Player Name"]] = (wktMap[r["Player Name"]] || 0) + (+r["Wickets"] || 0); });
  const purpleCap = topEntry(wktMap);

  // Most Sixes
  const sixMap = {};
  d.forEach(r => { sixMap[r["Player Name"]] = (sixMap[r["Player Name"]] || 0) + (+r["Sixes"] || 0); });
  const mostSixes = topEntry(sixMap);

  // Most Fours
  const fourMap = {};
  d.forEach(r => { fourMap[r["Player Name"]] = (fourMap[r["Player Name"]] || 0) + (+r["Fours"] || 0); });
  const mostFours = topEntry(fourMap);

  // Highest SR (min 50 balls)
  const srMap = {}, ballMap = {};
  d.forEach(r => {
    srMap[r["Player Name"]]   = (srMap[r["Player Name"]]   || 0) + (+r["Strike Rate"] || 0);
    ballMap[r["Player Name"]] = (ballMap[r["Player Name"]] || 0) + 1;
  });
  const srEntries = Object.entries(srMap)
    .filter(([p]) => (ballMap[p] || 0) >= 5)
    .map(([p, v]) => [p, +(v / ballMap[p]).toFixed(1)]);
  const highSR = srEntries.sort((a, b) => b[1] - a[1])[0] || ["—", 0];

  // Best bowling
  const bowlMap = {};
  d.forEach(r => { if (+r["Wickets"] >= 3) bowlMap[r["Player Name"]] = Math.max(bowlMap[r["Player Name"]] || 0, +r["Wickets"]); });
  const bestBowl = topEntry(bowlMap);

  const cards = [
    { icon: "fa-hat-cowboy", label: "Orange Cap", badge: "🏅 Batting King", name: orangeCap[0], value: fmtNum(orangeCap[1]) + " Runs", color: "#FF6B35", sub: "Most Runs" },
    { icon: "fa-bowling-ball", label: "Purple Cap", badge: "🎯 Bowling King", name: purpleCap[0], value: purpleCap[1] + " Wickets", color: "#CE93D8", sub: "Most Wickets" },
    { icon: "fa-baseball-bat-ball", label: "Six Machine", badge: "💥 Six Hitter", name: mostSixes[0], value: mostSixes[1] + " Sixes", color: "#FFD700", sub: "Most Sixes" },
    { icon: "fa-flag", label: "Boundary King", badge: "🏏 Fours Leader", name: mostFours[0], value: mostFours[1] + " Fours", color: "#4FC3F7", sub: "Most Fours" },
    { icon: "fa-bolt", label: "Highest Strike Rate", badge: "⚡ Speedster", name: highSR[0], value: highSR[1] + " SR", color: "#66BB6A", sub: "Avg Strike Rate" },
    { icon: "fa-fire", label: "Best Bowling", badge: "🔥 Wicket Taker", name: bestBowl[0], value: bestBowl[1] + " Wickets", color: "#EF5350", sub: "Best Performance" },
  ];

  const html = cards.map((c, i) => `
    <div class="col-6 col-md-4 col-lg-2">
      <div class="analytics-card h-100">
        <div class="analytics-icon" style="background:${c.color}22;color:${c.color}">
          <i class="fas ${c.icon}"></i>
        </div>
        <div class="analytics-badge" style="background:${c.color}22;color:${c.color}">${c.badge}</div>
        <div class="analytics-name">${c.name}</div>
        <div class="analytics-value">${c.value}</div>
        <div class="analytics-sub">${c.sub}</div>
      </div>
    </div>`).join("");

  document.getElementById("playerCardsRow").innerHTML = html;
}

// ──────────────────────────────────────────────
// TEAM ANALYTICS SECTION
// ──────────────────────────────────────────────
function renderTeamAnalytics() {
  const d = filteredData;
  const teamStats = {};

  d.forEach(r => {
    const t = r["Team"];
    if (!teamStats[t]) teamStats[t] = { wins: 0, matches: 0, runs: 0, wickets: 0 };
    teamStats[t].matches++;
    teamStats[t].runs += (+r["Runs"] || 0);
    teamStats[t].wickets += (+r["Wickets"] || 0);
    if (r["Match Result"] === "Won") teamStats[t].wins++;
  });

  const teams = Object.entries(teamStats);
  const bestTeam    = teams.sort((a, b) => (b[1].wins / b[1].matches) - (a[1].wins / a[1].matches))[0];
  const mostWins    = teams.sort((a, b) => b[1].wins - a[1].wins)[0];
  const highestRuns = teams.sort((a, b) => b[1].runs - a[1].runs)[0];
  const lowestRuns  = teams.sort((a, b) => a[1].runs - b[1].runs)[0];
  const bestWinPct  = teams.sort((a, b) => (b[1].wins / b[1].matches) - (a[1].wins / a[1].matches))[0];

  const cards = [
    { icon: "fa-trophy",      label: "Best Performing Team", badge: "🏆 Champion",      name: bestTeam?.[0]    || "—", value: ((bestTeam?.[1].wins / bestTeam?.[1].matches) * 100).toFixed(0) + "% Win Rate", color: "#FFD700" },
    { icon: "fa-medal",       label: "Most Wins",            badge: "🥇 Winner",         name: mostWins?.[0]    || "—", value: mostWins?.[1].wins + " Wins",                                    color: "#FF6B35" },
    { icon: "fa-arrow-up",    label: "Highest Team Total",   badge: "📈 Top Scorer",     name: highestRuns?.[0] || "—", value: fmtNum(highestRuns?.[1].runs) + " Runs",                         color: "#66BB6A" },
    { icon: "fa-arrow-down",  label: "Lowest Team Total",    badge: "📉 Needs Boost",    name: lowestRuns?.[0]  || "—", value: fmtNum(lowestRuns?.[1].runs) + " Runs",                          color: "#EF5350" },
    { icon: "fa-percent",     label: "Win Percentage Lead",  badge: "📊 Win %",          name: bestWinPct?.[0]  || "—", value: ((bestWinPct?.[1].wins / bestWinPct?.[1].matches) * 100).toFixed(1) + "%", color: "#CE93D8" },
  ];

  const html = cards.map(c => `
    <div class="col-6 col-md-4 col-lg" style="min-width:180px">
      <div class="analytics-card h-100">
        <div class="analytics-icon" style="background:${c.color}22;color:${c.color}">
          <i class="fas ${c.icon}"></i>
        </div>
        <div class="analytics-badge" style="background:${c.color}22;color:${c.color}">${c.badge}</div>
        <div class="analytics-name">${c.name}</div>
        <div class="analytics-value">${c.value}</div>
        <div class="analytics-sub">${c.label}</div>
      </div>
    </div>`).join("");

  document.getElementById("teamCardsRow").innerHTML = html;
}

function topEntry(map) {
  const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);
  return sorted[0] || ["—", 0];
}

// ──────────────────────────────────────────────
// AI INSIGHTS
// ──────────────────────────────────────────────
function renderInsights() {
  const d = filteredData;
  const insights = [];

  // Insight 1: Top batting team
  const runMap = {};
  d.forEach(r => { runMap[r["Team"]] = (runMap[r["Team"]] || 0) + (+r["Runs"] || 0); });
  const topTeam = topEntry(runMap);
  insights.push({ icon: "fa-chart-line", title: "Top Batting Team", text: `<b>${topTeam[0]}</b> scored the highest aggregate runs across all selected matches — a total of <b>${fmtNum(topTeam[1])}</b> runs, indicating strong batting depth.` });

  // Insight 2: Most consistent player
  const cntMap = {};
  d.forEach(r => { cntMap[r["Player Name"]] = (cntMap[r["Player Name"]] || 0) + (+r["Runs"] > 20 ? 1 : 0); });
  const consistent = topEntry(cntMap);
  insights.push({ icon: "fa-user-check", title: "Most Consistent Player", text: `<b>${consistent[0]}</b> has the highest consistency score — scoring 20+ runs in <b>${consistent[1]}</b> innings, showing remarkable reliability under pressure.` });

  // Insight 3: Best venue for batting
  const vMap = {};
  d.forEach(r => { const v = r["Venue"].split(",")[0]; vMap[v] = (vMap[v] || 0) + (+r["Runs"] || 0); });
  const topVenue = topEntry(vMap);
  insights.push({ icon: "fa-location-dot", title: "Batting-Friendly Venue", text: `<b>${topVenue[0]}</b> has yielded the highest total runs — <b>${fmtNum(topVenue[1])}</b> — suggesting a batting-friendly pitch and conditions.` });

  // Insight 4: Wickets by role
  const rolWkt = {};
  d.forEach(r => { rolWkt[r["Role"]] = (rolWkt[r["Role"]] || 0) + (+r["Wickets"] || 0); });
  const topRole = topEntry(rolWkt);
  const totalW  = Object.values(rolWkt).reduce((a, b) => a + b, 0);
  const rolesPct = totalW > 0 ? ((rolWkt[topRole[0]] / totalW) * 100).toFixed(0) : 0;
  insights.push({ icon: "fa-bowling-ball", title: "Wicket Dominance by Role", text: `<b>${topRole[0]}s</b> account for <b>${rolesPct}%</b> of total wickets taken — highlighting the strategic importance of this role in IPL teams.` });

  // Insight 5: Sixes trend
  const sixTotal = d.reduce((a, r) => a + (+r["Sixes"] || 0), 0);
  const foursTotal = d.reduce((a, r) => a + (+r["Fours"] || 0), 0);
  const sixPct = +(sixTotal / (sixTotal + foursTotal) * 100).toFixed(0);
  insights.push({ icon: "fa-baseball-bat-ball", title: "Boundary Ratio Insight", text: `Out of all boundaries, <b>${sixPct}%</b> are sixes, showing that modern IPL batters prefer big hits over conventional fours — a sign of aggressive game evolution.` });

  // Insight 6: Win rate trend
  const winCount  = d.filter(r => r["Match Result"] === "Won").length;
  const winRate   = ((winCount / d.length) * 100).toFixed(1);
  insights.push({ icon: "fa-trophy", title: "Overall Win Rate", text: `The current filtered dataset shows an overall win rate of <b>${winRate}%</b>. Teams should analyze patterns in losses to improve their strategy.` });

  // Insight 7: High SR players
  const srMap = {}, ballMap = {};
  d.forEach(r => {
    srMap[r["Player Name"]]   = (srMap[r["Player Name"]]   || 0) + (+r["Strike Rate"] || 0);
    ballMap[r["Player Name"]] = (ballMap[r["Player Name"]] || 0) + 1;
  });
  const topSR = Object.entries(srMap)
    .filter(([p]) => ballMap[p] >= 5)
    .map(([p, v]) => [p, +(v / ballMap[p]).toFixed(1)])
    .sort((a, b) => b[1] - a[1])[0] || ["—", 0];
  insights.push({ icon: "fa-bolt", title: "Strike Rate Champion", text: `<b>${topSR[0]}</b> leads with an average strike rate of <b>${topSR[1]}</b> — making them the most explosive batter in the filtered dataset.` });

  // Insight 8: Economy king
  const econMap = {}, econCnt = {};
  d.forEach(r => {
    if (+r["Economy Rate"] > 0 && +r["Wickets"] > 0) {
      econMap[r["Player Name"]] = (econMap[r["Player Name"]] || 0) + (+r["Economy Rate"]);
      econCnt[r["Player Name"]] = (econCnt[r["Player Name"]] || 0) + 1;
    }
  });
  const econBest = Object.entries(econMap)
    .filter(([p]) => econCnt[p] >= 3)
    .map(([p, v]) => [p, +(v / econCnt[p]).toFixed(2)])
    .sort((a, b) => a[1] - b[1])[0] || ["—", 0];
  insights.push({ icon: "fa-gauge", title: "Most Economical Bowler", text: `<b>${econBest[0]}</b> is the most economical bowler with an average economy of <b>${econBest[1]}</b> — a key asset in death-overs and powerplay strategies.` });

  const html = insights.map((ins, i) => `
    <div class="col-12 col-md-6 col-lg-3">
      <div class="insight-card h-100" style="animation-delay:${i * 0.1}s">
        <div class="d-flex align-items-start gap-3">
          <div class="insight-icon"><i class="fas ${ins.icon}"></i></div>
          <div>
            <div class="insight-title">${ins.title}</div>
            <div class="insight-text">${ins.text}</div>
          </div>
        </div>
      </div>
    </div>`).join("");

  document.getElementById("insightsGrid").innerHTML = html;
}

// ──────────────────────────────────────────────
// PREDICTIONS
// ──────────────────────────────────────────────
function renderPredictions() {
  const d = filteredData;

  // Predicted top team
  const winMap = {}, matchMap = {};
  d.forEach(r => {
    matchMap[r["Team"]] = (matchMap[r["Team"]] || 0) + 1;
    if (r["Match Result"] === "Won") winMap[r["Team"]] = (winMap[r["Team"]] || 0) + 1;
  });
  const topTeam = Object.entries(winMap).sort((a, b) => b[1] - a[1])[0] || ["—", 0];
  const topTeamPct = matchMap[topTeam[0]] ? ((topTeam[1] / matchMap[topTeam[0]]) * 100).toFixed(0) : 0;

  // Orange cap prediction
  const runMap = {};
  d.forEach(r => { runMap[r["Player Name"]] = (runMap[r["Player Name"]] || 0) + (+r["Runs"] || 0); });
  const orangePred = topEntry(runMap);

  // Purple cap prediction
  const wktMap = {};
  d.forEach(r => { wktMap[r["Player Name"]] = (wktMap[r["Player Name"]] || 0) + (+r["Wickets"] || 0); });
  const purplePred = topEntry(wktMap);

  // Win probability for top 4 teams
  const winProbs = Object.entries(winMap)
    .map(([t, w]) => [t, ((w / matchMap[t]) * 100).toFixed(1)])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const predCards = [
    { icon: "fa-shield-halved", label: "Predicted Top Team",      value: topTeam[0],      conf: `${topTeamPct}% win rate`, pct: topTeamPct },
    { icon: "fa-hat-cowboy",    label: "Predicted Orange Cap",    value: orangePred[0],   conf: `${fmtNum(orangePred[1])} runs`, pct: Math.min(95, 60 + Math.random() * 30 | 0) },
    { icon: "fa-bowling-ball",  label: "Predicted Purple Cap",    value: purplePred[0],   conf: `${purplePred[1]} wickets`, pct: Math.min(95, 60 + Math.random() * 30 | 0) },
    { icon: "fa-chart-simple",  label: "Win Probability Analysis",value: winProbs.map(w => `${w[0]}: ${w[1]}%`).join(" | "), conf: "Based on current form", pct: 80 },
  ];

  const html = predCards.map(c => `
    <div class="col-12 col-md-6 col-lg-3">
      <div class="prediction-card h-100">
        <div class="prediction-icon"><i class="fas ${c.icon}"></i></div>
        <div class="prediction-label">${c.label}</div>
        <div class="prediction-value">${c.value}</div>
        <div class="prediction-confidence"><i class="fas fa-check-circle me-1"></i>${c.conf}</div>
        <div class="confidence-bar">
          <div class="confidence-fill" style="width:0%" data-width="${c.pct}%"></div>
        </div>
      </div>
    </div>`).join("");

  document.getElementById("predictionCards").innerHTML = html;

  // Animate confidence bars
  setTimeout(() => {
    document.querySelectorAll(".confidence-fill").forEach(el => {
      el.style.width = el.dataset.width;
    });
  }, 200);
}

// ──────────────────────────────────────────────
// DATA TABLES
// ──────────────────────────────────────────────
function initDataTables() {
  buildTableData();

  dtPlayer = new DataTable("#playerTable", {
    pageLength: 10,
    lengthMenu: [10, 25, 50, 100],
    order: [[3, "desc"]],
    scrollX: true,
    dom: "<'row'<'col-sm-6'l><'col-sm-6'f>>rtip",
    language: { search: '<i class="fas fa-search"></i> ', searchPlaceholder: "Search players..." }
  });

  dtTeam = new DataTable("#teamTable", {
    pageLength: 10,
    order: [[4, "desc"]],
    scrollX: true,
    dom: "<'row'<'col-sm-6'l><'col-sm-6'f>>rtip",
    language: { search: '<i class="fas fa-search"></i> ', searchPlaceholder: "Search teams..." }
  });

  dtMatch = new DataTable("#matchTable", {
    pageLength: 10,
    order: [[0, "asc"]],
    scrollX: true,
    dom: "<'row'<'col-sm-6'l><'col-sm-6'f>>rtip",
    language: { search: '<i class="fas fa-search"></i> ', searchPlaceholder: "Search matches..." }
  });
}

function buildTableData() {
  buildPlayerTable();
  buildTeamTable();
  buildMatchTable();
}

function buildPlayerTable() {
  const aggMap = {};
  filteredData.forEach(d => {
    const k = `${d["Player Name"]}|||${d["Team"]}|||${d["Season"]}`;
    if (!aggMap[k]) aggMap[k] = { player: d["Player Name"], team: d["Team"], role: d["Role"], runs: 0, balls: 0, fours: 0, sixes: 0, wickets: 0, economy: [], season: d["Season"] };
    aggMap[k].runs    += +d["Runs"]     || 0;
    aggMap[k].balls   += +d["Balls Faced"] || 0;
    aggMap[k].fours   += +d["Fours"]    || 0;
    aggMap[k].sixes   += +d["Sixes"]    || 0;
    aggMap[k].wickets += +d["Wickets"]  || 0;
    if (+d["Economy Rate"] > 0) aggMap[k].economy.push(+d["Economy Rate"]);
  });

  const rows = Object.values(aggMap).map(a => {
    const sr   = a.balls > 0 ? +((a.runs / a.balls) * 100).toFixed(1) : 0;
    const econ = a.economy.length > 0 ? +(a.economy.reduce((x, y) => x + y) / a.economy.length).toFixed(2) : 0;
    return [a.player, a.team, a.role, a.runs, a.balls, sr, a.fours, a.sixes, a.wickets, econ, a.season];
  }).sort((a, b) => b[3] - a[3]).slice(0, 500);

  const tbody = document.getElementById("playerTableBody");
  tbody.innerHTML = rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("");
}

function buildTeamTable() {
  const ts = {};
  filteredData.forEach(d => {
    const t = d["Team"];
    if (!ts[t]) ts[t] = { matches: 0, wins: 0, losses: 0, runs: 0, wickets: 0 };
    ts[t].matches++;
    ts[t].runs    += +d["Runs"]    || 0;
    ts[t].wickets += +d["Wickets"]|| 0;
    if (d["Match Result"] === "Won")  ts[t].wins++;
    if (d["Match Result"] === "Lost") ts[t].losses++;
  });

  const rows = Object.entries(ts).map(([team, s]) => [
    team, s.matches, s.wins, s.losses,
    s.matches > 0 ? ((s.wins / s.matches) * 100).toFixed(1) + "%" : "0%",
    s.runs, s.matches > 0 ? (s.runs / s.matches).toFixed(0) : 0, s.wickets
  ]).sort((a, b) => parseFloat(b[4]) - parseFloat(a[4]));

  const tbody = document.getElementById("teamTableBody");
  tbody.innerHTML = rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("");
}

function buildMatchTable() {
  const seen = new Set();
  const rows = filteredData.filter(d => {
    const k = `${d["Match ID"]}|||${d["Team"]}`;
    if (seen.has(k)) return false;
    seen.add(k); return true;
  }).slice(0, 500).map(d => [
    d["Match ID"], d["Season"], d["Team"], d["Opponent"],
    d["Venue"].split(",")[0], d["Match Date"], d["Match Result"], d["Player of the Match"]
  ]);

  const tbody = document.getElementById("matchTableBody");
  tbody.innerHTML = rows.map(r => `<tr>${r.map((c, i) => {
    if (i === 6) return `<td><span class="badge" style="background:${c === 'Won' ? '#66BB6A33' : '#EF535033'};color:${c === 'Won' ? '#66BB6A' : '#EF5350'};border-radius:6px;padding:3px 8px">${c}</span></td>`;
    return `<td>${c}</td>`;
  }).join("")}</tr>`).join("");
}

function refreshTables() {
  if (dtPlayer) { dtPlayer.destroy(); buildPlayerTable(); dtPlayer = new DataTable("#playerTable", { pageLength: 10, order: [[3, "desc"]], scrollX: true, dom: "<'row'<'col-sm-6'l><'col-sm-6'f>>rtip" }); }
  if (dtTeam)   { dtTeam.destroy();   buildTeamTable();   dtTeam   = new DataTable("#teamTable",   { pageLength: 10, order: [[4, "desc"]], scrollX: true, dom: "<'row'<'col-sm-6'l><'col-sm-6'f>>rtip" }); }
  if (dtMatch)  { dtMatch.destroy();  buildMatchTable();  dtMatch  = new DataTable("#matchTable",  { pageLength: 10, order: [[0, "asc"]],  scrollX: true, dom: "<'row'<'col-sm-6'l><'col-sm-6'f>>rtip" }); }
}

// ──────────────────────────────────────────────
// FILE UPLOAD
// ──────────────────────────────────────────────
function handleFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const ext = file.name.split(".").pop().toLowerCase();

  if (ext === "csv") {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: result => {
        if (!validateData(result.data)) return;
        rawData = result.data.map(normalizeRow);
        filteredData = [...rawData];
        rebuildAll();
        showAlert(`✅ CSV loaded: <b>${rawData.length}</b> records from <b>${file.name}</b>`, "success");
      },
      error: () => showAlert("❌ CSV parse error. Please check your file format.", "danger")
    });
  } else if (ext === "xlsx" || ext === "xls") {
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const wb   = XLSX.read(ev.target.result, { type: "binary" });
        const ws   = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws);
        if (!validateData(json)) return;
        rawData = json.map(normalizeRow);
        filteredData = [...rawData];
        rebuildAll();
        showAlert(`✅ Excel loaded: <b>${rawData.length}</b> records from <b>${file.name}</b>`, "success");
      } catch (err) {
        showAlert("❌ Excel parse error. Ensure the file is valid .xlsx or .xls format.", "danger");
      }
    };
    reader.readAsBinaryString(file);
  } else {
    showAlert("❌ Unsupported format. Please upload a CSV or Excel (.xlsx) file.", "warning");
  }

  // Reset input
  e.target.value = "";
}

function validateData(data) {
  if (!data || data.length === 0) {
    showAlert("❌ The uploaded file appears to be empty.", "danger");
    return false;
  }
  const required = ["Runs", "Player Name", "Team"];
  const keys = Object.keys(data[0] || {});
  const missing = required.filter(r => !keys.some(k => k.trim().toLowerCase() === r.toLowerCase()));
  if (missing.length > 0) {
    showAlert(`⚠️ Missing columns: <b>${missing.join(", ")}</b>. Attempting to use available data.`, "warning");
  }
  return true;
}

function normalizeRow(row) {
  const norm = {};
  const fieldMap = {
    "match id": "Match ID", "matchid": "Match ID",
    "season": "Season",
    "team": "Team",
    "opponent": "Opponent",
    "venue": "Venue",
    "match date": "Match Date", "matchdate": "Match Date", "date": "Match Date",
    "player name": "Player Name", "playername": "Player Name", "player": "Player Name",
    "role": "Role",
    "runs": "Runs",
    "balls faced": "Balls Faced", "ballsfaced": "Balls Faced", "balls": "Balls Faced",
    "strike rate": "Strike Rate", "strikerate": "Strike Rate", "sr": "Strike Rate",
    "fours": "Fours", "4s": "Fours",
    "sixes": "Sixes", "6s": "Sixes",
    "wickets": "Wickets",
    "overs": "Overs",
    "economy rate": "Economy Rate", "economy": "Economy Rate", "econ": "Economy Rate",
    "catches": "Catches",
    "match result": "Match Result", "result": "Match Result",
    "player of the match": "Player of the Match", "potm": "Player of the Match",
  };
  Object.entries(row).forEach(([k, v]) => {
    const mapped = fieldMap[k.trim().toLowerCase()] || k;
    norm[mapped] = v;
  });
  return norm;
}

function rebuildAll() {
  buildFilters_fresh();
  applyFilters();
  refreshTables();
}

function buildFilters_fresh() {
  ["filterSeason","filterTeam","filterPlayer","filterVenue"].forEach(id => {
    const sel = document.getElementById(id);
    while (sel.options.length > 1) sel.remove(1);
  });
  buildFilters();
}

// ──────────────────────────────────────────────
// EXPORT FUNCTIONS
// ──────────────────────────────────────────────
function exportTableCSV(tableId, filename) {
  const table = document.getElementById(tableId);
  const rows  = [...table.querySelectorAll("tr")];
  const csv   = rows.map(r =>
    [...r.querySelectorAll("th,td")]
      .map(cell => `"${cell.textContent.trim().replace(/"/g, '""')}"`)
      .join(",")
  ).join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement("a"), { href: url, download: `${filename}.csv` });
  a.click();
  URL.revokeObjectURL(url);
  showAlert(`📥 ${filename}.csv downloaded!`, "success", 2000);
}

function exportTableExcel(tableId, filename) {
  const ws  = XLSX.utils.table_to_sheet(document.getElementById(tableId));
  const wb  = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");
  XLSX.writeFile(wb, `${filename}.xlsx`);
  showAlert(`📥 ${filename}.xlsx downloaded!`, "success", 2000);
}

// ──────────────────────────────────────────────
// CHART DOWNLOAD
// ──────────────────────────────────────────────
function downloadChart(canvasId) {
  const canvas = document.getElementById(canvasId);
  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = `IPL_${canvasId}_${Date.now()}.png`;
  a.click();
  showAlert("📊 Chart downloaded as PNG!", "success", 2000);
}

// ──────────────────────────────────────────────
// PDF DOWNLOAD
// ──────────────────────────────────────────────
async function downloadPDF() {
  showAlert("⏳ Generating PDF report...", "info", 3000);
  try {
    const { jsPDF } = window.jspdf;
    const canvas = await html2canvas(document.body, {
      scale: 0.6,
      useCORS: true,
      backgroundColor: "#0a0a1a",
      logging: false,
    });
    const imgData = canvas.toDataURL("image/jpeg", 0.8);
    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const w = pdf.internal.pageSize.getWidth();
    const h = (canvas.height * w) / canvas.width;
    let y = 0;
    const pageH = pdf.internal.pageSize.getHeight();
    while (y < h) {
      pdf.addImage(imgData, "JPEG", 0, -y, w, h);
      y += pageH;
      if (y < h) pdf.addPage();
    }
    pdf.save(`IPL_Analytics_Dashboard_${Date.now()}.pdf`);
    showAlert("✅ PDF downloaded successfully!", "success", 3000);
  } catch (err) {
    showAlert("⚠️ PDF generation failed. Try downloading individual charts.", "warning", 3000);
  }
}

// ──────────────────────────────────────────────
// THEME TOGGLE
// ──────────────────────────────────────────────
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.dataset.theme === "dark";
  html.dataset.theme = isDark ? "light" : "dark";
  document.getElementById("themeIcon").className = isDark ? "fas fa-sun" : "fas fa-moon";

  // Re-render charts with updated colors
  setTimeout(renderAll, 100);
}

// ──────────────────────────────────────────────
// FULLSCREEN
// ──────────────────────────────────────────────
function toggleFullscreen() {
  const icon = document.getElementById("fsIcon");
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
    icon.className = "fas fa-compress";
  } else {
    document.exitFullscreen();
    icon.className = "fas fa-expand";
  }
}

// ──────────────────────────────────────────────
// COMPARE TOOL
// ──────────────────────────────────────────────
function renderCompare() {
  const p1 = document.getElementById("compareP1").value;
  const p2 = document.getElementById("compareP2").value;
  if (!p1 || !p2) return;

  const getStats = player => {
    const rows = rawData.filter(d => d["Player Name"] === player);
    const runs    = rows.reduce((a, r) => a + (+r["Runs"]    || 0), 0);
    const balls   = rows.reduce((a, r) => a + (+r["Balls Faced"] || 0), 0);
    const wickets = rows.reduce((a, r) => a + (+r["Wickets"] || 0), 0);
    const sixes   = rows.reduce((a, r) => a + (+r["Sixes"]   || 0), 0);
    const fours   = rows.reduce((a, r) => a + (+r["Fours"]   || 0), 0);
    const sr      = balls > 0 ? +((runs / balls) * 100).toFixed(1) : 0;
    const econArr = rows.filter(r => +r["Economy Rate"] > 0).map(r => +r["Economy Rate"]);
    const econ    = econArr.length > 0 ? +(econArr.reduce((a, b) => a + b) / econArr.length).toFixed(2) : 0;
    return { runs, balls, wickets, sixes, fours, sr, econ };
  };

  const s1 = getStats(p1);
  const s2 = getStats(p2);

  const stats = [
    { label: "Runs",        v1: s1.runs,    v2: s2.runs    },
    { label: "Balls",       v1: s1.balls,   v2: s2.balls   },
    { label: "Wickets",     v1: s1.wickets, v2: s2.wickets },
    { label: "Sixes",       v1: s1.sixes,   v2: s2.sixes   },
    { label: "Fours",       v1: s1.fours,   v2: s2.fours   },
    { label: "Strike Rate", v1: s1.sr,      v2: s2.sr      },
    { label: "Economy",     v1: s1.econ,    v2: s2.econ    },
  ];

  document.getElementById("playerCompareResult").innerHTML = `
    <div class="compare-header text-center mb-3">
      <span style="color:#4FC3F7;font-weight:700">${p1}</span>
      <span class="vs-badge mx-3">VS</span>
      <span style="color:#FF6B35;font-weight:700">${p2}</span>
    </div>
    ${stats.map(s => {
      const w1 = s.v1 > s.v2 ? "compare-winner" : "";
      const w2 = s.v2 > s.v1 ? "compare-winner" : "";
      return `<div class="compare-stat-row">
        <span class="compare-val-left ${w1}">${s.v1}${w1 ? " 🏆" : ""}</span>
        <span class="compare-stat-label">${s.label}</span>
        <span class="compare-val-right ${w2}">${s.v2}${w2 ? " 🏆" : ""}</span>
      </div>`;
    }).join("")}
  `;

  if (playerCompareChart) playerCompareChart.destroy();
  const ctx = document.getElementById("playerCompareChart").getContext("2d");
  playerCompareChart = new Chart(ctx, {
    type: "radar",
    data: {
      labels: ["Runs", "Wickets", "Sixes", "Fours", "Strike Rate"],
      datasets: [
        { label: p1, data: [norm(s1.runs,2000), norm(s1.wickets,50), norm(s1.sixes,200), norm(s1.fours,300), norm(s1.sr,250)], borderColor: "#4FC3F7", backgroundColor: "rgba(79,195,247,0.15)", pointBackgroundColor: "#4FC3F7" },
        { label: p2, data: [norm(s2.runs,2000), norm(s2.wickets,50), norm(s2.sixes,200), norm(s2.fours,300), norm(s2.sr,250)], borderColor: "#FF6B35", backgroundColor: "rgba(255,107,53,0.15)", pointBackgroundColor: "#FF6B35" },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      scales: { r: { ticks: { color: "#6060a0", backdropColor: "transparent" }, grid: { color: "rgba(255,255,255,0.08)" }, angleLines: { color: "rgba(255,255,255,0.06)" }, pointLabels: { color: "#a0a0c0" } } },
      plugins: { ...CHART_DEFAULTS.plugins },
    }
  });
}

function renderTeamCompare() {
  const t1 = document.getElementById("compareT1").value;
  const t2 = document.getElementById("compareT2").value;
  if (!t1 || !t2) return;

  const getTeamStats = team => {
    const rows = rawData.filter(d => d["Team"] === team);
    const wins    = rows.filter(r => r["Match Result"] === "Won").length;
    const matches = rows.length;
    const runs    = rows.reduce((a, r) => a + (+r["Runs"]    || 0), 0);
    const wickets = rows.reduce((a, r) => a + (+r["Wickets"] || 0), 0);
    const sixes   = rows.reduce((a, r) => a + (+r["Sixes"]   || 0), 0);
    const winPct  = matches > 0 ? +((wins / matches) * 100).toFixed(1) : 0;
    return { wins, matches, runs, wickets, sixes, winPct };
  };

  const s1 = getTeamStats(t1);
  const s2 = getTeamStats(t2);

  const stats = [
    { label: "Wins",     v1: s1.wins,   v2: s2.wins   },
    { label: "Matches",  v1: s1.matches,v2: s2.matches },
    { label: "Runs",     v1: s1.runs,   v2: s2.runs    },
    { label: "Wickets",  v1: s1.wickets,v2: s2.wickets },
    { label: "Sixes",    v1: s1.sixes,  v2: s2.sixes   },
    { label: "Win %",    v1: s1.winPct, v2: s2.winPct  },
  ];

  document.getElementById("teamCompareResult").innerHTML = `
    <div class="compare-header text-center mb-3">
      <span style="color:#4FC3F7;font-weight:700">${t1}</span>
      <span class="vs-badge mx-3">VS</span>
      <span style="color:#FF6B35;font-weight:700">${t2}</span>
    </div>
    ${stats.map(s => {
      const w1 = s.v1 > s.v2 ? "compare-winner" : "";
      const w2 = s.v2 > s.v1 ? "compare-winner" : "";
      return `<div class="compare-stat-row">
        <span class="compare-val-left ${w1}">${s.v1}${w1 ? " 🏆" : ""}</span>
        <span class="compare-stat-label">${s.label}</span>
        <span class="compare-val-right ${w2}">${s.v2}${w2 ? " 🏆" : ""}</span>
      </div>`;
    }).join("")}
  `;

  if (teamCompareChartObj) teamCompareChartObj.destroy();
  const ctx = document.getElementById("teamCompareChart").getContext("2d");
  teamCompareChartObj = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Wins","Runs (÷100)","Wickets","Sixes","Win %"],
      datasets: [
        { label: t1, data: [s1.wins, s1.runs/100, s1.wickets, s1.sixes, s1.winPct], backgroundColor: "rgba(79,195,247,0.7)", borderColor: "#4FC3F7", borderWidth: 2, borderRadius: 6 },
        { label: t2, data: [s2.wins, s2.runs/100, s2.wickets, s2.sixes, s2.winPct], backgroundColor: "rgba(255,107,53,0.7)",  borderColor: "#FF6B35", borderWidth: 2, borderRadius: 6 },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { ...CHART_DEFAULTS.plugins },
      scales: { ...CHART_DEFAULTS.scales },
    }
  });
}

function norm(val, max) { return +((val / max) * 100).toFixed(1); }

// ──────────────────────────────────────────────
// ALERT SYSTEM
// ──────────────────────────────────────────────
function showAlert(msg, type = "info", duration = 4000) {
  const zone  = document.getElementById("alertZone");
  const id    = "alert_" + Date.now();
  const icons = { success: "circle-check", info: "circle-info", warning: "triangle-exclamation", danger: "circle-xmark" };
  const html  = `
    <div id="${id}" class="alert alert-${type} alert-dismissible d-flex align-items-center gap-2 shadow-sm" role="alert">
      <i class="fas fa-${icons[type] || "circle-info"}"></i>
      <span>${msg}</span>
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>`;
  zone.insertAdjacentHTML("afterbegin", html);
  if (duration > 0) {
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.remove();
    }, duration);
  }
}

// ──────────────────────────────────────────────
// SMOOTH SCROLL NAV
// ──────────────────────────────────────────────
document.querySelectorAll(".nav-link[href^='#']").forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute("href"));
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
      link.classList.add("active");
    }
  });
});

// ──────────────────────────────────────────────
// KEYBOARD SHORTCUTS
// ──────────────────────────────────────────────
document.addEventListener("keydown", e => {
  if (e.ctrlKey && e.key === "d") { e.preventDefault(); toggleTheme(); }
  if (e.ctrlKey && e.key === "p") { e.preventDefault(); downloadPDF(); }
  if (e.ctrlKey && e.key === "f") { e.preventDefault(); toggleFullscreen(); }
});

// ──────────────────────────────────────────────
// INTERSECTION OBSERVER (card animations)
// ──────────────────────────────────────────────
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
    }
  });
}, { threshold: 0.1 });

function observeCards() {
  document.querySelectorAll(".kpi-card, .chart-card, .analytics-card, .prediction-card").forEach(card => {
    card.style.opacity = "0";
    card.style.transform = "translateY(20px)";
    card.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    observer.observe(card);
  });
}

// Call after initial render
setTimeout(observeCards, 1500);
