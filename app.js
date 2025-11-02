// Global helpers
const $ = (s, r=document)=>r.querySelector(s);
const $$ = (s, r=document)=>Array.from(r.querySelectorAll(s));
const uid = ()=>Math.random().toString(36).slice(2,9);

// ====== Landing Page Navigation ======
const landingPage = $('#landing-page');
const mainApp = $('#main-app');

function showApp(){
  if(landingPage) landingPage.style.display = 'none';
  if(mainApp) mainApp.style.display = 'block';
  document.body.style.overflow = 'auto';
}

function showLanding(){
  if(landingPage) landingPage.style.display = 'block';
  if(mainApp) mainApp.style.display = 'none';
  window.scrollTo({top:0, behavior:'smooth'});
}

// Landing page buttons
$('#enterApp')?.addEventListener('click', showApp);
$('#getStarted')?.addEventListener('click', showApp);
$('#ctaLaunch')?.addEventListener('click', showApp);
$('#backToLanding')?.addEventListener('click', showLanding);

// Smooth scroll for Learn More
$('#learnMore')?.addEventListener('click', ()=>{
  $('#features')?.scrollIntoView({behavior:'smooth', block:'start'});
});

// Check if user wants to go directly to app (from localStorage or URL)
if(localStorage.getItem('si_suite_skip_landing')==='true' || window.location.hash==='#app'){
  showApp();
}

// ====== State ======
const state = {
  req: { items: [] }, // {id,title,actor,ac,bucket}
  ea: { stages: [], caps: [], map: {} , stakeholders: [] }, // map key: stage -> [{id, heat}]
  ixd: { mode: 'move', nodes: [], wires: [] }, // nodes: {id,type,x,y,w,h,label}
  diagram: { tool: 'select', shapes: [], connectors: [], selected: null, tempConnector: null }, // draw.io-like
  erd: { mode: 'move', entities: [], relations: [], selected: null, pending: null },
  quiz: { answers: {}, submitted: false, score: 0 }
};

// ====== Tabs ======
$$('.tab').forEach(t=>t.addEventListener('click', ()=>{
  $$('.tab').forEach(x=>x.classList.remove('active'));
  t.classList.add('active');
  $$('.tab-panel').forEach(p=>p.classList.remove('active'));
  $('#tab-' + t.dataset.tab).classList.add('active');
}));

// ====== REQUIREMENTS ======
$('#req-form').addEventListener('submit', (e)=>{
  e.preventDefault();
  const fd = new FormData(e.target);
  const item = {
    id: uid(), title: (fd.get('title')||'').trim(),
    actor: (fd.get('actor')||'').trim(), ac: (fd.get('ac')||'').trim(),
    bucket: 'S'
  };
  if(!item.title) return;
  state.req.items.push(item);
  e.target.reset();
  drawReq();
});

function drawReq(){
  const buckets = {M:$('#m-list'), S:$('#s-list'), C:$('#c-list'), W:$('#w-list')};
  Object.values(buckets).forEach(el=>el.innerHTML='');

  state.req.items.forEach(it=>{
    const el = document.createElement('article');
    el.className='ticket'; el.draggable=true; el.dataset.id=it.id;
    el.innerHTML = `
      <header>
        <span class="badge">${it.actor||'Actor'}</span>
        <div style="display:flex; gap:6px">
          <button class="del danger" title="Delete">×</button>
        </div>
      </header>
      <div contenteditable="true" class="title">${it.title}</div>
      <label>Acceptance Criteria</label>
      <textarea>${it.ac||''}</textarea>
    `;
    // drag
    el.addEventListener('dragstart', ev=>{
      ev.dataTransfer.setData('text/plain', it.id);
    });
    // edits
    el.querySelector('.title').addEventListener('input', ev=>{
      it.title = ev.target.textContent.trim();
    });
    el.querySelector('textarea').addEventListener('input', ev=>{
      it.ac = ev.target.value;
    });
    el.querySelector('.del').addEventListener('click', ()=>{
      state.req.items = state.req.items.filter(x=>x.id!==it.id);
      drawReq();
    });
    buckets[it.bucket].appendChild(el);
  });

  $$('.col .list').forEach(list=>{
    list.addEventListener('dragover', e=>e.preventDefault());
    list.addEventListener('drop', e=>{
      const id = e.dataTransfer.getData('text/plain');
      const item = state.req.items.find(x=>x.id===id);
      if(item){
        item.bucket = list.closest('.col').dataset.bucket;
        drawReq();
      }
    });
  });
}

$('#export-req-csv').addEventListener('click', ()=>{
  const rows = [['ID','Title','Actor','AC','Bucket']]
    .concat(state.req.items.map(i=>[i.id,i.title,i.actor,(i.ac||'').replace(/\n/g,' '),i.bucket]));
  const csv = rows.map(r=>r.map(v=>`"${(v||'').replace(/"/g,'""')}"`).join(',')).join('\n');
  downloadBlob(new Blob([csv],{type:'text/csv'}),'requirements.csv');
});

// ====== EA: Value Stream × Capability ======
$('#add-vs').addEventListener('click', ()=>{
  const name = ($('#vs-name').value||'').trim(); if(!name) return;
  state.ea.stages.push({ id: uid(), name });
  $('#vs-name').value=''; drawEA();
});
$('#add-cap').addEventListener('click', ()=>{
  const name = ($('#cap-name').value||'').trim(); if(!name) return;
  const cap = { id: uid(), name };
  state.ea.caps.push(cap); drawEA();
  $('#cap-name').value='';
});

$('#stake-add').addEventListener('click', ()=>{
  const name = ($('#stake-input').value||'').trim(); if(!name) return;
  state.ea.stakeholders.push({ id: uid(), name });
  $('#stake-input').value=''; drawEA();
});

function drawEA(){
  // Stakeholders
  const s = $('#stake-list'); s.innerHTML='';
  state.ea.stakeholders.forEach(k=>{
    const d = document.createElement('div');
    d.className='row';
    d.innerHTML = `<span style="flex:1">${k.name}</span><button data-id="${k.id}" class="danger">×</button>`;
    d.querySelector('button').onclick = ()=>{
      state.ea.stakeholders = state.ea.stakeholders.filter(x=>x.id!==k.id); drawEA();
    };
    s.appendChild(d);
  });

  // Stages grid
  const grid = $('#vs-grid'); grid.innerHTML='';
  state.ea.stages.forEach(st=>{
    const wrap = document.createElement('section');
    wrap.className='stage'; wrap.dataset.id = st.id;
    wrap.innerHTML = `
      <header><h3 contenteditable="true">${st.name}</h3>
      <button class="danger del">×</button></header>
      <div class="drop" aria-label="Drop capabilities here"></div>`;
    wrap.querySelector('h3').oninput = e=>{ st.name = e.target.textContent.trim(); };
    wrap.querySelector('.del').onclick = ()=>{
      state.ea.stages = state.ea.stages.filter(x=>x.id!==st.id); delete state.ea.map[st.id]; drawEA();
    };
    const drop = wrap.querySelector('.drop');
    drop.addEventListener('dragover', e=>e.preventDefault());
    drop.addEventListener('drop', e=>{
      const capId = e.dataTransfer.getData('text/plain');
      if(!state.ea.map[st.id]) state.ea.map[st.id]=[];
      if(!state.ea.map[st.id].some(x=>x.id===capId)){
        state.ea.map[st.id].push({ id: capId, heat:50 });
      }
      drawEA();
    });

    // render mapped caps
    const mapped = (state.ea.map[st.id]||[]).map(m=>{
      const cap = state.ea.caps.find(c=>c.id===m.id);
      if(!cap) return null;
      const chip = document.createElement('div');
      chip.className='cap-chip';
      chip.innerHTML = `<span>${cap.name}</span><input class="heat" type="range" min="0" max="100" value="${m.heat}"><button class="danger rm">×</button>`;
      chip.querySelector('.heat').oninput = e=>{ m.heat = +e.target.value; };
      chip.querySelector('.rm').onclick = ()=>{
        state.ea.map[st.id] = (state.ea.map[st.id]||[]).filter(x=>x.id!==m.id); drawEA();
      };
      // color by heat
      const hue = 220 - (m.heat*2);
      chip.style.borderColor = `hsl(${hue} 60% 45%)`;
      return chip;
    }).filter(Boolean);
    mapped.forEach(c=>drop.appendChild(c));
    grid.appendChild(wrap);
  });

  // Capability pool
  const pool = $('#cap-pool'); pool.innerHTML='';
  state.ea.caps.forEach(cap=>{
    const chip = document.createElement('div');
    chip.className='cap-chip pool'; chip.draggable=true; chip.dataset.id=cap.id;
    chip.innerHTML = `<span>${cap.name}</span>`;
    chip.addEventListener('dragstart', e=>{
      e.dataTransfer.setData('text/plain', cap.id);
    });
    pool.appendChild(chip);
  });
}

// ====== IXD: Wireframe + Wiring + Event log ======
const ixdWires = $('#ixd-wires');
(function initDefs(){
  const defs = document.createElementNS('http://www.w3.org/2000/svg','defs');
  const marker = document.createElementNS('http://www.w3.org/2000/svg','marker');
  marker.setAttribute('id','arrow'); marker.setAttribute('markerWidth','10'); marker.setAttribute('markerHeight','7'); marker.setAttribute('refX','10'); marker.setAttribute('refY','3.5'); marker.setAttribute('orient','auto');
  const path = document.createElementNS('http://www.w3.org/2000/svg','path');
  path.setAttribute('d','M0,0 L10,3.5 L0,7 z'); path.setAttribute('fill','#86c5ff'); marker.appendChild(path);
  defs.appendChild(marker); ixdWires.appendChild(defs);
})();

$('#ixd-mode').addEventListener('change', e=> state.ixd.mode = e.target.value);
$('.palette').addEventListener('click', e=>{
  const b = e.target.closest('.comp'); if(!b) return;
  spawnNode(b.dataset.type, 40 + state.ixd.nodes.length*16, 60 + state.ixd.nodes.length*12);
});

const ixdBoard = $('#ixd-board');
function spawnNode(type, x, y){
  const id = uid();
  const el = document.createElement('article');
  el.className='wf'; el.tabIndex=0; el.dataset.id=id; el.style.left=x+'px'; el.style.top=y+'px';
  el.innerHTML = renderNodeInner(type);
  ixdBoard.appendChild(el);

  const n = { id, type, x, y, w: el.offsetWidth, h: el.offsetHeight, label: type };
  state.ixd.nodes.push(n);
  bindNode(el); redrawIXD();
}
function renderNodeInner(type){
  if(type==='button') return `<header contenteditable="true">Button</header><button class="sim">Click me</button>`;
  if(type==='input') return `<header contenteditable="true">Input</header><input placeholder="Type..." />`;
  if(type==='card') return `<header contenteditable="true">Card</header><div contenteditable="true">Some content...</div>`;
  if(type==='checkbox') return `<header contenteditable="true">Checkbox</header><label><input type="checkbox"> Option</label>`;
  return `<header contenteditable="true">${type}</header>`;
}

function bindNode(el){
  const id = el.dataset.id;
  const header = el.querySelector('header');
  let dragging=false, dx=0, dy=0;
  el.addEventListener('pointerdown', (e)=>{
    if(e.target.closest('input,textarea,button')) return;
    dragging=true; el.setPointerCapture(e.pointerId);
    dx = e.clientX - el.offsetLeft; dy = e.clientY - el.offsetTop;
  });
  el.addEventListener('pointermove', (e)=>{
    if(!dragging) return;
    const nx = Math.max(0, e.clientX - dx);
    const ny = Math.max(0, e.clientY - dy);
    el.style.left = nx+'px'; el.style.top = ny+'px';
    const node = state.ixd.nodes.find(n=>n.id===id);
    node.x = nx; node.y = ny; redrawIXD();
  });
  el.addEventListener('pointerup', ()=> dragging=false);

  header?.addEventListener('input', ()=>{
    const node = state.ixd.nodes.find(n=>n.id===id);
    node.label = header.textContent.trim();
  });

  // runtime events -> log
  el.addEventListener('click', (e)=>{
    if(e.target.classList.contains('sim')){
      logIXD(`Button "${state.ixd.nodes.find(n=>n.id===id)?.label||'Button'}" clicked`);
    }
  });

  // connect in Wire mode
  el.addEventListener('click', ()=>{
    if(state.ixd.mode!=='wire') return;
    if(!state._pending){ state._pending = id; el.style.outline='2px solid #22d3ee'; return; }
    if(state._pending===id){ el.style.outline=''; state._pending=null; return; }
    state.ixd.wires.push({ id: uid(), a: state._pending, b: id });
    const prev = $(`.wf[data-id="${state._pending}"]`); if(prev) prev.style.outline='';
    state._pending=null; redrawIXD();
  });
}

function redrawIXD(){
  ixdWires.innerHTML = ixdWires.querySelector('defs')?.outerHTML || '';
  const center = (el)=>{
    const r = el.getBoundingClientRect(); const b = ixdBoard.getBoundingClientRect();
    return {x:r.left-b.left + r.width/2, y:r.top-b.top + r.height/2};
  };
  state.ixd.wires.forEach(w=>{
    const a = $(`.wf[data-id="${w.a}"]`), b = $(`.wf[data-id="${w.b}"]`);
    if(!a||!b) return;
    const ca=center(a), cb=center(b);
    const line = document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1',ca.x); line.setAttribute('y1',ca.y); line.setAttribute('x2',cb.x); line.setAttribute('y2',cb.y);
    line.classList.add('connection'); line.setAttribute('marker-end','url(#arrow)');
    ixdWires.appendChild(line);
  });
}

function logIXD(msg){
  const box = $('#ixd-log'); const t = new Date().toLocaleTimeString();
  const row = document.createElement('div'); row.textContent = `${t} | ${msg}`;
  box.prepend(row);
}

$('#ixd-export-svg').addEventListener('click', ()=>{
  const b = ixdBoard.getBoundingClientRect();
  const doc = document.implementation.createDocument('http://www.w3.org/2000/svg','svg',null);
  const root = doc.documentElement;
  root.setAttribute('xmlns','http://www.w3.org/2000/svg');
  root.setAttribute('width', b.width); root.setAttribute('height', b.height);
  // nodes as rect + label
  state.ixd.nodes.forEach(n=>{
    const g = doc.createElementNS('http://www.w3.org/2000/svg','g');
    const rect = doc.createElementNS('http://www.w3.org/2000/svg','rect');
    rect.setAttribute('x', n.x); rect.setAttribute('y', n.y); rect.setAttribute('width', n.w||140); rect.setAttribute('height', n.h||80);
    rect.setAttribute('rx','10'); rect.setAttribute('fill','#151936'); rect.setAttribute('stroke','#2e356a');
    const text = doc.createElementNS('http://www.w3.org/2000/svg','text');
    text.setAttribute('x', n.x+10); text.setAttribute('y', n.y+24); text.setAttribute('fill','#e6e6f0'); text.textContent = n.label||n.type;
    g.appendChild(rect); g.appendChild(text); root.appendChild(g);
  });
  // wires
  state.ixd.wires.forEach(w=>{
    const a = state.ixd.nodes.find(n=>n.id===w.a), b = state.ixd.nodes.find(n=>n.id===w.b); if(!a||!b) return;
    const line = doc.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1', a.x+(a.w||140)/2); line.setAttribute('y1', a.y+(a.h||80)/2);
    line.setAttribute('x2', b.x+(b.w||140)/2); line.setAttribute('y2', b.y+(b.h||80)/2);
    line.setAttribute('stroke','#86c5ff'); line.setAttribute('stroke-width','2.5');
    root.appendChild(line);
  });
  const xml = new XMLSerializer().serializeToString(root);
  downloadBlob(new Blob([xml],{type:'image/svg+xml'}),'wireframe.svg');
});

// ====== DIAGRAM BUILDER (like draw.io) ======
const diagramCanvas = $('#diagram-canvas');
let diagramDragging = false;
let diagramDragTarget = null;
let diagramDragOffset = {x:0, y:0};

// Shape definitions
const shapeTemplates = {
  rectangle: (x,y,w,h,fill,stroke,sw) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" rx="5"/>`,
  circle: (x,y,w,h,fill,stroke,sw) => `<ellipse cx="${x+w/2}" cy="${y+h/2}" rx="${w/2}" ry="${h/2}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`,
  diamond: (x,y,w,h,fill,stroke,sw) => `<path d="M${x+w/2},${y} L${x+w},${y+h/2} L${x+w/2},${y+h} L${x},${y+h/2} Z" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`,
  triangle: (x,y,w,h,fill,stroke,sw) => `<path d="M${x+w/2},${y} L${x+w},${y+h} L${x},${y+h} Z" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`,
  hexagon: (x,y,w,h,fill,stroke,sw) => `<path d="M${x+w*0.25},${y} L${x+w*0.75},${y} L${x+w},${y+h/2} L${x+w*0.75},${y+h} L${x+w*0.25},${y+h} L${x},${y+h/2} Z" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`,
  cylinder: (x,y,w,h,fill,stroke,sw) => `<ellipse cx="${x+w/2}" cy="${y+h*0.15}" rx="${w/2}" ry="${h*0.15}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/><rect x="${x}" y="${y+h*0.15}" width="${w}" height="${h*0.7}" fill="${fill}" stroke="none"/><path d="M${x},${y+h*0.15} L${x},${y+h*0.85} Q${x+w/2},${y+h} ${x+w},${y+h*0.85} L${x+w},${y+h*0.15}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`,
  star: (x,y,w,h,fill,stroke,sw) => {
    const cx=x+w/2, cy=y+h/2, r=Math.min(w,h)/2;
    let path = 'M';
    for(let i=0; i<10; i++){
      const angle = (i*36-90) * Math.PI/180;
      const rad = i%2===0 ? r : r*0.5;
      path += `${cx+rad*Math.cos(angle)},${cy+rad*Math.sin(angle)} ${i<9?'L':''}`;
    }
    return `<path d="${path}Z" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
  },
  arrow: (x,y,w,h,fill,stroke,sw) => `<path d="M${x},${y+h/2} L${x+w*0.7},${y+h/2} L${x+w*0.7},${y} L${x+w},${y+h/2} L${x+w*0.7},${y+h} L${x+w*0.7},${y+h/2}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`
};

// Add shape buttons
$$('.shape-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const shape = btn.dataset.shape;
    const fill = $('#diagram-fill').value;
    const stroke = $('#diagram-stroke').value;
    const sw = $('#diagram-stroke-width').value;
    addDiagramShape(shape, 100 + state.diagram.shapes.length*20, 100 + state.diagram.shapes.length*20, 120, 80, fill, stroke, sw);
  });
});

// Tool buttons
$$('.tool-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    $$('.tool-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    if(btn.id==='diagram-select-tool') state.diagram.tool='select';
    if(btn.id==='diagram-connector-tool') state.diagram.tool='connector';
    if(btn.id==='diagram-text-tool') state.diagram.tool='text';
    if(btn.id==='diagram-delete-tool') state.diagram.tool='delete';
  });
});

function addDiagramShape(type, x, y, w, h, fill, stroke, strokeWidth){
  const id = uid();
  const shape = {id, type, x, y, w, h, fill, stroke, strokeWidth: +strokeWidth, text: type.charAt(0).toUpperCase()+type.slice(1)};
  state.diagram.shapes.push(shape);
  drawDiagram();
}

function drawDiagram(){
  const canvas = diagramCanvas;
  if(!canvas) return;
  
  // Clear (keep defs)
  const defs = canvas.querySelector('defs')?.outerHTML || '';
  canvas.innerHTML = defs;
  
  // Draw connectors
  state.diagram.connectors.forEach(conn=>{
    const from = state.diagram.shapes.find(s=>s.id===conn.from);
    const to = state.diagram.shapes.find(s=>s.id===conn.to);
    if(!from || !to) return;
    
    const x1 = from.x + from.w/2;
    const y1 = from.y + from.h/2;
    const x2 = to.x + to.w/2;
    const y2 = to.y + to.h/2;
    
    const line = document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.classList.add('diagram-connector');
    line.dataset.id = conn.id;
    line.addEventListener('click', ()=>{
      if(state.diagram.tool==='delete'){
        state.diagram.connectors = state.diagram.connectors.filter(c=>c.id!==conn.id);
        drawDiagram();
      }
    });
    canvas.appendChild(line);
  });
  
  // Draw shapes
  state.diagram.shapes.forEach(shape=>{
    const g = document.createElementNS('http://www.w3.org/2000/svg','g');
    g.classList.add('diagram-shape');
    g.dataset.id = shape.id;
    if(state.diagram.selected === shape.id) g.classList.add('selected');
    
    const shapeEl = shapeTemplates[shape.type](shape.x, shape.y, shape.w, shape.h, shape.fill, shape.stroke, shape.strokeWidth);
    g.innerHTML = shapeEl;
    
    // Add text
    const text = document.createElementNS('http://www.w3.org/2000/svg','text');
    text.classList.add('diagram-text');
    text.setAttribute('x', shape.x + shape.w/2);
    text.setAttribute('y', shape.y + shape.h/2);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('font-size', $('#diagram-font-size').value);
    text.textContent = shape.text || '';
    g.appendChild(text);
    
    // Events
    g.addEventListener('mousedown', (e)=>{
      e.stopPropagation();
      if(state.diagram.tool==='select'){
        state.diagram.selected = shape.id;
        diagramDragging = true;
        diagramDragTarget = shape;
        const pt = getSVGPoint(canvas, e);
        diagramDragOffset = {x: pt.x - shape.x, y: pt.y - shape.y};
        drawDiagram();
      }else if(state.diagram.tool==='connector'){
        if(!state.diagram.tempConnector){
          state.diagram.tempConnector = {from: shape.id};
        }else{
          state.diagram.connectors.push({
            id: uid(),
            from: state.diagram.tempConnector.from,
            to: shape.id
          });
          state.diagram.tempConnector = null;
          drawDiagram();
        }
      }else if(state.diagram.tool==='delete'){
        state.diagram.shapes = state.diagram.shapes.filter(s=>s.id!==shape.id);
        state.diagram.connectors = state.diagram.connectors.filter(c=>c.from!==shape.id && c.to!==shape.id);
        drawDiagram();
      }
    });
    
    g.addEventListener('dblclick', ()=>{
      const newText = prompt('Enter text:', shape.text);
      if(newText !== null){
        shape.text = newText;
        drawDiagram();
      }
    });
    
    canvas.appendChild(g);
  });
}

diagramCanvas?.addEventListener('mousemove', (e)=>{
  if(diagramDragging && diagramDragTarget){
    const pt = getSVGPoint(diagramCanvas, e);
    diagramDragTarget.x = Math.max(0, pt.x - diagramDragOffset.x);
    diagramDragTarget.y = Math.max(0, pt.y - diagramDragOffset.y);
    drawDiagram();
  }
});

diagramCanvas?.addEventListener('mouseup', ()=>{
  diagramDragging = false;
  diagramDragTarget = null;
});

diagramCanvas?.addEventListener('click', (e)=>{
  if(e.target === diagramCanvas){
    state.diagram.selected = null;
    state.diagram.tempConnector = null;
    drawDiagram();
  }
  
  if(state.diagram.tool==='text' && e.target === diagramCanvas){
    const pt = getSVGPoint(diagramCanvas, e);
    const text = prompt('Enter text:');
    if(text){
      const id = uid();
      state.diagram.shapes.push({
        id, type:'rectangle', x:pt.x-60, y:pt.y-20, w:120, h:40,
        fill:'transparent', stroke:'#3b82f6', strokeWidth:2, text
      });
      drawDiagram();
    }
  }
});

function getSVGPoint(svg, evt){
  const pt = svg.createSVGPoint();
  pt.x = evt.clientX;
  pt.y = evt.clientY;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
}

// Export functions
$('#diagram-export-svg')?.addEventListener('click', ()=>{
  const clone = diagramCanvas.cloneNode(true);
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  const xml = new XMLSerializer().serializeToString(clone);
  downloadBlob(new Blob([xml],{type:'image/svg+xml'}),'diagram.svg');
});

$('#diagram-export-png')?.addEventListener('click', ()=>{
  const clone = diagramCanvas.cloneNode(true);
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  const xml = new XMLSerializer().serializeToString(clone);
  const canvas = document.createElement('canvas');
  canvas.width = diagramCanvas.clientWidth * 2;
  canvas.height = diagramCanvas.clientHeight * 2;
  const ctx = canvas.getContext('2d');
  const img = new Image();
  img.onload = ()=>{
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(blob=>downloadBlob(blob, 'diagram.png'));
  };
  img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(xml)));
});

$('#diagram-clear')?.addEventListener('click', ()=>{
  if(confirm('Clear all shapes and connectors?')){
    state.diagram.shapes = [];
    state.diagram.connectors = [];
    state.diagram.selected = null;
    drawDiagram();
  }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e)=>{
  if(e.key==='Delete' && state.diagram.selected){
    state.diagram.shapes = state.diagram.shapes.filter(s=>s.id!==state.diagram.selected);
    state.diagram.connectors = state.diagram.connectors.filter(c=>c.from!==state.diagram.selected && c.to!==state.diagram.selected);
    state.diagram.selected = null;
    drawDiagram();
  }
});

// ====== QUIZ & ASSESSMENT ======
const quizQuestions = [
  {
    id: 'q1',
    type: 'multiple',
    question: 'Apa tujuan utama dari Information System Laboratory (ISL)?',
    options: [
      'Mengembangkan hardware komputer',
      'Menyediakan teknologi untuk masyarakat informasi dan ekonomi digital',
      'Membuat aplikasi mobile',
      'Mengelola server dan jaringan'
    ],
    correct: 1
  },
  {
    id: 'q2',
    type: 'multiple',
    question: 'Manakah yang BUKAN termasuk topik inti penelitian ISL?',
    options: [
      'Pengembangan Sistem Informasi',
      'Analisis Data',
      'Pemodelan Konseptual',
      'Desain Hardware Elektronik'
    ],
    correct: 3
  },
  {
    id: 'q3',
    type: 'text',
    question: 'Sebutkan metode prioritasi requirements yang digunakan dalam modul Requirements Engineering! (singkatan 4 huruf)',
    correct: 'MoSCoW'
  },
  {
    id: 'q4',
    type: 'multiple',
    question: 'Dalam MoSCoW prioritization, apa arti dari huruf "M"?',
    options: [
      'Maybe-have',
      'Must-have',
      'Might-have',
      'Minor-have'
    ],
    correct: 1
  },
  {
    id: 'q5',
    type: 'multiple',
    question: 'Apa fungsi utama dari Enterprise Architecture dalam pengembangan SI?',
    options: [
      'Membuat desain UI/UX',
      'Integrasi bisnis-teknologi dan optimalisasi value stream',
      'Testing aplikasi',
      'Menulis kode program'
    ],
    correct: 1
  },
  {
    id: 'q6',
    type: 'text',
    question: 'Dalam ERD, simbol apa yang digunakan untuk menandai Primary Key? (emoji)',
    correct: '🔑'
  },
  {
    id: 'q7',
    type: 'multiple',
    question: 'Apa kepanjangan dari ERD?',
    options: [
      'Entity Relationship Database',
      'Entity Relationship Diagram',
      'Enterprise Resource Design',
      'Extended Relational Database'
    ],
    correct: 1
  },
  {
    id: 'q8',
    type: 'multiple',
    question: 'Dalam Value Stream mapping, apa fungsi dari "heat intensity" pada capability?',
    options: [
      'Menunjukkan suhu server',
      'Mengukur kecepatan proses',
      'Menunjukkan intensitas dukungan capability terhadap stage',
      'Menghitung biaya operasional'
    ],
    correct: 2
  },
  {
    id: 'q9',
    type: 'text',
    question: 'Sebutkan salah satu bentuk (shape) yang tersedia di Diagram Builder! (lowercase)',
    correct: ['rectangle', 'circle', 'diamond', 'triangle', 'hexagon', 'cylinder', 'star', 'arrow']
  },
  {
    id: 'q10',
    type: 'multiple',
    question: 'Apa tujuan dari pemodelan konseptual dalam pengembangan SI?',
    options: [
      'Membuat dokumentasi user manual',
      'Representasi abstrak sistem dan proses bisnis untuk analisis',
      'Mendesain logo perusahaan',
      'Melakukan testing security'
    ],
    correct: 1
  },
  {
    id: 'q11',
    type: 'multiple',
    question: 'Format export apa yang tersedia untuk Diagram Builder?',
    options: [
      'Hanya PDF',
      'Hanya JSON',
      'SVG dan PNG',
      'Hanya TXT'
    ],
    correct: 2
  },
  {
    id: 'q12',
    type: 'text',
    question: 'Dalam wireframe, apa nama fitur yang menghubungkan dua komponen dengan garis/arrow?',
    correct: ['wiring', 'wire', 'connector', 'connection']
  },
  {
    id: 'q13',
    type: 'multiple',
    question: 'Apa fokus utama penelitian ISL terkait data?',
    options: [
      'Data Mining cryptocurrency',
      'Manajemen data dan analisis informasi',
      'Database administration',
      'Data entry manual'
    ],
    correct: 1
  },
  {
    id: 'q14',
    type: 'multiple',
    question: 'Dalam konteks ISL, apa yang dimaksud dengan "integrasi bisnis-teknologi"?',
    options: [
      'Menggabungkan beberapa perangkat hardware',
      'Alignment strategis antara kebutuhan bisnis dan solusi TI',
      'Membuat website e-commerce',
      'Instalasi software bisnis'
    ],
    correct: 1
  },
  {
    id: 'q15',
    type: 'text',
    question: 'Berapa jumlah modul yang tersedia di SILab Suite? (angka)',
    correct: ['6', '6 modul', 'enam']
  }
];

function initQuiz(){
  const container = $('#quiz-container');
  if(!container) return;
  
  container.innerHTML = '';
  
  quizQuestions.forEach((q, idx)=>{
    const qDiv = document.createElement('div');
    qDiv.className = 'quiz-question';
    qDiv.dataset.id = q.id;
    
    let optionsHTML = '';
    if(q.type === 'multiple'){
      optionsHTML = q.options.map((opt, i)=>`
        <div class="quiz-option" data-option="${i}">
          <input type="radio" name="${q.id}" id="${q.id}_${i}" value="${i}">
          <label for="${q.id}_${i}">${opt}</label>
        </div>
      `).join('');
    }else{
      optionsHTML = `<input type="text" class="quiz-input" data-qid="${q.id}" placeholder="Masukkan jawaban Anda...">`;
    }
    
    qDiv.innerHTML = `
      <div class="quiz-q-header">
        <div class="quiz-q-number">${idx + 1}</div>
        <div class="quiz-q-text">${q.question}</div>
        <div class="quiz-q-type">${q.type === 'multiple' ? 'Pilgan' : 'Isian'}</div>
      </div>
      <div class="quiz-options">
        ${optionsHTML}
      </div>
      <div class="quiz-correct-answer"></div>
    `;
    
    container.appendChild(qDiv);
  });
  
  // Add event listeners
  $$('.quiz-option').forEach(opt=>{
    opt.addEventListener('click', ()=>{
      const radio = opt.querySelector('input[type="radio"]');
      if(radio && !state.quiz.submitted){
        radio.checked = true;
        state.quiz.answers[radio.name] = parseInt(radio.value);
        updateQuizStats();
      }
    });
  });
  
  $$('.quiz-input').forEach(input=>{
    input.addEventListener('input', (e)=>{
      if(!state.quiz.submitted){
        state.quiz.answers[e.target.dataset.qid] = e.target.value.trim();
        updateQuizStats();
      }
    });
  });
  
  updateQuizStats();
}

function updateQuizStats(){
  const total = quizQuestions.length;
  const answered = Object.keys(state.quiz.answers).filter(k=>state.quiz.answers[k]!==undefined && state.quiz.answers[k]!=='').length;
  
  $('#quiz-total').textContent = total;
  $('#quiz-answered').textContent = answered;
}

$('#quiz-submit')?.addEventListener('click', ()=>{
  if(state.quiz.submitted) return;
  
  let correct = 0;
  
  quizQuestions.forEach(q=>{
    const userAnswer = state.quiz.answers[q.id];
    const qDiv = $(`.quiz-question[data-id="${q.id}"]`);
    const answerDiv = qDiv?.querySelector('.quiz-correct-answer');
    
    if(q.type === 'multiple'){
      const isCorrect = userAnswer === q.correct;
      if(isCorrect) correct++;
      
      // Mark options
      qDiv?.querySelectorAll('.quiz-option').forEach((opt, i)=>{
        if(i === q.correct){
          opt.classList.add('correct');
        }else if(i === userAnswer && !isCorrect){
          opt.classList.add('incorrect');
        }
        opt.style.pointerEvents = 'none';
      });
      
      if(answerDiv){
        answerDiv.textContent = `✓ Jawaban benar: ${q.options[q.correct]}`;
      }
    }else{
      // Text answer
      const correctAnswers = Array.isArray(q.correct) ? q.correct : [q.correct];
      const isCorrect = correctAnswers.some(ans => 
        userAnswer?.toLowerCase() === ans.toLowerCase()
      );
      
      if(isCorrect){
        correct++;
        qDiv?.classList.add('answered');
      }else{
        qDiv?.classList.add('wrong');
      }
      
      if(answerDiv){
        const correctText = Array.isArray(q.correct) ? q.correct.join(' / ') : q.correct;
        answerDiv.textContent = `✓ Jawaban benar: ${correctText}`;
      }
      
      const input = qDiv?.querySelector('.quiz-input');
      if(input) input.readOnly = true;
    }
    
    qDiv?.classList.add('show-answer');
  });
  
  const score = Math.round((correct / quizQuestions.length) * 100);
  state.quiz.score = score;
  state.quiz.submitted = true;
  
  // Show result
  $('#quiz-score').textContent = score;
  const feedback = $('#quiz-feedback');
  if(feedback){
    if(score >= 90) feedback.textContent = '🎉 Excellent! Pemahaman Anda sangat baik!';
    else if(score >= 75) feedback.textContent = '👍 Great! Anda memahami materi dengan baik!';
    else if(score >= 60) feedback.textContent = '👌 Good! Tingkatkan lagi pemahaman Anda!';
    else feedback.textContent = '📚 Keep learning! Pelajari kembali materinya!';
  }
  
  $('#quiz-result').style.display = 'block';
  $('#quiz-submit-area').style.display = 'none';
  
  // Scroll to top
  window.scrollTo({top: 0, behavior: 'smooth'});
});

$('#quiz-retry')?.addEventListener('click', ()=>{
  state.quiz.answers = {};
  state.quiz.submitted = false;
  state.quiz.score = 0;
  
  $('#quiz-result').style.display = 'none';
  $('#quiz-submit-area').style.display = 'block';
  
  initQuiz();
});

// ====== ERD: Data Modeling ======
const erdBoard = $('#erd-board');
const erdWires = $('#erd-wires');

erdBoard?.addEventListener('click', (e)=>{
  if(e.target !== erdBoard) return;
  if(state.erd.mode==='relate' && state.erd.pending){
    state.erd.pending=null;
    drawERD();
  }
});

(function initErdDefs(){
  if(!erdWires) return;
  const defs = document.createElementNS('http://www.w3.org/2000/svg','defs');
  const marker = document.createElementNS('http://www.w3.org/2000/svg','marker');
  marker.setAttribute('id','erd-arrow');
  marker.setAttribute('markerWidth','10');
  marker.setAttribute('markerHeight','6');
  marker.setAttribute('refX','10');
  marker.setAttribute('refY','3');
  marker.setAttribute('orient','auto');
  const path = document.createElementNS('http://www.w3.org/2000/svg','path');
  path.setAttribute('d','M0,0 L10,3 L0,6 z');
  path.setAttribute('fill','#fcd34d');
  marker.appendChild(path);
  defs.appendChild(marker);
  erdWires.appendChild(defs);
})();

$('#erd-entity-form')?.addEventListener('submit', (e)=>{
  e.preventDefault();
  const name = ($('#erd-entity-name').value||'').trim();
  if(!name) return;
  const entity = {
    id: uid(),
    name,
    attrs: [],
    x: 60 + state.erd.entities.length * 36,
    y: 80 + state.erd.entities.length * 24
  };
  state.erd.entities.push(entity);
  state.erd.selected = entity.id;
  $('#erd-entity-name').value = '';
  drawERD();
});

$('#erd-mode')?.addEventListener('change', e=>{
  state.erd.mode = e.target.value;
  state.erd.pending = null;
  drawERD();
});

$('#erd-attr-form')?.addEventListener('submit', (e)=>{
  e.preventDefault();
  const ent = getSelectedEntity();
  if(!ent) return toast('Pilih entitas terlebih dahulu');
  const name = ($('#erd-attr-name').value||'').trim();
  const type = ($('#erd-attr-type').value||'').trim();
  const pk = !!$('#erd-attr-pk').checked;
  if(!name) return;
  ent.attrs.push({ id: uid(), name, type: type || 'varchar', pk });
  $('#erd-attr-name').value='';
  $('#erd-attr-pk').checked=false;
  drawERD();
});

$('#erd-export-json')?.addEventListener('click', ()=>{
  downloadBlob(new Blob([JSON.stringify(state.erd,null,2)],{type:'application/json'}),'erd-model.json');
});

$('#erd-reset')?.addEventListener('click', ()=>{
  if(!confirm('Hapus semua entitas dan relasi ERD?')) return;
  state.erd.entities=[]; state.erd.relations=[]; state.erd.selected=null; state.erd.pending=null;
  drawERD();
});

function drawERD(){
  if(!erdBoard) return;
  const list = $('#erd-entity-list');
  if(list){
    list.innerHTML='';
    state.erd.entities.forEach(ent=>{
      const btn = document.createElement('button');
      btn.type='button';
      btn.className='entity-pill';
      if(ent.id===state.erd.selected) btn.classList.add('active');
      btn.textContent = ent.name||'Entitas';
      btn.addEventListener('click', ()=>{
        state.erd.selected = ent.id;
        drawERD();
      });
      list.appendChild(btn);
    });
    if(!state.erd.entities.some(e=>e.id===state.erd.selected)){
      state.erd.selected = state.erd.entities[0]?.id || null;
    }
  }

  const modeSel = $('#erd-mode');
  if(modeSel && modeSel.value!==state.erd.mode){
    modeSel.value = state.erd.mode;
  }

  renderSelectedEntityPanel();
  renderRelationPanel();

  erdBoard.innerHTML='';
  state.erd.entities.forEach(ent=>{
    const card = document.createElement('article');
    card.className='entity-card';
    if(ent.id===state.erd.selected) card.classList.add('selected');
    if(state.erd.pending===ent.id) card.classList.add('pending');
    card.dataset.id=ent.id;
    card.style.left=(ent.x||60)+'px';
    card.style.top=(ent.y||60)+'px';
    card.innerHTML = `
      <header contenteditable="true">${ent.name||'Entitas'}</header>
      <ul class="attr-list">${ent.attrs.map(attr=>`
        <li>
          <span>${attr.pk?'🔑 ':''}${attr.name}<small>${attr.type}</small></span>
        </li>
      `).join('') || '<li class="muted">Tambahkan atribut di panel kiri</li>'}
      </ul>
    `;
    const header = card.querySelector('header');
    header.addEventListener('input', ()=>{
      ent.name = header.textContent.trim()||'Entitas';
      drawERD();
    });
    bindEntityCard(card, ent);
    erdBoard.appendChild(card);
  });

  redrawERD();
}

function bindEntityCard(card, ent){
  let dragging=false, dx=0, dy=0;
  card.addEventListener('pointerdown', (e)=>{
    if(e.target.tagName==='HEADER' && state.erd.mode!=='move') return;
    if(state.erd.mode==='move'){
      dragging=true;
      card.setPointerCapture(e.pointerId);
      dx = e.clientX - card.offsetLeft;
      dy = e.clientY - card.offsetTop;
    }
  });
  card.addEventListener('pointermove', (e)=>{
    if(!dragging) return;
    const bounds = erdBoard.getBoundingClientRect();
    const nx = Math.max(0, Math.min(bounds.width - card.offsetWidth, e.clientX - dx));
    const ny = Math.max(0, Math.min(bounds.height - card.offsetHeight, e.clientY - dy));
    card.style.left = nx+'px';
    card.style.top = ny+'px';
    ent.x = nx; ent.y = ny;
    redrawERD();
  });
  card.addEventListener('pointerup', ()=>{
    dragging=false;
  });
  card.addEventListener('click', (e)=>{
    e.stopPropagation();
    if(state.erd.mode==='relate'){
      handleRelationClick(ent.id);
      return;
    }
    state.erd.selected = ent.id;
    drawERD();
  });
}

function handleRelationClick(entityId){
  if(!state.erd.pending){
    state.erd.pending = entityId;
    drawERD();
    return;
  }
  if(state.erd.pending === entityId){
    state.erd.pending=null;
    drawERD();
    return;
  }
  const a = state.erd.entities.find(e=>e.id===state.erd.pending);
  const b = state.erd.entities.find(e=>e.id===entityId);
  if(!a||!b){
    state.erd.pending=null;
    drawERD();
    return;
  }
  const name = prompt(`Nama relasi ${a.name} ↔ ${b.name}?`,`${a.name}_${b.name}`);
  if(name===null){
    state.erd.pending=null;
    drawERD();
    return;
  }
  const cardA = prompt(`Kardinalitas dari ${a.name} ke ${b.name}? (cth: 1, 0..1, 1..N)`,`1..N`) || '1..N';
  const cardB = prompt(`Kardinalitas dari ${b.name} ke ${a.name}?`,`1..N`) || '1..N';
  state.erd.relations.push({ id: uid(), a: a.id, b: b.id, name: name.trim()||`${a.name}_${b.name}`, cardA, cardB });
  state.erd.pending=null;
  drawERD();
}

function renderSelectedEntityPanel(){
  const nameEl = $('#erd-selected-name');
  const attrsEl = $('#erd-attr-list');
  const ent = getSelectedEntity();
  if(nameEl) nameEl.textContent = ent ? ent.name : 'Belum ada entitas terpilih';
  if(!attrsEl) return;
  attrsEl.innerHTML = '';
  if(!ent){
    const msg = document.createElement('p');
    msg.className='muted';
    msg.textContent='Tambahkan entitas dan pilih salah satunya untuk mengelola atribut.';
    attrsEl.appendChild(msg);
    return;
  }
  if(!ent.attrs.length){
    const msg = document.createElement('p');
    msg.className='muted';
    msg.textContent='Belum ada atribut. Gunakan form untuk menambah.';
    attrsEl.appendChild(msg);
  }
  ent.attrs.forEach(attr=>{
    const row = document.createElement('div');
    row.className='attr-row';
    row.innerHTML = `
      <span>${attr.pk?'🔑 ':''}${attr.name} <small>${attr.type}</small></span>
      <div class="actions">
        <button type="button" data-action="toggle">${attr.pk?'PK':'Set PK'}</button>
        <button type="button" data-action="delete" class="danger">Hapus</button>
      </div>
    `;
    row.querySelector('[data-action="toggle"]').onclick = ()=>{
      attr.pk = !attr.pk;
      if(attr.pk){
        ent.attrs = ent.attrs.map(a=>a.id===attr.id?attr:{...a, pk:false});
      }
      drawERD();
    };
    row.querySelector('[data-action="delete"]').onclick = ()=>{
      ent.attrs = ent.attrs.filter(a=>a.id!==attr.id);
      drawERD();
    };
    attrsEl.appendChild(row);
  });
}

function renderRelationPanel(){
  const info = $('#erd-info');
  const relList = $('#erd-rel-list');
  if(info){
    if(!state.erd.entities.length){
      info.textContent = 'Tambahkan entitas lalu atur atribut, posisi, dan relasi untuk menyusun ERD.';
    }else{
      info.textContent = state.erd.mode==='relate'
        ? 'Mode Relasi: klik entitas pertama lalu kedua untuk membuat relationship.'
        : 'Mode Move: seret entitas untuk mengatur tata letak. Ubah mode untuk membuat relasi.';
    }
  }
  if(!relList) return;
  relList.innerHTML='';
  if(!state.erd.relations.length){
    const hint = document.createElement('p');
    hint.className='muted';
    hint.textContent='Belum ada relasi.';
    relList.appendChild(hint);
    return;
  }
  state.erd.relations.forEach(rel=>{
    const a = state.erd.entities.find(e=>e.id===rel.a);
    const b = state.erd.entities.find(e=>e.id===rel.b);
    if(!a||!b) return;
    const row = document.createElement('div');
    row.className='rel-row';
    row.innerHTML = `
      <span><b>${a.name}</b> (${rel.cardA}) — <em>${rel.name}</em> — (${rel.cardB}) <b>${b.name}</b></span>
      <button class="danger">×</button>
    `;
    row.querySelector('button').onclick = ()=>{
      state.erd.relations = state.erd.relations.filter(r=>r.id!==rel.id);
      drawERD();
    };
    relList.appendChild(row);
  });
}

function redrawERD(){
  if(!erdWires) return;
  const defs = erdWires.querySelector('defs')?.outerHTML || '';
  erdWires.innerHTML = defs;
  state.erd.relations.forEach(rel=>{
    const aEl = erdBoard.querySelector(`.entity-card[data-id="${rel.a}"]`);
    const bEl = erdBoard.querySelector(`.entity-card[data-id="${rel.b}"]`);
    if(!aEl || !bEl) return;
    const aRect = aEl.getBoundingClientRect();
    const bRect = bEl.getBoundingClientRect();
    const boardRect = erdBoard.getBoundingClientRect();
    const ax = aRect.left - boardRect.left + aRect.width/2;
    const ay = aRect.top - boardRect.top + aRect.height/2;
    const bx = bRect.left - boardRect.left + bRect.width/2;
    const by = bRect.top - boardRect.top + bRect.height/2;
    const line = document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1', ax);
    line.setAttribute('y1', ay);
    line.setAttribute('x2', bx);
    line.setAttribute('y2', by);
    line.classList.add('erd-connection');
    line.setAttribute('marker-end','url(#erd-arrow)');
    erdWires.appendChild(line);

    const label = document.createElementNS('http://www.w3.org/2000/svg','text');
    label.classList.add('erd-label');
    label.setAttribute('x', (ax+bx)/2);
    label.setAttribute('y', (ay+by)/2 - 6);
    label.textContent = `${rel.name} [${rel.cardA}:${rel.cardB}]`;
    erdWires.appendChild(label);
  });
}

function getSelectedEntity(){
  if(!state.erd.selected) return null;
  return state.erd.entities.find(e=>e.id===state.erd.selected) || null;
}

// ====== Save/Load/Export/Reset ======
$('#saveAll').addEventListener('click', ()=>{
  localStorage.setItem('si_suite', JSON.stringify(state));
  toast('Saved');
});
$('#loadAll').addEventListener('click', ()=>{
  const raw = localStorage.getItem('si_suite'); if(!raw) return toast('No saved data');
  const data = JSON.parse(raw);
  // shallow merge and redraw
  Object.assign(state.req, data.req||{});
  Object.assign(state.ea, data.ea||{});
  Object.assign(state.ixd, data.ixd||{});
  Object.assign(state.diagram, data.diagram||{shapes:[],connectors:[],selected:null});
  Object.assign(state.erd, data.erd||{});
  // Don't load quiz state - always reset
  // redraw all
  drawReq(); drawEA(); redrawIXD(); drawDiagram(); drawERD(); initQuiz();
  toast('Loaded');
});
$('#exportAll').addEventListener('click', ()=>{
  downloadBlob(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),'silab-suite.json');
});
$('#resetAll').addEventListener('click', ()=>{
  if(!confirm('Reset semua modul?')) return;
  state.req.items=[]; state.ea.stages=[]; state.ea.caps=[]; state.ea.map={}; state.ea.stakeholders=[];
  state.ixd.nodes=[]; state.ixd.wires=[];
  state.diagram.shapes=[]; state.diagram.connectors=[]; state.diagram.selected=null;
  state.erd.entities=[]; state.erd.relations=[]; state.erd.selected=null; state.erd.pending=null;
  state.quiz.answers={}; state.quiz.submitted=false; state.quiz.score=0;
  drawReq(); drawEA(); redrawIXD(); drawDiagram(); drawERD(); initQuiz();
});

// ====== Utils ======
function downloadBlob(blob, filename){
  const url = URL.createObjectURL(blob); const a=document.createElement('a');
  a.href=url; a.download=filename; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function toast(msg){ console.log(msg); }

// initial draws
drawReq(); drawEA(); redrawIXD(); drawDiagram(); drawERD(); initQuiz();
