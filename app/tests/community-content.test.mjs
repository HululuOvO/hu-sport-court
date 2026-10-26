import test from 'node:test';
import assert from 'node:assert/strict';
import {communitySpaces, forumTopics, newsArticles, makeForumComments, newsSnapshotDate} from '../src/content-data.js';
import {matches,teams} from '../src/data.js';
test('every club and national stand has usable topics with distinct discussion identities',()=>{
  assert.equal(new Set(communitySpaces.map(s=>s.id)).size,communitySpaces.length);
  assert.equal(new Set(forumTopics.map(t=>t.id)).size,forumTopics.length);
  assert(communitySpaces.some(s=>s.type==='nation'));
  for(const space of communitySpaces){
    assert(space.type==='club'?teams[space.teamKey]:/^[a-z]{2}$/.test(space.flag));
    assert(forumTopics.filter(t=>t.spaceId===space.id).length>=3);
  }
  const ids=[];
  for(const topic of forumTopics){
    assert(communitySpaces.some(s=>s.id===topic.spaceId));
    if(topic.matchId){assert(matches.some(m=>m.id===topic.matchId));assert.equal(topic.id,topic.matchId);}
    else {assert(!matches.some(m=>m.id===topic.id));const c=makeForumComments(topic);assert(c.length);for(const x of c){assert(x.text&&x.name);assert(Array.isArray(x.replies));ids.push(x.id);}}
  }
  assert.equal(new Set(ids).size,ids.length);
});
test('news snapshots retain article-level attribution, valid dates and a real discussion destination',()=>{
  assert(newsArticles.length>=6);
  assert.equal(new Set(newsArticles.map(a=>a.id)).size,newsArticles.length);
  let previous='9999';
  for(const a of newsArticles){
    assert(new URL(a.sourceUrl).protocol==='https:');
    assert(new URL(a.sourceUrl).pathname.endsWith('.htm'));
    assert(a.source&&a.title&&a.summary&&a.kind);
    assert(a.points.length>=2);
    assert(communitySpaces.some(s=>s.id===a.spaceId));
    for(const id of a.relatedSpaces||[])assert(communitySpaces.some(s=>s.id===id));
    assert(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(a.publishedAt));
    assert(a.publishedAt.slice(0,10)<=newsSnapshotDate);
    assert(a.publishedAt<=previous);previous=a.publishedAt;
  }
});
