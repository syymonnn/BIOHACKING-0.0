// components/HeroOrbitale.jsx
import { useEffect, useRef } from 'react';

export default function HeroOrbitale() {
  const overlayRef = useRef(null);

  useEffect(() => {
    const cvs = document.getElementById('ae-field');
    const ctx = cvs.getContext('2d', { alpha: true });

    // ---- params rendering ----
    const COLORS = ['#dce8f5', '#b9c9f2'];
    const ACCENT_PROB = 0.008;
    const N_PARTS = 300, LOCAL_R1 = 110, LOCAL_R2 = 200, ATTR1 = 0.9, ATTR2 = 0.35;
    const SPRING = 0.010, DAMPING = 0.90, NOISEV = 0.0035;
    const DOT_MIN = 1.0, DOT_MAX = 1.7;
    const LINK_DIST = 120, LINKS_MAX = 1;

    let w, h, dpr; let built = false;
    const mouse = { x: 0, y: 0, active: false };
    let parts = [];

    // ---- FADE su scroll ----
    const MIN_OPACITY = 0.35;        // opacità finale (più basso = più “dietro”)
    let targetOpacity = 1, currentOpacity = 1;
    const LERP = 0.12;               // morbidezza animazione

    function updateFade() {
      const fadeDist = Math.min(window.innerHeight * 0.4, 640); // prima “fetta” di pagina
      const t = Math.min(1, window.scrollY / fadeDist);         // 0..1
      targetOpacity = 1 - t * (1 - MIN_OPACITY);                // 1 → MIN_OPACITY
    }

    function applyFade() {
      // lerp per evitare scatti
      currentOpacity += (targetOpacity - currentOpacity) * LERP;
      const el = overlayRef.current;
      if (el) el.style.opacity = currentOpacity.toFixed(3);
    }

    // full‑viewport canvas
    function resize() {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = cvs.width  = Math.floor(window.innerWidth  * dpr);
      h = cvs.height = Math.floor(window.innerHeight * dpr);
      built = false;
      updateFade();
    }
    window.addEventListener('resize', resize);

    const choice = (a) => a[(Math.random()*a.length)|0];
    const rand   = (a,b) => a + Math.random()*(b-a);

    function build() {
      parts = Array.from({length:N_PARTS}, () => ({
        x: Math.random()*w, y: Math.random()*h,
        vx:(Math.random()-0.5)*0.2, vy:(Math.random()-0.5)*0.2,
        hx: Math.random()*w, hy: Math.random()*h,
        phase: Math.random()*Math.PI*2,
        r: rand(DOT_MIN, DOT_MAX)*dpr,
        color: (Math.random()<ACCENT_PROB ? '#c8ff57' : choice(COLORS)),
        excite: 0
      }));
    }

    function draw() {
      if (!built) { build(); built = true; }
      ctx.clearRect(0,0,w,h);

      const cell = (LINK_DIST*dpr)|0;
      const grid = new Map(); const key=(ix,iy)=>ix+','+iy;

      for (const p of parts) {
        p.phase += NOISEV + p.excite*0.004;
        const nx=Math.cos(p.phase), ny=Math.sin(p.phase*0.9);
        p.vx += nx*0.06; p.vy += ny*0.06;
        p.vx += (p.hx-p.x)*SPRING; p.vy += (p.hy-p.y)*SPRING;

        if (mouse.active) {
          const mx=mouse.x-p.x, my=mouse.y-p.y, d2=mx*mx+my*my;
          const r1=LOCAL_R1*dpr, r2=LOCAL_R2*dpr;
          if (d2<r2*r2){ const d=Math.sqrt(d2)||1, ux=mx/d, uy=my/d;
            const f=(d<r1)? ATTR1*(1-d/r1) : ATTR2*(1-d/r2);
            p.vx += ux*f; p.vy += uy*f; p.excite = Math.min(1, p.excite+0.10+f*0.15);
          }
        }

        p.x+=p.vx; p.y+=p.vy; p.vx*=DAMPING; p.vy*=DAMPING; p.excite*=0.92;
        if(p.x<0){p.x=0;p.vx*=-0.5;} if(p.x>w){p.x=w;p.vx*=-0.5;}
        if(p.y<0){p.y=0;p.vy*=-0.5;} if(p.y>h){p.y=h;p.vy*=-0.5;}

        const ix=Math.floor(p.x/cell), iy=Math.floor(p.y/cell), k=key(ix,iy);
        if(!grid.has(k)) grid.set(k,[]); grid.get(k).push(p);
      }

      // links sobri
      ctx.lineCap='round'; ctx.lineJoin='round';
      for (const [k,bucket] of grid){
        const [ix,iy]=k.split(',').map(Number);
        const neigh=[]; for(let gx=-1;gx<=1;gx++) for(let gy=-1;gy<=1;gy++){
          const nb=grid.get(`${ix+gx},${iy+gy}`); if(nb) neigh.push(...nb);
        }
        for(const p of bucket){ let linked=0;
          for(const q of neigh){ if(p===q||linked>=LINKS_MAX) continue;
            const dx=p.x-q.x, dy=p.y-q.y, R=LINK_DIST*dpr, d2=dx*dx+dy*dy;
            if(d2<R*R){ const d=Math.sqrt(d2), a=1-d/R;
              ctx.lineWidth=Math.max(1,dpr*0.8);
              ctx.strokeStyle=`rgba(190,210,245,${(0.04+a*0.08).toFixed(3)})`;
              ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y); ctx.stroke(); linked++;
            }
          }
        }
      }

      for (const p of parts){
        ctx.globalAlpha=0.85 + p.excite*0.15;
        ctx.fillStyle=p.color; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
      }
      ctx.globalAlpha=1;

      // applica fade morbido
      applyFade();

      requestAnimationFrame(draw);
    }

    function onPointer(e){
      const m=e.touches?e.touches[0]:e;
      const ratio = window.devicePixelRatio || 1;
      mouse.active=true; mouse.x=m.clientX*ratio; mouse.y=m.clientY*ratio;

      // aggiorna gradiente che segue il mouse
      const svg = document.getElementById('ae-hero');
      const grad = document.getElementById('ae-glow');
      if(svg && grad){
        const bbox = svg.getBoundingClientRect();
        const rx=(m.clientX-bbox.left)/bbox.width, ry=(m.clientY-bbox.top)/bbox.height;
        grad.setAttribute('cx', (1200*rx).toFixed(1));
        grad.setAttribute('cy', (300*ry).toFixed(1));
      }
    }

    function onScroll(){ updateFade(); }
    function onResize(){ resize(); }

    // boot
    resize(); updateFade();
    requestAnimationFrame(draw);
    window.addEventListener('pointermove', onPointer, {passive:true});
    window.addEventListener('touchmove', onPointer, {passive:true});
    window.addEventListener('scroll', onScroll, {passive:true});
    window.addEventListener('resize', onResize);

    // PRM
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handlePRM = () => { if (media.matches) overlayRef.current && (overlayRef.current.style.opacity = '1'); };
    media.addEventListener?.('change', handlePRM);

    return () => {
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('touchmove', onPointer);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      media.removeEventListener?.('change', handlePRM);
    };
  }, []);

  return (
    <>
      {/* OVERLAY fisso a pieno schermo (trasparente, fuori dal flow) */}
      <div
        id="ae-overlay"
        ref={overlayRef}
        aria-hidden
        style={{
          position:'fixed', inset:0, width:'100%', height:'100dvh',
          pointerEvents:'none', zIndex:0, opacity:1, // l'opacità verrà gestita via JS
          overflow:'visible', background:'transparent'
        }}
      >
        <canvas
          id="ae-field"
          style={{position:'absolute', inset:0, width:'100%', height:'100%', background:'transparent'}}
        />
        <svg
          id="ae-hero"
          viewBox="0 0 1200 300"
          preserveAspectRatio="xMidYMid meet"
          style={{
            position:'absolute', left:'50%', top:'50%',
            transform:'translate(-50%,-50%)',
            width:'min(92vw,1400px)', height:'auto',
            overflow:'visible', pointerEvents:'none'
          }}
        >
          <defs>
            <radialGradient id="ae-glow" gradientUnits="userSpaceOnUse" cx="600" cy="150" r="240">
              <stop offset="0%"  stopColor="#35ffd2" stopOpacity="0.28"/>
              <stop offset="35%" stopColor="#a56bff" stopOpacity="0.18"/>
              <stop offset="65%" stopColor="#a56bff" stopOpacity="0.06"/>
              <stop offset="100%" stopColor="#000"    stopOpacity="0"/>
            </radialGradient>
            <linearGradient id="ae-base" x1="0" y1="0" x2="1200" y2="0">
              <stop offset="0%" stopColor="rgba(255,255,255,0.22)"/>
              <stop offset="100%" stopColor="rgba(255,255,255,0.22)"/>
            </linearGradient>
            <filter id="ae-soft" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle"
            fontFamily="Inter,Segoe UI,Arial,sans-serif" fontWeight="900" fontSize="220"
            fill="none" stroke="url(#ae-base)" strokeWidth="1.3" strokeLinejoin="round">
            Æ-HUMAN
          </text>

          <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle"
            fontFamily="Inter,Segoe UI,Arial,sans-serif" fontWeight="900" fontSize="220"
            fill="none" stroke="url(#ae-glow)" strokeWidth="4.0" strokeLinejoin="round"
            opacity="0.85" filter="url(#ae-soft)">
            Æ-HUMAN
          </text>
        </svg>
      </div>

      {/* SPACER nel flow (mantiene layout invariato) */}
      <div style={{height:'100dvh'}} />
    </>
  );
}
