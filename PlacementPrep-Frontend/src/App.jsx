import React, { useEffect, useState } from "react";
import {
  LayoutDashboard, UserRound, Code2, ClipboardCheck, MessagesSquare,
  Building2, TrendingUp, LogOut, Bell, Search,
  ArrowRight, CheckCircle2, Clock3, BookOpen, Target, Sparkles,
  Database, Braces, BrainCircuit, Menu, X, Award
} from "lucide-react";
import { apiRequest, clearSession, getSavedSession, saveSession } from "./api";

const nav = [
  ["Dashboard", LayoutDashboard, "/"],
  ["My Profile", UserRound, "/profile"],
  ["Practice", Code2, "/practice"],
  ["Mock Tests", ClipboardCheck, "/tests"],
  ["Interview Prep", MessagesSquare, "/interview"],
  ["Company Resources", Building2, "/companies"],
  ["My Progress", TrendingUp, "/progress"],
];

function Sidebar({ active, setActive, mobileOpen, setMobileOpen, onLogout }) {
  return (
    <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
      <div className="brand">
        <div className="brand-mark"><Award size={19}/></div>
        <span>PlacementPrep</span>
        <button className="close-mobile" onClick={() => setMobileOpen(false)}><X size={20}/></button>
      </div>
      <nav>
        {nav.map(([label, Icon, path]) => (
          <button key={label} className={`nav-item ${active === label ? "active" : ""}`}
            onClick={() => { setActive(label); setMobileOpen(false); }}>
            <Icon size={18}/><span>{label}</span>
          </button>
        ))}
      </nav>
      <button className="logout" onClick={onLogout}><LogOut size={18}/> Logout</button>
    </aside>
  );
}

function Header({ setMobileOpen, user, onLogout }) {
  const initials = user.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return <header className="header">
    <button className="mobile-menu" onClick={() => setMobileOpen(true)}><Menu/></button>
    <div className="header-search"><Search size={17}/><input placeholder="Search anything..." /></div>
    <div className="header-right">
      <Notifications user={user}/>
      <div className="avatar">{initials}</div>
      <span className="user-name">{user.name}</span>
      <button className="logout-button" onClick={onLogout}>Log out</button>
    </div>
  </header>
}

function Notifications({ user }) {
  const storageKey = `placementprep.reminders:${user.id || user.email}`;
  const [isOpen, setIsOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [reminders, setReminders] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const unreadCount = reminders.filter((reminder) => !reminder.read && !reminder.completed).length;

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(reminders));
  }, [reminders, storageKey]);

  useEffect(() => {
    if (!isOpen) return undefined;

    function closeOnEscape(event) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  function togglePanel() {
    const willOpen = !isOpen;
    setIsOpen(willOpen);
    setNotice("");
    if (willOpen) {
      setReminders((current) => current.map((reminder) => ({ ...reminder, read: true })));
    }
  }

  function generateReminders() {
    const now = new Date();
    const today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-");
    const skills = Array.isArray(user.skills) && user.skills.length
      ? user.skills
      : ["DSA", "Java", "SQL"];
    const templates = [
      { title: `Practice ${skills[0]}`, detail: "Work through a focused 25-minute practice session.", minutesFromNow: 30 },
      { title: `Review ${skills[1] || "Java"}`, detail: "Review your notes and explain three key concepts.", minutesFromNow: 120 },
      { title: "Practice a mock interview", detail: "Talk through one technical answer out loud.", minutesFromNow: 240 },
    ];
    const existingIds = new Set(reminders.map((reminder) => reminder.id));
    const newReminders = templates
      .map((template, index) => {
        const id = `${today}-${index}`;
        if (existingIds.has(id)) return null;
        const dueAt = new Date(Date.now() + template.minutesFromNow * 60 * 1000);
        return {
          id,
          title: template.title,
          detail: template.detail,
          dueAt: dueAt.toISOString(),
          read: false,
          completed: false,
        };
      })
      .filter(Boolean);

    if (newReminders.length === 0) {
      setNotice("Today's reminders have already been generated.");
      return;
    }

    setReminders((current) => [...newReminders, ...current]);
    setNotice("Today's study reminders are ready.");
  }

  function completeReminder(id) {
    setReminders((current) => current.map((reminder) => (
      reminder.id === id ? { ...reminder, completed: true, read: true } : reminder
    )));
  }

  function dismissReminder(id) {
    setReminders((current) => current.filter((reminder) => reminder.id !== id));
  }

  function formatDueTime(dueAt) {
    const date = new Date(dueAt);
    if (Number.isNaN(date.getTime())) return "Study reminder";
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    const dueDate = isToday ? "Today" : isTomorrow
      ? "Tomorrow"
      : date.toLocaleDateString([], { month: "short", day: "numeric" });
    return `${dueDate} at ${date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  }

  return (
    <div className="notification-center">
      <button
        type="button"
        className="icon-btn notification-trigger"
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        onClick={togglePanel}
      >
        <Bell size={19}/>
        {unreadCount > 0 && <span className="notification-count">{unreadCount > 9 ? "9+" : unreadCount}</span>}
      </button>

      {isOpen && (
        <section className="notification-panel" role="dialog" aria-label="Notifications and reminders">
          <div className="notification-panel-head">
            <div>
              <h2>Notifications</h2>
              <p>Your study reminders</p>
            </div>
            <button type="button" className="notification-close" aria-label="Close notifications" onClick={() => setIsOpen(false)}>
              <X size={18}/>
            </button>
          </div>
          <button type="button" className="notification-generate" onClick={generateReminders}>
            <Sparkles size={16}/> Generate today's reminders
          </button>
          {notice && <p className="notification-notice" role="status">{notice}</p>}
          <div className="notification-list">
            {reminders.length === 0 ? (
              <div className="notification-empty">
                <Bell size={22}/>
                <p>No reminders yet. Generate a study plan for today.</p>
              </div>
            ) : reminders.map((reminder) => (
              <article className={`notification-item ${reminder.completed ? "is-complete" : ""}`} key={reminder.id}>
                <span className="notification-item-icon">
                  {reminder.completed ? <CheckCircle2 size={17}/> : <Clock3 size={17}/>}
                </span>
                <div className="notification-item-copy">
                  <b>{reminder.title}</b>
                  <p>{reminder.detail}</p>
                  <small>{reminder.completed ? "Completed" : formatDueTime(reminder.dueAt)}</small>
                  {!reminder.completed && (
                    <button type="button" className="notification-complete" onClick={() => completeReminder(reminder.id)}>
                      Mark complete
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  className="notification-dismiss"
                  aria-label={`Dismiss ${reminder.title}`}
                  onClick={() => dismissReminder(reminder.id)}
                >
                  <X size={15}/>
                </button>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Score({ score=78 }) {
  return <div className="score-wrap">
    <div className="score-ring" style={{"--score": `${score*3.6}deg`}}>
      <div><strong>{score}%</strong><small>Readiness</small></div>
    </div>
  </div>
}

function Stat({ title, value, note, icon: Icon, good=true }) {
  return <div className="stat-card">
    <div className="stat-top"><span>{title}</span><div className="stat-icon"><Icon size={17}/></div></div>
    <strong>{value}</strong>
    <small className={good ? "positive" : "warning"}>{note}</small>
  </div>
}

function DailyFocusCard() {
  const [goals, setGoals] = useState([
    { id: 1, title: "Solve 2 DSA problems", detail: "Arrays & strings practice", done: true },
    { id: 2, title: "Review Java OOP", detail: "Collections + generics", done: false },
    { id: 3, title: "Mock interview block", detail: "15-minute speaking drill", done: false },
  ]);

  const completed = goals.filter((goal) => goal.done).length;
  const progress = Math.round((completed / goals.length) * 100);
  const streak = 6 + completed;

  function toggleGoal(id) {
    setGoals((currentGoals) => currentGoals.map((goal) => goal.id === id ? { ...goal, done: !goal.done } : goal));
  }

  return <div className="panel focus-panel">
    <div className="panel-head">
      <div>
        <h3>Daily Momentum</h3>
        <p>Small wins create big progress</p>
      </div>
      <span className="streak-pill"><Sparkles size={14}/> {streak}-day streak</span>
    </div>

    <div className="focus-summary">
      <div className="focus-ring" style={{ "--progress": `${progress}%` }}>
        <div className="focus-ring-inner"><strong>{progress}%</strong><small>done</small></div>
      </div>
      <div className="focus-copy">
        <h4>Today’s focus</h4>
        <p>Stay consistent and finish your most important prep blocks before the day ends.</p>
      </div>
    </div>

    <div className="focus-goals">
      {goals.map((goal) => (
        <button key={goal.id} className={`focus-goal ${goal.done ? "done" : ""}`} type="button" onClick={() => toggleGoal(goal.id)}>
          <span className={`goal-check ${goal.done ? "done" : ""}`}><CheckCircle2 size={15}/></span>
          <span className="goal-copy">
            <b>{goal.title}</b>
            <small>{goal.detail}</small>
          </span>
          <span className="goal-status">{goal.done ? "Done" : "Next"}</span>
        </button>
      ))}
    </div>
  </div>;
}

function StudyReflection({ user }) {
  const defaultTopics = ["DSA", "Java", "SQL"];
  const topics = Array.isArray(user.skills) && user.skills.length ? user.skills : defaultTopics;
  const storageKey = `placementprep.reflections:${user.id || user.email}`;
  const [saved, setSaved] = useState(() => {
    try {
      const value = localStorage.getItem(storageKey);
      const parsed = value ? JSON.parse(value) : [];
      return { entries: Array.isArray(parsed) ? parsed : [], error: "" };
    } catch {
      return { entries: [], error: "Saved reflections could not be loaded from this browser." };
    }
  });
  const [topic, setTopic] = useState(topics[0]);
  const [reflection, setReflection] = useState("");
  const [confidence, setConfidence] = useState(3);
  const [notice, setNotice] = useState("");

  function saveReflection(event) {
    event.preventDefault();
    const explanation = reflection.trim();
    if (!explanation) {
      setNotice("Write a short explanation from memory before saving.");
      return;
    }

    const nextEntries = [{
      id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
      topic,
      explanation,
      confidence,
      createdAt: new Date().toISOString(),
    }, ...saved.entries].slice(0, 5);

    try {
      localStorage.setItem(storageKey, JSON.stringify(nextEntries));
      setSaved({ entries: nextEntries, error: "" });
      setReflection("");
      setNotice("Reflection saved. Revisit it later to strengthen recall.");
    } catch {
      setSaved((current) => ({ ...current, error: "Could not save this reflection. Check browser storage settings and try again." }));
    }
  }

  return (
    <section className="panel study-reflection">
      <div className="panel-head">
        <div>
          <h3>Teach it back</h3>
          <p>Strengthen recall by explaining a topic without looking at your notes.</p>
        </div>
        <div className="study-reflection-icon"><BookOpen size={19}/></div>
      </div>
      <form onSubmit={saveReflection}>
        <div className="reflection-prompt">
          <label htmlFor="reflection-topic">Pick a topic</label>
          <select id="reflection-topic" value={topic} onChange={(event) => setTopic(event.target.value)}>
            {topics.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
        <label className="reflection-prompt" htmlFor="reflection-text">
          <span>Explain the key idea in your own words</span>
          <textarea
            id="reflection-text"
            value={reflection}
            onChange={(event) => setReflection(event.target.value)}
            placeholder="What do you remember? Include an example or something you found difficult."
            rows={4}
            maxLength={1200}
          />
        </label>
        <div className="reflection-confidence">
          <span>How confident do you feel?</span>
          <div role="group" aria-label="Confidence rating from 1 to 5">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                className={confidence === rating ? "selected" : ""}
                aria-pressed={confidence === rating}
                aria-label={`${rating} out of 5`}
                onClick={() => setConfidence(rating)}
              >
                {rating}
              </button>
            ))}
          </div>
          <small>{confidence <= 2 ? "Flag this topic for another review." : confidence >= 4 ? "Good recall — test yourself again in a few days." : "Keep practicing to make it stick."}</small>
        </div>
        <div className="reflection-actions">
          <span className={saved.error ? "reflection-error" : "reflection-notice"} role="status">{saved.error || notice}</span>
          <button type="submit" className="primary-btn">Save reflection</button>
        </div>
      </form>
      {saved.entries.length > 0 && (
        <div className="reflection-history">
          <h4>Recent reflections</h4>
          {saved.entries.slice(0, 3).map((entry) => (
            <article key={entry.id} className="reflection-entry">
              <div>
                <b>{entry.topic}</b>
                <small>{new Date(entry.createdAt).toLocaleDateString()} · Confidence {entry.confidence}/5</small>
              </div>
              <p>{entry.explanation}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function StudyPlan({ user, plan, onToggleTask, storageError }) {
  if (!plan) return null;
  const skills = Array.isArray(user.skills) && user.skills.length ? user.skills : ["DSA", "Java", "SQL"];
  const completed = plan?.tasks.filter((task) => task.done).length || 0;
  const progress = plan?.tasks.length ? Math.round((completed / plan.tasks.length) * 100) : 0;

  return (
    <section className="panel study-plan-panel" aria-live="polite">
      <div className="panel-head study-plan-head">
        <div>
          <h3>Your 7-day study plan</h3>
          <p>Built around your skills: {skills.join(", ")}. Aim for one focused session each day.</p>
        </div>
        <span className="study-plan-progress">{completed}/{plan.tasks.length} complete · {progress}%</span>
      </div>
      <div className="study-plan-progress-track" aria-label={`${progress}% of study plan complete`}>
        <span style={{ width: `${progress}%` }}/>
      </div>
      <div className="study-plan-tasks">
        {plan.tasks.map((task) => (
          <label key={task.id} className={`study-plan-task ${task.done ? "is-done" : ""}`}>
            <input type="checkbox" checked={task.done} onChange={() => onToggleTask(task.id)} />
            <span className="study-plan-task-day">{task.day}</span>
            <span className="study-plan-task-title">{task.title}</span>
            <small>{task.minutes} min</small>
          </label>
        ))}
      </div>
      {storageError && <p className="study-plan-error" role="status">{storageError}</p>}
    </section>
  );
}

function Dashboard({ user }) {
  const storageKey = `placementprep.study-plan:${user.id || user.email}`;
  const skills = Array.isArray(user.skills) && user.skills.length ? user.skills : ["DSA", "Java", "SQL"];
  const [plan, setPlan] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      const parsed = saved ? JSON.parse(saved) : null;
      return parsed && Array.isArray(parsed.tasks) ? parsed : null;
    } catch {
      return null;
    }
  });
  const [storageError, setStorageError] = useState("");

  function generatePlan() {
    const tasks = Array.from({ length: 7 }, (_, index) => {
      const skill = skills[index % skills.length];
      const sessions = [
        `Review the core concepts in ${skill} and write down 3 key ideas.`,
        `Practice ${skill}: solve 2 problems or complete one focused exercise.`,
        `Use active recall to explain a ${skill} concept without notes.`,
        `Apply ${skill} in a small example and review what was difficult.`,
        `Take a short self-test on ${skill} and revisit incorrect answers.`,
        `Review your ${skill} notes and identify one remaining knowledge gap.`,
        `Do a 25-minute ${skill} recap, then plan what to study next week.`,
      ];
      return {
        id: `${index + 1}`,
        day: `Day ${index + 1}`,
        title: sessions[index],
        minutes: index === 6 ? 25 : 30,
        done: false,
      };
    });
    const nextPlan = { generatedAt: new Date().toISOString(), tasks };
    setPlan(nextPlan);
    try {
      localStorage.setItem(storageKey, JSON.stringify(nextPlan));
      setStorageError("");
    } catch {
      setStorageError("This plan is available until you leave the page, but browser storage prevented saving it.");
    }
  }

  function toggleTask(taskId) {
    setPlan((current) => {
      if (!current) return current;
      const updated = {
        ...current,
        tasks: current.tasks.map((task) => task.id === taskId ? { ...task, done: !task.done } : task),
      };
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
        setStorageError("");
      } catch {
        setStorageError("Your progress could not be saved to browser storage.");
      }
      return updated;
    });
  }

  return <main>
    <div className="page-title">
      <div><h1>Hello, {user.name} 👋</h1><p>Keep going! Your hard work will pay off.</p></div>
      <button type="button" className="primary-btn" onClick={generatePlan}>
        <Sparkles size={17}/>{plan ? "Regenerate Study Plan" : "Get Study Plan"}
      </button>
    </div>
    <StudyPlan user={user} plan={plan} onToggleTask={toggleTask} storageError={storageError}/>
    <section className="stats-grid">
      <div className="stat-card readiness">
        <div><span>Placement Readiness Score</span><h2>78%</h2><small className="positive">Good progress!</small></div><Score/>
      </div>
      <Stat title="Total Questions Solved" value="245" note="↑ 12 this week" icon={Target}/>
      <Stat title="Mock Tests Taken" value="8" note="↑ 2 this week" icon={ClipboardCheck}/>
      <Stat title="Skills Completed" value="5/8" note="Keep going!" icon={Award} good={false}/>
    </section>

    <section className="two-col">
      <div className="panel">
        <div className="panel-head"><div><h3>Your Progress</h3><p>Weekly preparation activity</p></div><button className="text-btn">View details <ArrowRight size={15}/></button></div>
        <div className="chart">
          <div className="y-labels"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div>
          <div className="chart-area">
            <div className="gridlines"><i/><i/><i/><i/><i/></div>
            <svg viewBox="0 0 600 220" preserveAspectRatio="none">
              <polyline points="15,180 120,140 220,122 325,82 430,62 570,22" fill="none" stroke="#2f6f4f" strokeWidth="4"/>
              <polyline points="15,180 120,140 220,122 325,82 430,62 570,22 570,220 15,220" fill="rgba(47,111,79,.08)" stroke="none"/>
              {[ ["15","180"],["120","140"],["220","122"],["325","82"],["430","62"],["570","22"] ].map((p,i)=><circle key={i} cx={p[0]} cy={p[1]} r="6" fill="#fff" stroke="#2f6f4f" strokeWidth="3"/>)}
            </svg>
            <div className="x-labels"><span>Week 1</span><span>Week 2</span><span>Week 3</span><span>Week 4</span><span>Week 5</span><span>Week 6</span></div>
          </div>
        </div>
      </div>
      <DailyFocusCard />
    </section>

    <section className="panel">
      <div className="panel-head"><div><h3>Continue Learning</h3><p>Recommended based on your performance</p></div></div>
      <div className="learning-grid">
        {[
          ["Java","Core Java + OOP","68%","blue",Braces],
          ["DSA","Arrays & Linked Lists","60%","green",BrainCircuit],
          ["SQL","Advanced SQL Queries","75%","orange",Database]
        ].map(([a,b,c,color,Icon])=><div className="learning-card" key={a}>
          <div className={`course-icon ${color}`}><Icon size={21}/></div><div><b>{a}</b><p>{b}</p><div className="bar"><i style={{width:c}}/></div><small>{c} completed</small></div><ArrowRight size={17}/>
        </div>)}
      </div>
    </section>
    <StudyReflection user={user}/>
  </main>
}

function Practice() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("Aptitude");
  const [selectedTopic, setSelectedTopic] = useState("All Topics");
  const [searchQuery, setSearchQuery] = useState("");
  const [answerResults, setAnswerResults] = useState({});
  const [answerErrors, setAnswerErrors] = useState({});
  const [submittingAnswers, setSubmittingAnswers] = useState({});

  useEffect(() => {
    let active = true;
    apiRequest("/questions")
      .then((data) => {
        if (active) setQuestions(data);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const subjectCategories = {
    Aptitude: ["Aptitude", "Quantitative", "Logical Reasoning", "Verbal Ability"],
    Java: ["Java"],
    DSA: ["DSA"],
    SQL: ["SQL"],
  };
  const subjects = [
    ["Aptitude","Quantitative, Logical & Verbal","purple",BrainCircuit],
    ["Java","Core Java, OOP & Collections","red",Braces],
    ["DSA","Arrays, Trees, Graphs & DP","green",BrainCircuit],
    ["SQL","Basic to Advanced SQL","orange",Database]
  ];
  const topics = [...new Set(questions
    .filter((question) => subjectCategories[selectedSubject].includes(question.category))
    .map((question) => question.category))];
  const visibleQuestions = questions.filter((question) => {
    const matchesSubject = subjectCategories[selectedSubject].includes(question.category);
    const matchesTopic = selectedTopic === "All Topics" || question.category === selectedTopic;
    const matchesSearch = question.questionText.toLowerCase().includes(searchQuery.trim().toLowerCase());
    return matchesSubject && matchesTopic && matchesSearch;
  });
  const answeredCount = visibleQuestions.filter((question) => answerResults[question.id]).length;
  const correctCount = visibleQuestions.filter((question) => answerResults[question.id]?.correct).length;

  function startSubject(subject) {
    setSelectedSubject(subject);
    setSelectedTopic("All Topics");
    document.getElementById("aptitude-practice")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function submitAnswer(question, answer) {
    setAnswerErrors((current) => ({ ...current, [question.id]: "" }));
    setSubmittingAnswers((current) => ({ ...current, [question.id]: true }));
    try {
      const result = await apiRequest(`/questions/${question.id}/answer`, {
        method: "POST",
        body: JSON.stringify({ answer }),
      });
      setAnswerResults((current) => ({ ...current, [question.id]: { ...result, selectedAnswer: answer } }));
    } catch (requestError) {
      setAnswerErrors((current) => ({ ...current, [question.id]: requestError.message }));
    } finally {
      setSubmittingAnswers((current) => ({ ...current, [question.id]: false }));
    }
  }

  return <main>
    <div className="page-title"><div><h1>Practice Questions</h1><p>Build strong fundamentals through consistent practice.</p></div><div className="search-box"><Search size={17}/><input placeholder="Search questions..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)}/></div></div>
    <div className="subject-grid">{subjects.map(([name,desc,color,Icon])=><div className={`subject-card ${selectedSubject === name ? "subject-selected" : ""}`} key={name}><div className={`big-icon ${color}`}><Icon size={24}/></div><h3>{name}</h3><b>{questions.filter((question) => subjectCategories[name].includes(question.category)).length} Questions</b><p>{desc}</p><button className="outline-btn" type="button" onClick={() => startSubject(name)}>Start Practice <ArrowRight size={15}/></button></div>)}</div>
    <section className="panel" id="aptitude-practice">
      <div className="panel-head"><div><h3>{selectedSubject} Questions</h3><p>Choose an answer to get instant feedback.</p></div><div className="practice-tools">{!loading && !error && <span className="practice-score">{answeredCount} answered · {correctCount} correct</span>}<select value={selectedTopic} onChange={(event) => setSelectedTopic(event.target.value)}><option>All Topics</option>{topics.map((topic) => <option key={topic}>{topic}</option>)}</select></div></div>
      {error && <div className="api-error" role="alert">{error}</div>}
      {loading && <div className="api-loading">Loading questions...</div>}
      {!loading && !error && visibleQuestions.length === 0 && <div className="api-empty">No {selectedSubject.toLowerCase()} questions are available for this topic yet.</div>}
      {!loading && !error && visibleQuestions.map((question, questionIndex) => (
        <article className="question-card" key={question.id}>
          <div className="question-title-row"><h4><span>Q{questionIndex + 1}</span>{question.questionText}</h4><span className="question-difficulty">{question.difficulty}</span></div>
          <div className="question-options">
            {[question.optionA, question.optionB, question.optionC, question.optionD].map((option, index) => (
              <button
                className={`question-option ${answerResults[question.id]?.correctAnswer === option ? "correct" : ""} ${answerResults[question.id]?.selectedAnswer === option && !answerResults[question.id]?.correct ? "incorrect" : ""}`}
                type="button"
                key={`${question.id}-${index}`}
                disabled={Boolean(answerResults[question.id]) || Boolean(submittingAnswers[question.id])}
                onClick={() => submitAnswer(question, option)}
              >
                <span>{String.fromCharCode(65 + index)}</span>{option}
              </button>
            ))}
          </div>
          <div className="question-meta"><span>{question.category}</span></div>
          {submittingAnswers[question.id] && <p className="answer-feedback" aria-live="polite">Checking your answer...</p>}
          {answerResults[question.id] && <p className={`answer-feedback ${answerResults[question.id].correct ? "answer-right" : "answer-wrong"}`} role="status">
            {answerResults[question.id].correct ? "Correct!" : `Not quite. The correct answer is ${answerResults[question.id].correctAnswer}.`}
          </p>}
          {answerErrors[question.id] && <div className="api-error answer-error" role="alert">{answerErrors[question.id]}</div>}
        </article>
      ))}
    </section>
  </main>
}

function Tests() {
  return <main><div className="page-title"><div><h1>Mock Tests</h1><p>Simulate real placement tests and measure your readiness.</p></div></div>
    <div className="tabs"><button className="tab active">Available Tests</button><button className="tab">My Attempts</button></div>
    <section className="panel test-list">{[
      ["Aptitude Mock Test - 1","Quantitative • Logical • Verbal","60 mins","100 questions",BrainCircuit],
      ["Java Mock Test - 1","Core Java • OOP • Collections","60 mins","50 questions",Braces],
      ["DSA Mock Test - 1","Arrays • Linked List • Trees","90 mins","75 questions",BrainCircuit],
      ["SQL Mock Test - 1","Basic to Advanced SQL","60 mins","50 questions",Database]
    ].map(([t,d,time,q,Icon])=><div className="test-row" key={t}><div className="row-icon"><Icon size={19}/></div><div className="test-info"><b>{t}</b><p>{d}</p><small><Clock3 size={13}/> {time} &nbsp; • &nbsp; {q}</small></div><button className="primary-btn">Start Test</button></div>)}</section>
  </main>
}

function Interview({ user }) {
  const tabs = ["Technical", "HR", "Company Specific"];
  const storageKey = `placementprep.interview:${user?.id || user?.email || "guest"}`;
  const [activeTab, setActiveTab] = useState("Technical");
  const [practiceMode, setPracticeMode] = useState(false);
  const [showAnswer, setShowAnswer] = useState({});
  const [storageError, setStorageError] = useState("");
  const [reviewed, setReviewed] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      const parsed = saved ? JSON.parse(saved) : {};
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(reviewed));
      setStorageError("");
    } catch {
      setStorageError("Interview progress could not be saved in this browser.");
    }
  }, [reviewed, storageKey]);

  const cardData = {
    Technical: {
      title: "Technical Questions",
      stats: "500+ questions",
      desc: "Java, DSA, DBMS, Web & more",
      Icon: Code2,
      questions: [
        {
          id: "tech-1",
          prompt: "Explain the difference between a stack and a queue and where each is useful in interviews.",
          answer: "A stack follows LIFO, useful for recursion, expression evaluation, and undo operations. A queue follows FIFO, useful for task scheduling, breadth-first search, and order-sensitive processing.",
        },
        {
          id: "tech-2",
          prompt: "How do you explain polymorphism in Java with a brief example?",
          answer: "Polymorphism allows one method name to behave differently based on the object type. For example, a parent class Animal can have a speak() method, and Dog and Cat override it with their own implementations.",
        },
        {
          id: "tech-3",
          prompt: "What is the role of indexes in SQL performance?",
          answer: "Indexes help the database quickly locate matching rows instead of scanning every row in a table. They are especially useful on columns used in WHERE, JOIN, and ORDER BY clauses, though too many indexes can slow down writes.",
        },
      ],
    },
    HR: {
      title: "HR Questions",
      stats: "100+ questions",
      desc: "Common HR and behavioral questions",
      Icon: MessagesSquare,
      questions: [
        {
          id: "hr-1",
          prompt: "Tell me about a time you handled pressure or a difficult deadline.",
          answer: "Use the STAR method: describe the Situation, Task, Action, and Result. Focus on staying calm, prioritizing tasks, and delivering a workable outcome under constraints.",
        },
        {
          id: "hr-2",
          prompt: "Why do you want to join this company?",
          answer: "Highlight the company’s values, growth opportunities, and how your skills align with its goals. Mention specific things you have researched rather than speaking in generalities.",
        },
        {
          id: "hr-3",
          prompt: "How do you handle feedback when it is critical?",
          answer: "Listen without interrupting, ask clarifying questions, reflect on the feedback, and create a practical improvement plan. This shows maturity, coaching mindset, and growth orientation.",
        },
      ],
    },
    "Company Specific": {
      title: "Company Specific",
      stats: "50+ companies",
      desc: "Company-wise interview preparation",
      Icon: Building2,
      questions: [
        {
          id: "company-1",
          prompt: "How would you prepare for an aptitude-heavy campus placement round?",
          answer: "Revise arithmetic, percentages, profit-loss, time-speed-distance, and ratio concepts. Practice short timed sets and learn quick mental math shortcuts to improve speed and accuracy.",
        },
        {
          id: "company-2",
          prompt: "What should you focus on for a software company technical round?",
          answer: "Have strong fundamentals in DSA, Java or JavaScript, OOPs, DBMS, and basic system design awareness. Practice explaining your approach clearly while coding.",
        },
        {
          id: "company-3",
          prompt: "How do you prepare for a final interview round?",
          answer: "Research the company, review its products and values, rehearse your introduction, and prepare 3 to 5 stories that show leadership, teamwork, and problem-solving.",
        },
      ],
    },
  };

  const activeCard = cardData[activeTab];

  function toggleAnswer(questionId) {
    setShowAnswer((current) => ({ ...current, [questionId]: !current[questionId] }));
  }

  function toggleReviewed(questionId) {
    setReviewed((current) => ({ ...current, [questionId]: !current[questionId] }));
  }

  return <main>
    <div className="page-title"><div><h1>Interview Preparation</h1><p>Prepare for technical and HR rounds with focused practice.</p></div></div>
    <div className="tabs" role="tablist" aria-label="Interview question categories">{tabs.map((tab) => <button key={tab} role="tab" aria-selected={activeTab === tab} className={`tab ${activeTab === tab ? "active" : ""}`} type="button" onClick={() => { setActiveTab(tab); setPracticeMode(true); }}>{tab}</button>)}</div>
    <div className="interview-grid">{tabs.map((tab) => {
      const entry = cardData[tab];
      const Icon = entry.Icon;
      return <div className="interview-card" key={tab}>
        <div className="big-icon purple"><Icon size={25}/></div>
        <h2>{entry.title}</h2>
        <b>{entry.stats}</b>
        <p>{entry.desc}</p>
        <button className="outline-btn" type="button" onClick={() => { setActiveTab(tab); setPracticeMode(true); }}>Start Practice <ArrowRight size={15}/></button>
      </div>
    })}</div>

    {practiceMode && (
      <section className="panel" style={{ marginTop: 22 }}>
        <div className="panel-head">
          <div><h3>{activeCard.title} Practice</h3><p>Review questions, reveal answers, and mark each one complete.</p></div>
          <button className="text-btn" type="button" onClick={() => setPracticeMode(false)}>Hide practice</button>
        </div>
        {storageError && <p className="api-error" role="status">{storageError}</p>}
        {activeCard.questions.map((question, index) => (
          <article className="question-card" key={question.id}>
            <div className="question-title-row">
              <h4><span>Q{index + 1}</span>{question.prompt}</h4>
              <span className="question-difficulty">{reviewed[question.id] ? "Reviewed" : "Practice"}</span>
            </div>
            {showAnswer[question.id] && (
              <div className="answer-feedback answer-right" style={{ marginTop: 12 }}>
                <strong>Answer:</strong> {question.answer}
              </div>
            )}
            <div className="question-meta" style={{ marginTop: 12 }}><span>{activeTab}</span></div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 14, flexWrap: "wrap" }}>
              <button className="outline-btn" type="button" onClick={() => toggleAnswer(question.id)}>{showAnswer[question.id] ? "Hide Answer" : "Reveal Answer"}</button>
              <button className="primary-btn small" type="button" onClick={() => toggleReviewed(question.id)}>{reviewed[question.id] ? "Unmark" : "Mark Reviewed"}</button>
            </div>
          </article>
        ))}
      </section>
    )}
  </main>
}

function Companies() {
  const companies = [
    { name: "TCS", description: "Tata Consultancy Services", tags: ["Previous Year Questions", "Technical Interviews"], resources: [
      ["TCS Careers", "Explore roles and learn about TCS hiring.", "https://www.tcs.com/careers"],
      ["TCS iON National Qualifier Test", "Official information about the TCS iON NQT.", "https://www.tcsion.com/hub/national-qualifier-test/"],
      ["TCS interview practice", "Practice company-specific interview questions.", "https://www.geeksforgeeks.org/interview-experiences/tcs-interview-experience/"],
    ] },
    { name: "Infosys", description: "Infosys Limited", tags: ["Previous Year Questions", "Interview Questions"], resources: [
      ["Infosys Careers", "Explore careers and open roles at Infosys.", "https://www.infosys.com/careers/"],
      ["Infosys Springboard", "Explore learning and skill development resources.", "https://infyspringboard.onwingspan.com/"],
      ["Infosys interview practice", "Practice company-specific interview questions.", "https://www.geeksforgeeks.org/interview-experiences/infosys-interview-experience/"],
    ] },
    { name: "Wipro", description: "Wipro Limited", tags: ["Previous Year Questions", "Interview Questions"], resources: [
      ["Wipro Careers", "Explore careers and open roles at Wipro.", "https://careers.wipro.com/"],
      ["Wipro interview practice", "Practice company-specific interview questions.", "https://www.geeksforgeeks.org/interview-experiences/wipro-interview-experience/"],
      ["Coding practice", "Strengthen coding skills with practice problems.", "https://www.hackerrank.com/domains"],
    ] },
    { name: "Amazon", description: "Amazon", tags: ["DSA Questions", "Leadership Principles"], resources: [
      ["Amazon Jobs", "Explore roles and prepare for the hiring process.", "https://www.amazon.jobs/"],
      ["Amazon Leadership Principles", "Review the principles used in Amazon interviews.", "https://www.amazon.jobs/content/en/our-workplace/leadership-principles"],
      ["Amazon interview preparation", "Review Amazon's official interview preparation resources.", "https://www.amazon.jobs/content/en/how-we-hire/interview-prep"],
    ] },
    { name: "Microsoft", description: "Microsoft Corporation", tags: ["Technical Interviews", "Career Opportunities"], resources: [
      ["Microsoft Careers", "Explore roles and career opportunities at Microsoft.", "https://careers.microsoft.com/"],
      ["Microsoft Learn", "Build technical skills with Microsoft learning paths.", "https://learn.microsoft.com/training/"],
      ["Microsoft interview practice", "Practice company-specific interview questions.", "https://www.geeksforgeeks.org/interview-experiences/microsoft-interview-experience/"],
    ] },
  ];
  const [search, setSearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const filters = ["All", "TCS", "Infosys", "Wipro", "Amazon", "Microsoft"];
  const filteredCompanies = companies.filter((company) => {
    const matchesFilter = selectedFilter === "All" || company.name === selectedFilter;
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || `${company.name} ${company.description} ${company.tags.join(" ")}`.toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });

  useEffect(() => {
    if (!selectedCompany) return undefined;
    function closeOnEscape(event) {
      if (event.key === "Escape") setSelectedCompany(null);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selectedCompany]);

  return <main><div className="page-title"><div><h1>Company Resources</h1><p>Prepare smarter with company-specific resources.</p></div></div>
    <div className="chips">{filters.map((filter) => <button className={`chip ${selectedFilter === filter ? "active" : ""}`} key={filter} onClick={() => setSelectedFilter(filter)}>{filter}</button>)}</div>
    <div className="page-title company-search"><span>{filteredCompanies.length} companies</span><div className="search-box"><Search size={17}/><input placeholder="Search companies..." value={search} onChange={(event) => setSearch(event.target.value)}/></div></div>
    <section className="panel">
      {filteredCompanies.map((company) => <div className="company-row" key={company.name}>
        <div className="company-logo">{company.name[0]}</div>
        <div className="company-info"><b>{company.name}</b><small>{company.description}</small><div className="mini-tags">{company.tags.map((tag) => <span key={tag}>{tag}</span>)}<span>Preparation Guide</span></div></div>
        <button className="outline-btn" onClick={() => setSelectedCompany(company)}>View Resources <ArrowRight size={15}/></button>
      </div>)}
      {filteredCompanies.length === 0 && <div className="api-empty">No companies match your search.</div>}
    </section>
    {selectedCompany && <div className="resource-overlay" onMouseDown={(event) => {
      if (event.target === event.currentTarget) setSelectedCompany(null);
    }}>
      <section className="resource-dialog" role="dialog" aria-modal="true" aria-labelledby="resource-title">
        <div className="resource-dialog-header">
          <div><h2 id="resource-title">{selectedCompany.name} Resources</h2><p>Official links and interview preparation resources</p></div>
          <button className="resource-close" aria-label="Close resources" onClick={() => setSelectedCompany(null)}><X size={20}/></button>
        </div>
        <div className="resource-links">{selectedCompany.resources.map(([title, description, url]) => <a className="resource-link" href={url} key={title} target="_blank" rel="noreferrer">
          <div><b>{title}</b><small>{description}</small></div><ArrowRight size={17}/>
        </a>)}</div>
      </section>
    </div>}
  </main>
}

function Progress() {
  return <main><div className="page-title"><div><h1>My Progress</h1><p>Track your preparation and identify areas to improve.</p></div></div>
    <section className="two-col">
      <div className="panel score-panel"><h3>Placement Readiness Score</h3><div className="score-large"><Score score={78}/><div><h2>Good Progress!</h2><p>You are on the right track. Keep practicing consistently.</p><button className="primary-btn">View Detailed Report</button></div></div></div>
      <div className="panel"><h3>Strengths</h3>{["Logical Reasoning","Java Basics","SQL Queries","Problem Solving"].map(x=><div className="strength" key={x}><CheckCircle2 size={18}/><b>{x}</b></div>)}</div>
    </section>
    <section className="panel"><div className="panel-head"><div><h3>Subject-wise Performance</h3><p>Your latest practice performance</p></div></div>
      {[["Aptitude",72],["Java",68],["DSA",60],["SQL",75]].map(([x,v])=><div className="performance" key={x}><span>{x}</span><div className="bar"><i style={{width:`${v}%`}}/></div><b>{v}%</b></div>)}
    </section>
  </main>
}

function Profile({ user, onUpdateUser }) {
  const defaultSkills = ["Java", "Python", "SQL", "DSA", "HTML", "CSS", "React"];
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSkillsOpen, setIsSkillsOpen] = useState(false);
  const [showPlan, setShowPlan] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    college: user?.college || "",
  });
  const [skills, setSkills] = useState(Array.isArray(user?.skills) && user.skills.length ? user.skills : defaultSkills);

  useEffect(() => {
    setProfileForm({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      college: user?.college || "",
    });
    setSkills(Array.isArray(user?.skills) && user.skills.length ? user.skills : defaultSkills);
  }, [user]);

  function handleProfileSubmit(event) {
    event.preventDefault();
    const nextUser = {
      ...user,
      name: profileForm.name.trim() || user.name,
      email: profileForm.email.trim() || user.email,
      phone: profileForm.phone.trim(),
      college: profileForm.college.trim(),
    };
    onUpdateUser(nextUser);
    setIsProfileOpen(false);
  }

  function toggleSkill(skill) {
    setSkills((currentSkills) => {
      if (currentSkills.includes(skill)) {
        return currentSkills.filter((value) => value !== skill);
      }
      return [...currentSkills, skill];
    });
  }

  function handleSkillSave() {
    onUpdateUser({ ...user, skills });
    setIsSkillsOpen(false);
  }

  const skillOptions = ["Java", "Python", "SQL", "DSA", "HTML", "CSS", "React", "C++", "Spring Boot", "MongoDB", "AWS"];
  const profileSkills = skills.length ? skills : defaultSkills;

  return <main>
    <div className="page-title">
      <div><h1>My Profile</h1><p>Manage your details and placement skills.</p></div>
      <button type="button" className="primary-btn" onClick={() => setIsProfileOpen(true)}>Edit Profile</button>
    </div>

    <section className="profile-grid">
      <div className="panel profile-main">
        <div className="profile-head">
          <div className="profile-avatar">{user.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</div>
          <div><h2>{user.name}</h2><p>{user.email}</p></div>
        </div>
        <hr/>
        <h3>Personal Information</h3>
        <div className="info-grid">
          <div><small>Name</small><b>{user.name}</b></div>
          <div><small>Email</small><b>{user.email}</b></div>
          <div><small>Phone</small><b>{user.phone || "Not added"}</b></div>
          <div><small>College</small><b>{user.college || "Not added"}</b></div>
        </div>
      </div>

      <div className="panel">
        <h3>Skills</h3>
        <div className="skill-tags">{profileSkills.map((skill) => <span key={skill}>{skill}</span>)}</div>
        <button type="button" className="outline-btn" onClick={() => setIsSkillsOpen(true)}>Edit Skills</button>
        <div className="plan-box">
          <Sparkles size={22}/>
          <div>
            <b>Personalized Preparation Plan</b>
            <p>{showPlan ? "Your study plan is ready: strengthen Java fundamentals, solve 3 DSA arrays problems, and revise SQL joins before your next mock test." : "Your plan will be generated based on your progress."}</p>
          </div>
          <button type="button" className="text-btn" onClick={() => setShowPlan((value) => !value)}>{showPlan ? "Hide Plan" : "View Plan"}</button>
        </div>
      </div>
    </section>

    {isProfileOpen && (
      <div style={{ position: "fixed", inset: 0, background: "rgba(17, 24, 39, 0.35)", display: "grid", placeItems: "center", zIndex: 40 }}>
        <div style={{ background: "#fff", borderRadius: 16, width: "min(520px, calc(100% - 24px))", padding: 24, border: "1px solid #e6eaf2", boxShadow: "0 18px 50px rgba(15,23,42,.18)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <h3 style={{ margin: 0 }}>Edit Profile</h3>
            <button type="button" className="text-btn" onClick={() => setIsProfileOpen(false)}>Close</button>
          </div>
          <form onSubmit={handleProfileSubmit} style={{ display: "grid", gap: 14 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 12, color: "#5d6881", fontWeight: 600 }}>Name</span>
              <input value={profileForm.name} onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))} style={{ border: "1px solid #dfe4f1", borderRadius: 10, padding: "10px 12px" }} />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 12, color: "#5d6881", fontWeight: 600 }}>Email</span>
              <input type="email" value={profileForm.email} onChange={(event) => setProfileForm((current) => ({ ...current, email: event.target.value }))} style={{ border: "1px solid #dfe4f1", borderRadius: 10, padding: "10px 12px" }} />
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: 12, color: "#5d6881", fontWeight: 600 }}>Phone</span>
                <input value={profileForm.phone} onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value }))} style={{ border: "1px solid #dfe4f1", borderRadius: 10, padding: "10px 12px" }} placeholder="Phone number" />
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: 12, color: "#5d6881", fontWeight: 600 }}>College</span>
                <input value={profileForm.college} onChange={(event) => setProfileForm((current) => ({ ...current, college: event.target.value }))} style={{ border: "1px solid #dfe4f1", borderRadius: 10, padding: "10px 12px" }} placeholder="College name" />
              </label>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
              <button type="button" className="outline-btn" onClick={() => setIsProfileOpen(false)}>Cancel</button>
              <button type="submit" className="primary-btn">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    )}

    {isSkillsOpen && (
      <div style={{ position: "fixed", inset: 0, background: "rgba(17, 24, 39, 0.35)", display: "grid", placeItems: "center", zIndex: 40 }}>
        <div style={{ background: "#fff", borderRadius: 16, width: "min(560px, calc(100% - 24px))", padding: 24, border: "1px solid #e6eaf2", boxShadow: "0 18px 50px rgba(15,23,42,.18)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <h3 style={{ margin: 0 }}>Edit Skills</h3>
            <button type="button" className="text-btn" onClick={() => setIsSkillsOpen(false)}>Close</button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 18 }}>
            {skillOptions.map((skill) => (
              <button
                key={skill}
                type="button"
                className={skills.includes(skill) ? "primary-btn small" : "outline-btn"}
                onClick={() => toggleSkill(skill)}
                style={{
                  padding: "8px 12px",
                  borderRadius: 999,
                  background: skills.includes(skill) ? "#5146e5" : "#fff",
                  color: skills.includes(skill) ? "#fff" : "#5146e5",
                  border: skills.includes(skill) ? "1px solid #5146e5" : "1px solid #dfe4f1",
                }}
              >
                {skill}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button type="button" className="outline-btn" onClick={() => setIsSkillsOpen(false)}>Cancel</button>
            <button type="button" className="primary-btn" onClick={handleSkillSave}>Save Skills</button>
          </div>
        </div>
      </div>
    )}
  </main>
}

export default function App() {
  const [active, setActive] = useState("Dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(() => {
    const savedSession = getSavedSession();
    if (!savedSession) return null;
    return {
      ...savedSession,
      phone: savedSession.phone || "",
      college: savedSession.college || "",
      skills: Array.isArray(savedSession.skills) && savedSession.skills.length ? savedSession.skills : ["Java", "Python", "SQL", "DSA", "HTML", "CSS", "React"],
    };
  });

  function handleLogout() {
    clearSession();
    setUser(null);
  }

  function handleUserUpdate(nextUser) {
    const mergedUser = {
      ...user,
      ...nextUser,
      name: nextUser.name || user.name,
      email: nextUser.email || user.email,
      phone: nextUser.phone || "",
      college: nextUser.college || "",
      skills: Array.isArray(nextUser.skills) && nextUser.skills.length ? nextUser.skills : user.skills,
    };
    saveSession(mergedUser);
    setUser(mergedUser);
  }

  if (!user) {
    return <AuthScreen onAuthenticated={(session) => {
      const enrichedSession = {
        ...session,
        phone: session.phone || "",
        college: session.college || "",
        skills: Array.isArray(session.skills) && session.skills.length ? session.skills : ["Java", "Python", "SQL", "DSA", "HTML", "CSS", "React"],
      };
      saveSession(enrichedSession);
      setUser(enrichedSession);
    }} />;
  }

  const pages = {Dashboard:<Dashboard user={user}/>, "My Profile":<Profile user={user} onUpdateUser={handleUserUpdate}/>, Practice:<Practice/>, "Mock Tests":<Tests/>, "Interview Prep":<Interview user={user}/>, "Company Resources":<Companies/>, "My Progress":<Progress/>};
  return <div className="app"><Sidebar active={active} setActive={setActive} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} onLogout={handleLogout}/><div className="content"><Header setMobileOpen={setMobileOpen} user={user} onLogout={handleLogout}/>{pages[active]}</div></div>
}

function AuthScreen({ onAuthenticated }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const session = await apiRequest(`/auth/${isRegistering ? "register" : "login"}`, {
        method: "POST",
        body: JSON.stringify(form),
      });
      onAuthenticated(session);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  function switchMode() {
    setIsRegistering((registering) => !registering);
    setError("");
  }

  return <div className="auth-page">
    <section className="auth-card">
      <div className="auth-brand"><div className="brand-mark"><Award size={19}/></div><span>PlacementPrep</span></div>
      <h1>{isRegistering ? "Create your account" : "Welcome back"}</h1>
      <p>{isRegistering ? "Register to start your placement preparation." : "Sign in to continue your placement preparation."}</p>
      <form className="auth-form" onSubmit={handleSubmit}>
        {isRegistering && <label>Name<input autoComplete="name" required value={form.name} onChange={(event) => setForm({...form, name: event.target.value})}/></label>}
        <label>Email<input type="email" autoComplete="email" required value={form.email} onChange={(event) => setForm({...form, email: event.target.value})}/></label>
        <label>Password<input type="password" autoComplete={isRegistering ? "new-password" : "current-password"} required minLength={isRegistering ? 6 : undefined} value={form.password} onChange={(event) => setForm({...form, password: event.target.value})}/></label>
        {error && <div className="auth-error" role="alert">{error}</div>}
        <button className="primary-btn" type="submit" disabled={submitting}>{submitting ? "Please wait..." : isRegistering ? "Create account" : "Sign in"}</button>
      </form>
      <button className="auth-toggle" type="button" onClick={switchMode}>{isRegistering ? "Already have an account? Sign in" : "New here? Create an account"}</button>
    </section>
  </div>;
}