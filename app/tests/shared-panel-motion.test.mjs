import test from 'node:test';
import assert from 'node:assert/strict';
import {sharedPanelFrame} from '../src/shared-panel-motion.js';
const geometry={heroTop:300,heroLeft:700,heroWidth:500,targetTop:1300,targetLeft:80,targetWidth:550,dockTop:190,landingY:190,viewportHeight:900};
test('the shared panel matches both real slots and travels continuously in between',()=>{
 const start=sharedPanelFrame({...geometry,scroll:0});
 assert.equal(start.x,700);assert.equal(start.y,300);assert.equal(start.scale,500/550);assert.equal(start.phase,'hero');
 const middle=sharedPanelFrame({...geometry,scroll:600});
 assert(middle.x>80 && middle.x<700);assert(middle.progress>0 && middle.progress<1);assert.equal(middle.phase,'handoff');
 const end=sharedPanelFrame({...geometry,scroll:1200});
 assert.equal(end.x,80);assert.equal(end.y,190);assert.equal(end.scale,1);assert.equal(end.phase,'story');
 assert.deepEqual(sharedPanelFrame({...geometry,scroll:600}),middle);
});
test('after docking, the same panel follows its sticky slot out of view',()=>{
 const result=sharedPanelFrame({...geometry,scroll:2400,dockTop:-520});
 assert.equal(result.y,-520);assert.equal(result.scale,1);assert.equal(result.phase,'story');
});
test('reduced motion uses the source or destination without interpolating a flight',()=>{
 const first=sharedPanelFrame({...geometry,scroll:100,reduced:true});
 const last=sharedPanelFrame({...geometry,scroll:1200,reduced:true});
 assert.equal(first.progress,0);assert.equal(first.y,200);assert.equal(last.progress,1);assert.equal(last.y,190);
});
