import test from 'node:test';
import assert from 'node:assert/strict';
import {journeyProgress} from '../src/shared-panel-motion.js';
test('the scene is bounded, continuous and reverses with scrolling',()=>{
 assert.equal(journeyProgress(-200,0,460),0);
 assert.equal(journeyProgress(900,0,460),1);
 assert.equal(journeyProgress(230,0,460),.5);
 let last=0;
 for(let scroll=0;scroll<=460;scroll++){
  const next=journeyProgress(scroll,0,460);
  assert(next>=last);assert(next-last<.004);last=next;
 }
 assert.equal(journeyProgress(230,0,460),.5);
});
test('mobile begins after its introductory copy has passed',()=>{
 assert.equal(journeyProgress(150,300,220),0);
 assert.equal(journeyProgress(410,300,220),.5);
 assert.equal(journeyProgress(520,300,220),1);
});
test('reduced motion switches treatments without intermediate transforms',()=>{
 assert.equal(journeyProgress(50,0,460,true),0);
 assert.equal(journeyProgress(230,0,460,true),1);
 assert.equal(journeyProgress(450,0,460,true),1);
});
