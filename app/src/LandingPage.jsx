import { useState } from "react";
import { ArrowRight, ArrowDown, ArrowUpRight, Check, Scales, ChatCircle, Heart, SoccerBall } from "@phosphor-icons/react";
import { matches, teams } from "./data";
import "./landing.css";

const sample = matches.find(match => match.id === "m1");
const scrollToSection = id => document.getElementById(id)?.scrollIntoView({
  behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
  block: "start",
});

function TeamMark({ name }) {
  const team = teams[name];
  return <img src={team.crest || `https://crests.football-data.org/${team.id}.svg`} alt={`${team.name}队徽`} width="52" height="60" />;
}

function PitchLines() {
  return <svg className="intro-pitch" viewBox="0 0 700 430" fill="none" aria-hidden="true">
    <g stroke="currentColor" strokeWidth="1.5">
      <rect x="30" y="30" width="640" height="370" rx="2" />
      <path d="M350 30v370M30 125h105v180H30m640-180H565v180h105M30 170h43v90H30m640-90h-43v90h43" />
      <circle cx="350" cy="215" r="64" /><circle cx="350" cy="215" r="3" fill="currentColor" />
      <path d="M135 167a62 62 0 0 1 0 96m430-96a62 62 0 0 0 0 96" />
    </g>
  </svg>;
}

function ProductPreview() {
  return <figure className="intro-product" aria-label="小法庭界面预览，示例比赛">
    <PitchLines />
    <div className="intro-match-slip">
      <div><span className="intro-live-dot" />终场之后</div>
      <div className="intro-slip-score"><TeamMark name="united" /><b>1 <span>:</span> 1</b><TeamMark name="spurs" /></div>
      <p>比分之外，还有话想说。</p>
    </div>
    <div className="intro-court-preview">
      <div className="intro-preview-top"><span><Scales size={19} />赛后小法庭</span><span>示例 · 开庭中<i /></span></div>
      <div className="intro-matchup"><span><TeamMark name="united" />曼联</span><b>1 <small>:</small> 1</b><span><TeamMark name="spurs" />热刺</span></div>
      <h2>这场平局，<br />曼联该不该被批评？</h2>
      <div className="intro-preview-opinions"><div><span>正方</span><p>表现不到位，<br />就该接受批评。</p></div><span>VS</span><div><span>反方</span><p>别只看比分，<br />也该看看过程。</p></div></div>
      <div className="intro-preview-meter"><span>57%</span><span>43%</span></div>
      <div className="intro-preview-foot"><span>辩论席</span><span>陪审席</span><span>庭审记录</span></div>
    </div>
    <div className="intro-comment-slip"><span className="intro-comment-avatar">球</span><div><strong>不站队，也能说句公道话。</strong><p>批评可以，别忘了聊聊比赛本身。</p><span><Heart size={14} /> 赞同观点 <ChatCircle size={14} /> 继续聊</span></div></div>
    <figcaption>真实交互界面的一角 · 比赛与发言均为演示内容</figcaption>
  </figure>;
}

function OpinionPreview() {
  const [choice, setChoice] = useState(null);
  const red = sample.votes[0] + (choice === 0 ? 1 : 0);
  const blue = sample.votes[1] + (choice === 1 ? 1 : 0);
  const percent = Math.round(red / (red + blue) * 100);
  const options = [
    { title: "正方", text: "踢成这样，曼联该被批评。", className: "for" },
    { title: "反方", text: "别只看比分，平局也有价值。", className: "against" },
    { title: "不站队", text: "两边都有道理，我有自己的看法。", className: "neutral" },
  ];
  return <div className="intro-opinion-demo">
    <div className="intro-demo-title"><Scales size={23} /><span>如果是你，会怎么选？</span><small>互动预览</small></div>
    <p className="intro-demo-question">{sample.topic}</p>
    <div className="intro-demo-options">{options.map((option, i) => <button key={option.title} className={`${option.className}${choice === i ? " chosen" : ""}`} aria-pressed={choice === i} onClick={() => setChoice(choice === i ? null : i)}><span>{option.title}</span><strong>{option.text}</strong><span className="intro-option-check">{choice === i && <Check size={16} weight="bold" />}</span></button>)}</div>
    <div className="intro-demo-meter" aria-label={`示例支持率：正方 ${percent}%，反方 ${100 - percent}%`}><span style={{ width: percent + "%" }}>正方 {percent}%</span><span style={{ width: 100 - percent + "%" }}>反方 {100 - percent}%</span></div>
    <p className="intro-demo-status" role="status">{choice === null ? "点选一个观点，感受一下。" : `你选择了${options[choice].title}，也可以随时改变主意。`}</p>
  </div>;
}

export function LandingPage({ Wordmark }) {
  return <div className="hu-intro">
    <a className="intro-skip" href="#/courts">跳过介绍，进入小法庭</a>
    <header className="intro-nav intro-container">
      <a href="#/" className="intro-brand" aria-label="HU 项目介绍"><Wordmark /></a>
      <nav aria-label="项目介绍导航"><button onClick={() => scrollToSection("intro-idea")}>这个想法</button><button onClick={() => scrollToSection("intro-play")}>如何参与</button></nav>
      <button className="intro-nav-cta" onClick={() => scrollToSection("intro-experience")}>去体验 <ArrowUpRight size={18} /></button>
    </header>
    <main>
      <section className="intro-hero intro-container" aria-labelledby="intro-title">
        <p className="intro-project-label"><SoccerBall size={18} />HU Sport Court · 足球互动作品</p>
        <h1 id="intro-title">终场哨响，<br />讨论才刚<span>开场。</span></h1>
        <p className="intro-hero-description">把一场球的意难平，带进赛后小法庭。<br />亮出观点，听听另一边，或投上你的一票。</p>
        <div className="intro-hero-actions"><button className="intro-pill" onClick={() => scrollToSection("intro-idea")}>了解这个想法 <ArrowDown size={18} /></button><button className="intro-pill intro-pill-outline" onClick={() => scrollToSection("intro-play")}>看看怎么玩 <ArrowRight size={18} /></button></div>
        <ProductPreview />
      </section>

      <section id="intro-idea" className="intro-idea intro-container" aria-labelledby="intro-idea-title">
        <div className="intro-idea-copy"><h2 id="intro-idea-title">比分有终点，<br />球迷的讨论没有。</h2><p>一场平局，有人觉得该批，有人觉得情有可原。赛后评论很热闹，但不同观点往往混在一起。</p><p>我想做一个小一点、清楚一点的讨论空间：一场比赛，一个议题。让球迷知道双方在争什么，也能找到自己想参与的方式。</p><span className="intro-author">胡睿哲 Roy Hu <span>·</span> 从球迷视角出发的个人项目</span></div>
        <blockquote className="intro-quote"><SoccerBall size={34} weight="light" /><p>“你不一定要<br />站在某一边，<br /><em>但你的看法值得被听见。</em>”</p><span>这就是赛后小法庭的出发点。</span></blockquote>
      </section>

      <section id="intro-play" className="intro-play" aria-labelledby="intro-play-title"><div className="intro-container">
        <div className="intro-section-heading"><h2 id="intro-play-title">想辩两句，<br />还是只投一票？</h2><p>参与的方式，由你决定。<br />不需要长篇大论，也不必急着站队。</p></div>
        <div className="intro-play-layout"><div className="intro-ways"><article><span>辩论席</span><h3>有观点，就说出来。</h3><p>先看正反方的主要意见，再进入讨论。发言、点赞、反驳和回复，把想说的讲清楚。</p></article><article><span>陪审席</span><h3>不想发言，也能参与。</h3><p>选一个更认同的观点，投上一票。看看其他球迷怎么想，也可以改变选择。</p></article><article><span>不站队</span><h3>留一个中间的位置。</h3><p>赞同一部分，也保留一点意见。公道话和不同的角度，同样有自己的位置。</p></article></div><OpinionPreview /></div>
      </div></section>

      <section className="intro-journey intro-container" aria-labelledby="intro-journey-title"><h2 id="intro-journey-title">从终场，到你的主场。</h2><ol><li><span>01</span><div><h3>选一场比赛</h3><p>从比赛与争议话题，进入对应法庭。</p></div></li><li><span>02</span><div><h3>听听双方观点</h3><p>正方、反方，先看清楚，再作判断。</p></div></li><li><span>03</span><div><h3>留下你的看法</h3><p>发言、回复或投票，结案后回看结果。</p></div></li></ol></section>

      <section className="intro-next intro-container" aria-labelledby="intro-next-title"><div><Scales size={29} weight="light" /><h2 id="intro-next-title">先让讨论发生，<br />再让 AI 帮忙梳理。</h2></div><div><p>这个想法由我提出，并借助 AI 辅助完成界面设计与代码实现。现在，你可以体验从开庭到辩论、投票和查看结果的流程。</p><p>下一步，我希望接入 AI，把双方的主要论点整理成摘要，让后来的人也能快速跟上讨论。比赛数据接入与多人同步，也在后续计划中。</p><span>当前可体验：前端互动演示。AI 观点摘要尚未接入。</span></div></section>

      <section id="intro-experience" className="intro-experience" aria-labelledby="intro-experience-title"><div className="intro-container"><div className="intro-final-whistle"><SoccerBall size={24} weight="light" /><span>轮到你上场了</span></div><h2 id="intro-experience-title">这场球，<br />你来评评理。</h2><p>挑一场比赛，去小法庭坐坐。</p><a className="intro-pill" href="#/courts">进入小法庭 · 立即体验 <ArrowRight size={21} /></a><span className="intro-experience-note">无需注册 · 示例法庭持续开放</span></div></section>
    </main>
    <footer className="intro-footer intro-container"><a className="intro-brand" href="#/" aria-label="HU 项目介绍"><Wordmark /></a><span>胡睿哲 Roy Hu · 个人作品</span><a href="https://github.com/HululuOvO/hu-sport-court" target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={15} /></a><p>示例比赛与发言仅用于展示；投票、点赞和回复保留于本次体验。</p></footer>
  </div>;
}
