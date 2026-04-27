const http = require("http");

const PAYOFF = {
  Collude:   {Collude:[40,40],Undercut:[10,60],Advertise:[25,35]},
  Undercut:  {Collude:[60,10],Undercut:[15,15],Advertise:[30,20]},
  Advertise: {Collude:[35,25],Undercut:[20,30],Advertise:[30,30]},
};

const games = {};

function genCode() {
  return Math.random().toString(36).substring(2,7).toUpperCase();
}

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Oligopoly Showdown</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,sans-serif;background:linear-gradient(135deg,#0f172a,#1e293b);min-height:100vh;color:#fff;display:flex;flex-direction:column;align-items:center;padding:20px}
h1{font-size:24px;text-align:center;margin-bottom:4px}
.sub{text-align:center;font-size:13px;color:#94a3b8;margin-bottom:20px}
.card{background:#1e293b;border:1px solid #334155;border-radius:16px;padding:22px;width:100%;max-width:460px;margin-bottom:14px}
.wide{max-width:700px}
h2{font-size:15px;font-weight:bold;margin-bottom:10px}
input{width:100%;padding:10px 14px;border-radius:10px;border:1px solid #475569;background:#0f172a;color:#fff;font-size:15px;margin-bottom:10px;outline:none}
input:focus{border-color:#60a5fa}
button{padding:10px 20px;border-radius:10px;border:none;font-weight:bold;cursor:pointer;font-size:14px;margin-bottom:8px;transition:opacity .2s;width:100%}
button:hover{opacity:.85}
button:disabled{opacity:.4;cursor:not-allowed}
.bg{background:#22c55e;color:#fff}
.bp{background:#7c3aed;color:#fff}
.bb{background:#3b82f6;color:#fff}
.bgr{background:#475569;color:#fff}
.code-display{font-size:42px;font-weight:900;letter-spacing:8px;color:#facc15;text-align:center;margin:14px 0}
.err{color:#f87171;font-size:13px;margin-top:6px;text-align:center}
.score-row{display:flex;gap:12px;margin-bottom:12px}
.score-box{flex:1;background:#0f172a;border-radius:10px;padding:12px;text-align:center}
.score-box.me{border:2px solid #3b82f6}
.slabel{font-size:11px;color:#94a3b8;margin-bottom:4px}
.sval{font-size:24px;font-weight:900;color:#4ade80}
.mx{overflow-x:auto;margin-bottom:8px}
table{width:100%;border-collapse:collapse;font-size:12px;text-align:center}
th{background:#0f172a;padding:7px 4px;font-size:11px}
td{border:1px solid #334155;padding:7px 4px}
td.tl{text-align:left;font-weight:bold;background:#0f172a;white-space:nowrap;padding-left:8px}
.sbtn{width:100%;padding:12px;border-radius:12px;border:2px solid;font-size:14px;font-weight:bold;text-align:left;margin-bottom:8px;background:transparent;color:#fff;cursor:pointer;display:flex;align-items:center;gap:10px}
.sbtn:hover{opacity:.8}
.sdesc{font-size:11px;font-weight:normal;color:#cbd5e1;display:block;margin-top:2px}
.rr{background:#0f172a;border-radius:10px;padding:12px;margin-bottom:10px;font-size:13px}
.expl{color:#94a3b8;font-size:12px;margin-top:4px;font-style:italic}
.econ{background:#1e3a5f;border:1px solid #2563eb;border-radius:10px;padding:14px;font-size:13px;line-height:1.7;margin-bottom:12px}
.econ p{margin-bottom:6px}
.wait{color:#facc15;font-size:13px;text-align:center;margin-top:8px;animation:pulse 1.5s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
.hi{background:#0f172a;border-radius:8px;padding:10px;margin-bottom:6px;font-size:13px;display:flex;justify-content:space-between;align-items:center}
.g{color:#4ade80}.b{color:#60a5fa}
.div{text-align:center;font-size:12px;color:#475569;margin:8px 0}
</style>
</head>
<body>
<div style="font-size:34px;margin-bottom:4px">🏭</div>
<h1>Oligopoly Showdown</h1>
<p class="sub">5-Round Game Theory · Prisoner's Dilemma · Nash Equilibrium</p>
<div id="app"></div>
<script>
const PAYOFF={Collude:{Collude:[40,40],Undercut:[10,60],Advertise:[25,35]},Undercut:{Collude:[60,10],Undercut:[15,15],Advertise:[30,20]},Advertise:{Collude:[35,25],Undercut:[20,30],Advertise:[30,30]}};
const STRATS=[{key:"Collude",emoji:"🤝",color:"#22c55e",desc:"Keep prices high, share the market equally."},{key:"Undercut",emoji:"✂️",color:"#ef4444",desc:"Lower prices to steal market share from rival."},{key:"Advertise",emoji:"📣",color:"#eab308",desc:"Grow the market but spend on ads, reducing margins."}];
const EX={"Collude-Collude":"Both firms cooperated → mutual benefit. Ideal but fragile — each is tempted to defect.","Undercut-Undercut":"Both undercut → price war! Nash Equilibrium — profits crash for both.","Advertise-Advertise":"Both advertised → moderate outcome; ad costs ate into margins.","Collude-Undercut":"Firm B defected while A cooperated → classic Prisoner's Dilemma betrayal.","Undercut-Collude":"Firm A defected while B cooperated → classic Prisoner's Dilemma betrayal.","Collude-Advertise":"Firm B advertised while A colluded. B grew the market; A missed out.","Advertise-Collude":"Firm A advertised while B colluded. A grew the market; B missed out.","Undercut-Advertise":"Firm A undercut, Firm B advertised. A stole share; B got less return.","Advertise-Undercut":"Firm A advertised, Firm B undercut. B stole share; A got less return."};

let ST={screen:"home",role:null,code:"",ji:"",err:"",game:null,myChoice:null,loading:false};
let poll=null;

async function api(action,params={}){
  const r=await fetch("/api?action="+action+"&"+new URLSearchParams(params).toString());
  const j=await r.json();
  if(!j.ok) throw new Error(j.error||"Error");
  return j;
}

function startPoll(){
  if(poll) clearInterval(poll);
  poll=setInterval(async()=>{
    try{
      const j=await api("get",{code:ST.code});
      if(JSON.stringify(j.game)!==JSON.stringify(ST.game)){
        ST.game=j.game;
        if(j.game.phase==="choosing"&&ST.screen==="lobby") ST.screen="game";
        if(j.game.phase==="done") ST.screen="results";
        if(j.game.phase==="choosing"){ST.myChoice=null;ST.loading=false;}
        render();
      }
    }catch(e){}
  },2000);
}
function stopPoll(){if(poll){clearInterval(poll);poll=null;}}

async function createGame(){
  ST.loading=true;ST.err="";render();
  try{
    const j=await api("create");
    ST.code=j.code;ST.role="A";ST.game=j.game;ST.screen="lobby";ST.loading=false;
    startPoll();render();
  }catch(e){ST.err="Could not create game.";ST.loading=false;render();}
}

async function joinGame(){
  const code=ST.ji.trim().toUpperCase();
  if(!code){ST.err="Please enter a room code.";render();return;}
  ST.loading=true;ST.err="";render();
  try{
    const j=await api("join",{code});
    ST.code=code;ST.role="B";ST.game=j.game;ST.screen="game";ST.loading=false;
    startPoll();render();
  }catch(e){ST.err=e.message;ST.loading=false;render();}
}

async function submitChoice(choice){
  ST.myChoice=choice;render();
  try{
    const j=await api("move",{code:ST.code,role:ST.role,choice});
    ST.game=j.game;
    if(j.game.phase==="choosing"||j.game.phase==="done"){ST.myChoice=null;ST.loading=false;}
    if(j.game.phase==="done") ST.screen="results";
    render();
  }catch(e){ST.myChoice=null;ST.err="Error. Try again.";render();}
}

function reset(){stopPoll();ST={screen:"home",role:null,code:"",ji:"",err:"",game:null,myChoice:null,loading:false};render();}
function render(){document.getElementById("app").innerHTML=scr();}

function scr(){
  if(ST.screen==="home") return \`
  <div class="card">
    <h2 style="text-align:center;font-size:17px">Welcome!</h2>
    <p style="font-size:13px;color:#94a3b8;text-align:center;margin:6px 0 14px">Two rival firms · 5 rounds · Who earns the most?</p>
    <button class="bb" onclick="goTo('instr')">📖 How to Play</button>
    <button class="bg" onclick="doCreate()" \${ST.loading?"disabled":""}>\${ST.loading?"Creating…":"➕ Create Game — I am Firm A"}</button>
    <div class="div">── or join a game ──</div>
    <input placeholder="Enter room code (e.g. XK9TQ)" value="\${ST.ji}" oninput="ST.ji=this.value" onkeydown="if(event.key==='Enter')doJoin()"/>
    <button class="bp" onclick="doJoin()" \${ST.loading?"disabled":""}>\${ST.loading?"Joining…":"🔗 Join Game — I am Firm B"}</button>
    \${ST.err?\`<p class="err">\${ST.err}</p>\`:""}
    <p style="font-size:11px;color:#475569;text-align:center;margin-top:8px">No account needed · Any browser · Any device</p>
  </div>\`;

  if(ST.screen==="instr") return \`
  <div class="card wide">
    <h2>📖 How to Play</h2>
    <p style="font-size:13px;color:#94a3b8;margin-bottom:12px">You and your partner are two rival firms. Each round secretly pick a strategy — then both are revealed at the same time.</p>
    \${STRATS.map(s=>\`<div style="display:flex;gap:12px;align-items:flex-start;background:#0f172a;border-radius:10px;padding:12px;margin-bottom:8px"><span style="font-size:26px">\${s.emoji}</span><div><strong>\${s.key}</strong><br><span style="font-size:12px;color:#94a3b8">\${s.desc}</span></div></div>\`).join("")}
    <p style="font-size:13px;color:#94a3b8;margin:12px 0">After <strong>5 rounds</strong>, the firm with the most profit wins.</p>
    <button class="bgr" onclick="goTo('home')">← Back</button>
  </div>\`;

  if(ST.screen==="lobby") return \`
  <div class="card" style="text-align:center">
    <div style="font-size:38px;margin-bottom:8px">⏳</div>
    <h2>Waiting for Firm B…</h2>
    <p style="font-size:13px;color:#94a3b8;margin:10px 0">Share this code with your partner in Zoom chat:</p>
    <div class="code-display">\${ST.code}</div>
    <p style="font-size:12px;color:#64748b">They open the same link, enter this code, click Join.</p>
  </div>\`;

  if(ST.screen==="game"){
    const g=ST.game;if(!g)return"";
    const me=ST.role;
    const iChose=ST.myChoice||(me==="A"?g.choiceA:g.choiceB);
    const theyChose=me==="A"?g.choiceB:g.choiceA;
    const hist=g.history||[];
    const last=hist[hist.length-1];
    return \`<div style="width:100%;max-width:700px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px">
      <span style="font-weight:bold">🏭 Firm \${me} <span style="font-size:11px;color:#94a3b8">(You)</span></span>
      <span style="background:#facc15;color:#000;padding:3px 14px;border-radius:20px;font-size:13px;font-weight:bold">Round \${g.round} / 5</span>
      <span style="font-size:12px;color:#94a3b8">Code: <strong style="color:#facc15">\${ST.code}</strong></span>
    </div>
    <div class="score-row">
      <div class="score-box \${me==="A"?"me":""}"><div class="slabel">Firm A \${me==="A"?"(You)":"(Rival)"}</div><div class="sval">\$\${g.scores.A}</div></div>
      <div class="score-box \${me==="B"?"me":""}"><div class="slabel">Firm B \${me==="B"?"(You)":"(Rival)"}</div><div class="sval">\$\${g.scores.B}</div></div>
    </div>
    <div class="card wide" style="margin-bottom:12px">
      <p style="font-size:12px;font-weight:bold;margin-bottom:8px;text-align:center">📊 Payoff Matrix — (Your profit, Rival's profit)</p>
      <div class="mx"><table>
        <thead><tr><th>You ↓ / Rival →</th>\${STRATS.map(s=>\`<th>\${s.emoji} \${s.key}</th>\`).join("")}</tr></thead>
        <tbody>\${STRATS.map(my=>\`<tr><td class="tl">\${STRATS.find(x=>x.key===my.key).emoji} \${my.key}</td>\${STRATS.map(their=>{const raw=PAYOFF[my.key][their.key];const[mine,rival]=me==="A"?raw:[raw[1],raw[0]];return\`<td><span class="g" style="font-weight:bold">\$\${mine}</span>, <span style="color:#f87171">\$\${rival}</span></td>\`;}).join("")}</tr>\`).join("")}</tbody>
      </table></div>
    </div>
    \${last?\`<div class="rr"><strong>Round \${last.round} Result:</strong> A: \${STRATS.find(x=>x.key===last.choiceA).emoji}<strong>\${last.choiceA}</strong> · B: \${STRATS.find(x=>x.key===last.choiceB).emoji}<strong>\${last.choiceB}</strong><br><span class="g">A +\$\${last.profitA}</span> · <span class="b">B +\$\${last.profitB}</span><p class="expl">\${EX[last.choiceA+"-"+last.choiceB]}</p></div>\`:""}
    <div class="card wide">
      \${iChose?\`<p style="text-align:center;margin-bottom:6px">You chose: <strong>\${STRATS.find(x=>x.key===iChose).emoji} \${iChose}</strong></p><p class="wait">\${theyChose?"Calculating…":"Waiting for rival to choose…"}</p>\`:\`
        <p style="font-weight:bold;margin-bottom:12px;text-align:center">Choose your strategy for Round \${g.round}:</p>
        \${STRATS.map(s=>\`<button class="sbtn" style="border-color:\${s.color}" onclick="doChoice('\${s.key}')"><span style="font-size:22px">\${s.emoji}</span><span><strong>\${s.key}</strong><span class="sdesc">\${s.desc}</span></span></button>\`).join("")}
      \`}
    </div>
    </div>\`;
  }

  if(ST.screen==="results"){
    const g=ST.game;if(!g)return"";
    const hist=g.history||[];
    let winner,expl;
    if(g.scores.A>g.scores.B){winner="🏆 Firm A Wins!";expl=\`Firm A earned \$\${g.scores.A} vs Firm B's \$\${g.scores.B}.\`;}
    else if(g.scores.B>g.scores.A){winner="🏆 Firm B Wins!";expl=\`Firm B earned \$\${g.scores.B} vs Firm A's \$\${g.scores.A}.\`;}
    else{winner="🤝 It's a Tie!";expl=\`Both firms ended with \$\${g.scores.A} — a Nash Equilibrium.\`;}
    const nash=hist.filter(r=>r.choiceA==="Undercut"&&r.choiceB==="Undercut").length;
    const col=hist.filter(r=>r.choiceA==="Collude"&&r.choiceB==="Collude").length;
    return\`<div style="width:100%;max-width:700px">
    <div class="card" style="text-align:center;margin-bottom:12px">
      <div style="font-size:50px">\${g.scores.A>g.scores.B?"🔵":g.scores.B>g.scores.A?"🟣":"⚖️"}</div>
      <h2 style="font-size:20px;margin-top:6px">\${winner}</h2>
      <p style="font-size:13px;color:#94a3b8;margin-top:8px">\${expl}</p>
      <div style="display:flex;justify-content:center;gap:32px;margin-top:12px">
        <div><div style="font-size:11px;color:#94a3b8">Firm A Total</div><div class="sval">\$\${g.scores.A}</div></div>
        <div><div style="font-size:11px;color:#94a3b8">Firm B Total</div><div class="sval">\$\${g.scores.B}</div></div>
      </div>
    </div>
    <div class="card wide" style="margin-bottom:12px">
      <h2>📋 Round History</h2>
      \${hist.map(r=>\`<div class="hi"><span><strong>Round \${r.round}</strong> &nbsp; A: \${STRATS.find(x=>x.key===r.choiceA).emoji}\${r.choiceA} vs B: \${STRATS.find(x=>x.key===r.choiceB).emoji}\${r.choiceB}</span><span><span class="g">A +\$\${r.profitA}</span> &nbsp; <span class="b">B +\$\${r.profitB}</span></span></div>\`).join("")}
    </div>
    <div class="econ">
      <h2 style="margin-bottom:8px">🎓 Economics Takeaway</h2>
      \${nash>0?\`<p>⚠️ <strong>Price war!</strong> Both undercut in \${nash} round(s) — the <strong>Nash Equilibrium</strong>: self-interest hurt both.</p>\`:""}
      \${col>0?\`<p>✅ <strong>Cooperation!</strong> Both colluded in \${col} round(s) — best joint outcome, but always tempting to defect.</p>\`:""}
      <p>📌 The <strong>Prisoner's Dilemma</strong>: individually rational choices can lead to collectively worse outcomes — a core tension in oligopoly markets.</p>
    </div>
    <button class="bgr" onclick="doReset()">🔄 Play Again</button>
    </div>\`;
  }
  return "";
}

function goTo(s){ST.screen=s;ST.err="";render();}
function doCreate(){createGame();}
function doJoin(){joinGame();}
function doChoice(c){submitChoice(c);}
function doReset(){reset();}
render();
<\/script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  const path = url.pathname;
  const p = url.searchParams;

  res.setHeader("Access-Control-Allow-Origin", "*");

  if (path === "/api") {
    const action = p.get("action");
    let result;

    if (action === "create") {
      const code = genCode();
      games[code] = {phase:"waiting_B",round:1,scores:{A:0,B:0},history:[],choiceA:"",choiceB:""};
      result = {ok:true, code, game:games[code]};
    } else if (action === "get") {
      const g = games[p.get("code")];
      result = g ? {ok:true, game:g} : {ok:false, error:"Room not found. Check the code."};
    } else if (action === "join") {
      const g = games[p.get("code")];
      if (!g) { result = {ok:false, error:"Room not found. Check the code."}; }
      else if (g.phase !== "waiting_B") { result = {ok:false, error:"Game already started."}; }
      else { g.phase = "choosing"; result = {ok:true, game:g}; }
    } else if (action === "move") {
      const g = games[p.get("code")];
      if (!g) { result = {ok:false, error:"Room not found"}; }
      else {
        const role = p.get("role"), choice = p.get("choice");
        if (role === "A") g.choiceA = choice; else g.choiceB = choice;
        if (g.choiceA && g.choiceB) {
          const pv = PAYOFF[g.choiceA][g.choiceB];
          g.scores.A += pv[0]; g.scores.B += pv[1];
          g.history.push({round:g.round,choiceA:g.choiceA,choiceB:g.choiceB,profitA:pv[0],profitB:pv[1]});
          g.choiceA = ""; g.choiceB = "";
          g.phase = g.round >= 5 ? "done" : "choosing";
          if (g.phase === "choosing") g.round++;
        }
        result = {ok:true, game:g};
      }
    } else {
      result = {ok:false, error:"Unknown action"};
    }

    res.writeHead(200, {"Content-Type":"application/json"});
    res.end(JSON.stringify(result));

  } else {
    res.writeHead(200, {"Content-Type":"text/html"});
    res.end(HTML);
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Server running on port " + PORT));
