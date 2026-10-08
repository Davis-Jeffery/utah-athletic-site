// Athletic Global network map: world outline with an animated link from Utah to Vichy.
// Ported from docs/design-reference/extra/Network Map.html. Geometry is src/data/world-geo.json
// (regenerate with npm run geo:build); nodes are NETWORK_NODES in src/data/site.ts.
import React, { useEffect, useRef, useState } from 'react';
import { geoEqualEarth, geoPath, geoGraticule10, geoInterpolate } from 'd3-geo';
import { select } from 'd3-selection';
import { zoom as d3zoom, zoomIdentity } from 'd3-zoom';
import { easeCubicInOut } from 'd3-ease';
import 'd3-transition';
import GEO from '../data/world-geo.json';
import { NETWORK_NODES as NODES } from '../data/site';

const W = 960, H = 520;
const HOME = ['840', '250']; // USA, France

export default function NetworkMap() {
  const svgRef = useRef(null);
  const api = useRef({});
  const [view, setView] = useState('link');

  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const svg = select(svgRef.current);
    svg.selectAll('*').remove();
    const proj = geoEqualEarth().fitExtent([[20, 20], [W - 20, H - 20]], { type: 'FeatureCollection', features: GEO.countries });
    const path = geoPath(proj);
    const world = svg.append('g'), over = svg.append('g');
    let tf = zoomIdentity, raf = 0;

    world.append('path').datum(geoGraticule10()).attr('d', path).attr('fill', 'none').attr('stroke', 'rgba(233,233,237,.035)').attr('vector-effect', 'non-scaling-stroke');
    world.append('g').selectAll('path').data(GEO.countries).join('path').attr('d', path)
      .attr('fill', (d) => (HOME.includes(d.id) ? '#25302f' : '#1f2229'))
      .attr('stroke', (d) => (HOME.includes(d.id) ? 'rgba(120,183,179,.5)' : 'rgba(233,233,237,.07)'))
      .attr('stroke-width', 0.7).attr('vector-effect', 'non-scaling-stroke');
    const arc = world.append('path').datum({ type: 'LineString', coordinates: [NODES[0].ll, NODES[1].ll] }).attr('d', path)
      .attr('fill', 'none').attr('stroke', '#78b7b3').attr('stroke-width', 1.6).attr('vector-effect', 'non-scaling-stroke');
    if (reduce) arc.attr('stroke-dasharray', '5 5').attr('stroke-opacity', 0.8);
    else {
      const len = arc.node().getTotalLength();
      arc.attr('stroke-dasharray', len).attr('stroke-dashoffset', len).transition().delay(700).duration(1600).ease(easeCubicInOut).attr('stroke-dashoffset', 0)
        .on('end', () => arc.attr('stroke-dasharray', '5 5').attr('stroke-opacity', 0.8));
      const runner = over.append('circle').attr('r', 3.5).attr('fill', '#b5e1dd').style('filter', 'drop-shadow(0 0 6px #78b7b3)');
      const gi = geoInterpolate(NODES[0].ll, NODES[1].ll);
      const t0 = performance.now();
      const tick = (t) => {
        if (!document.hidden) runner.attr('transform', 'translate(' + tf.apply(proj(gi(((t - t0) / 4200) % 1))) + ')');
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }
    NODES.forEach((n) => {
      const g = over.append('g').attr('class', 'node').datum(n);
      if (!reduce) g.append('circle').attr('class', 'netmap-ring').attr('r', 10);
      g.append('circle').attr('r', 6).attr('fill', '#111318').attr('stroke', '#78b7b3').attr('stroke-width', 2);
      g.append('circle').attr('r', 2.6).attr('fill', '#78b7b3');
      const lab = g.append('g'), tx = 16 * n.side, anchor = n.side > 0 ? 'start' : 'end';
      lab.append('text').attr('x', tx).attr('y', -3).attr('text-anchor', anchor).attr('fill', '#e9e9ed').attr('font-size', 15).attr('font-weight', 500).text(n.name);
      lab.append('text').attr('x', tx).attr('y', 14).attr('text-anchor', anchor).attr('fill', '#8b8d98').attr('font-size', 11).text(n.sub);
      const bb = lab.node().getBBox();
      lab.insert('rect', 'text').attr('x', bb.x - 9).attr('y', bb.y - 7).attr('width', bb.width + 18).attr('height', bb.height + 14).attr('rx', 7).attr('fill', 'rgba(17,19,24,.92)').attr('stroke', 'rgba(120,183,179,.45)');
    });
    const place = () => over.selectAll('.node').attr('transform', (d) => 'translate(' + tf.apply(proj(d.ll)) + ')');

    // Wheel zoom needs ctrl/cmd so the page keeps scrolling.
    const zoom = d3zoom().scaleExtent([1, 8]).translateExtent([[-100, -100], [W + 100, H + 100]])
      .filter((e) => (e.type !== 'wheel' || e.ctrlKey || e.metaKey) && !e.button)
      .on('zoom', (e) => { tf = e.transform; world.attr('transform', tf); place(); });
    svg.call(zoom).on('dblclick.zoom', null);
    place();

    const goLink = (ms = 900) => {
      const a = proj(NODES[0].ll), b = proj(NODES[1].ll), k = Math.min(8, (0.5 * W) / Math.abs(b[0] - a[0]));
      const t = zoomIdentity.translate(W / 2, H / 2 + 20).scale(k).translate(-(a[0] + b[0]) / 2, -(a[1] + b[1]) / 2 + 20);
      (reduce ? svg : svg.transition().duration(ms).ease(easeCubicInOut)).call(zoom.transform, t);
      setView('link');
    };
    const goWorld = () => { (reduce ? svg : svg.transition().duration(900).ease(easeCubicInOut)).call(zoom.transform, zoomIdentity); setView('world'); };
    api.current = { goLink, goWorld };
    const t = setTimeout(() => goLink(1400), 300);
    return () => { clearTimeout(t); cancelAnimationFrame(raf); svg.interrupt(); };
  }, []);

  const btn = (on) => ({ cursor: 'pointer', minHeight: '36px', minWidth: '36px', padding: '0 12px', borderRadius: '8px', border: `1px solid ${on ? '#78b7b3' : 'rgba(233,233,237,.1)'}`, background: on ? 'rgba(120,183,179,.12)' : 'rgba(17,19,24,.85)', backdropFilter: 'blur(8px)', color: on ? '#78b7b3' : '#e9e9ed', font: '500 12px/1 var(--font-body)', transition: 'border-color .2s,color .2s' });
  return (
    <div style={{ position: 'relative', flex: 1, height: '100%', minHeight: 'clamp(380px,52vh,520px)', borderRadius: '10px', overflow: 'hidden', background: 'radial-gradient(ellipse at 45% 40%,rgba(120,183,179,.08),transparent 60%),#15171d', boxShadow: 'inset 0 0 0 1px rgba(233,233,237,.1)' }}>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label="World map of the Athletic Global network: Utah Athletic in Utah, USA, linked to RC Vichy Athletic in Vichy, France" style={{ display: 'block', width: '100%', height: '100%', cursor: 'grab', fontFamily: 'var(--font-body)' }} />
      <div style={{ position: 'absolute', right: '12px', top: '12px', display: 'flex', gap: '6px' }}>
        <button type="button" aria-pressed={view === 'link'} onClick={() => api.current.goLink?.()} className="hv-outline" style={btn(view === 'link')}>Utah ↔ Vichy</button>
        <button type="button" aria-pressed={view === 'world'} onClick={() => api.current.goWorld?.()} className="hv-outline" style={btn(view === 'world')}>World</button>
      </div>
      <div style={{ position: 'absolute', left: '12px', bottom: '10px', fontSize: '10px', color: '#5f616b' }}>Map data: Natural Earth via world-atlas</div>
    </div>
  );
}
