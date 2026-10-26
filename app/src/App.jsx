import { useEffect, useId, useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Check,
  CaretDown,
  Heart,
  ChatCircle,
  UserCircle,
  Scales,
  Fire,
  Clock,
  ArrowUpRight,
  X,
  CheckCircle,
  SoccerBall,
} from "@phosphor-icons/react";
import { matches, teams, courtState, makeComments, demoRemaining } from "./data";
import { courtCrests } from "./crest-assets";
import { leagues, standingsSnapshot } from "./standings-data";
import { Community, News, QualificationLegend, rankZone } from "./ContentPages";
import { forumTopics, makeForumComments } from "./content-data";
import { COURT_ONLY, parseShowcaseRoute } from "./showcase-config";
import { CourtStateFilter } from "./CourtStateFilter";
import { LandingPage } from "./LandingPage";
const ScoreLink = COURT_ONLY ? "div" : "a";
const sides = { red: "正方", blue: "反方", neutral: "不站队", hot: "热评" };
const parseRoute = () => parseShowcaseRoute(location.hash, matches);
const go = (path = "") => (location.hash = "/" + path);
function HUWordmark() {
  return <svg className="hu-wordmark" viewBox="0 0 88 64" aria-hidden="true" focusable="false">
    <g fill="currentColor">
      <path d="M6 8h9v18h12c8 0 12 4 12 12v17h-9V39c0-3-1-5-5-5H15v21H6Z" />
      <path d="M47 26h9v16c0 4 2 5 6 5h10V26h9v29H61c-9 0-14-4-14-13Z" />
    </g>
  </svg>;
}
function OpeningScales() {
  return <svg className="entrance-scales" width="76" height="76" viewBox="0 0 96 96" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M48 17v61M35 79h26" />
    <g className="scale-beam">
      <path d="M17 31h62" />
      <g className="scale-pan left"><path d="M17 31 6 55h22L17 31M6 55c0 8 22 8 22 0" /></g>
      <g className="scale-pan right"><path d="m79 31-11 24h22L79 31M68 55c0 8 22 8 22 0" /></g>
    </g>
    <circle cx="48" cy="31" r="3" fill="currentColor" stroke="none" />
  </svg>;
}
function LeagueLogo({ league }) {
  return <img className="league-logo" src={league.logo} alt={league.name + "标识"} />;
}
function Crest({ team, large = false, court = false }) {
  return (
    <span className={"crest-frame" + (large ? " large" : "")}>
      <img
        className={"crest " + (large ? "large" : "")}
        src={(court && courtCrests[team.id]) || team.crest || "https://crests.football-data.org/" + team.id + ".svg"}
        alt={team.name + "队徽"}
      />
    </span>
  );
}
function Badge({ match, now }) {
  const s = courtState(match, now);
  return (
    <span className={"badge " + s}>
      {s === "open"
        ? "开庭中"
        : s === "closed"
          ? "已结案"
          : s === "live"
            ? "进行中 67′"
            : "未开赛"}
    </span>
  );
}
function Remaining({ startedAt, now }) {
  const seconds = Math.ceil(demoRemaining(startedAt, now) / 1000);
  const clock = [Math.floor(seconds / 3600), Math.floor(seconds % 3600 / 60), seconds % 60].map(n => String(n).padStart(2, "0")).join(":");
  return <span>演示倒计时 <b>{clock}</b></span>;
}
function OpinionTitle({ text }) {
  const i = text.indexOf("，");
  return i < 0 ? (
    text
  ) : (
    <>
      <span>{text.slice(0, i + 1)}</span>
      <span>{text.slice(i + 1)}</span>
    </>
  );
}
function AnimatedNumber({ value, animateOnMount = false }) {
  const initial = animateOnMount && !window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : value;
  const [display, setDisplay] = useState(initial);
  const previous = useRef(initial);
  useEffect(() => {
    const from = previous.current;
    previous.current = value;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }
    let frame;
    const started = performance.now();
    const tick = (time) => {
      const progress = Math.min(1, (time - started) / 720);
      setDisplay(Math.round(from + (value - from) * (1 - (1 - progress) ** 3)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return display.toLocaleString("zh-CN");
}
function SupportBar({ match, vote, revealed = true }) {
  const red = match.votes[0] + (vote === 0 ? 1 : 0);
  const blue = match.votes[1] + (vote === 1 ? 1 : 0);
  const percent = red + blue ? Math.round(red / (red + blue) * 100) : 50;
  return (
    <div className="support-summary">
      <div className="support-heading"><span>正反方对抗</span><small>双方支持率 · 不站队单独计入</small></div>
      <div className="duel-meter" role="img" aria-label={`正方 ${percent}%，反方 ${100 - percent}%`}>
        <div className="duel-half affirmative" style={{ width: percent + "%" }}><span>正方</span><strong><AnimatedNumber animateOnMount value={revealed ? percent : 0} /><small>%</small></strong></div>
        <span className="duel-vs" style={{ left: percent + "%" }}>VS</span>
        <div className="duel-half opposing" style={{ width: (100 - percent) + "%" }}><strong><AnimatedNumber animateOnMount value={revealed ? 100 - percent : 0} /><small>%</small></strong><span>反方</span></div>
      </div>
      <div className="support-counts"><span><AnimatedNumber animateOnMount value={revealed ? red : 0} /> 人支持正方</span><span><AnimatedNumber animateOnMount value={revealed ? blue : 0} /> 人支持反方</span></div>
    </div>
  );
}
function Score({ match }) {
  return (
    <div className="score">
      {match.score ? (
        <>
          {match.score[0]}
          <span>:</span>
          {match.score[1]}
        </>
      ) : (
        <span className="vs">VS</span>
      )}
    </div>
  );
}
export function App() {
  const [route, setRoute] = useState(parseRoute),
    [now, setNow] = useState(Date.now()),
    [followed, setFollowed] = useState([]),
    [intro, setIntro] = useState(null),
    [toast, setToast] = useState("");
  const [comments, setComments] = useState(() =>
      Object.fromEntries([...matches.map((m) => [m.id, makeComments(m)]), ...(!COURT_ONLY ? forumTopics.filter(t => !t.matchId).map(t => [t.id, makeForumComments(t)]) : [])]),
    ),
    [votes, setVotes] = useState({}),
    [liked, setLiked] = useState({});
  const [customTopics, setCustomTopics] = useState([]);
  const [profile, setProfile] = useState(false),
    [nickname, setNickname] = useState("我"),
    [draftName, setDraftName] = useState("");
  const introRef = useRef(null),
    modalRef = useRef(null),
    mainRef = useRef(null);
  useEffect(() => {
    let wasIntroduction = COURT_ONLY && !parseRoute()[0];
    const change = () => {
      const nextRoute = parseRoute();
      const isIntroduction = COURT_ONLY && !nextRoute[0];
      const boundaryChanged = wasIntroduction !== isIntroduction;
      wasIntroduction = isIntroduction;
      const update = () => { setRoute(nextRoute); window.scrollTo(0, 0); };
      if (boundaryChanged && document.startViewTransition && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        const transition = document.startViewTransition(() => flushSync(update));
        transition.ready.catch(() => {});
      } else update();
    };
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    if (!intro) return;
    introRef.current?.focus();
    const timer = setTimeout(() => {
      setIntro(null);
      go("court/" + intro.id);
    }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 500 : 1800);
    return () => clearTimeout(timer);
  }, [intro]);
  useEffect(() => {
    if (profile) modalRef.current?.focus();
  }, [profile]);
  useEffect(() => {
    if (route.length && !intro) mainRef.current?.focus({ preventScroll: true });
  }, [route.join("/"), intro]);
  const match = matches.find((m) => m.id === route[1]),
    home = COURT_ONLY ? route[0] === "courts" : !route[0] || route[0] === "following";
  const courtVisit = route[0] === "court" ? route[1] : null;
  const [visit, setVisit] = useState(() => ({ id: courtVisit, startedAt: Date.now() }));
  useEffect(() => {
    setVisit({ id: courtVisit, startedAt: Date.now() });
  }, [courtVisit]);
  const enter = (m) => {
    const s = courtState(m, now);
    if (s === "open") {
      setVisit({ id: m.id, startedAt: Date.now() });
      setIntro(m);
      go("court/" + m.id);
    }
    else if (s === "closed") go("court/" + m.id + "/records");
  };
  const follow = (m) => {
    setFollowed((f) =>
      f.includes(m.id) ? f.filter((id) => id !== m.id) : [...f, m.id],
    );
    setToast(followed.includes(m.id) ? "已取消关注" : "已加入我的关注");
  };
  const cast = (id, side) => {
    setVotes((v) => ({ ...v, [id]: side }));
    setToast("已投票，可以修改选择");
  };
  const like = (id) => setLiked((l) => ({ ...l, [id]: !l[id] }));
  const addComment = (id, side, text) => {
    setComments((c) => ({
      ...c,
      [id]: [
        {
          id: crypto.randomUUID(),
          side,
          name: nickname,
          text,
          likes: 0,
          time: "刚刚",
          createdAt: Date.now(),
          replies: [],
        },
        ...c[id],
      ],
    }));
    setToast("发言已加入本次体验");
  };
  const addTopic = ({ spaceId, title, summary }) => {
    const id = "forum-" + crypto.randomUUID();
    setCustomTopics(t => [{ id, spaceId, title, summary, author: nickname, category: "球迷看台", createdAt: Date.now(), demo: false }, ...t]);
    setComments(c => ({ ...c, [id]: [] }));
    setToast("帖子已加入本次体验");
    return id;
  };
  const addReply = (id, parent, text) => {
    setComments((c) => ({
      ...c,
      [id]: c[id].map((x) =>
        x.id === parent
          ? {
              ...x,
              replies: [
                ...x.replies,
                { id: crypto.randomUUID(), name: nickname, text, likes: 0 },
              ],
            }
          : x,
      ),
    }));
    setToast("回复已加入本次体验");
  };
  if (COURT_ONLY && !route[0]) return <LandingPage Wordmark={HUWordmark} />;
  return (
    <>
      <div className="site-atmosphere" aria-hidden="true" />
      {home && <div className="stadium-background" aria-hidden="true" />}
      <div className={"site-shell " + (COURT_ONLY ? "court-only " : "") + (route[0] === "court" ? "court-shell" : "")} inert={intro ? true : undefined}>
        <header className="topbar glass">
          <a className="brand" href="#/" aria-label="HU 首页">
            <HUWordmark />
          </a>
          <nav className="main-nav" aria-label="主导航">
            <a
              className={!route[0] || ["courts", "match", "court"].includes(route[0]) ? "selected" : ""}
              href={COURT_ONLY ? "#/courts" : "#/"}
            >
              {COURT_ONLY ? "赛后小法庭" : "比赛"}
            </a>
            {!COURT_ONLY && <>
            <a className={["standings", "scorers"].includes(route[0]) ? "selected" : ""} href="#/standings">积分榜</a>
            <a className={route[0] === "community" ? "selected" : ""} href="#/community">社区</a>
            <a className={route[0] === "news" ? "selected" : ""} href="#/news">资讯</a>
            <a
              className={route[0] === "following" ? "selected" : ""}
              href="#/following"
            >
              我的关注
            </a>
            </>}
          </nav>
          <button
            className="profile-button icon-button"
            aria-label="设置体验昵称"
            onClick={() => {
              setDraftName(nickname === "我" ? "" : nickname);
              setProfile(true);
            }}
          >
            <UserCircle size={28} />
          </button>
        </header>
        <main ref={mainRef} tabIndex={-1}>
          {!COURT_ONLY && route[0] === "community" ? (
            <Community key={route.slice(1).join("/")} segments={route.slice(1)} customTopics={customTopics} addTopic={addTopic} comments={comments} liked={liked} like={like} addComment={addComment} addReply={addReply} enter={enter} Thread={Thread} Crest={Crest} />
          ) : !COURT_ONLY && route[0] === "news" ? (
            <News articleId={route[1]} Crest={Crest} />
          ) : !COURT_ONLY && route[0] === "scorers" ? (
            <Standings leagueId={route[1]} />
          ) : !COURT_ONLY && route[0] === "standings" ? (
            <Standings leagueId={route[1]} />
          ) : home ? (
            <Home
              followed={followed}
              following={route[0] === "following"}
              now={now}
              enter={enter}
              follow={follow}
            />
          ) : !match ? (
            <section className="panel empty">
              <h1>这场比赛暂未收录。</h1>
              <a href={COURT_ONLY ? "#/courts" : "#/"}>返回比赛</a>
            </section>
          ) : !COURT_ONLY && route[0] === "match" ? (
            <MatchDetail
              match={match}
              now={now}
              tab={route[2] || "overview"}
              enter={enter}
              follow={follow}
              followed={followed.includes(match.id)}
            />
          ) : (
            <Court
              key={match.id}
              startedAt={visit.startedAt}
              opening={!!intro}
              enter={enter}
              match={match}
              now={now}
              section={route[2] || "debate"}
              comments={comments[match.id]}
              vote={votes[match.id]}
              cast={cast}
              liked={liked}
              like={like}
              addComment={addComment}
              addReply={addReply}
            />
          )}
        </main>
        <footer>
          <span className="footer-brand">HU</span>
          <span>{COURT_ONLY ? "赛后小法庭 · 互动作品展示" : ["standings", "scorers"].includes(route[0]) ? "积分榜 · ESPN 数据快照" : ["community", "news"].includes(route[0]) ? "中文内容 · 初版体验" : "示例比赛 · 前端互动体验"}</span>
          <span>发言和投票仅保留在本次体验</span>
        </footer>
      </div>
      {intro && (
        <div
          className="court-entrance"
          role="dialog"
          aria-modal="true"
          aria-label="正在进入法庭"
          ref={introRef}
          tabIndex={-1}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setIntro(null);
              go("court/" + intro.id);
            }
            if (e.key === "Tab") {
              e.preventDefault();
              introRef.current?.querySelector("button")?.focus();
            }
          }}
        >
          <div className="entrance-curtain upper" aria-hidden="true" /><div className="entrance-curtain lower" aria-hidden="true" />
          <div className="entrance-screen">
            <OpeningScales />
            <h2>赛后小法庭</h2>
            <p className="entrance-subtitle">全体起立</p>
            <p className="entrance-matchup">
              {teams[intro.home].name} <span>VS</span> {teams[intro.away].name}
            </p>
            <button
              onClick={() => {
                setIntro(null);
                go("court/" + intro.id);
              }}
            >
              直接进入 <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
      {toast && (
        <div className="toast" role="status">
          <CheckCircle size={20} />
          {toast}
        </div>
      )}
      {profile && (
        <div className="modal-backdrop" onClick={() => setProfile(false)}>
          <section
            className="profile-modal panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-title"
            ref={modalRef}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Escape") setProfile(false);
              if (e.key === "Tab") {
                const els = modalRef.current.querySelectorAll("button,input"),
                  first = els[0],
                  last = els[els.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                  e.preventDefault();
                  last.focus();
                }
                if (!e.shiftKey && document.activeElement === last) {
                  e.preventDefault();
                  first.focus();
                }
              }
            }}
          >
            <button
              className="icon-button close-modal"
              onClick={() => setProfile(false)}
              aria-label="关闭昵称设置"
            >
              <X size={22} />
            </button>
            <h2 id="profile-title">你在看台的名字</h2>
            <p>设置本次体验的昵称。</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setNickname(draftName.trim() || "我");
                setProfile(false);
                setToast("昵称已更新");
              }}
            >
              <label htmlFor="nickname">昵称</label>
              <input
                id="nickname"
                maxLength={16}
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="比如：周末看台"
              />
              <button className="button primary">保存昵称</button>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
function Standings({ leagueId }) {
  const [fullStats, setFullStats] = useState(false);
  const league = leagues.find((l) => l.id === leagueId) || leagues[0];
  return <section className="standings-page">
    <div className="standings-page-heading"><div><p className="eyebrow">2026–27 赛季</p><h1>积分榜</h1></div><span>更新于 {standingsSnapshot}</span></div>
    <nav className="standings-tabs" aria-label="选择积分榜赛事">
      {leagues.map((l) => <a className={league.id === l.id ? "selected" : ""} aria-current={league.id === l.id ? "page" : undefined} key={l.id} href={"#/standings/" + l.id}><LeagueLogo league={l} /><span>{l.name}</span></a>)}
    </nav>
    <div className="standings-table-panel panel">
      <header><LeagueLogo league={league} /><div><h2>{league.name}{league.id === "uefa.champions" ? " · 联赛阶段" : ""}</h2><p>{league.id === "uefa.champions" ? "联赛阶段排名" : "积分与净胜球"}</p></div><span>{league.teams.length} 支球队</span></header>
      <button className="standings-expand" onClick={() => setFullStats((v) => !v)} aria-pressed={fullStats}>{fullStats ? "收起详细数据" : "展开完整数据"} <CaretDown size={14} /></button>
      <div className={"standings-scroll" + (fullStats ? " full-stats" : "")} role="region" aria-label={league.name + "完整积分榜，可横向滚动"} tabIndex={0}>
        <table><caption className="sr-only">{league.name} 2026–27 积分榜，数据快照 {standingsSnapshot}</caption>
          <thead><tr><th scope="col">排名</th><th scope="col">球队</th><th scope="col">场次</th><th scope="col" className="detail-stat">胜</th><th scope="col" className="detail-stat">平</th><th scope="col" className="detail-stat">负</th><th scope="col" className="detail-stat">进 / 失</th><th scope="col">净胜球</th><th scope="col">积分</th></tr></thead>
          <tbody>{league.teams.map((t) => <tr key={t.id} className={"rank-zone " + rankZone(league.id, t.rank).className}><td><span className="table-rank" title={rankZone(league.id, t.rank).label}>{t.rank}</span></td><th scope="row"><div className="standings-team"><img src={t.logo} alt="" loading="lazy" /><span title={t.originalName}>{t.name}</span></div></th><td>{t.played}</td><td className="detail-stat">{t.won}</td><td className="detail-stat">{t.drawn}</td><td className="detail-stat">{t.lost}</td><td className="detail-stat">{t.for} / {t.against}</td><td>{t.difference > 0 ? "+" : ""}{t.difference}</td><td className="table-points">{t.points}</td></tr>)}</tbody>
        </table>
      </div>
      <QualificationLegend leagueId={league.id} />
      <div className="standings-source"><span>数据快照 · {standingsSnapshot} · 非实时更新</span><a href={league.source} target="_blank" rel="noreferrer">数据来源 ESPN <ArrowUpRight size={14} /></a></div>
    </div>
  </section>;
}
function Home({ followed, following, now, enter, follow }) {
  const [filter, setFilter] = useState(COURT_ONLY ? "open" : "all");
  const visible = matches.filter(
    (m) =>
      (!following || followed.includes(m.id)) &&
      (filter === "all" || courtState(m, now) === filter),
  );
  return (
    <>
      <section className="home-hero">
        <p className="eyebrow">{COURT_ONLY ? "赛后小法庭" : "2026年10月11日 · 星期日 · 示例赛程"}</p>
        <h1>
          {following ? "把喜欢的比赛，留在这里。" : "比赛结束，聊个明白。"}
        </h1>
        {COURT_ONLY && <p className="court-lobby-intro">说说你的观点，或投上一票。</p>}
        <div className="hero-controls">
          <span>{COURT_ONLY ? "选择一场，开始讨论" : following ? "我的关注" : "今日比赛"}</span>
          {COURT_ONLY ? <CourtStateFilter value={filter} onChange={setFilter} /> : <label className="filter-select">
            <select
              aria-label="筛选比赛状态"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">{COURT_ONLY ? "全部法庭" : "全部比赛"}</option>
              <option value="open">开庭中</option>
              <option value="closed">已结案</option>
              <option value="scheduled">{COURT_ONLY ? "预约中" : "未开赛"}</option>
              <option value="live">{COURT_ONLY ? "完赛后开庭" : "进行中"}</option>
            </select>
            <CaretDown size={17} />
          </label>}
        </div>
      </section>
      {!COURT_ONLY && !following && <nav className="competition-strip" aria-label="赛事积分榜">
        {leagues.map((league) => <a key={league.id} href={"#/standings/" + league.id}>
          <LeagueLogo league={league} /><span>{league.name}</span><ArrowUpRight size={14} />
        </a>)}
      </nav>}
      {visible.length ? (
        ["欧冠", "英超", "西甲", "德甲", "意甲", "法甲"].map((league) => {
          const group = visible.filter((m) => m.league === league);
          return group.length ? (
            <section
              className="league-panel panel"
              data-league={league}
              key={league}
              aria-label={league + "比赛"}
            >
              <img className="league-watermark" src={leagues.find((l) => l.name === league).logo} alt="" aria-hidden="true" />
              <h2>
                <LeagueLogo league={leagues.find((l) => l.name === league)} />
                {league}
                <span>{group.length}场</span>
                {!COURT_ONLY && <a className="league-table-link" href={"#/standings/" + leagues.find((l) => l.name === league).id}>积分榜 <ArrowUpRight size={14} /></a>}
              </h2>
              {group.map((m) => (
                <article className="match-row" key={m.id}>
                  <div className="row-status">
                    <span>
                      {m.state === "finished"
                        ? "全场结束"
                        : m.state === "live"
                          ? "正在比赛"
                          : "即将开始"}
                    </span>
                    <Badge match={m} now={now} />
                  </div>
                  <ScoreLink
                    className="match-score-link"
                    href={COURT_ONLY ? undefined : "#/match/" + m.id}
                    aria-label={
                      teams[m.home].name +
                      "对" +
                      teams[m.away].name +
                      (COURT_ONLY ? "，示例比分" : "，查看比分和赛况")
                    }
                  >
                    <div className="row-team home">
                      <span>{teams[m.home].name}</span>
                      <Crest team={teams[m.home]} />
                    </div>
                    <div className="score-group">
                      <Score match={m} />
                      {!COURT_ONLY && <span className="score-hint">查看赛况</span>}
                    </div>
                    <div className="row-team away">
                      <Crest team={teams[m.away]} />
                      <span>{teams[m.away].name}</span>
                    </div>
                    {COURT_ONLY && <span className="court-case-question">{m.topic || "终场之后，再来聊聊。"}</span>}
                  </ScoreLink>
                  <div className="row-action">
                    {m.state === "scheduled" ? (
                      <button
                        className={
                          "button " +
                          (followed.includes(m.id) ? "subtle" : "outline")
                        }
                        onClick={() => follow(m)}
                      >
                        {followed.includes(m.id) ? (
                          <Check size={18} />
                        ) : (
                          <Bell size={18} />
                        )}{" "}
                        {followed.includes(m.id) ? "已预约" : "预约法庭"}
                      </button>
                    ) : m.state === "live" ? (
                      <button className="button subtle" disabled>
                        完赛后开庭
                      </button>
                    ) : (
                      <button
                        className={
                          "button " +
                          (courtState(m, now) === "open" ? "primary" : "subtle")
                        }
                        onClick={() => enter(m)}
                      >
                        {courtState(m, now) === "open"
                          ? "进入法庭"
                          : "查看结果"}
                        <ArrowRight size={18} />
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </section>
          ) : null;
        })
      ) : (
        <section className="panel empty">
          <Bell size={40} weight="light" />
          <h2>{following ? "还没有关注的比赛" : COURT_ONLY ? "暂无符合条件的法庭" : "暂无符合条件的比赛"}</h2>
          <p>
            {following
              ? "预约一场比赛，就会出现在这里。"
              : "换个筛选条件看看。"}
          </p>
          <a className="button primary" href={COURT_ONLY ? "#/courts" : "#/"}>
            {COURT_ONLY ? "返回法庭大厅" : "去看比赛"} <ArrowRight size={18} />
          </a>
        </section>
      )}
    </>
  );
}
function MatchHeader({ match, now, court = false }) {
  return (
    <section
      className={"match-header panel" + (court ? " court-score-header" : "")}
    >
      <div className="match-meta">
        <span>{match.league} · 示例赛况</span>
        <Badge match={match} now={now} />
      </div>
      <div className="big-scoreboard">
        <ScoreLink href={COURT_ONLY ? undefined : "#/match/" + match.id} className="big-team">
          <Crest team={teams[match.home]} large court={court} />
          <h2>{teams[match.home].name}</h2>
        </ScoreLink>
        <div className="big-score-center">
          <span>
            {match.state === "finished"
              ? "全场结束"
              : match.state === "live"
                ? "进行中 · 67′"
                : "未开赛"}
          </span>
          <Score match={match} />
          {COURT_ONLY ? <small className="court-score-note">示例比分</small> : court ? (
            <a href={"#/match/" + match.id}>
              查看赛况 <ArrowUpRight size={15} />
            </a>
          ) : (
            <small>阵容与进球均为演示数据</small>
          )}
        </div>
        <ScoreLink href={COURT_ONLY ? undefined : "#/match/" + match.id} className="big-team">
          <Crest team={teams[match.away]} large court={court} />
          <h2>{teams[match.away].name}</h2>
        </ScoreLink>
      </div>
    </section>
  );
}
function MatchDetail({ match, now, tab, enter, follow, followed }) {
  return (
    <>
      <a className="back-link" href={COURT_ONLY ? "#/courts" : "#/"}>
        <ArrowLeft size={18} />
        返回比赛
      </a>
      <MatchHeader match={match} now={now} />
      <div className="detail-actions">
        {match.state === "finished" ? (
          <button className="button primary" onClick={() => enter(match)}>
            <Scales size={20} />
            {courtState(match, now) === "closed" ? "查看庭审结果" : "进入法庭"}
            <ArrowRight size={18} />
          </button>
        ) : (
          <button className="button outline" onClick={() => follow(match)}>
            {followed ? <Check size={18} /> : <Bell size={18} />}{" "}
            {followed ? "已关注 · 点击取消" : "关注这场比赛"}
          </button>
        )}
      </div>
      <nav className="section-tabs" aria-label="赛况导航">
        {[
          ["overview", "赛况"],
          ["stats", "数据"],
          ["lineup", "阵容"],
        ].map(([key, name]) => (
          <a
            key={key}
            className={tab === key ? "active" : ""}
            href={"#/match/" + match.id + "/" + key}
          >
            {name}
          </a>
        ))}
      </nav>
      {match.state === "scheduled" ? (
        <section className="panel empty">
          <Clock size={40} weight="light" />
          <h2>终场哨响，再来开庭。</h2>
          <p>赛况、进球和首发将在比赛开始后显示。</p>
          <span className="demo-note">此场为预约流程演示，不发送通知。</span>
        </section>
      ) : tab === "lineup" ? (
        <section className="panel content-panel">
          <h2>
            首发阵容 <span className="muted">示例 · 4–3–3</span>
          </h2>
          <div className="lineups">
            {[match.home, match.away].map((key) => (
              <div key={key}>
                <h3>
                  <Crest team={teams[key]} />
                  {teams[key].name}
                </h3>
                {teams[key].players.map((name, i) => (
                  <div className="player-row" key={name}>
                    <span>{[1, 2, 4, 5, 3, 6, 8, 10, 7, 11, 9][i]}</span>
                    <strong>{name}</strong>
                    <small>
                      {i === 0
                        ? "门将"
                        : i < 5
                          ? "后卫"
                          : i < 8
                            ? "中场"
                            : "前锋"}
                    </small>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      ) : tab === "stats" ? (
        <section className="panel content-panel stats-panel">
          <h2>比赛数据</h2>
          {match.stats.map(([h, a, label, p]) => (
            <div className="stat-row" key={label}>
              <div>
                <strong>
                  {h}
                  {p ? "%" : ""}
                </strong>
                <span>{label}</span>
                <strong>
                  {a}
                  {p ? "%" : ""}
                </strong>
              </div>
              <div className="stat-bars">
                <span style={{ width: (h / (h + a)) * 100 + "%" }} />
                <span style={{ width: (a / (h + a)) * 100 + "%" }} />
              </div>
            </div>
          ))}
        </section>
      ) : (
        <section className="panel content-panel">
          <h2>比赛进程</h2>
          <div className="timeline">
            {match.state === "finished" && (
              <div className="timeline-row">
                <span>90′</span>
                <CheckCircle size={22} />
                <div>
                  <strong>全场结束</strong>
                  <p>
                    {teams[match.home].name} {match.score.join(" : ")}{" "}
                    {teams[match.away].name}
                  </p>
                </div>
              </div>
            )}
            {[...match.goals].reverse().map(([minute, side, player]) => (
              <div className="timeline-row" key={minute}>
                <span>{minute}′</span>
                <SoccerBall size={22} />
                <div>
                  <strong>{player}</strong>
                  <p>{teams[match[side]].name} · 进球</p>
                </div>
              </div>
            ))}
            {!match.goals.length && (
              <p className="empty-inline">暂时还没有进球。</p>
            )}
            <div className="timeline-row">
              <span>0′</span>
              <Clock size={22} />
              <div>
                <strong>比赛开始</strong>
                <p>示例比赛进程</p>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
function CourtHighlights({ match, comments, liked }) {
  const [index, setIndex] = useState(0), [paused, setPaused] = useState(false);
  const leaders = [...comments].sort((a, b) => (b.likes + (liked[b.id] ? 1 : 0)) - (a.likes + (liked[a.id] ? 1 : 0))).slice(0, 5);
  useEffect(() => {
    setIndex(0);
  }, [match.id]);
  useEffect(() => {
    if (paused || leaders.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setIndex((n) => n + 1), 4500);
    return () => clearInterval(timer);
  }, [match.id, paused, leaders.length]);
  const current = leaders[index % leaders.length];
  if (!current) return null;
  return <a className="court-highlight" href={"#/court/" + match.id + "/hot"} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)} aria-label={"查看热评：" + current.name + "，" + current.text}>
    <span className="highlight-label"><Fire size={16} weight="fill" />{index % leaders.length === 0 ? "最热" : "热议"}</span>
    <span key={current.id} className="highlight-quote"><b>{current.name}</b>：{current.text}</span>
    <span className="highlight-likes"><Heart size={13} />{(current.likes + (liked[current.id] ? 1 : 0)).toLocaleString("zh-CN")}</span>
  </a>;
}
function Court({
  startedAt,
  opening = false,
  enter,
  match,
  now,
  section,
  comments,
  vote,
  cast,
  liked,
  like,
  addComment,
  addReply,
}) {
  const state = courtState(match, now),
    closed = state === "closed",
    thread = sides[section] ? section : null;
  if (state !== "open" && state !== "closed")
    return (
      <section className="panel empty">
        <h1>这场还没开庭。</h1>
        <p>比赛结束后，法庭才会开放。</p>
        <a className="button primary" href={COURT_ONLY ? "#/" : "#/match/" + match.id}>
          {COURT_ONLY ? "返回法庭大厅" : "查看赛况"}
        </a>
      </section>
    );
  const tab =
    section === "jury" ? "jury" : section === "records" ? "records" : section === "others" ? "others" : "debate";
  return (
    <>
      <div className="court-banner">
      <a className="back-link" href={COURT_ONLY ? "#/courts" : "#/"}>
        <ArrowLeft size={18} />
        {COURT_ONLY ? "返回法庭大厅" : "返回比赛"}
      </a>
      <Scales className="court-watermark" weight="light" aria-hidden="true" />
      <div className="court-title">
        <p className="eyebrow">赛后小法庭</p>
        <h1>{match.topic}</h1>
      </div>
      <MatchHeader match={match} now={now} court />
      <div className="court-live-strip">
        <span className="court-clock"><Clock size={15} />{closed ? "庭审已结束" : <Remaining startedAt={startedAt} now={now} />}</span>
        <CourtHighlights key={match.id} match={match} comments={comments} liked={liked} />
      </div>
      </div>
      <nav className="section-tabs" aria-label="法庭导航">
        {[
          ["debate", "辩论席"],
          ["jury", "陪审席"],
          ["records", "庭审记录"],
          ["others", "其他场次"],
        ].map(([key, name]) => (
          <a
            key={key}
            className={tab === key ? "active" : ""}
            href={"#/court/" + match.id + "/" + key}
          >
            {name}
          </a>
        ))}
      </nav>
      {tab === "jury" ? (
        <Jury match={match} vote={vote} cast={cast} closed={closed} />
      ) : tab === "records" ? (
        <Records key={match.id} match={match} vote={vote} closed={closed} now={now} startedAt={startedAt} />
      ) : tab === "others" ? (
        <OtherCourts match={match} now={now} enter={enter} />
      ) : thread ? (
        <Thread
          key={thread}
          match={match}
          side={thread}
          comments={comments}
          liked={liked}
          like={like}
          addComment={addComment}
          addReply={addReply}
          closed={closed}
        />
      ) : (
        <section className="debate-entry">
          <SupportBar match={match} vote={vote} revealed={!opening} />
          <div className="opinion-grid">
            {["red", "blue"].map((side) => {
              const popular = [...comments].filter((c) => c.side === side).sort((a,b) => (b.likes + (liked[b.id] ? 1 : 0)) - (a.likes + (liked[a.id] ? 1 : 0)))[0];
              return <div className={"argument-column " + side} key={side}>
              <a
                className={"opinion-card " + side}
                href={"#/court/" + match.id + "/" + side}
                key={side}
              >
                <div className="opinion-meta">
                  <span><Fire className="argument-flame" size={16} weight="fill" aria-hidden="true" />{sides[side]}观点</span>
                  <span className="opinion-support"><AnimatedNumber value={match.votes[side === "red" ? 0 : 1] + (vote === (side === "red" ? 0 : 1) ? 1 : 0)} /> 人支持</span>
                </div>
                <h2>
                  <OpinionTitle text={match[side]} />
                </h2>
                <p>{match[side + "Body"]}</p>
                <div className="opinion-footer">
                  进入讨论 <ArrowRight size={17} />
                </div>
              </a>
              {popular && <Comment featured comment={popular} matchId={match.id} liked={liked} like={like} addReply={addReply} closed={closed} />}
              </div>;
            })}
          </div>
          <a
            className="neutral-entry panel"
            href={"#/court/" + match.id + "/neutral"}
          >
            <div>
              <span>第三种声音 · <AnimatedNumber value={match.votes[2] + (vote === 2 ? 1 : 0)} /> 人不站队</span>
              <h2>不站队，说句公道话。</h2>
            </div>
            <ArrowUpRight size={28} />
          </a>
          <Thread embedded match={match} side="hot" comments={comments} liked={liked} like={like} addComment={addComment} addReply={addReply} closed={closed} />
        </section>
      )}
    </>
  );
}
function OtherCourts({ match, now, enter }) {
  const priority = { open: 0, closed: 1, live: 2, scheduled: 3 };
  const others = matches.filter((m) => m.id !== match.id).sort((a, b) => priority[courtState(a, now)] - priority[courtState(b, now)]);
  return <section className="other-courts">
    <div className="other-courts-heading"><h2>其他场次</h2><span>换一场，继续聊。</span></div>
    <div className="other-courts-list">
      {others.map((m) => {
        const state = courtState(m, now), ready = state === "open" || state === "closed";
        return <article className="other-court-row" key={m.id}>
          <div className="other-court-meta"><span>{m.league}</span><Badge match={m} now={now} /></div>
          <ScoreLink className="other-court-score" href={COURT_ONLY ? undefined : "#/match/" + m.id} aria-label={teams[m.home].name + "对" + teams[m.away].name + (COURT_ONLY ? "，示例比分" : "，查看赛况")}>
            <span className="other-court-team"><Crest team={teams[m.home]} /><span>{teams[m.home].name}</span></span>
            <Score match={m} />
            <span className="other-court-team"><Crest team={teams[m.away]} /><span>{teams[m.away].name}</span></span>
          </ScoreLink>
          <div className="other-court-bottom"><p>{m.topic || "比赛结束后，法庭开放。"}</p><button className={"button " + (ready ? "primary" : "quiet")} disabled={!ready} onClick={() => enter(m)} aria-label={(state === "open" ? "进入" : "查看") + teams[m.home].name + "对" + teams[m.away].name + "的法庭"}>{state === "open" ? "进入法庭" : state === "closed" ? "查看结果" : "完赛后开放"}<ArrowRight size={15} /></button></div>
        </article>;
      })}
    </div>
  </section>;
}
function Jury({ match, vote, cast, closed }) {
  const [selection, setSelection] = useState(vote);
  useEffect(() => setSelection(vote), [vote, match.id]);
  const total =
    match.votes.reduce((a, b) => a + b, 0) + (vote !== undefined ? 1 : 0);
  return (
    <section className="panel jury-panel">
      <div className="section-heading">
        <p className="eyebrow">陪审席</p>
        <h2>{closed ? "这场讨论，大家这样看。" : "你更认同哪一种说法？"}</h2>
        <p>{closed ? "投票已结束。" : vote !== undefined ? "已投票，可以修改选择。" : "选一个，投完看结果。"}</p>
      </div>
      {(vote !== undefined || closed) && <SupportBar match={match} vote={vote} />}
      <div className="vote-options" role="group" aria-label="选择投票观点">
        {["red", "blue", "neutral"].map((side, i) => (
          <button
            key={side}
            className={"vote-option " + side + (selection === i ? " chosen" : "")}
            onClick={() => setSelection(i)}
            disabled={closed}
            aria-pressed={selection === i}
          >
            <span className="vote-radio" aria-hidden="true">{selection === i && <Check size={16} weight="bold" />}</span>
            <div className="vote-copy"><strong>{side === "neutral" ? "不站队，说句公道话。" : match[side]}</strong><p>{side === "neutral" ? "两边都有道理，也都有值得讨论的地方。" : match[side + "Body"]}</p></div>
            {(vote !== undefined || closed) && (
              <span className="vote-result">
                <b>
                  <AnimatedNumber animateOnMount={closed} value={Math.round(
                    ((match.votes[i] + (vote === i ? 1 : 0)) / total) * 100,
                  )} />
                  %
                </b>
                <span><AnimatedNumber value={match.votes[i] + (vote === i ? 1 : 0)} />票</span>
              </span>
            )}
          </button>
        ))}
      </div>
      {!closed && <button className="button primary submit-vote" disabled={selection === undefined || selection === vote} onClick={() => cast(match.id, selection)}>{vote === undefined ? "确认投票" : selection === vote ? "已投票" : "修改投票"}<ArrowRight size={18} /></button>}
      <p className="vote-note">
        <AnimatedNumber value={total} />票 · 示例投票
        {vote !== undefined && !closed ? " · 已投票，可修改选择" : ""}
      </p>
    </section>
  );
}
function Records({ match, vote, closed, now, startedAt }) {
  const total =
      match.votes.reduce((a, b) => a + b, 0) + (vote !== undefined ? 1 : 0),
    tallies = match.votes.map((n, i) => n + (vote === i ? 1 : 0)),
    winner = tallies.indexOf(Math.max(...tallies));
  return (
    <section className={"panel records-panel" + (closed ? " closed-case" : "")}>
      <p className="eyebrow">庭审记录</p>
      <h2>{closed ? "终场之后，观点有了回响。" : "讨论还在继续。"}</h2>
      {closed ? (
        <>
          <div className={"verdict " + ["red", "blue", "neutral"][winner]}>
            <span className="verdict-label"><CheckCircle className="verdict-check" size={22} /> 社区投票结果</span>
            <h3>
              {winner === 0
                ? match.red
                : winner === 1
                  ? match.blue
                  : "暂不站队，继续观察。"}
            </h3>
            <p>获得最多支持 · <AnimatedNumber animateOnMount value={Math.round((tallies[winner] / total) * 100)} />%</p>
          </div>
          <Jury match={match} vote={vote} cast={() => {}} closed />
          <p className="demo-note">
            结果来自示例投票，不代表事实认定或 AI 判决。
          </p>
        </>
      ) : (
        <>
          <p>这是可反复参与的演示案例。每次进入重新倒计时，发言与投票持续开放。</p>
          <p className="court-clock">
            <Clock size={18} />
            <Remaining startedAt={startedAt} now={now} />
          </p>
          <a
            className="button primary"
            href={"#/court/" + match.id + "/debate"}
          >
            回到辩论席 <ArrowRight size={18} />
          </a>
        </>
      )}
      <div className="record-summary">
        <div>
          <span>比赛</span>
          <strong>
            {teams[match.home].name} {match.score.join(" : ")}{" "}
            {teams[match.away].name}
          </strong>
        </div>
        <div>
          <span>{closed ? "示例庭审时长" : "演示倒计时"}</span>
          <strong>{closed ? "12小时" : "每次进入重置"}</strong>
        </div>
        <div>
          <span>陪审票数</span>
          <strong>{total}票</strong>
        </div>
        <div>
          <span>状态</span>
          <Badge match={match} now={now} />
        </div>
      </div>
    </section>
  );
}
function Thread({
  embedded = false,
  community = false,
  match,
  side,
  comments,
  liked,
  like,
  addComment,
  addReply,
  closed,
}) {
  const [sort, setSort] = useState(side === "hot" ? "hot" : "latest"),
    [text, setText] = useState(""),
    [opinion, setOpinion] = useState(side === "hot" ? "neutral" : side),
    [showComposer, setShowComposer] = useState(!embedded);
  const list = comments
    .filter((c) => side === "hot" || c.side === side)
    .sort((a, b) =>
      sort === "hot"
        ? b.likes + (liked[b.id] ? 1 : 0) - (a.likes + (liked[a.id] ? 1 : 0))
        : (b.createdAt || 0) - (a.createdAt || 0),
    );
  return (
    <section className={"thread-view" + (embedded ? " embedded-thread" : "") + (community ? " forum-thread" : "")}>
      {!embedded && <><a className="back-link" href={"#/court/" + match.id + "/debate"}>
        <ArrowLeft size={17} />
        所有观点
      </a>
      <div className={"thread-heading " + side}>
        <span>{sides[side]}</span>
        <h2>
          {side === "hot"
            ? "这场比赛，大家怎么说？"
            : side === "neutral"
              ? "不站队，说句公道话。"
              : match[side]}
        </h2>
      </div>
      </>}
      <div className="panel comments-panel">
        <div className="comments-title">
          <h3>
            {embedded && !community ? "大家怎么说" : "讨论"} <span>{list.length}条发言</span>
          </h3>
          <div className="comment-toolbar">
          {embedded && !closed && <button className="write-opinion" onClick={() => setShowComposer((v) => !v)} aria-expanded={showComposer}>发表意见 <ArrowUpRight size={15} /></button>}
          <div className="sort-controls" aria-label="评论排序">
            <button
              className={sort === "hot" ? "selected" : ""}
              onClick={() => setSort("hot")}
            >
              热评
            </button>
            <button
              className={sort === "latest" ? "selected" : ""}
              onClick={() => setSort("latest")}
            >
              最新
            </button>
          </div>
          </div>
        </div>
        {!closed && showComposer && (
          <form
            className="composer"
            onSubmit={(e) => {
              e.preventDefault();
              if (text.trim()) {
                addComment(match.id, opinion, text.trim());
                setText("");
                setSort("latest");
              }
            }}
          >
            {side === "hot" && !community && (
              <label className="composer-side">
                选择观点
                <select
                  value={opinion}
                  onChange={(e) => setOpinion(e.target.value)}
                  aria-label="发言立场"
                >
                  <option value="red">正方</option>
                  <option value="blue">反方</option>
                  <option value="neutral">不站队</option>
                </select>
              </label>
            )}
            <label className="sr-only" htmlFor="comment-text">
              {community ? "你的发言" : "你的观点"}
            </label>
            <textarea
              id="comment-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={community ? "聊聊你的看法。" : "说说你看到的比赛。"}
              maxLength={300}
              rows={2}
            />
            <div className="composer-bottom">
              <span>{text.length}/300</span>
              <button className="button primary" disabled={!text.trim()}>
                发言 <ArrowUpRight size={17} />
              </button>
            </div>
          </form>
        )}
        {closed && <p className="closed-note">庭审已结束，发言保留在这里。</p>}
        <div className="comment-list">
          {list.length ? (
            list.map((c) => (
              <Comment
                key={c.id}
                comment={c}
                matchId={match.id}
                liked={liked}
                like={like}
                addReply={addReply}
                closed={closed}
              />
            ))
          ) : (
            <p className="empty-inline">还没有发言。来聊聊你的看法。</p>
          )}
        </div>
      </div>
    </section>
  );
}
function Comment({ featured = false, comment: c, matchId, liked, like, addReply, closed }) {
  const replyId = useId();
  const [expanded, setExpanded] = useState(false),
    [replying, setReplying] = useState(false),
    [reply, setReply] = useState("");
  return (
    <article className={"comment" + (featured ? " featured-argument " + c.side : "")}>
      <div className="comment-header">
        <UserCircle size={31} weight="light" />
        <div>
          <strong>{c.name}</strong>
          <span>{c.time}</span>
        </div>
        <span className={"side-tag " + c.side}>{sides[c.side]}</span>
      </div>
      <p className="comment-text">{c.text}</p>
      <div className="comment-actions">
        <button
          className={liked[c.id] ? "liked" : ""}
          onClick={() => like(c.id)}
          aria-label={
            (liked[c.id] ? "取消点赞" : "点赞") + " " + c.name + "的发言"
          }
          aria-pressed={!!liked[c.id]}
        >
          <Heart size={18} weight={liked[c.id] ? "fill" : "regular"} />
          {c.likes + (liked[c.id] ? 1 : 0)}
        </button>
        <button disabled={closed} onClick={() => setReplying((v) => !v)}>
          <ChatCircle size={18} />
          {featured ? "反驳" : "回复"} {c.replies.length || ""}
        </button>
      </div>
      {c.replies.length > 0 && (
        <button
          className="expand-replies"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          {expanded ? "收起回复" : "展开 " + c.replies.length + " 条回复"}
          <CaretDown size={14} className={expanded ? "rotated" : ""} />
        </button>
      )}
      {expanded && (
        <div className="reply-list">
          {c.replies.map((r) => (
            <div className="reply" key={r.id}>
              <div>
                <strong>{r.name}</strong>
                <p>{r.text}</p>
              </div>
              <button
                className={liked[r.id] ? "liked" : ""}
                aria-label={
                  (liked[r.id] ? "取消点赞" : "点赞") + " " + r.name + "的回复"
                }
                aria-pressed={!!liked[r.id]}
                onClick={() => like(r.id)}
              >
                <Heart size={16} weight={liked[r.id] ? "fill" : "regular"} />
                {r.likes + (liked[r.id] ? 1 : 0)}
              </button>
            </div>
          ))}
        </div>
      )}
      {replying && !closed && (
        <form
          className="reply-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (reply.trim()) {
              addReply(matchId, c.id, reply.trim());
              setReply("");
              setReplying(false);
              setExpanded(true);
            }
          }}
        >
          <label className="sr-only" htmlFor={replyId}>
            回复{c.name}
          </label>
          <input
            id={replyId}
            maxLength={200}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder={"回复 " + c.name}
          />
          <button className="button primary" disabled={!reply.trim()}>
            发送
          </button>
          <button
            className="icon-button"
            type="button"
            aria-label="取消回复"
            onClick={() => setReplying(false)}
          >
            <X size={18} />
          </button>
        </form>
      )}
    </article>
  );
}
