// Data Senarai Kelab
const availableClubs = [
    { name: "Real Madrid", power: 88 },
    { name: "Barcelona", power: 86 },
    { name: "Arsenal", power: 84 },
    { name: "Bayern München", power: 87 },
    { name: "Manchester City", power: 89 },
    { name: "Inter Milan", power: 83 },
    { name: "Manchester United", power: 82 }
];

// Data Default Skuad
const defaultSquad = [
    { name: "John Doe", pos: "FW", rating: 72, wage: 5000 },
    { name: "Alex Smith", pos: "MF", rating: 70, wage: 4000 },
    { name: "David Ray", pos: "DF", rating: 68, wage: 3500 },
    { name: "Mark Cole", pos: "GK", rating: 71, wage: 4000 }
];

const defaultMarket = [
    { name: "Carlos Silva", pos: "FW", rating: 80, price: 500000, wage: 12000 },
    { name: "Liam Brown", pos: "MF", rating: 76, price: 300000, wage: 8000 },
    { name: "Erick Hansen", pos: "DF", rating: 78, price: 400000, wage: 9500 },
    { name: "Sergio Ramos", pos: "DF", rating: 88, price: 5000000, wage: 50000 },
    { name: "Kylian Mbappe", pos: "FW", rating: 92, price: 15000000, wage: 120000 },
    { name: "Iker Casillas", pos: "GK", rating: 92, price: 900000, wage: 18050 }
];

// Load Data Simpanan (localStorage)
let myClub = localStorage.getItem('tycoon_myClub') || availableClubs[0].name;
let opponentClub = localStorage.getItem('tycoon_oppClub') || availableClubs[1].name;
let balance = parseFloat(localStorage.getItem('tycoon_balance')) || 10000000;
let fans = parseInt(localStorage.getItem('tycoon_fans')) || 5000;

// Load Squad & Market (Auto reset jika market kosong)
let squad = JSON.parse(localStorage.getItem('tycoon_squad')) || defaultSquad;
let savedMarket = JSON.parse(localStorage.getItem('tycoon_market'));
let market = (!savedMarket || savedMarket.length === 0) ? [...defaultMarket] : savedMarket;

let boardConfidence = 100;
let ticketPrice = 15;
let currentTactic = "Balanced";
let wins = 0;
let leagueTitles = 0;
let cupTitles = 0;

let activeSponsor = null;
let keySequence = "";

const sponsors = [
    { name: "Fly High Airways", payout: 50000, reqWins: 3 },
    { name: "TechCorp Global", payout: 100000, reqWins: 5 }
];

function setupEventListeners() {
    const startBtn = document.getElementById('start-game-btn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            saveGameState();
            showScreen('game-screen');
        });
    }
    
    const backBtn = document.getElementById('back-to-menu-btn');
    if (backBtn) backBtn.addEventListener('click', () => showScreen('main-menu'));

    const aboutBtn = document.getElementById('about-btn');
    if (aboutBtn) aboutBtn.addEventListener('click', showAboutModal);
    
    const closeModalBtn = document.getElementById('close-modal-btn');
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);

    const myClubBtn = document.getElementById('select-your-club-btn');
    if (myClubBtn) myClubBtn.addEventListener('click', openMyClubModal);
    
    const oppClubBtn = document.getElementById('select-opponent-btn');
    if (oppClubBtn) oppClubBtn.addEventListener('click', openFightClubModal);
    
    const closeClubBtn = document.getElementById('close-club-modal-btn');
    if (closeClubBtn) {
        closeClubBtn.addEventListener('click', () => {
            document.getElementById('club-select-modal').style.display = 'none';
        });
    }
    
    const closeFightBtn = document.getElementById('close-fight-modal-btn');
    if (closeFightBtn) {
        closeFightBtn.addEventListener('click', () => {
            document.getElementById('fight-select-modal').style.display = 'none';
        });
    }

    const playBtn = document.getElementById('play-match-btn');
    if (playBtn) playBtn.addEventListener('click', playMatch);

    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => switchTab(e.target.getAttribute('data-tab'), e.target));
    });

    const tacticsSelect = document.getElementById('tactics-select');
    if (tacticsSelect) {
        tacticsSelect.addEventListener('change', (e) => currentTactic = e.target.value);
    }

    const ticketSlider = document.getElementById('ticket-price');
    if (ticketSlider) {
        ticketSlider.addEventListener('input', (e) => {
            ticketPrice = parseInt(e.target.value);
            document.getElementById('ticket-price-val').innerText = ticketPrice;
        });
    }

    // KOD RAHSIA (9999)
    document.addEventListener('keydown', (e) => {
        const activeElement = document.activeElement;
        if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'SELECT') return;

        if (e.key >= '0' && e.key <= '9') {
            keySequence += e.key;
        } else {
            keySequence = "";
            return;
        }

        if (keySequence.length > 4) {
            keySequence = keySequence.substring(keySequence.length - 4);
        }

        if (keySequence === "9999") {
            const moneyPanel = document.getElementById('money-panel');
            if (moneyPanel) {
                moneyPanel.style.display = 'flex';
                setTimeout(() => {
                    const inputField = document.getElementById('custom-money-input');
                    if (inputField) inputField.focus();
                }, 100);
            }
            keySequence = "";
        }
    });

    const addMoneyBtn = document.getElementById('add-money-btn');
    if (addMoneyBtn) {
        addMoneyBtn.addEventListener('click', () => {
            const inputVal = document.getElementById('custom-money-input').value;
            const parsedAmount = parseFloat(inputVal);

            if (!isNaN(parsedAmount) && parsedAmount >= 0) {
                balance = parsedAmount;
                saveGameState();
                updateUI();
                alert(`Berjaya! Balance baharu anda: $${balance.toLocaleString()}`);
                document.getElementById('money-panel').style.display = 'none';
                document.getElementById('custom-money-input').value = "";
            } else {
                alert("Sila masukkan nombor yang sah!");
            }
        });
    }

    const closeMoneyBtn = document.getElementById('close-money-btn');
    if (closeMoneyBtn) {
        closeMoneyBtn.addEventListener('click', () => {
            document.getElementById('money-panel').style.display = 'none';
        });
    }
}

function saveGameState() {
    localStorage.setItem('tycoon_balance', balance);
    localStorage.setItem('tycoon_fans', fans);
    localStorage.setItem('tycoon_myClub', myClub);
    localStorage.setItem('tycoon_oppClub', opponentClub);
    localStorage.setItem('tycoon_squad', JSON.stringify(squad));
    localStorage.setItem('tycoon_market', JSON.stringify(market));
}

function openMyClubModal() {
    const container = document.getElementById('my-club-list');
    if (!container) return;
    container.innerHTML = "";
    availableClubs.forEach(club => {
        const btn = document.createElement('button');
        btn.className = "club-opt-btn";
        btn.innerText = club.name;
        btn.onclick = () => {
            myClub = club.name;
            if (myClub === opponentClub) {
                const otherClubs = availableClubs.filter(c => c.name !== myClub);
                opponentClub = otherClubs[0].name;
            }
            saveGameState();
            updateUI();
            document.getElementById('club-select-modal').style.display = 'none';
        };
        container.appendChild(btn);
    });
    document.getElementById('club-select-modal').style.display = 'flex';
}

function openFightClubModal() {
    const container = document.getElementById('fight-club-list');
    if (!container) return;
    container.innerHTML = "";
    availableClubs.forEach(club => {
        if (club.name !== myClub) {
            const btn = document.createElement('button');
            btn.className = "club-opt-btn";
            btn.innerText = club.name;
            btn.onclick = () => {
                opponentClub = club.name;
                saveGameState();
                updateUI();
                document.getElementById('fight-select-modal').style.display = 'none';
            };
            container.appendChild(btn);
        }
    });
    document.getElementById('fight-select-modal').style.display = 'flex';
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(screenId);
    if (target) target.classList.add('active');
}

function showAboutModal() {
    document.getElementById('modal-title').innerText = "About Game";
    document.getElementById('modal-body').innerHTML = `<p>Football Club Tycoon Game Version 2.0</p>`;
    document.getElementById('modal-overlay').style.display = 'flex';
}

function closeModal() {
    document.getElementById('modal-overlay').style.display = 'none';
}

function updateUI() {
    const menuMyClub = document.getElementById('menu-my-club');
    if (menuMyClub) menuMyClub.innerText = myClub;
    
    const menuFightClub = document.getElementById('menu-fight-club');
    if (menuFightClub) menuFightClub.innerText = opponentClub;

    const clubName = document.getElementById('club-name');
    if (clubName) clubName.innerText = myClub;
    
    const myClubDisp = document.getElementById('my-club-display');
    if (myClubDisp) myClubDisp.innerText = myClub;
    
    const oppClubDisp = document.getElementById('opponent-club-display');
    if (oppClubDisp) oppClubDisp.innerText = opponentClub;

    const balElem = document.getElementById('balance');
    if (balElem) balElem.innerText = balance.toLocaleString();

    const fansElem = document.getElementById('fans');
    if (fansElem) fansElem.innerText = fans.toLocaleString();

    const boardElem = document.getElementById('board-confidence');
    if (boardElem) boardElem.innerText = boardConfidence;

    const lTrophies = document.getElementById('league-trophies');
    if (lTrophies) lTrophies.innerText = leagueTitles;

    const cTrophies = document.getElementById('cup-trophies');
    if (cTrophies) cTrophies.innerText = cupTitles;
}

function switchTab(tabId, clickedBtn) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    const targetTab = document.getElementById(`tab-${tabId}`);
    if (targetTab) targetTab.classList.add('active');
    if (clickedBtn) clickedBtn.classList.add('active');
}

function renderSquad() {
    const list = document.getElementById('squad-list');
    if (!list) return;
    list.innerHTML = "";
    
    squad.forEach((player, index) => {
        const sellPrice = Math.floor((player.rating * 1000) + (player.wage * 20));
        
        const li = document.createElement('li');
        li.innerHTML = `
            <span><strong>${player.name}</strong> (${player.pos}) - OVR: ${player.rating}</span>
            <div style="display:flex; align-items:center; gap:8px;">
                <small style="color:#aaa;">$${player.wage.toLocaleString()}/m</small>
            </div>
        `;

        const sellBtn = document.createElement('button');
        sellBtn.innerText = `Sell ($${sellPrice.toLocaleString()})`;
        sellBtn.style.cssText = "background-color:#e53935; color:white; border:none; padding:5px 10px; border-radius:4px; font-weight:bold; cursor:pointer;";
        sellBtn.addEventListener('click', () => sellPlayer(index));

        li.querySelector('div').appendChild(sellBtn);
        list.appendChild(li);
    });
}

function sellPlayer(index) {
    if (squad.length <= 4) {
        alert("Pemain terlalu sedikit! Anda memerlukan sekurang-kurangnya 4 pemain dalam skuad.");
        return;
    }

    const player = squad[index];
    const sellPrice = Math.floor((player.rating * 1000) + (player.wage * 20));

    balance += sellPrice;
    squad.splice(index, 1);

    saveGameState();
    renderSquad();
    updateUI();
    logCommentary(`SOLD! ${player.name} dijual pada harga $${sellPrice.toLocaleString()}.`);
}

function getTeamRating() {
    if (squad.length === 0) return 70;
    const total = squad.reduce((sum, p) => sum + p.rating, 0);
    return Math.round(total / squad.length);
}

function renderMarket() {
    const list = document.getElementById('market-list');
    if (!list) return;
    list.innerHTML = "";

    market.forEach((player, index) => {
        const li = document.createElement('li');
        li.innerHTML = `<span><strong>${player.name}</strong> (${player.pos}) - OVR: ${player.rating}</span>`;
        
        const buyBtn = document.createElement('button');
        buyBtn.className = "action-btn";
        buyBtn.style.cssText = "width:auto; padding:6px 12px; font-size:13px;";
        buyBtn.innerText = `Buy $${player.price.toLocaleString()}`;
        buyBtn.addEventListener('click', () => buyPlayer(index));
        
        li.appendChild(buyBtn);
        list.appendChild(li);
    });
}

function buyPlayer(index) {
    const player = market[index];
    if (balance >= player.price) {
        balance -= player.price;
        squad.push(player);
        market.splice(index, 1);
        
        saveGameState();
        renderSquad();
        renderMarket();
        updateUI();
        logCommentary(`SIGNED! ${player.name} joined the club for $${player.price.toLocaleString()}.`);
    } else {
        alert("Not enough funds!");
    }
}

async function playMatch() {
    const btn = document.getElementById('play-match-btn');
    if (!btn || btn.disabled) return;
    
    btn.disabled = true;

    const totalWages = squad.reduce((sum, p) => sum + p.wage, 0);
    balance -= totalWages;

    const attendanceFactor = Math.max(0.2, 1 - (ticketPrice - 15) * 0.03);
    const matchAttendance = Math.floor(fans * attendanceFactor);
    const matchIncome = matchAttendance * ticketPrice;
    balance += matchIncome;

    const oppData = availableClubs.find(c => c.name === opponentClub) || { power: 75 };

    logCommentary(`--- MATCHDAY: ${myClub} VS ${opponentClub} ---`);
    logCommentary(`Attendance: ${matchAttendance} fans. Ticket Income: $${matchIncome.toLocaleString()}`);

    let myScore = 0;
    let oppScore = 0;
    let teamPower = getTeamRating() + (currentTactic === "Gegenpressing" ? 5 : 0);
    let oppPower = oppData.power + Math.floor(Math.random() * 5);

    for (let min = 15; min <= 90; min += 25) {
        await new Promise(r => setTimeout(r, 400));
        
        const rand = Math.random() * (teamPower + oppPower);
        if (rand < teamPower) {
            myScore++;
            logCommentary(`[${min}'] GOAL! ${myClub} scores! (${myScore}-${oppScore})`);
        } else if (rand < teamPower + oppPower * 0.4) {
            oppScore++;
            logCommentary(`[${min}'] GOAL! ${opponentClub} scores! (${myScore}-${oppScore})`);
        } else {
            logCommentary(`[${min}'] Tight play in the midfield...`);
        }
    }

    if (myScore > oppScore) {
        logCommentary(`FULL TIME: VICTORY! ${myClub} beat ${opponentClub} ${myScore}-${oppScore}.`);
        fans += 150;
        boardConfidence = Math.min(100, boardConfidence + 5);
        wins++;
    } else if (myScore === oppScore) {
        logCommentary(`FULL TIME: DRAW! Final score ${myScore}-${oppScore}.`);
    } else {
        logCommentary(`FULL TIME: DEFEAT! ${opponentClub} won ${oppScore}-${myScore}.`);
        fans = Math.max(100, fans - 100);
        boardConfidence -= 8;
    }

    saveGameState();
    updateUI();
    btn.disabled = false;
}

function logCommentary(msg) {
    const box = document.getElementById('commentary-box');
    if (box) {
        box.innerHTML += `<p>${msg}</p>`;
        box.scrollTop = box.scrollHeight;
    }
}

function renderSponsors() {
    const container = document.getElementById('sponsor-container');
    if (!container) return;
    
    container.innerHTML = "";
    if (activeSponsor) {
        container.innerHTML = `<p><strong>Active Sponsor:</strong> ${activeSponsor.name}</p>`;
    } else {
        sponsors.forEach((s, idx) => {
            const div = document.createElement('div');
            div.style.marginTop = "10px";
            div.innerHTML = `<strong>${s.name}</strong> - $${s.payout.toLocaleString()} `;
            
            const signBtn = document.createElement('button');
            signBtn.innerText = "Sign Deal";
            signBtn.addEventListener('click', () => {
                activeSponsor = { ...sponsors[idx] };
                renderSponsors();
            });
            
            div.appendChild(signBtn);
            container.appendChild(div);
        });
    }
}

function init() {
    setupEventListeners();
    saveGameState();
    renderSquad();
    renderMarket();
    renderSponsors();
    updateUI();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}