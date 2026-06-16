import { useState, useEffect } from "react";

// ── Palette & theme ──────────────────────────────────────────────────────────
// Soft sage + warm lilac + deep plum — calming, clinical, trustworthy.
// Signature element: animated mood-ring gradient that responds to selected mood.

const MOODS = [
  { value: 5, emoji: "😄", label: "Ótimo",    color: "#4CAF82" },
  { value: 4, emoji: "🙂", label: "Bem",      color: "#7EC8A4" },
  { value: 3, emoji: "😐", label: "Neutro",   color: "#A89CC8" },
  { value: 2, emoji: "😔", label: "Mal",      color: "#C8A0C0" },
  { value: 1, emoji: "😢", label: "Péssimo",  color: "#C87A9A" },
];

const ACTIVITIES = [
  "🧘 Meditação", "🚶 Caminhada", "📖 Leitura", "💤 Descanso",
  "🎨 Arte", "🎵 Música", "🌿 Natureza", "💬 Socializar",
  "🏃 Exercício", "📝 Diário", "🍵 Autocuidado", "📞 Ligar pra alguém",
];

const INITIAL_PATIENTS = [
  { id: 1, name: "Ana Lima",    avatar: "AL", lastMood: 4, sessions: 8  },
  { id: 2, name: "Bruno Melo",  avatar: "BM", lastMood: 2, sessions: 12 },
  { id: 3, name: "Carla Souza", avatar: "CS", lastMood: 3, sessions: 5  },
];

const INITIAL_PATIENT_DATA = {
  1: {
    moodHistory: [
      { date: "10/06", value: 3 }, { date: "11/06", value: 4 },
      { date: "12/06", value: 4 }, { date: "13/06", value: 5 },
      { date: "14/06", value: 4 }, { date: "15/06", value: 4 },
    ],
    diary: [
      { id: 1, date: "15/06", text: "Me senti mais tranquila hoje, consegui fazer a meditação." },
      { id: 2, date: "14/06", text: "Dia difícil no trabalho, mas respirei fundo como o Dr. Samuel orientou." },
    ],
    tasks: [
      { id: 1, text: "Meditação guiada 10 min/dia",        done: true  },
      { id: 2, text: "Escrever 3 coisas boas do dia",      done: true  },
      { id: 3, text: "Caminhar 20 minutos ao ar livre",    done: false },
      { id: 4, text: "Ligar para um amigo esta semana",    done: false },
    ],
  },
  2: {
    moodHistory: [
      { date: "10/06", value: 2 }, { date: "11/06", value: 2 },
      { date: "12/06", value: 3 }, { date: "13/06", value: 2 },
      { date: "14/06", value: 3 }, { date: "15/06", value: 2 },
    ],
    diary: [
      { id: 1, date: "15/06", text: "Acordei com ansiedade novamente. Difícil de controlar." },
    ],
    tasks: [
      { id: 1, text: "Técnica de respiração 4-7-8", done: false },
      { id: 2, text: "Evitar cafeína após as 14h",  done: true  },
      { id: 3, text: "Registro de pensamentos",     done: false },
    ],
  },
  3: {
    moodHistory: [
      { date: "10/06", value: 4 }, { date: "11/06", value: 3 },
      { date: "12/06", value: 3 }, { date: "13/06", value: 4 },
      { date: "14/06", value: 3 }, { date: "15/06", value: 3 },
    ],
    diary: [],
    tasks: [
      { id: 1, text: "Ler 15 min antes de dormir", done: false },
      { id: 2, text: "Praticar gratidão diária",   done: false },
    ],
  },
};

// ── Tiny chart (pure SVG) ────────────────────────────────────────────────────
function MoodChart({ data }) {
  if (!data || data.length === 0) return null;
  const W = 300, H = 110, PAD = 16;
  const xs = data.map((_, i) => PAD + (i / (data.length - 1)) * (W - PAD * 2));
  const ys = data.map(d => H - PAD - ((d.value - 1) / 4) * (H - PAD * 2));
  const line = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`).join(" ");
  const area = line + ` L${xs[xs.length-1]},${H} L${xs[0]},${H} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H }}>
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7C6FAD" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#7C6FAD" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {[1,2,3,4,5].map(v => {
        const y = H - PAD - ((v-1)/4)*(H-PAD*2);
        return <line key={v} x1={PAD} y1={y} x2={W-PAD} y2={y} stroke="#E8E4F0" strokeWidth="1" />;
      })}
      <path d={area} fill="url(#cg)" />
      <path d={line} fill="none" stroke="#7C6FAD" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {xs.map((x, i) => (
        <g key={i}>
          <circle cx={x} cy={ys[i]} r="4" fill="#7C6FAD" />
          <text x={x} y={H - 2} textAnchor="middle" fontSize="9" fill="#9990B8">{data[i].date}</text>
        </g>
      ))}
    </svg>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [role, setRole]           = useState(null);      // "psicologo" | "paciente"
  const [screen, setScreen]       = useState("login");   // login | home | detail | mood | diary | tasks | diaryNew
  const [activePatient, setActivePatient] = useState(null);
  const [patients, setPatients]   = useState(INITIAL_PATIENTS);
  const [patientData, setPatientData] = useState(INITIAL_PATIENT_DATA);
  const [moodSelected, setMoodSelected] = useState(null);
  const [moodNote, setMoodNote]   = useState("");
  const [newEntry, setNewEntry]   = useState("");
  const [newTask, setNewTask]     = useState("");
  const [activitiesSelected, setActivitiesSelected] = useState([]);
  const [tab, setTab]             = useState("visao");   // visao | pacientes | tarefas
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");
  const [moodRing, setMoodRing]   = useState("#7C6FAD");

  // Update mood ring gradient when mood changes
  useEffect(() => {
    if (moodSelected !== null) {
      const m = MOODS.find(m => m.value === moodSelected);
      if (m) setMoodRing(m.color);
    }
  }, [moodSelected]);

  const pData = activePatient ? patientData[activePatient.id] : null;

  // ── Login ──
  function handleLogin() {
    if (loginUser === "dr.samuel" && loginPass === "psi123") {
      setRole("psicologo"); setScreen("home");
    } else if (loginUser === "paciente" && loginPass === "123") {
      setRole("paciente");
      setActivePatient(INITIAL_PATIENTS[0]);
      setScreen("mood");
    } else {
      setLoginError("Usuário ou senha incorretos.");
    }
  }

  // ── Toggle task ──
  function toggleTask(taskId) {
    setPatientData(prev => ({
      ...prev,
      [activePatient.id]: {
        ...prev[activePatient.id],
        tasks: prev[activePatient.id].tasks.map(t =>
          t.id === taskId ? { ...t, done: !t.done } : t
        ),
      },
    }));
  }

  // ── Add task ──
  function addTask() {
    if (!newTask.trim()) return;
    setPatientData(prev => {
      const tasks = prev[activePatient.id].tasks;
      return {
        ...prev,
        [activePatient.id]: {
          ...prev[activePatient.id],
          tasks: [...tasks, { id: Date.now(), text: newTask, done: false }],
        },
      };
    });
    setNewTask("");
  }

  // ── Save mood ──
  function saveMood() {
    if (!moodSelected) return;
    const today = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    setPatientData(prev => ({
      ...prev,
      [activePatient.id]: {
        ...prev[activePatient.id],
        moodHistory: [
          ...prev[activePatient.id].moodHistory,
          { date: today, value: moodSelected },
        ],
      },
    }));
    setPatients(prev =>
      prev.map(p => p.id === activePatient.id ? { ...p, lastMood: moodSelected } : p)
    );
    setMoodSelected(null);
    setMoodNote("");
    setActivitiesSelected([]);
    setScreen("home");
  }

  // ── Save diary entry ──
  function saveDiary() {
    if (!newEntry.trim()) return;
    const today = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    setPatientData(prev => ({
      ...prev,
      [activePatient.id]: {
        ...prev[activePatient.id],
        diary: [
          { id: Date.now(), date: today, text: newEntry },
          ...prev[activePatient.id].diary,
        ],
      },
    }));
    setNewEntry("");
    setScreen(role === "paciente" ? "home" : "detail");
  }

  function moodLabel(v) {
    return MOODS.find(m => m.value === v)?.emoji || "—";
  }
  function moodColor(v) {
    return MOODS.find(m => m.value === v)?.color || "#A89CC8";
  }

  // ── STYLES ────────────────────────────────────────────────────────────────
  const S = {
    app: {
      fontFamily: "'Nunito', system-ui, sans-serif",
      background: "#F5F3FA",
      minHeight: "100vh",
      maxWidth: 420,
      margin: "0 auto",
      position: "relative",
      paddingBottom: 72,
    },
    header: {
      background: "linear-gradient(135deg, #5B4D8A 0%, #7C6FAD 100%)",
      color: "#fff",
      padding: "20px 20px 24px",
      borderRadius: "0 0 28px 28px",
    },
    headerSub: { fontSize: 13, opacity: 0.75, marginTop: 2 },
    card: {
      background: "#fff",
      borderRadius: 20,
      padding: "18px 20px",
      marginBottom: 14,
      boxShadow: "0 2px 12px rgba(92,77,138,0.08)",
    },
    cardTitle: { fontWeight: 700, fontSize: 15, color: "#3D3260", marginBottom: 12 },
    btn: {
      background: "linear-gradient(135deg, #5B4D8A, #7C6FAD)",
      color: "#fff",
      border: "none",
      borderRadius: 14,
      padding: "13px 28px",
      fontWeight: 700,
      fontSize: 15,
      cursor: "pointer",
      width: "100%",
      marginTop: 8,
    },
    btnOutline: {
      background: "transparent",
      color: "#7C6FAD",
      border: "2px solid #7C6FAD",
      borderRadius: 14,
      padding: "11px 24px",
      fontWeight: 700,
      fontSize: 14,
      cursor: "pointer",
      marginTop: 8,
    },
    input: {
      width: "100%",
      border: "1.5px solid #E0D9F5",
      borderRadius: 12,
      padding: "12px 14px",
      fontSize: 14,
      color: "#3D3260",
      background: "#FAFAFF",
      boxSizing: "border-box",
      outline: "none",
      marginBottom: 10,
    },
    navBar: {
      position: "fixed",
      bottom: 0,
      left: "50%",
      transform: "translateX(-50%)",
      width: "100%",
      maxWidth: 420,
      background: "#fff",
      borderTop: "1px solid #EDE8F8",
      display: "flex",
      justifyContent: "space-around",
      padding: "10px 0 16px",
      zIndex: 100,
    },
    navBtn: (active) => ({
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 3,
      cursor: "pointer",
      color: active ? "#5B4D8A" : "#B0A8CC",
      fontWeight: active ? 700 : 500,
      fontSize: 11,
      background: "none",
      border: "none",
      padding: "4px 16px",
    }),
    tag: (active, color) => ({
      background: active ? color : "#F0EDF9",
      color: active ? "#fff" : "#7C6FAD",
      border: `1.5px solid ${active ? color : "#E0D9F5"}`,
      borderRadius: 20,
      padding: "6px 14px",
      fontSize: 13,
      cursor: "pointer",
      fontWeight: 600,
      marginRight: 6,
      marginBottom: 8,
      display: "inline-block",
    }),
    backBtn: {
      background: "none",
      border: "none",
      color: "#fff",
      fontSize: 22,
      cursor: "pointer",
      marginRight: 8,
      lineHeight: 1,
    },
    avatar: (color) => ({
      width: 44,
      height: 44,
      borderRadius: 14,
      background: color,
      color: "#fff",
      fontWeight: 800,
      fontSize: 15,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }),
    pill: (color) => ({
      background: color + "22",
      color: color,
      borderRadius: 20,
      padding: "3px 10px",
      fontSize: 12,
      fontWeight: 700,
    }),
  };

  const avatarColors = ["#7C6FAD","#4CAF82","#C87A9A","#E89A3C","#5B9BD5"];

  function scrollToTop() {
    window.scrollTo({ top: 0 });
  }

  // ── SCREENS ───────────────────────────────────────────────────────────────

  // LOGIN
  if (screen === "login") return (
    <div style={S.app}>
      <div style={{ padding: "48px 28px 24px", textAlign: "center" }}>
        {/* Mood ring signature element */}
        <div style={{
          width: 90, height: 90, borderRadius: "50%",
          background: `radial-gradient(circle, ${moodRing}44 30%, ${moodRing}22 70%)`,
          border: `4px solid ${moodRing}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px",
          transition: "all 0.6s ease",
          fontSize: 36,
        }}>🧠</div>
        <h1 style={{ color: "#3D3260", fontSize: 24, fontWeight: 800, margin: 0 }}>Psicológico</h1>
        <h1 style={{ color: "#5B4D8A", fontSize: 24, fontWeight: 800, margin: "0 0 4px" }}>Samuel Sabóia</h1>
        <p style={{ color: "#9990B8", fontSize: 14, margin: "6px 0 32px" }}>Acompanhamento psicológico</p>

        <div style={{ textAlign: "left" }}>
          <label style={{ fontSize: 13, color: "#7C6FAD", fontWeight: 700 }}>USUÁRIO</label>
          <input style={S.input} placeholder="dr.samuel ou paciente"
            value={loginUser} onChange={e => setLoginUser(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()} />
          <label style={{ fontSize: 13, color: "#7C6FAD", fontWeight: 700 }}>SENHA</label>
          <input style={S.input} type="password" placeholder="••••••"
            value={loginPass} onChange={e => setLoginPass(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()} />
          {loginError && <p style={{ color: "#C87A9A", fontSize: 13, margin: "0 0 8px" }}>{loginError}</p>}
          <button style={S.btn} onClick={handleLogin}>Entrar</button>
          <p style={{ color: "#B0A8CC", fontSize: 12, textAlign: "center", marginTop: 16 }}>
            Demo — Psicólogo: <b>dr.samuel / psi123</b><br />
            Paciente: <b>paciente / 123</b>
          </p>
        </div>
      </div>
    </div>
  );

  // ── PSICÓLOGA HOME ────────────────────────────────────────────────────────
  if (role === "psicologo" && screen === "home") {
    const avgMood = (patients.reduce((a, p) => a + p.lastMood, 0) / patients.length).toFixed(1);
    return (
      <div style={S.app}>
        <div style={S.header}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 13, opacity: 0.75 }}>Bem-vinda,</div>
              <h2 style={{ margin: "2px 0 0", fontSize: 22, fontWeight: 800 }}>Dr. Samuel 👋</h2>
            </div>
            <div style={{
              background: "rgba(255,255,255,0.2)", borderRadius: 12,
              padding: "8px 14px", textAlign: "center",
            }}>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{patients.length}</div>
              <div style={{ fontSize: 11, opacity: 0.85 }}>pacientes</div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
            {["visao","pacientes"].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                background: tab === t ? "#fff" : "rgba(255,255,255,0.15)",
                color: tab === t ? "#5B4D8A" : "#fff",
                border: "none", borderRadius: 10,
                padding: "7px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer",
              }}>
                {t === "visao" ? "Visão Geral" : "Pacientes"}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: "20px 16px 0" }}>
          {tab === "visao" && <>
            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              {[
                { label: "Humor médio", value: avgMood + " / 5", icon: "📊" },
                { label: "Sessões este mês", value: patients.reduce((a,p)=>a+p.sessions,0), icon: "🗓" },
              ].map(s => (
                <div key={s.label} style={{ ...S.card, marginBottom: 0, textAlign: "center" }}>
                  <div style={{ fontSize: 24 }}>{s.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#3D3260" }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: "#9990B8" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Alert patients */}
            <div style={S.card}>
              <div style={S.cardTitle}>⚠️ Atenção necessária</div>
              {patients.filter(p => p.lastMood <= 2).map(p => (
                <div key={p.id} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 0", borderBottom: "1px solid #F5F3FA",
                }} onClick={() => { setActivePatient(p); setScreen("detail"); scrollToTop(); }}>
                  <div style={S.avatar(avatarColors[p.id % 5])}>{p.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: "#3D3260" }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: "#9990B8" }}>Humor baixo registrado</div>
                  </div>
                  <div style={{ fontSize: 22 }}>{moodLabel(p.lastMood)}</div>
                </div>
              ))}
              {patients.filter(p => p.lastMood <= 2).length === 0 &&
                <p style={{ color: "#9990B8", fontSize: 13 }}>Todos os pacientes estão bem! 🎉</p>
              }
            </div>

            {/* All patients preview */}
            <div style={S.card}>
              <div style={S.cardTitle}>👥 Todos os pacientes</div>
              {patients.map(p => (
                <div key={p.id} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
                  borderBottom: "1px solid #F5F3FA", cursor: "pointer",
                }} onClick={() => { setActivePatient(p); setScreen("detail"); scrollToTop(); }}>
                  <div style={S.avatar(avatarColors[p.id % 5])}>{p.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: "#3D3260" }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: "#9990B8" }}>{p.sessions} sessões</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 22 }}>{moodLabel(p.lastMood)}</div>
                    <div style={{ ...S.pill(moodColor(p.lastMood)), fontSize: 11 }}>
                      {MOODS.find(m => m.value === p.lastMood)?.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>}

          {tab === "pacientes" && (
            <div style={S.card}>
              <div style={S.cardTitle}>👥 Seus pacientes</div>
              {patients.map(p => (
                <div key={p.id} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 0",
                  borderBottom: "1px solid #F5F3FA", cursor: "pointer",
                }} onClick={() => { setActivePatient(p); setScreen("detail"); scrollToTop(); }}>
                  <div style={S.avatar(avatarColors[p.id % 5])}>{p.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: "#3D3260" }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: "#9990B8" }}>{p.sessions} sessões • {patientData[p.id]?.tasks.filter(t=>t.done).length}/{patientData[p.id]?.tasks.length} tarefas feitas</div>
                  </div>
                  <div style={{ color: "#B0A8CC", fontSize: 18 }}>›</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={S.navBar}>
          <button style={S.navBtn(true)} onClick={() => setScreen("home")}>
            <span style={{ fontSize: 22 }}>🏠</span> Início
          </button>
          <button style={S.navBtn(false)} onClick={() => { setRole(null); setScreen("login"); setLoginUser(""); setLoginPass(""); }}>
            <span style={{ fontSize: 22 }}>🚪</span> Sair
          </button>
        </div>
      </div>
    );
  }

  // ── PACIENTE DETAIL (psicóloga vê) ────────────────────────────────────────
  if (role === "psicologo" && screen === "detail" && activePatient) {
    const d = patientData[activePatient.id];
    const tasksDone = d.tasks.filter(t => t.done).length;
    return (
      <div style={S.app}>
        <div style={{ ...S.header, display: "flex", alignItems: "center" }}>
          <button style={S.backBtn} onClick={() => setScreen("home")}>‹</button>
          <div style={S.avatar(avatarColors[activePatient.id % 5])}>{activePatient.avatar}</div>
          <div style={{ marginLeft: 12 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{activePatient.name}</h2>
            <div style={S.headerSub}>{activePatient.sessions} sessões realizadas</div>
          </div>
        </div>

        <div style={{ padding: "20px 16px 0" }}>
          {/* Mood Chart */}
          <div style={S.card}>
            <div style={S.cardTitle}>📈 Evolução de humor</div>
            <MoodChart data={d.moodHistory} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              {MOODS.slice().reverse().map(m => (
                <div key={m.value} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 16 }}>{m.emoji}</div>
                  <div style={{ fontSize: 10, color: "#9990B8" }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tasks */}
          <div style={S.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={S.cardTitle}>✅ Tarefas</div>
              <div style={S.pill("#4CAF82")}>{tasksDone}/{d.tasks.length} feitas</div>
            </div>
            {d.tasks.map(t => (
              <div key={t.id} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 0", borderBottom: "1px solid #F5F3FA",
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 7,
                  background: t.done ? "#4CAF82" : "#F0EDF9",
                  border: `2px solid ${t.done ? "#4CAF82" : "#D5CEF0"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>{t.done && <span style={{ color: "#fff", fontSize: 13 }}>✓</span>}</div>
                <span style={{ fontSize: 14, color: t.done ? "#B0A8CC" : "#3D3260",
                  textDecoration: t.done ? "line-through" : "none" }}>{t.text}</span>
              </div>
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <input style={{ ...S.input, marginBottom: 0, flex: 1 }}
                placeholder="Nova tarefa para o paciente…"
                value={newTask} onChange={e => setNewTask(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addTask()} />
              <button onClick={addTask} style={{
                background: "#5B4D8A", color: "#fff", border: "none",
                borderRadius: 12, padding: "0 16px", fontSize: 20, cursor: "pointer",
              }}>+</button>
            </div>
          </div>

          {/* Diary */}
          <div style={S.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={S.cardTitle}>📓 Diário do paciente</div>
            </div>
            {d.diary.length === 0 && <p style={{ color: "#9990B8", fontSize: 13 }}>Nenhuma entrada ainda.</p>}
            {d.diary.map(entry => (
              <div key={entry.id} style={{
                background: "#FAFAFF", borderRadius: 12, padding: "12px 14px", marginBottom: 10,
                borderLeft: "3px solid #7C6FAD",
              }}>
                <div style={{ fontSize: 11, color: "#9990B8", marginBottom: 4 }}>{entry.date}</div>
                <div style={{ fontSize: 14, color: "#3D3260", lineHeight: 1.5 }}>{entry.text}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={S.navBar}>
          <button style={S.navBtn(false)} onClick={() => setScreen("home")}>
            <span style={{ fontSize: 22 }}>‹</span> Voltar
          </button>
          <button style={S.navBtn(false)} onClick={() => { setRole(null); setScreen("login"); setLoginUser(""); setLoginPass(""); }}>
            <span style={{ fontSize: 22 }}>🚪</span> Sair
          </button>
        </div>
      </div>
    );
  }

  // ── PACIENTE — MOOD REGISTER ───────────────────────────────────────────────
  if (role === "paciente" && screen === "mood") return (
    <div style={S.app}>
      <div style={{ ...S.header, textAlign: "center" }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Como você está hoje? 💜</h2>
        <div style={S.headerSub}>{new Date().toLocaleDateString("pt-BR", { weekday:"long", day:"numeric", month:"long" })}</div>
      </div>

      <div style={{ padding: "24px 16px 0" }}>
        {/* Mood ring — signature element */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 110, height: 110, borderRadius: "50%",
            background: `radial-gradient(circle, ${moodRing}55 20%, ${moodRing}22 70%, transparent 100%)`,
            border: `5px solid ${moodRing}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto",
            transition: "all 0.5s ease",
            fontSize: 48,
          }}>
            {moodSelected ? MOODS.find(m => m.value === moodSelected)?.emoji : "🤔"}
          </div>
          {moodSelected &&
            <div style={{ marginTop: 10, fontWeight: 700, color: moodRing, fontSize: 16, transition: "color 0.4s" }}>
              {MOODS.find(m => m.value === moodSelected)?.label}
            </div>
          }
        </div>

        {/* Mood selector */}
        <div style={{ ...S.card }}>
          <div style={S.cardTitle}>Selecione seu humor</div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            {MOODS.map(m => (
              <button key={m.value} onClick={() => setMoodSelected(m.value)} style={{
                background: moodSelected === m.value ? m.color : "#F5F3FA",
                border: `2px solid ${moodSelected === m.value ? m.color : "#E8E4F0"}`,
                borderRadius: 14, padding: "10px 8px", cursor: "pointer",
                transition: "all 0.3s",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              }}>
                <span style={{ fontSize: 26 }}>{m.emoji}</span>
                <span style={{ fontSize: 10, color: moodSelected === m.value ? "#fff" : "#9990B8", fontWeight: 700 }}>
                  {m.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Activities */}
        <div style={S.card}>
          <div style={S.cardTitle}>O que você fez hoje? (opcional)</div>
          <div>
            {ACTIVITIES.map(a => (
              <span key={a} style={S.tag(activitiesSelected.includes(a), "#7C6FAD")}
                onClick={() => setActivitiesSelected(prev =>
                  prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]
                )}>{a}</span>
            ))}
          </div>
        </div>

        {/* Note */}
        <div style={S.card}>
          <div style={S.cardTitle}>📝 Nota rápida (opcional)</div>
          <textarea style={{ ...S.input, height: 80, resize: "none", fontFamily: "inherit" }}
            placeholder="Como foi seu dia? O que está sentindo?"
            value={moodNote} onChange={e => setMoodNote(e.target.value)} />
        </div>

        <button style={{ ...S.btn, opacity: moodSelected ? 1 : 0.5 }}
          onClick={moodSelected ? saveMood : undefined}>
          Salvar registro 💜
        </button>
      </div>
    </div>
  );

  // ── PACIENTE HOME ─────────────────────────────────────────────────────────
  if (role === "paciente" && screen === "home") {
    const d = patientData[activePatient.id];
    const tasksDone = d.tasks.filter(t => t.done).length;
    return (
      <div style={S.app}>
        <div style={S.header}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 13, opacity: 0.75 }}>Olá,</div>
              <h2 style={{ margin: "2px 0 0", fontSize: 22, fontWeight: 800 }}>Ana Lima 💜</h2>
            </div>
            <div style={{
              background: "rgba(255,255,255,0.2)", borderRadius: 50,
              width: 46, height: 46, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 22,
            }}>😊</div>
          </div>
        </div>

        <div style={{ padding: "20px 16px 0" }}>
          {/* Quick mood */}
          <div style={{ ...S.card, background: "linear-gradient(135deg, #5B4D8A, #9B7FC8)", color: "#fff" }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Como está se sentindo agora?</div>
            <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 14 }}>Registre seu humor de hoje</div>
            <button onClick={() => setScreen("mood")} style={{
              background: "#fff", color: "#5B4D8A", border: "none",
              borderRadius: 12, padding: "10px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer",
            }}>+ Registrar humor</button>
          </div>

          {/* Tasks */}
          <div style={S.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={S.cardTitle}>✅ Suas tarefas</div>
              <div style={S.pill("#4CAF82")}>{tasksDone}/{d.tasks.length}</div>
            </div>
            {d.tasks.map(t => (
              <div key={t.id} onClick={() => toggleTask(t.id)} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "9px 0",
                borderBottom: "1px solid #F5F3FA", cursor: "pointer",
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 7,
                  background: t.done ? "#4CAF82" : "#F0EDF9",
                  border: `2px solid ${t.done ? "#4CAF82" : "#D5CEF0"}`,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>{t.done && <span style={{ color: "#fff", fontSize: 13 }}>✓</span>}</div>
                <span style={{ fontSize: 14, color: t.done ? "#B0A8CC" : "#3D3260",
                  textDecoration: t.done ? "line-through" : "none" }}>{t.text}</span>
              </div>
            ))}
          </div>

          {/* Mood chart */}
          <div style={S.card}>
            <div style={S.cardTitle}>📈 Seu humor esta semana</div>
            <MoodChart data={d.moodHistory} />
          </div>

          {/* Diary */}
          <div style={S.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={S.cardTitle}>📓 Diário</div>
              <button onClick={() => setScreen("diaryNew")} style={{
                background: "#5B4D8A", color: "#fff", border: "none",
                borderRadius: 10, padding: "6px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer",
              }}>+ Nova entrada</button>
            </div>
            {d.diary.slice(0, 2).map(entry => (
              <div key={entry.id} style={{
                background: "#FAFAFF", borderRadius: 12, padding: "12px 14px", marginBottom: 10,
                borderLeft: "3px solid #7C6FAD",
              }}>
                <div style={{ fontSize: 11, color: "#9990B8", marginBottom: 4 }}>{entry.date}</div>
                <div style={{ fontSize: 14, color: "#3D3260", lineHeight: 1.5 }}>{entry.text}</div>
              </div>
            ))}
            {d.diary.length === 0 && <p style={{ color: "#9990B8", fontSize: 13 }}>Nenhuma entrada ainda. Comece a escrever!</p>}
          </div>
        </div>

        <div style={S.navBar}>
          <button style={S.navBtn(true)} onClick={() => setScreen("home")}>
            <span style={{ fontSize: 22 }}>🏠</span> Início
          </button>
          <button style={S.navBtn(false)} onClick={() => setScreen("mood")}>
            <span style={{ fontSize: 22 }}>💜</span> Humor
          </button>
          <button style={S.navBtn(false)} onClick={() => setScreen("diaryNew")}>
            <span style={{ fontSize: 22 }}>📓</span> Diário
          </button>
          <button style={S.navBtn(false)} onClick={() => { setRole(null); setScreen("login"); setLoginUser(""); setLoginPass(""); }}>
            <span style={{ fontSize: 22 }}>🚪</span> Sair
          </button>
        </div>
      </div>
    );
  }

  // ── PACIENTE — NEW DIARY ENTRY ─────────────────────────────────────────────
  if (role === "paciente" && screen === "diaryNew") return (
    <div style={S.app}>
      <div style={{ ...S.header, display: "flex", alignItems: "center" }}>
        <button style={S.backBtn} onClick={() => setScreen("home")}>‹</button>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>📓 Nova entrada no diário</h2>
          <div style={S.headerSub}>{new Date().toLocaleDateString("pt-BR", { weekday:"long", day:"numeric", month:"long" })}</div>
        </div>
      </div>
      <div style={{ padding: "24px 16px 0" }}>
        <div style={S.card}>
          <div style={S.cardTitle}>O que está na sua mente?</div>
          <textarea style={{ ...S.input, height: 200, resize: "none", fontFamily: "inherit", lineHeight: 1.6 }}
            placeholder="Escreva livremente sobre como está se sentindo, o que aconteceu hoje, seus pensamentos…"
            value={newEntry} onChange={e => setNewEntry(e.target.value)} />
          <button style={{ ...S.btn, opacity: newEntry.trim() ? 1 : 0.5 }}
            onClick={newEntry.trim() ? saveDiary : undefined}>
            Salvar entrada 💜
          </button>
        </div>
        <p style={{ color: "#B0A8CC", fontSize: 12, textAlign: "center" }}>
          Suas anotações são privadas e compartilhadas apenas com sua psicóloga.
        </p>
      </div>
    </div>
  );

  return null;
}
