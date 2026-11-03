import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createIcons, ArrowUpRight, ArrowLeft, ArrowRight, RotateCcw, MoveUpRight, Box, Layers3, CarFront, Settings2, GitBranch, Disc3, Armchair, Nut, Search, ChevronDown, ChevronRight, X, Plus, Minus, MousePointer2, Rotate3d, Scan, Eye, EyeOff, Focus, Maximize, Info, SlidersHorizontal, Check, Play, Pause, Command, CircleHelp } from 'lucide';
import { createCar } from './car.js';
import { systems, matchesPart, explosionOffset } from './catalog.js';

const iconSet = {ArrowUpRight,ArrowLeft,ArrowRight,RotateCcw,MoveUpRight,Box,Layers3,CarFront,Settings2,GitBranch,Disc3,Armchair,Nut,Search,ChevronDown,ChevronRight,X,Plus,Minus,MousePointer2,Rotate3d,Scan,Eye,EyeOff,Focus,Maximize,Info,SlidersHorizontal,Check,Play,Pause,Command,CircleHelp};
const icon = (name, cls='') => `<i data-lucide="${name}" class="${cls}"></i>`;
const refreshIcons = () => createIcons({ icons: iconSet, attrs: { 'stroke-width': 1.6 } });
const { root, parts } = createCar();
let activeSystem = 'all', query = '', selected = null, isolated = false, xray = false, explode = .18, targetExplode = .18, playing = false, autoRotate = false;
document.querySelector('#app').innerHTML = `
  <header class="header">
    <a class="brand" href="./" aria-label="Torque home"><span class="brand-mark">${icon('nut')}</span>torque<span class="brand-dot">.</span></a>
    <div class="header-divider"></div><span class="workspace-label">The anatomy of a machine</span>
    <nav><span class="nav-active">Explorer</span><button id="help">How it works ${icon('arrow-up-right')}</button></nav>
    <span class="prototype"><span></span>INTERACTIVE LAB</span>
  </header>
  <div class="workspace">
    <aside class="sidebar">
      <div class="side-intro"><span class="eyebrow">YOUR WORKBENCH</span><h1>Beneath the<br>surface<span>.</span></h1><p>Every part has a purpose.<br>Discover how it all connects.</p></div>
      <div class="model-card"><div class="model-symbol">${icon('car-front')}</div><div><strong>GT Coupé</strong><span>Concept series · 01</span></div><span class="model-tag">3D</span></div>
      <div class="section-title"><span>VEHICLE SYSTEMS</span><span>${systems.length-1}</span></div>
      <div class="systems">${systems.map(s=>`<button class="system ${s.id==='all'?'active':''}" data-system="${s.id}">${icon(s.icon)}<span>${s.name}</span><span class="system-count">${s.id==='all'?parts.length:parts.filter(p=>p.system===s.id).length}</span></button>`).join('')}</div>
      <div class="side-note"><span class="note-icon">${icon('mouse-pointer-2')}</span><strong>Curiosity is the only tool you need.</strong><p>Pick a part. Pull it apart.<br>See the bigger picture.</p></div>
      <div class="sidebar-bottom">A LITTLE CURIOSITY. A LOT UNDER THE HOOD.<span>TORQUE LABS © ${new Date().getFullYear()}</span></div>
    </aside>
    <main>
      <div class="main-heading"><div class="breadcrumbs">Workbench ${icon('chevron-right')}<span>GT Coupé</span></div><div class="scene-state"><span></span>Model ready <span class="tiny-divider"></span><span id="visible-count">${parts.length} parts</span></div></div>
      <div class="title-row"><div><div class="eyebrow">EXPLORE THE ENGINEERING</div><h2>One machine. <em>Every detail.</em></h2></div><button class="text-button" id="reset">${icon('rotate-ccw')} Reset view</button></div>
      <div class="explorer">
        <section class="viewport" aria-label="Interactive 3D car explorer">
          <div id="canvas-container"></div>
          <div class="viewport-top"><div class="view-switch"><button class="active" data-view="perspective">${icon('box')} Perspective</button><button data-view="side">Side</button><button data-view="top">Top</button></div><button class="icon-button" id="fullscreen" title="Expand viewer" aria-label="Expand viewer">${icon('maximize')}</button></div>
          <div class="model-caption"><span class="small-cross">+</span><div><strong>GT COUPÉ / 01</strong><span>ILLUSTRATIVE ASSEMBLY</span></div></div>
          <div class="view-tools"><button class="icon-button" id="zoom-in" aria-label="Zoom in" title="Zoom in">${icon('plus')}</button><button class="icon-button" id="zoom-out" aria-label="Zoom out" title="Zoom out">${icon('minus')}</button><span></span><button class="icon-button" id="auto-rotate" aria-label="Toggle rotation" title="Auto rotate" aria-pressed="false">${icon('rotate-3d')}</button><button class="icon-button" id="xray" aria-label="Toggle X-ray" title="X-ray view" aria-pressed="false">${icon('scan')}</button></div>
          <div id="part-tooltip"></div>
          <div class="orientation"><span class="axis-y">Y</span><span class="axis-z">Z</span><span class="axis-x">X</span><svg width="65" height="60" viewBox="0 0 65 60"><path d="M30 34V7M30 34L8 46M30 34L55 47" stroke="#93a59b" stroke-width="1.5"/><circle cx="30" cy="34" r="3" fill="#526b5d"/></svg></div>
          <div class="interaction-hint">${icon('rotate-3d')} Drag to orbit <span>·</span> Scroll to zoom <span>·</span> Click to inspect</div>
          <div class="explode-control"><div class="explode-heading"><div class="explode-label">${icon('layers-3')}<strong>Exploded view</strong><span>See what’s inside.</span></div><output id="explode-value" for="explode-range">18<span>%</span></output></div><div class="range-row"><button id="play" class="play-button" aria-label="Animate exploded view">${icon('play')}</button><input id="explode-range" type="range" min="0" max="100" value="18" aria-label="Exploded view amount"/><button id="explode-all" class="icon-button" aria-label="Fully explode assembly" title="Fully explode">${icon('move-up-right')}</button></div><div class="range-labels"><button id="assemble">Assembled</button><span>DRAG TO DISASSEMBLE</span><button id="disassemble">Fully exploded</button></div></div>
          <div class="webgl-error" hidden><h3>3D rendering is unavailable</h3><p>Enable WebGL in your browser to explore the model. You can still browse every part in the list.</p></div>
        </section>
        <aside class="inspector"><div class="inspector-heading"><span>PART INSPECTOR</span><span class="live-dot"></span></div><div id="inspector-content"></div></aside>
      </div>
      <section class="parts-section"><div class="parts-heading"><div><h3>Piece by piece <span id="list-count"></span></h3><p id="system-description">${systems[0].description}</p></div><label class="search">${icon('search')}<input id="part-search" type="search" placeholder="Find a part…" aria-label="Search parts"/><kbd>/</kbd></label></div><div class="part-list" id="part-list"></div></section>
      <footer><span><span class="footer-dot"></span>Built for the endlessly curious.</span><span>Generic concept model · Not a service reference ${icon('info')}</span></footer>
    </main>
  </div>
  <div id="toast" role="status"></div>
  <dialog id="help-dialog"><button class="icon-button close-dialog" aria-label="Close help">${icon('x')}</button><span class="eyebrow">WELCOME TO TORQUE</span><h2>A little closer.<br>A lot more to discover.</h2><p>Explore a generic sports coupe one component at a time.</p><ol><li><strong>Take it apart.</strong> Move the exploded-view slider to separate the assemblies.</li><li><strong>Find your angle.</strong> Drag to rotate, scroll to zoom, or choose a preset view.</li><li><strong>Follow your curiosity.</strong> Click a component or a part in the list to inspect, isolate, or hide it.</li><li><strong>Go beneath the body.</strong> Turn on X-ray or select a system in the sidebar.</li></ol><div class="help-note">This is a procedural concept model, with ${parts.length} selectable components including 20 wheel bolts. Shapes and materials are illustrative. It is not a complete vehicle CAD model or a repair guide.</div><button class="primary-button" id="start-exploring">Start exploring ${icon('arrow-right')}</button></dialog>
`;

const container = document.querySelector('#canvas-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(36,1,.1,100);
const initialCamera = new THREE.Vector3(-5.4,3.6,5.4);
camera.position.copy(initialCamera);
let renderer, controls, cameraFit = 1, raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
scene.add(root);
scene.add(new THREE.HemisphereLight('#ffffff','#9aa493',3));
const key = new THREE.DirectionalLight('#fff9ee',4.5);key.position.set(-3,7,5);scene.add(key);
const fill = new THREE.DirectionalLight('#deefff',2);fill.position.set(4,4,-5);scene.add(fill);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:'#e8ece5',roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-.4;scene.add(ground);
const grid = new THREE.GridHelper(30,60,'#d4ddd1','#dde4d9');grid.position.y=-.395;grid.material.transparent=true;grid.material.opacity=.55;scene.add(grid);
// Soft contact shadow, independent of the part selection materials.
const shadowCanvas = document.createElement('canvas');shadowCanvas.width=128;shadowCanvas.height=128;
const ctx=shadowCanvas.getContext('2d');const gradient=ctx.createRadialGradient(64,64,4,64,64,64);gradient.addColorStop(0,'rgba(42,59,42,.23)');gradient.addColorStop(1,'rgba(42,59,42,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);
const shadow = new THREE.Mesh(new THREE.PlaneGeometry(7,4),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=-.385;scene.add(shadow);

try {
  renderer = new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor('#e8ece5');renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;container.appendChild(renderer.domElement);
  controls = new OrbitControls(camera,renderer.domElement);controls.target.set(0,.85,0);controls.enableDamping=true;controls.dampingFactor=.07;controls.minDistance=3;controls.maxDistance=28;controls.maxPolarAngle=Math.PI*.49;controls.autoRotateSpeed=.6;controls.update();
  new ResizeObserver(()=>{const {width,height}=container.getBoundingClientRect();renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();}).observe(container);
} catch(error) {document.querySelector('.webgl-error').hidden=false;console.warn('WebGL unavailable',error.message);}

function toast(message){const el=document.querySelector('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toast.timeout);toast.timeout=setTimeout(()=>el.classList.remove('show'),2500);}
function renderList(){
  const list=parts.filter(p=>matchesPart(p,activeSystem,query));
  document.querySelector('#list-count').textContent=String(list.length).padStart(2,'0');
  document.querySelector('#system-description').textContent=systems.find(s=>s.id===activeSystem).description;
  document.querySelector('#part-list').innerHTML=list.length?list.map(p=>`<button class="part-card ${selected===p?'selected':''} ${p.hidden?'hidden-part':''}" data-part="${p.id}"><span class="part-icon">${icon(systems.find(s=>s.id===p.system).icon)}</span><span class="part-card-text"><strong>${p.name}</strong><span>${p.material} <span>·</span> ${p.id.toUpperCase()}</span></span>${icon(p.hidden?'eye-off':'arrow-up-right')}</button>`).join(''):'<div class="empty-search">No parts found. Try “wheel”, “steel”, or “engine”.</div>';
  document.querySelectorAll('[data-part]').forEach(el=>el.addEventListener('click',()=>selectPart(parts.find(p=>p.id===el.dataset.part))));refreshIcons();
}
function updateAppearance(){
  let visible=0;
  parts.forEach(p=>{
    const matching = activeSystem==='all'||p.system===activeSystem;
    p.group.visible=!p.hidden&&(!isolated||p===selected)&&matching;
    if(p.group.visible)visible++;
    p.group.traverse(obj=>{if(!obj.isMesh)return;if(!obj.userData.originalMaterial){obj.userData.originalMaterial=obj.material;obj.material=obj.material.clone();}
      const original=obj.userData.originalMaterial;const faded=xray&&p.system==='body'&&p!==selected;
      obj.material.transparent=faded||original.transparent;obj.material.opacity=faded?.13:original.opacity;obj.material.depthWrite=!faded;
      obj.material.emissive?.set(p===selected?'#536841':'#000000');obj.material.emissiveIntensity=p===selected?.23:0;
    });
  });
  document.querySelector('#visible-count').textContent=`${visible} / ${parts.length} parts visible`;
}
function renderInspector(){
  const el=document.querySelector('#inspector-content');
  if(!selected){el.innerHTML=`<div class="inspector-empty"><div class="empty-illustration">${icon('mouse-pointer-2')}<span class="orbit-ring"></span><span class="orbit-ring second"></span><span class="orbit-spark">+</span></div><span class="eyebrow">A CLOSER LOOK</span><h3>Every detail<br>has a story.</h3><p>Click any part of the car<br>to discover what it does.</p><div class="inspector-tip">${icon('info')}<span>Try separating the model<br>with the slider below.</span></div></div><div class="assembly-facts"><span>THE ASSEMBLY</span><div><strong>${parts.length}</strong><span>individual<br>components</span></div><div><strong>06</strong><span>connected<br>systems</span></div><span class="concept-note">A concept. An invitation to explore.</span></div>`;refreshIcons();return;}
  const system=systems.find(s=>s.id===selected.system);
  el.innerHTML=`<div class="selected-top"><span>${selected.id.toUpperCase()}</span><button id="deselect" class="icon-button" aria-label="Clear selection">${icon('x')}</button></div><div class="part-preview ${selected.system}">${icon(system.icon)}<span>+</span><span>+</span></div><div class="part-detail"><span class="eyebrow">${system.name.toUpperCase()}</span><h3>${selected.name}</h3><span class="selection-badge"><span></span>${selected.hidden?'Hidden from view':'Selected component'}</span><p>${selected.description}</p><dl><div><dt>Material</dt><dd>${selected.material}</dd></div><div><dt>Assembly</dt><dd>GT Coupé / 01</dd></div><div><dt>Component ID</dt><dd>${selected.id.toUpperCase()}</dd></div></dl><button id="isolate" class="primary-button">${icon(isolated?'layers-3':'focus')}${isolated?'Show assembly':'Isolate part'}</button><button id="hide-part" class="secondary-button">${icon(selected.hidden?'eye':'eye-off')}${selected.hidden?'Show part':'Hide part'}</button><div class="inspector-disclaimer">Illustrative component.<br>Not for manufacturing or repair.</div></div>`;
  document.querySelector('#deselect').onclick=()=>selectPart(null);
  document.querySelector('#isolate').onclick=()=>{isolated=!isolated;if(isolated){selected.hidden=false;activeSystem='all';updateSystemButtons();}updateAppearance();renderInspector();renderList();};
  document.querySelector('#hide-part').onclick=()=>{selected.hidden=!selected.hidden;isolated=false;updateAppearance();renderInspector();renderList();};
  refreshIcons();
}
function selectPart(p){selected=p;isolated=false;updateAppearance();renderInspector();renderList();}
function updateSystemButtons(){document.querySelectorAll('[data-system]').forEach(b=>b.classList.toggle('active',b.dataset.system===activeSystem));}
document.querySelectorAll('[data-system]').forEach(el=>el.onclick=()=>{activeSystem=el.dataset.system;isolated=false;selected=null;updateSystemButtons();updateAppearance();renderInspector();renderList();});
document.querySelector('#part-search').oninput=e=>{query=e.target.value;renderList();};
function setExplode(value){targetExplode=value;document.querySelector('#explode-range').value=Math.round(value*100);document.querySelector('#explode-value').innerHTML=`${Math.round(value*100)}<span>%</span>`;document.querySelector('#explode-range').style.setProperty('--value',`${value*100}%`);}
function stopPlaying(){playing=false;document.querySelector('#play').innerHTML=icon('play');document.querySelector('#play').setAttribute('aria-label','Animate exploded view');refreshIcons();}
document.querySelector('#explode-range').oninput=e=>{stopPlaying();setExplode(+e.target.value/100);};
document.querySelector('#assemble').onclick=()=>{stopPlaying();setExplode(0);};
document.querySelector('#disassemble').onclick=document.querySelector('#explode-all').onclick=()=>{stopPlaying();setExplode(1);};
document.querySelector('#play').onclick=()=>{playing=!playing;if(playing){if(targetExplode>=1)setExplode(0);document.querySelector('#play').innerHTML=icon('pause');document.querySelector('#play').setAttribute('aria-label','Pause animation');refreshIcons();}else stopPlaying();};
function setView(view){if(!controls)return;const positions={perspective:initialCamera,side:new THREE.Vector3(0,1.2,9),top:new THREE.Vector3(0,10,.01)};controls.target.set(0,.85,0);camera.position.copy(positions[view]).sub(controls.target).multiplyScalar(cameraFit).add(controls.target);controls.update();document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===view));}
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>setView(b.dataset.view));
document.querySelector('#zoom-in').onclick=()=>{if(controls){camera.position.sub(controls.target).multiplyScalar(.85).add(controls.target);controls.update();}};
document.querySelector('#zoom-out').onclick=()=>{if(controls){camera.position.sub(controls.target).multiplyScalar(1.18).add(controls.target);controls.update();}};
document.querySelector('#auto-rotate').onclick=e=>{autoRotate=!autoRotate;if(controls)controls.autoRotate=autoRotate;e.currentTarget.classList.toggle('active',autoRotate);e.currentTarget.setAttribute('aria-pressed',autoRotate);};
document.querySelector('#xray').onclick=e=>{xray=!xray;updateAppearance();e.currentTarget.classList.toggle('active',xray);e.currentTarget.setAttribute('aria-pressed',xray);};
document.querySelector('#reset').onclick=()=>{stopPlaying();setExplode(0);selected=null;isolated=false;xray=false;autoRotate=false;if(controls)controls.autoRotate=false;activeSystem='all';query='';document.querySelector('#part-search').value='';parts.forEach(p=>p.hidden=false);for(const id of ['xray','auto-rotate']){const button=document.querySelector(`#${id}`);button.classList.remove('active');button.setAttribute('aria-pressed','false');}setView('perspective');updateSystemButtons();updateAppearance();renderInspector();renderList();toast('Assembly and view reset');};
document.querySelector('#fullscreen').onclick=async()=>{const el=document.querySelector('.viewport');try{if(document.fullscreenElement)await document.exitFullscreen();else if(el.requestFullscreen)await el.requestFullscreen();else toast('Fullscreen is not supported by this browser');}catch{toast('Fullscreen is unavailable in this window');}};
const dialog=document.querySelector('#help-dialog');document.querySelector('#help').onclick=()=>dialog.showModal();document.querySelector('.close-dialog').onclick=document.querySelector('#start-exploring').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
window.addEventListener('keydown',e=>{if(e.key==='/'&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){e.preventDefault();document.querySelector('#part-search').focus();}if(e.key==='Escape'&&!dialog.open)selectPart(null);});

let down;
function hit(event){const r=renderer.domElement.getBoundingClientRect();pointer.set((event.clientX-r.left)/r.width*2-1,-(event.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);return raycaster.intersectObjects(parts.filter(p=>p.group.visible&&!(xray&&p.system==='body'&&p!==selected)).map(p=>p.group),true)[0]?.object.userData.part;}
if(renderer){renderer.domElement.addEventListener('pointerdown',e=>down=[e.clientX,e.clientY]);renderer.domElement.addEventListener('pointerup',e=>{if(down&&Math.hypot(e.clientX-down[0],e.clientY-down[1])<5){const p=hit(e);if(p)selectPart(p);}down=null;});renderer.domElement.addEventListener('pointermove',e=>{const p=hit(e);renderer.domElement.style.cursor=p?'pointer':'grab';const tip=document.querySelector('#part-tooltip');tip.textContent=p?.name||'';tip.classList.toggle('visible',!!p&&!down);const r=container.getBoundingClientRect();tip.style.left=`${Math.min(e.clientX-r.left+14,r.width-180)}px`;tip.style.top=`${e.clientY-r.top-35}px`;});renderer.domElement.addEventListener('pointerleave',()=>document.querySelector('#part-tooltip').classList.remove('visible'));}
let last=0;
function animate(time){requestAnimationFrame(animate);const delta=Math.min((time-last)/1000,.05);last=time;if(playing){setExplode(Math.min(1,targetExplode+delta*.13));if(targetExplode>=1)stopPlaying();}explode+=(targetExplode-explode)*.085;parts.forEach(p=>{const offset=explosionOffset(p,explode);p.group.position.set(...p.position.map((v,i)=>v+offset[i]));});if(controls){const fit=Math.max(1,1.45/camera.aspect)*(1+explode*.35);camera.position.sub(controls.target).multiplyScalar(fit/cameraFit).add(controls.target);cameraFit=fit;controls.update();renderer.render(scene,camera);}}
updateAppearance();renderInspector();renderList();setExplode(.18);refreshIcons();requestAnimationFrame(animate);
