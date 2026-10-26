import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUp, ArrowDown, ArrowUpRight, Check, Scales, Pause, Play } from "@phosphor-icons/react";
import { teams } from "./data";
import { courtCrests } from "./crest-assets";
import "./landing.css";
import AnimatedContent from "./components/AnimatedContent";
import ClickSpark from "./components/ClickSpark";
import ScrollExpand from "./components/ScrollExpand";
import CountUp from "./components/CountUp";
import PulseHeart from "./components/PulseHeart";
import RubberSegment from "./components/RubberSegment";
import Magnet from "./components/Magnet";
import { journeyProgress } from "./shared-panel-motion";
const TOUR_STEP_MS = 4200;
const chapters = ["hu-introduction", "hu-how-it-works", "hu-try-it"];
const features = [
  { name: "辩论席", title: "发言与回复", text: "看双方观点，发表看法，也能回复别人的发言。" },
  { name: "陪审席", title: "投票与改选", text: "选择认同的观点，不想发言也能参与。" },
  { name: "不站队", title: "说句公道话", text: "保留自己的判断，不必选边站。" },
];
function moveTo(id) { document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" }); }
function Team({ name, court=false }) { const t = teams[name]; return <img src={(court && courtCrests[t.id]) || t.crest || `https://crests.football-data.org/${t.id}.svg`} alt={t.name + "队徽"} width="44" height="48" />; }
function Matchup({court=false}) { return <div className="hu-matchup"><span><Team name="united" court={court} />曼联</span><b>1 <small>:</small> 1</b><span><Team name="spurs" court={court} />热刺</span></div>; }
function Debate({ hero = false, active = true }) { return <div className="hu-debate"><div className="hu-opposition"><div><span>正方</span><h3>表现不到位，<br />就该接受批评。</h3></div><i>VS</i><div><span>反方</span><h3>别只看比分，<br />也该看看过程。</h3></div></div><div className="hu-meter" aria-label="示例支持率：正方57%，反方43%"><span><CountUp key={active ? "red-run" : "red-idle"} from={0} to={57} duration={.58} delay={.1} trigger="view" startWhen={active} suffix="%" /></span><span><CountUp key={active ? "blue-run" : "blue-idle"} from={0} to={43} duration={.58} delay={.1} trigger="view" startWhen={active} suffix="%" /></span></div></div>; }
function Vote({choice,onChoice}) { return <div className="hu-vote"><p>你更认同哪一种？</p>{["表现不够好，该批评", "看过程，平局也有价值", "不站队，我有其他看法"].map((label,i) => <button key={label} aria-pressed={choice === i} className={"hu-vote-option side-" + i + (choice === i ? " chosen" : "")} onClick={() => onChoice(i)}><span>{["正方","反方","中立"][i]}</span><strong>{label}</strong><i>{choice === i && <Check size={17} weight="bold" />}</i></button>)}<p key={choice} className="hu-receipt" role="status">{choice === null ? "点选一次，试试投票。" : <><Check size={16} /> 你的一票已加入，可随时改选。</>}</p></div>; }
function Neutral({liked,onLike}) { return <div className="hu-neutral"><span>不站队 · 说句公道话</span><div className="hu-comment"><span className="hu-avatar">看</span><div><strong>看球不只看比分</strong><p>批评可以，也别忽略对手。聊清楚比赛，比争输赢更有意思。</p><PulseHeart liked={liked} count={24+(liked ? 1 : 0)} onChange={onLike} label="赞同" size={42} likedColor="#c52132" idleColor="#6b6470" pillColor="#faecee" textColor="#8a2635" duration={420} /></div></div></div>; }
function CourtWindow({ mode=0, hero=false, onModeChange, previewReady=false, choice, onChoice, liked, onLike }) { return <div data-ui="court-preview" data-preview-mode={mode} className={"hu-window" + (hero ? " hero-window" : "")}><div className="hu-court-masthead"><div className="hu-window-header"><span><Scales size={19} /> 赛后小法庭</span><small><i /> 示例开庭中</small></div><Matchup court /><h2 className="hu-case-title">曼联，该不该被批评？</h2><p className="hu-masthead-meta">英超 · 全场结束</p></div>{hero ? <><Debate hero /><div className="hu-window-foot"><span>辩论席</span><span>陪审席</span><span>庭审记录</span></div></> : <><RubberSegment className="hu-preview-segment" items={features.map((f,i)=>({value:String(i),label:f.name}))} value={String(mode)} onChange={value=>onModeChange?.(Number(value))} trackColor="#f6edef" thumbColor="#ffffff" textColor="#625e69" activeTextColor="#a91c2d" size="lg" radius={30} stretch={55} squash={1.5} aria-label="参与方式" /><div className="hu-preview-panels">{[<Debate active={previewReady && mode===0} />,<Vote choice={choice} onChoice={onChoice} />,<Neutral liked={liked} onLike={onLike} />].map((panel,i)=><div key={i} className={"hu-preview-panel"+(mode===i ? " active" : "")} aria-hidden={mode!==i} inert={mode!==i ? true : undefined}>{panel}</div>)}</div></>}</div>; }
function CourtPreview({ trigger="scroll", mode, onModeChange, choice, onChoice, liked, onLike, onReady, distance=16, initialOpacity=0 }) {
  const [ready,setReady]=useState(false);
  return <AnimatedContent trigger={trigger} distance={distance} initialOpacity={initialOpacity} duration={.65} delay={trigger==="mount" ? .08 : 0} onComplete={()=>{setReady(true);onReady?.();}}>
    <ScrollExpand><CourtWindow mode={mode} onModeChange={onModeChange} previewReady={ready} choice={choice} onChoice={onChoice} liked={liked} onLike={onLike} /></ScrollExpand>
  </AnimatedContent>;
}
export function LandingPage({ Wordmark }) {
  const root=useRef(null), [chapter,setChapter]=useState(0), [mode,setMode]=useState(0), [previewChoice,setPreviewChoice]=useState(null), [previewLiked,setPreviewLiked]=useState(false);
  const [tourVisible,setTourVisible]=useState(false), [tourReady,setTourReady]=useState(false);
  const [tourPaused,setTourPaused]=useState(false), [tourHovered,setTourHovered]=useState(false), [tourFocused,setTourFocused]=useState(false);
  const [pageVisible,setPageVisible]=useState(true), [reduceMotion,setReduceMotion]=useState(false);
  const tourPlaying=tourVisible && tourReady && !tourPaused && !tourHovered && !tourFocused && pageVisible && !reduceMotion;
  const selectMode=i=>{setTourPaused(true);setMode(i);};
  const selectVote=i=>{setTourPaused(true);setPreviewChoice(i);};
  const selectLike=value=>{setTourPaused(true);setPreviewLiked(value);};
  useEffect(()=>{
    const node=root.current?.querySelector(".hu-how-preview");
    const media=window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference=()=>setReduceMotion(media.matches);
    const updateVisibility=()=>setPageVisible(!document.hidden);
    updatePreference();updateVisibility();
    const observer=typeof IntersectionObserver==='function' ? new IntersectionObserver(entries=>{
      for(const entry of entries)setTourVisible(entry.isIntersecting && entry.intersectionRatio>=.55);
    },{threshold:[0,.55],rootMargin:"-8% 0px -5% 0px"}) : null;
    if(node)observer?.observe(node);
    media.addEventListener?.("change",updatePreference);
    document.addEventListener("visibilitychange",updateVisibility);
    return()=>{observer?.disconnect();media.removeEventListener?.("change",updatePreference);document.removeEventListener("visibilitychange",updateVisibility);};
  },[]);
  useEffect(()=>{
    if(!tourPlaying)return;
    const timer=setTimeout(()=>setMode(current=>(current+1)%features.length),TOUR_STEP_MS);
    return()=>clearTimeout(timer);
  },[tourPlaying,mode]);

  useEffect(()=>{
    const node=root.current;
    if(!node || !window.IntersectionObserver)return;
    const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting)setChapter(Number(entry.target.dataset.chapter));},{rootMargin:"-30% 0px -40% 0px",threshold:0});
    node.querySelectorAll("[data-chapter]").forEach(el=>observer.observe(el));
    let frame;
    const update=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{node.style.setProperty("--page-progress",String(Math.min(1,Math.max(0,scrollY/Math.max(1,node.scrollHeight-innerHeight)))));const hero=node.querySelector(".hu-opening");node.style.setProperty("--hero-progress",String(Math.min(1,Math.max(0,-hero.getBoundingClientRect().top/hero.offsetHeight))));});};
    window.addEventListener("scroll",update,{passive:true});update();
    return()=>{observer.disconnect();cancelAnimationFrame(frame);window.removeEventListener("scroll",update);};
  },[]);
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const journey = node.querySelector(".hu-journey");
    const opening = node.querySelector(".hu-opening");
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame;
    const draw = () => {
      const bounds = opening.getBoundingClientRect();
      const mobile = window.matchMedia("(max-width:1100px)").matches;
      const start = mobile ? Math.max(0, opening.offsetHeight - 80) : 0;
      const progress = journeyProgress(-bounds.top, start, mobile ? 220 : 460, media.matches);
      journey.style.setProperty("--journey", progress);
    };
    const update = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(draw); };
    window.addEventListener("scroll", update, {passive:true});
    window.addEventListener("resize", update);
    media.addEventListener?.("change", update);
    draw();
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", update); window.removeEventListener("resize", update); media.removeEventListener?.("change", update); };
  }, []);
  return <ClickSpark sparkColor={["#c52132","#ed9ca5"]} sparkCount={7} sparkSize={9} sparkRadius={27} duration={420} shape="line" glow={0} style={{height:"auto",minHeight:"100svh"}}><div className="hu-intro" ref={root}><a className="hu-skip" href="#/courts">跳过介绍，进入小法庭</a><header className="hu-intro-nav"><div className="hu-wrap"><a className="hu-intro-brand" href="#/" aria-label="HU 项目介绍"><Wordmark /></a><nav aria-label="项目介绍导航"><button className={chapter===0 ? "active" : ""} onClick={()=>moveTo(chapters[0])}>认识法庭</button><button className={chapter===1 ? "active" : ""} onClick={()=>moveTo(chapters[1])}>怎么玩</button></nav>{chapter>0 && <a className="hu-nav-experience" href="#/courts">进入体验 <ArrowUpRight size={18} /></a>}</div><div className="hu-reading-progress" /></header><main><div className="hu-journey">
    <section className="hu-opening hu-wrap" id={chapters[0]} data-chapter="0" aria-labelledby="hu-title"><AnimatedContent className="hu-opening-copy" trigger="mount" distance={24} duration={.8} stagger={.1}><h1 id="hu-title"><span>足球赛后，</span><span>球迷在这里辩论、投票。</span></h1><p className="hu-opening-description">围绕一场比赛的争议，发观点、投一票，也能不站队。</p><div className="hu-opening-actions"><Magnet padding={25} magnetStrength={10} maxOffset={6}><a className="hu-action" href="#/courts">体验赛后小法庭 <ArrowRight size={20} /></a></Magnet></div></AnimatedContent><div className="hu-hero-placeholder" aria-hidden="true" />
</section>
    <div className="hu-journey-visual"><div className="hu-opening-scene"><div className="hu-shared-court" aria-label="可交互的法庭预览"><CourtPreview trigger="mount" mode={mode} onModeChange={selectMode} choice={previewChoice} onChoice={selectVote} liked={previewLiked} onLike={selectLike} /></div></div></div>
    <section className="hu-how" data-tour-playing={tourPlaying ? "true" : "false"} style={{"--tour-step-time":TOUR_STEP_MS+"ms"}} id={chapters[1]} data-chapter="1" aria-labelledby="hu-how-title"><div className="hu-wrap">
      <div className="hu-how-heading-row"><AnimatedContent className="hu-how-heading" distance={8} duration={.45}><h2 id="hu-how-title">同一场球，三种参与。</h2><p>想说就说，不想说也能投票。</p></AnimatedContent><button className="hu-tour-toggle" aria-label={tourPaused ? "继续自动演示" : "暂停自动演示"} title={tourPaused ? "继续自动演示" : "暂停自动演示"} aria-pressed={!tourPaused} onClick={()=>setTourPaused(value=>!value)}>{tourPaused ? <Play size={20} weight="fill" /> : <Pause size={20} weight="fill" />}</button></div>
      <AnimatedContent className="hu-how-layout" distance={18} duration={.65} initialOpacity={1} onPointerMoveCapture={event=>{if(event.pointerType==="mouse")setTourHovered(true);}} onPointerLeave={()=>setTourHovered(false)} onFocusCapture={()=>setTourFocused(true)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget))setTourFocused(false);}} onPointerDownCapture={()=>setTourPaused(true)}><div className="hu-story" data-ui="tour-controls"><div className="hu-story-steps">{features.map((f,i)=><article key={f.name} className={mode===i ? "active" : ""}>
        <AnimatedContent distance={0} initialOpacity={1} duration={.35} style={{width:"100%"}}><button className="hu-story-copy" aria-pressed={mode===i} onClick={()=>selectMode(i)}><span className="hu-feature-name">{f.name}</span><h3>{f.title}</h3><p>{f.text}</p>{mode===i && tourPlaying && <span key={mode+"-playing"} className="hu-tour-progress" aria-hidden="true" />}</button></AnimatedContent>
      </article>)}</div></div><div className="hu-how-preview" aria-label="玩法介绍中的法庭示例"><CourtPreview distance={0} initialOpacity={1} onReady={()=>setTourReady(true)} mode={mode} onModeChange={selectMode} choice={previewChoice} onChoice={selectVote} liked={previewLiked} onLike={selectLike} /></div></AnimatedContent>
    </div></section>
    </div><section className="hu-try" id={chapters[2]} data-chapter="2" aria-labelledby="hu-try-title"><AnimatedContent className="hu-wrap" distance={24} duration={.75} stagger={.07}><h2 id="hu-try-title">这场球，<br />你来评评理。</h2><p>挑一场比赛，留下你的看法。</p><a className="hu-action" href="#/courts">进入小法庭 · 立即体验 <ArrowRight size={22} /></a></AnimatedContent></section>
    </main><footer className="hu-intro-footer hu-wrap"><div><span>Roy · 设计开发</span><a href="https://github.com/HululuOvO/hu-sport-court" target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={16} /></a></div></footer>{chapter>0 && <nav className="hu-chapter-pager" aria-label="介绍页翻屏"><span>{["认识法庭","参与方式","进入体验"][chapter]}</span><button aria-label="上一屏" disabled={chapter===0} onClick={()=>moveTo(chapters[chapter-1])}><ArrowUp size={19} /></button><button aria-label="下一屏" disabled={chapter===2} onClick={()=>moveTo(chapters[chapter+1])}><ArrowDown size={19} /></button></nav>}</div></ClickSpark>;
}
