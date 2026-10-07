// "Where we train" map: Utah counties, hub pins, nearest-hub service zones and a city finder.
// Ported from docs/design-reference/extra/Utah Map.html as a native component.
// Hubs and cities live in src/data/locations.ts; geometry in src/data/utah-geo.json.
import React, { useEffect, useRef, useState } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import { select } from 'd3-selection';
import { zoom as d3zoom, zoomIdentity } from 'd3-zoom';
import { easeCubicInOut } from 'd3-ease';
import { Delaunay } from 'd3-delaunay';
import 'd3-transition';
import GEO from '../data/utah-geo.json';
import { HUBS, HUB_TONES, SERVICE_COUNTIES, CITIES, REFERENCE_TOWNS, FIND_LABEL } from '../data/locations';
import '../styles/utah-map.css';

const W = 800, H = 640;
let uid = 0;

export default function UtahMap({ program = 'academy' }) {
  const svgRef = useRef(null);
  const api = useRef({});
  const [ids] = useState(() => { uid += 1; return { glow: `uamGlow${uid}`, clip: `uamSvc${uid}`, list: `uamCities${uid}` }; });
  const sites = (HUBS[program] || HUBS.academy).map((s, i) => ({ ...s, tone: HUB_TONES[i] }));
  const [active, setActive] = useState(null);
  const [hover, setHover] = useState(null);
  const [view, setView] = useState('state');
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);

  // Assign every city to its nearest hub (in projected space, as the design does).
  const proj = geoMercator().fitExtent([[60, 40], [W - 60, H - 40]], GEO.utah);
  const sp = sites.map((s) => proj(s.ll));
  const cities = CITIES.map(([name, lon, lat]) => {
    const p = proj([lon, lat]);
    let bi = 0, bd = Infinity;
    sp.forEach((q, i) => { const d = Math.hypot(p[0] - q[0], p[1] - q[1]); if (d < bd) { bd = d; bi = i; } });
    return { name, ll: [lon, lat], site: sites[bi] };
  });
  sites.forEach((s) => { s.serves = cities.filter((c) => c.site.id === s.id).map((c) => c.name); });

  useEffect(() => {
    const svg = select(svgRef.current);
    svg.selectAll('*').remove();
    const path = geoPath(proj);
    const defs = svg.append('defs');
    const gr = defs.append('radialGradient').attr('id', ids.glow);
    gr.append('stop').attr('offset', '0').attr('stop-color', '#78b7b3').attr('stop-opacity', 0.35);
    gr.append('stop').attr('offset', '1').attr('stop-color', '#78b7b3').attr('stop-opacity', 0);
    const world = svg.append('g'), over = svg.append('g');
    let tf = zoomIdentity, picked = null;

    world.append('g').selectAll('path').data(GEO.neighbors).join('path')
      .attr('d', path).attr('fill', '#14161b').attr('stroke', 'rgba(233,233,237,.05)').attr('vector-effect', 'non-scaling-stroke');
    world.append('path').datum(GEO.utah).attr('d', path).attr('fill', '#1d2027');
    const service = GEO.counties.filter((f) => SERVICE_COUNTIES.includes(f.id));
    const clip = defs.append('clipPath').attr('id', ids.clip);
    service.forEach((f) => clip.append('path').attr('d', path(f)));
    const vor = sites.length > 1 ? Delaunay.from(sp).voronoi([-400, -400, W + 400, H + 400]) : null;
    const cell = (i) => (vor ? 'M' + vor.cellPolygon(i).join('L') + 'Z' : 'M-400,-400H1200V1040H-400Z');
    const zg = world.append('g').attr('clip-path', `url(#${ids.clip})`);
    zg.selectAll('path').data(sites).join('path').attr('class', 'zone').attr('d', (d, i) => cell(i))
      .attr('fill', (d) => d.tone).attr('fill-opacity', 0.2).on('click', (e, d) => focusSite(d.id));
    if (vor) {
      zg.append('path').attr('d', vor.render()).attr('fill', 'none').attr('stroke', '#e9e9ed').attr('stroke-opacity', 0.35)
        .attr('stroke-width', 1).attr('stroke-dasharray', '4 4').attr('vector-effect', 'non-scaling-stroke');
    }
    world.append('g').selectAll('path').data(GEO.counties).join('path')
      .attr('d', path).attr('fill', 'none').attr('stroke', 'rgba(233,233,237,.09)').attr('stroke-width', 0.7).attr('vector-effect', 'non-scaling-stroke');
    world.append('g').selectAll('path').data(service).join('path')
      .attr('d', path).attr('fill', 'none').attr('stroke', 'rgba(120,183,179,.45)').attr('stroke-width', 1).attr('vector-effect', 'non-scaling-stroke');
    world.append('path').datum(GEO.utah).attr('d', path).attr('fill', 'none').attr('stroke', '#78b7b3').attr('stroke-width', 1.4).attr('vector-effect', 'non-scaling-stroke');

    const farG = over.append('g');
    REFERENCE_TOWNS.forEach(([n, lon, lat]) => {
      const g = farG.append('g').attr('class', 'ref').datum({ ll: [lon, lat] });
      g.append('circle').attr('r', 2.5).attr('fill', '#8b8d98');
      g.append('text').attr('x', 7).attr('y', 4).attr('fill', '#8b8d98').attr('font-size', 11).text(n);
    });
    const cg = over.append('g');
    cities.forEach((c) => {
      const g = cg.append('g').attr('class', 'city').datum(c).on('click', () => pickCity(c.name));
      g.append('circle').attr('r', 3).attr('fill', c.site.tone).attr('stroke', '#111318').attr('stroke-width', 1);
      g.append('text').attr('x', 6).attr('y', 3.5).attr('fill', '#b9bbc4').attr('font-size', 10).attr('paint-order', 'stroke')
        .attr('stroke', '#15171d').attr('stroke-width', 3).text(c.name);
    });
    const mark = over.append('g').attr('class', 'mark').style('opacity', 0);
    mark.append('circle').attr('r', 9).attr('fill', 'none').attr('stroke', '#e9e9ed').attr('stroke-width', 1.5);
    mark.append('circle').attr('r', 3.5).attr('fill', '#e9e9ed');
    const pinG = over.append('g');
    sites.forEach((s) => {
      const g = pinG.append('g').attr('class', 'pin').datum(s).on('click', () => focusSite(s.id));
      g.append('circle').attr('r', 34).attr('fill', `url(#${ids.glow})`);
      g.append('circle').attr('class', 'ring').attr('r', 10).style('stroke', s.tone);
      g.append('circle').attr('r', 6).attr('fill', '#111318').attr('stroke', s.tone).attr('stroke-width', 2);
      g.append('circle').attr('r', 2.6).attr('fill', s.tone);
      const lab = g.append('g').attr('class', 'lab');
      const tx = s.side > 0 ? 16 : -16, anchor = s.side > 0 ? 'start' : 'end';
      lab.append('text').attr('x', tx).attr('y', -3).attr('text-anchor', anchor).attr('fill', s.tone).attr('font-size', 10.5)
        .attr('letter-spacing', '.14em').text(s.label.toUpperCase());
      lab.append('text').attr('x', tx).attr('y', 14).attr('text-anchor', anchor).attr('fill', '#e9e9ed').attr('font-size', 15)
        .attr('font-weight', 500).text(s.city);
      const bb = lab.node().getBBox();
      lab.insert('rect', 'text').attr('x', bb.x - 9).attr('y', bb.y - 7).attr('width', bb.width + 18).attr('height', bb.height + 14)
        .attr('rx', 7).attr('fill', 'rgba(17,19,24,.92)').attr('stroke', s.tone).attr('stroke-opacity', 0.5);
    });

    const place = () => {
      over.selectAll('.ref').attr('transform', (d) => `translate(${tf.apply(proj(d.ll))})`);
      over.selectAll('.city').attr('transform', (d) => `translate(${tf.apply(proj(d.ll))})`)
        .style('opacity', (d) => (tf.k < 3 ? 0 : (d.name === picked || sites.every((s) => {
          const a = tf.apply(proj(s.ll)), b = tf.apply(proj(d.ll));
          return Math.hypot(a[0] - b[0], a[1] - b[1]) > 46;
        })) ? 1 : 0))
        .style('pointer-events', tf.k < 3 ? 'none' : 'auto');
      over.selectAll('.city text').style('display', tf.k < 4.5 ? 'none' : null);
      over.selectAll('.pin').attr('transform', (d) => `translate(${tf.apply(proj(d.ll))})`);
      const c = cities.find((x) => x.name === picked);
      if (c) mark.attr('transform', `translate(${tf.apply(proj(c.ll))})`);
    };

    // Wheel zoom needs ctrl/cmd so the page still scrolls; on touch, one finger scrolls the
    // page and two fingers pan/pinch the map.
    const zoom = d3zoom().scaleExtent([1, 60]).translateExtent([[-200, -200], [W + 200, H + 200]])
      .filter((e) => (e.type === 'wheel' ? e.ctrlKey || e.metaKey : true) && !e.button && !(e.type === 'touchstart' && e.touches.length < 2))
      .on('zoom', (e) => { tf = e.transform; world.attr('transform', tf); place(); });
    svg.call(zoom).on('dblclick.zoom', null);

    const fitBox = (pts, pad) => {
      const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
      const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
      const k = Math.min(60, pad * Math.min(W / (x1 - x0), H / (y1 - y0)));
      return zoomIdentity.translate(W / 2, H / 2).scale(k).translate(-(x0 + x1) / 2, -(y0 + y1) / 2);
    };
    const frontT = () => fitBox(sites.map((s) => proj(s.ll)).concat([proj([-111.95, 40.8]), proj([-111.66, 40.2])]), 0.6);
    const fly = (t, ms) => svg.transition().duration(ms || 900).ease(easeCubicInOut).call(zoom.transform, t);
    const highlightZones = (id) => {
      world.selectAll('.zone').attr('fill-opacity', (d) => (!id ? 0.2 : d.id === id ? 0.34 : 0.08));
      over.selectAll('.pin .lab').style('opacity', (d) => (!id || d.id === id ? 1 : 0.35));
    };
    function focusSite(id, at) {
      const s = sites.find((x) => x.id === id);
      setActive(id); setView(null); highlightZones(id);
      const p = proj(at || s.ll), k = Math.min(60, frontT().k * 1.5);
      fly(zoomIdentity.translate(W / 2, H / 2).scale(k).translate(-p[0], -p[1]));
    }
    function pickCity(name) {
      const c = cities.find((x) => x.name === name);
      picked = name;
      setQuery(name);
      setResult({ city: name, site: c.site });
      mark.style('opacity', 1);
      const a = proj(c.ll), b = proj(c.site.ll);
      focusSite(c.site.id, proj.invert([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]));
    }
    api.current = {
      focusSite, pickCity, highlightZones,
      front: (ms) => { setActive(null); highlightZones(null); setView('front'); fly(frontT(), ms); },
      state: () => { setActive(null); highlightZones(null); setView('state'); fly(zoomIdentity); },
      zoomBy: (f) => svg.transition().duration(350).call(zoom.scaleBy, f),
    };
    place();
    const t = setTimeout(() => api.current.front(1400), 500);
    return () => { clearTimeout(t); svg.interrupt(); svg.on('.zoom', null); };
  }, [program]);

  useEffect(() => { api.current.highlightZones?.(hover || active); }, [hover, active]);

  const onInput = (v) => {
    setQuery(v);
    const c = cities.find((x) => x.name.toLowerCase() === v.trim().toLowerCase());
    if (c) api.current.pickCity(c.name);
  };
  const onKey = (e) => {
    if (e.key !== 'Enter') return;
    const v = query.trim().toLowerCase();
    const c = v && cities.find((x) => x.name.toLowerCase().startsWith(v));
    if (c) api.current.pickCity(c.name);
    else setResult({ miss: true });
  };

  return (
    <div className="uamap">
      <div className="uamap-wrap">
        <div className="uamap-list">
          <div className="uamap-find">
            <label htmlFor={`${ids.list}-q`}>{FIND_LABEL[program] || FIND_LABEL.academy}</label>
            <input id={`${ids.list}-q`} list={ids.list} placeholder="Enter your city" autoComplete="off"
              value={query} onChange={(e) => onInput(e.target.value)} onKeyDown={onKey} />
            <datalist id={ids.list}>
              {cities.slice().sort((a, b) => a.name.localeCompare(b.name)).map((c) => <option key={c.name} value={c.name} />)}
            </datalist>
            <div className="uamap-res" aria-live="polite">
              {!result && 'Every city is matched to its nearest hub.'}
              {result?.miss && "Not on our list yet. Contact us and we'll point you to the right hub."}
              {result?.site && (<>{result.city} → <b>{result.site.label}</b> · {result.site.city}</>)}
            </div>
          </div>
          {sites.map((s) => {
            const shown = s.serves.filter((n) => !s.city.includes(n)).slice(0, 5);
            const more = s.serves.length - shown.length - (s.serves.some((n) => s.city.includes(n)) ? 1 : 0);
            return (
              <button key={s.id} className={`uamap-site${active === s.id ? ' on' : ''}`}
                onClick={() => api.current.focusSite(s.id)} onMouseEnter={() => setHover(s.id)} onMouseLeave={() => setHover(null)}>
                <span className="k"><i style={{ background: s.tone, boxShadow: `0 0 8px ${s.tone}` }} /><span style={{ color: s.tone }}>{s.label}</span></span>
                <span className="n">{s.city}</span>
                <span className="c">Serving {shown.join(', ')}{more > 0 ? ` + ${more} more` : ''}</span>
              </button>
            );
          })}
        </div>
        <div className="uamap-map">
          <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img"
            aria-label="Map of Utah training locations and service areas" />
          <div className="uamap-ctrls">
            <button className={view === 'front' ? 'on' : ''} onClick={() => api.current.front()}>Wasatch Front</button>
            <button className={view === 'state' ? 'on' : ''} onClick={() => api.current.state()}>All of Utah</button>
            <button aria-label="Zoom in" onClick={() => api.current.zoomBy(1.6)}>+</button>
            <button aria-label="Zoom out" onClick={() => api.current.zoomBy(1 / 1.6)}>−</button>
          </div>
          <div className="uamap-attr">Map data: U.S. Census Bureau via us-atlas</div>
        </div>
      </div>
    </div>
  );
}
