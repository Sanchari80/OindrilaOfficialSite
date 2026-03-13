import React, { useEffect, useRef } from 'react';

// ── Floating film flyer shapes (SVG decorative posters) ──
const FlyerShapes = [
  // Vertical film poster silhouette
  ({ style }) => (
    <svg style={style} viewBox="0 0 80 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="76" height="116" rx="2" stroke="#c9a84c" strokeWidth="1.5" fill="none"/>
      <rect x="2" y="2" width="76" height="8"  fill="rgba(201,168,76,0.15)"/>
      <rect x="2" y="110" width="76" height="8" fill="rgba(201,168,76,0.15)"/>
      {[0,1,2,3,4].map(i=>(
        <rect key={i} x="4" y={14+i*3} width="4" height="2" rx="1" fill="rgba(201,168,76,0.4)"/>
      ))}
      {[0,1,2,3,4].map(i=>(
        <rect key={i} x="72" y={14+i*3} width="4" height="2" rx="1" fill="rgba(201,168,76,0.4)"/>
      ))}
      <rect x="12" y="28" width="56" height="60" rx="1" fill="rgba(201,168,76,0.04)" stroke="rgba(201,168,76,0.2)" strokeWidth="1"/>
      <line x1="12" y1="95" x2="68" y2="95" stroke="rgba(201,168,76,0.3)" strokeWidth="0.8"/>
      <rect x="20" y="100" width="40" height="4" rx="1" fill="rgba(201,168,76,0.15)"/>
      <rect x="28" y="106" width="24" height="2" rx="1" fill="rgba(201,168,76,0.08)"/>
    </svg>
  ),
  // Film reel
  ({ style }) => (
    <svg style={style} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="46" stroke="#c9a84c" strokeWidth="1.2" fill="none"/>
      <circle cx="50" cy="50" r="30" stroke="rgba(201,168,76,0.4)" strokeWidth="1" fill="none"/>
      <circle cx="50" cy="50" r="10" fill="rgba(201,168,76,0.1)" stroke="#c9a84c" strokeWidth="1"/>
      <circle cx="50" cy="50" r="4"  fill="rgba(201,168,76,0.5)"/>
      {[0,60,120,180,240,300].map((deg,i)=>{
        const r=(deg*Math.PI)/180;
        return <circle key={i} cx={50+37*Math.cos(r)} cy={50+37*Math.sin(r)} r="5" fill="rgba(0,0,0,0.7)" stroke="rgba(201,168,76,0.4)" strokeWidth="0.8"/>;
      })}
      {[30,90,150,210,270,330].map((deg,i)=>{
        const r=(deg*Math.PI)/180;
        return <line key={i} x1={50+11*Math.cos(r)} y1={50+11*Math.sin(r)} x2={50+29*Math.cos(r)} y2={50+29*Math.sin(r)} stroke="rgba(201,168,76,0.25)" strokeWidth="1"/>;
      })}
    </svg>
  ),
  // Clapperboard
  ({ style }) => (
    <svg style={style} viewBox="0 0 110 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="18" width="106" height="58" rx="2" stroke="#c9a84c" strokeWidth="1.2" fill="rgba(201,168,76,0.03)"/>
      <rect x="2" y="2"  width="106" height="20" rx="2" stroke="#c9a84c" strokeWidth="1.2" fill="rgba(201,168,76,0.08)"/>
      {[0,1,2,3,4,5,6].map(i=>(
        <line key={i} x1={8+i*16} y1="2" x2={i*16} y2="22" stroke="rgba(201,168,76,0.5)" strokeWidth="2"/>
      ))}
      <line x1="8"  y1="36" x2="102" y2="36" stroke="rgba(201,168,76,0.2)" strokeWidth="0.8"/>
      <line x1="8"  y1="48" x2="102" y2="48" stroke="rgba(201,168,76,0.2)" strokeWidth="0.8"/>
      <rect x="10" y="56" width="50" height="5" rx="1" fill="rgba(201,168,76,0.1)"/>
    </svg>
  ),
  // Film strip horizontal
  ({ style }) => (
    <svg style={style} viewBox="0 0 200 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="198" height="48" rx="2" stroke="#c9a84c" strokeWidth="1" fill="none"/>
      {[0,1,2,3,4,5,6,7,8,9].map(i=>(
        <rect key={i} x={8+i*20} y="4"  width="8" height="5" rx="1" fill="rgba(201,168,76,0.3)" stroke="rgba(201,168,76,0.4)" strokeWidth="0.5"/>
      ))}
      {[0,1,2,3,4,5,6,7,8,9].map(i=>(
        <rect key={i} x={8+i*20} y="41" width="8" height="5" rx="1" fill="rgba(201,168,76,0.3)" stroke="rgba(201,168,76,0.4)" strokeWidth="0.5"/>
      ))}
      {[0,1,2,3].map(i=>(
        <rect key={i} x={4+i*50} y="12" width="44" height="26" rx="1" fill="rgba(201,168,76,0.04)" stroke="rgba(201,168,76,0.15)" strokeWidth="0.8"/>
      ))}
    </svg>
  ),
];

// ── Flyer config: position, size, animation ──
const FLYERS = [
  { left: '8%',  width: 70,  height: 105, shape: 0, anim: 'flyerFloat1', duration: '22s', delay: '0s'   },
  { left: '20%', width: 90,  height: 90,  shape: 1, anim: 'flyerFloat2', duration: '28s', delay: '5s'   },
  { left: '38%', width: 100, height: 72,  shape: 2, anim: 'flyerFloat1', duration: '25s', delay: '10s'  },
  { left: '55%', width: 160, height: 40,  shape: 3, anim: 'flyerFloat3', duration: '32s', delay: '3s'   },
  { left: '70%', width: 65,  height: 98,  shape: 0, anim: 'flyerFloat2', duration: '20s', delay: '14s'  },
  { left: '82%', width: 80,  height: 80,  shape: 1, anim: 'flyerFloat3', duration: '26s', delay: '8s'   },
  { left: '14%', width: 120, height: 34,  shape: 3, anim: 'flyerFloat2', duration: '30s', delay: '18s'  },
  { left: '60%', width: 60,  height: 90,  shape: 0, anim: 'flyerFloat1', duration: '23s', delay: '22s'  },
];

const CineplexBackground = () => {
  return (
    <>
      {/* Scan lines */}
      <div className="film-scanline" />

      {/* Spotlights */}
      <div className="spotlight-left" />
      <div className="spotlight-right" />
      <div className="projector-beam" />

      {/* Glow pools */}
      <div className="glow-amber" />
      <div className="glow-red" />

      {/* Film borders */}
      <div className="film-border-top" />
      <div className="film-border-bottom" />
      <div className="film-side-left" />
      <div className="film-side-right" />

      {/* Floating flyers */}
      {FLYERS.map((f, i) => {
        const Shape = FlyerShapes[f.shape];
        return (
          <Shape key={i} style={{
            position: 'fixed',
            left: f.left,
            bottom: '-20vh',
            width: f.width,
            height: f.height,
            zIndex: 3,
            pointerEvents: 'none',
            animation: `${f.anim} ${f.duration} linear ${f.delay} infinite`,
            willChange: 'transform, opacity',
          }} />
        );
      })}
    </>
  );
};

export default CineplexBackground;