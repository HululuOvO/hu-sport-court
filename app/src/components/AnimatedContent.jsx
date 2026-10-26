import { useEffect, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
const useSafeLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
const WIPES = {
  up: 'linear-gradient(to top, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',
  down: 'linear-gradient(to bottom, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',
  left: 'linear-gradient(to left, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',
  right: 'linear-gradient(to right, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',
  center: 'radial-gradient(farthest-corner at 50% 50%, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))'
};

// Adapted from the component supplied by Roy. Content stays visible if JS cannot run.
export default function AnimatedContent({ children, container, distance=28, direction='vertical',
  reverse=false, duration=.75, ease='power3.out', initialOpacity=0, animateOpacity=true,
  scale=1, blur=0, rotate=0, tilt=0, wipe='none', threshold=.15, delay=0,
  stagger=0, staggerFrom='start', trigger='scroll', once=true, scrub=false,
  disappearAfter=0, disappearDuration=.5, disappearEase='power3.in',
  onStart, onComplete, onDisappearanceComplete, className='', style, ...props }) {
  const ref=useRef(null), callbacks=useRef({});
  callbacks.current={onStart,onComplete,onDisappearanceComplete};
  useSafeLayoutEffect(()=>{
    const el=ref.current;
    if(!el) return;
    let scroller=container || document.getElementById('snap-main-container') || undefined;
    if(typeof scroller==='string') scroller=document.querySelector(scroller) || undefined;
    const mm=gsap.matchMedia();
    mm.add({reduce:'(prefers-reduced-motion: reduce)',normal:'(prefers-reduced-motion: no-preference)'},context=>{
      const targets=stagger>0 && el.children.length ? [...el.children] : [el];
      if(context.conditions.reduce){callbacks.current.onComplete?.();return;}
      const axis=direction==='horizontal' ? 'x' : 'y', sign=reverse ? -1 : 1, mask=WIPES[wipe];
      const from={[axis]:distance*sign,scale,opacity:animateOpacity ? initialOpacity : 1};
      const to={[axis]:0,scale:1,opacity:1,duration,ease};
      if(blur>0){from.filter=`blur(${blur}px)`;to.filter='blur(0px)';}
      if(rotate){from.rotation=rotate*sign;to.rotation=0;}
      if(tilt){const a=direction==='horizontal' ? 'rotationY' : 'rotationX';from[a]=tilt*sign;to[a]=0;from.transformPerspective=900;}
      if(mask){gsap.set(targets,{maskImage:mask,webkitMaskImage:mask});from['--ac-wipe']=0;to['--ac-wipe']=1;}
      if(stagger>0) to.stagger={each:stagger,from:staggerFrom};
      const tl=gsap.timeline({paused:true,onStart:()=>callbacks.current.onStart?.(),onComplete:()=>{
        callbacks.current.onComplete?.();
        if(!scrub){gsap.set(targets,{clearProps:mask ? 'filter,transform,maskImage,webkitMaskImage' : 'filter,transform'});}
        if(disappearAfter>0 && once && !scrub){gsap.to(targets,{[axis]:-distance*sign,opacity:0,delay:disappearAfter,duration:disappearDuration,ease:disappearEase,onComplete:()=>callbacks.current.onDisappearanceComplete?.()});}
      }});
      tl.fromTo(targets,from,to,scrub ? 0 : Math.max(0,delay));
      if(trigger==='mount'){tl.play();return;}
      const start=`top ${(1-threshold)*100}%`;
      ScrollTrigger.create({trigger:el,scroller,start,
        ...(scrub ? {end:`top ${Math.max((1-threshold)*100-45,5)}%`,scrub:scrub===true ? true : Math.max(.01,Number(scrub)||0),animation:tl}
          : {once,onEnter:()=>tl.play(),onLeaveBack:once ? undefined : ()=>{if(mask)gsap.set(targets,{maskImage:mask,webkitMaskImage:mask});tl.reverse();}})
      });
    },el);
    return ()=>mm.revert();
  },[container,distance,direction,reverse,duration,ease,initialOpacity,animateOpacity,scale,blur,rotate,tilt,wipe,threshold,delay,stagger,staggerFrom,trigger,once,scrub,disappearAfter,disappearDuration,disappearEase]);
  return <div ref={ref} className={className} style={style} {...props}>{children}</div>;
}
