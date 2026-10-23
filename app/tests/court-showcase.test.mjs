import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,writeFile,readFile} from 'node:fs/promises';
import {build} from 'esbuild';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {matches} from '../src/data.js';
import {COURT_ONLY,parseShowcaseRoute} from '../src/showcase-config.js';

test('portfolio routes resolve old sections back to the court lobby',()=>{
 assert.equal(COURT_ONLY,true);
 for(const hash of ['#/community','#/community/nation/brazil','#/news/barca-defence','#/standings/eng.1','#/scorers','#/following'])assert.deepEqual(parseShowcaseRoute(hash,matches),[]);
 assert.deepEqual(parseShowcaseRoute('#/match/m1/stats',matches),['court','m1']);
 assert.deepEqual(parseShowcaseRoute('#/court/m1/jury',matches),['court','m1','jury']);
 const scheduled=matches.find(m=>m.state==='scheduled');
 assert.deepEqual(parseShowcaseRoute('#/match/'+scheduled.id,matches),[]);
});

test('rendered lobby and every court retain the core flow without peripheral navigation',async()=>{
 const dir=await mkdtemp(new URL('../.showcase-qa-',import.meta.url).pathname);
 const previousWindow=globalThis.window,previousLocation=globalThis.location;
 try{
  await build({entryPoints:[new URL('../src/App.jsx',import.meta.url).pathname],outfile:dir+'/App.mjs',bundle:true,platform:'node',format:'esm',jsx:'automatic',external:['react','react-dom','@phosphor-icons/react'],logLevel:'silent'});
  const {App}=await import(dir+'/App.mjs');
  globalThis.window={matchMedia:()=>({matches:true})};
  function render(hash){globalThis.location={hash};return renderToStaticMarkup(React.createElement(App));}
  const noPeripheralLinks=html=>assert.doesNotMatch(html,/href="#\/(?:community|news|standings|scorers|following|match)(?:\/|"|\?)/);
  const home=render('#/');noPeripheralLinks(home);
  assert.match(home,/赛后小法庭/);assert.match(home,/说说你的观点，或投上一票/);
  assert.equal((home.match(/>进入法庭</g)||[]).length,matches.filter(m=>m.demoCourt==='open').length || 6);
  for(const hash of ['#/community','#/news','#/standings']){const html=render(hash);noPeripheralLinks(html);assert.match(html,/选择一场，开始讨论/);}
  for(const match of matches.filter(m=>m.state==='finished')){
   for(const section of ['debate','jury','records','others']){
    const html=render(`#/court/${match.id}/${section}`);noPeripheralLinks(html);
    assert.match(html,/辩论席/);assert.match(html,/陪审席/);assert.match(html,/庭审记录/);
    if(section==='jury')assert.match(html,/选择投票观点/);
   }
  }
  const source=await readFile(new URL('../src/App.jsx',import.meta.url),'utf8');
  for(const feature of ['function Jury','function Thread','function Comment','function CourtHighlights','function Standings'])assert(source.includes(feature));
 }finally{
  if(previousWindow===undefined)delete globalThis.window;else globalThis.window=previousWindow;
  if(previousLocation===undefined)delete globalThis.location;else globalThis.location=previousLocation;
  await rm(dir,{recursive:true,force:true});
 }
});
