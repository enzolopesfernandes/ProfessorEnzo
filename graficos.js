/* Gráficos responsivos e acessíveis. Sem dependências externas. */
(function graficosModule() {
  'use strict';
  const CORES = ['#4c67e9', '#92a4ce', '#2b7d70', '#d6ad55'];
  function el(tag, classe, txt) {
    const a = document.createElement(tag);
    if (classe) a.className = classe;
    if (txt !== undefined) a.textContent = String(txt);
    return a;
  }
  function legend(target, series) {
    if (series.length < 2) return;
    const leg = el('div', 'chart-legend');
    series.forEach((s, i) => {
      const sp = el('span', 'chart-legend-item');
      const square = el('span', 'chart-legend-swatch');
      square.style.backgroundColor = CORES[i % CORES.length];
      square.setAttribute('aria-hidden', 'true');
      sp.append(square, document.createTextNode(s.nome));
      leg.append(sp);
    });
    target.append(leg);
  }
  function columns(target, chart) {
    const outer = el('div', 'chart-columns');
    const max = Math.max(1, ...chart.series.flatMap(s => s.valores));
    chart.categorias.forEach((cat, i) => {
      const group = el('div', 'chart-column-group');
      const plot = el('div', 'chart-column-plot');
      chart.series.forEach((s, j) => {
        const bar = el('div', 'chart-column-bar');
        bar.style.height = `${Math.max(2, s.valores[i] / max * 88)}%`;
        bar.style.backgroundColor = CORES[j % CORES.length];
        bar.title = `${cat} — ${s.nome}: ${s.valores[i]}`;
        bar.append(el('span', 'chart-column-value', s.valores[i]));
        plot.append(bar);
      });
      group.append(plot, el('span', 'chart-axis-label', cat));
      outer.append(group);
    });
    target.append(outer);
    legend(target, chart.series);
  }
  function line(target, chart) {
    const values = chart.series[0].valores;
    const max = Math.ceil(Math.max(1, ...values) / 10) * 10;
    const x0 = 52, x1 = 658, y0 = 180, y1 = 28;
    const points = values.map((v, i) => ({x: x0 + i * ((x1 - x0) / Math.max(1, values.length - 1)), y: y0 - v / max * (y0 - y1), v}));
    const ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 710 225');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', chart.titulo);
    svg.classList.add('chart-line');
    function shape(tag, attrs, value) {
      const a = document.createElementNS(ns, tag);
      for (const [key, val] of Object.entries(attrs)) a.setAttribute(key, String(val));
      if (value !== undefined) a.textContent = String(value);
      svg.append(a);
    }
    shape('line', {x1:x0,y1:y0,x2:x1,y2:y0,stroke:'#ccd5e5','stroke-width':2});
    for (let i = 0; i <= 4; i++) {
      const y = y0 - i * (y0 - y1) / 4;
      shape('line', {x1:x0,y1:y,x2:x1,y2:y,stroke:'#e9edf4','stroke-width':1});
    }
    shape('polyline', {points:points.map(p => `${p.x},${p.y}`).join(' '),fill:'none',stroke:CORES[0],'stroke-width':3.5,'stroke-linecap':'round','stroke-linejoin':'round'});
    points.forEach((p,i) => {
      shape('circle',{cx:p.x,cy:p.y,r:5,fill:CORES[0]});
      shape('text',{x:p.x,y:p.y-12,'font-size':14,fill:'#203859','font-weight':700,'text-anchor':'middle'},p.v);
      shape('text',{x:p.x,y:207,'font-size':14,fill:'#5b6980','text-anchor':'middle'},chart.categorias[i]);
    });
    const scroll = el('div','chart-scroll');scroll.append(svg);target.append(scroll);
  }
  function pie(target, chart) {
    const vals = chart.series[0].valores;
    let from = 0;
    const bands = vals.map((v,i) => {const prev=from;from+=v;return `${CORES[i % CORES.length]} ${prev}% ${from}%`;});
    const wrap = el('div','chart-pie-layout');
    const circle = el('div','chart-pie');
    circle.style.background = `conic-gradient(${bands.join(', ')})`;
    circle.setAttribute('role','img');
    circle.setAttribute('aria-label',chart.categorias.map((c,i)=>`${c}: ${vals[i]}%`).join('; '));
    const leg = el('div','chart-pie-legend');
    chart.categorias.forEach((c,i) => {
      const sp=el('div','chart-legend-item'),square=el('span','chart-legend-swatch');
      square.style.backgroundColor=CORES[i % CORES.length];square.setAttribute('aria-hidden','true');
      sp.append(square,document.createTextNode(`${c}: ${vals[i]}%`));leg.append(sp);
    });
    wrap.append(circle,leg);target.append(wrap);
  }
  function pictogram(target, chart) {
    const group=el('div','chart-pictogram');
    chart.categorias.forEach((cat,i)=>{
      const row=el('div','chart-pictogram-row');
      row.append(el('span','chart-pictogram-label',cat));
      const squares=el('div','chart-pictogram-squares');
      for(let j=0;j<chart.series[0].valores[i];j++)squares.append(el('span','chart-pictogram-square'));
      row.append(squares,el('span','chart-pictogram-total',chart.series[0].valores[i]*(chart.unidade||1)));
      group.append(row);
    });
    target.append(group,el('p','chart-note',`Cada quadrado representa ${chart.unidade} caixas.`));
  }
  function horizontal(target, chart) {
    const max=Math.max(1,...chart.series.flatMap(s=>s.valores)), wrap=el('div','chart-horizontal');
    chart.categorias.forEach((cat,i)=>{
      const row=el('div','chart-h-row');row.append(el('span','chart-h-label',cat));
      const stack=el('div','chart-h-stack');
      chart.series.forEach((s,j)=>{
        const line=el('div','chart-h-line'),bar=el('div','chart-h-bar');
        bar.style.width=`${s.valores[i]/max*100}%`;bar.style.backgroundColor=CORES[j%CORES.length];
        line.append(bar,el('span','chart-h-value',`${s.valores[i]}${chart.sufixo||''}`));stack.append(line);
      });
      row.append(stack);wrap.append(row);
    });
    target.append(wrap);legend(target,chart.series);
  }
  function divergent(target, chart) {
    const max=Math.max(1,...chart.series[0].valores.map(Math.abs)), wrap=el('div','chart-divergent');
    chart.categorias.forEach((cat,i)=>{
      const v=chart.series[0].valores[i], row=el('div','chart-d-row');
      row.append(el('span','chart-d-label',cat));
      const track=el('div','chart-d-track'),bar=el('div','chart-d-bar'),pct=Math.abs(v)/max*47;
      bar.style.width=`${pct}%`;bar.style.left=v<0?`${50-pct}%`:'50%';
      bar.style.backgroundColor=v<0?'#bf7474':CORES[0];
      track.append(bar);row.append(track,el('span','chart-d-value',v>0?`+${v}`:v));wrap.append(row);
    });target.append(wrap);
  }
  function dataTable(target,chart) {
    const details=el('details','chart-data');details.append(el('summary','', 'Ver valores do gráfico'));
    const table=el('table',''),thead=el('thead',''),tr=el('tr','');tr.append(el('th','','Categoria'));
    chart.series.forEach(s=>tr.append(el('th','',s.nome)));
    thead.append(tr);table.append(thead);
    const tbody=el('tbody','');
    chart.categorias.forEach((cat,i)=>{
      const row=el('tr','');row.append(el('td','',cat));
      chart.series.forEach(s=>row.append(el('td','',`${s.valores[i]}${chart.sufixo||''}`)));
      tbody.append(row);
    });table.append(tbody);details.append(table);target.append(details);
  }
  window.renderGraficoQuestao=function(container,chart){
    container.replaceChildren();container.hidden=!chart;if(!chart)return;
    const figure=el('figure','chart-figure');
    figure.append(el('figcaption','chart-title',chart.titulo));
    if(chart.tipo==='colunas')columns(figure,chart);
    else if(chart.tipo==='linha')line(figure,chart);
    else if(chart.tipo==='setores')pie(figure,chart);
    else if(chart.tipo==='pictograma')pictogram(figure,chart);
    else if(chart.tipo==='barras')horizontal(figure,chart);
    else if(chart.tipo==='divergente')divergent(figure,chart);
    dataTable(figure,chart);container.append(figure);
  };
})();
