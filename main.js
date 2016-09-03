(function airTrafficViz(d3) {
  'use strict';
  const width = 1280;
  const height = 780;
  const innerRadius = 10;
  const outerRadius = 350;
  let exp = 1;
  const angle = d3.scale
    .ordinal()
    .domain(d3.range(4))
    .rangePoints([0, 2 * Math.PI]);
  const radius = d3.scale
    .pow()
    .exponent(exp)
    .range([innerRadius, outerRadius])
    .nice();

  function degrees(radians) {
    return ((radians / Math.PI) * 180) - 90;
  }

  function init() {
    // Add menu actions
    d3.select('#about')
      .on('click', () => d3.select('#info').style('display', 'block'));
    d3.select('#info')
      .on('click', () => {
        if (d3.event &&
          (d3.event.srcElement || d3.event.target) === document.getElementById('info')) {
          d3.select('#info').style('display', null);
        }
      });
    d3.select('#invert-btn')
      .on('click', () => {
        const body = d3.select('body');
        const clas = 'inverted';
        body.classed(clas, !body.classed(clas));
      });
    d3.select('#legend-btn')
      .on('click', () => {
        const body = d3.select('body');
        const svg = d3.select('svg');
        const clas = 'legend';
        body.classed(clas, !body.classed(clas));
        svg.classed(clas, !svg.classed(clas));
      });
    d3.select('#transform-btn')
      .on('click', () => {
        const delay = 10;
        const ease = 'in-out';
        const duration = () => Math.random() * 800;
        let hideLabels = false;

        if (exp === 1) {
          exp = 0.5;
        } else if (exp === 0.5) {
          exp = 0.3;
          hideLabels = true;
        } else if (exp === 0.3) {
          exp = 1;
          hideLabels = false;
        }

        const r = d3.scale
          .pow()
          .exponent(exp)
          .range([innerRadius, outerRadius])
          .nice();

        d3.selectAll('.node')
          .data(nodes)
          .transition()
          .ease(ease)
          .delay(delay)
          .duration(duration)
          .attr('cx', (d) => r(d.y));

        d3.selectAll('.link')
          .data(links)
          .transition()
          .ease(ease)
          .delay(delay)
          .duration(duration)
          .attr('d', d3.hive
            .link()
            .angle((d) => (d ? angle(d.x) : 0))
            .radius((d) => (d ? r(d.y) : 0)));

        d3.selectAll('text')
          .transition()
          .ease(ease)
          .delay(delay)
          .duration(duration)
          .style('opacity', hideLabels ? 0 : 100);
      });

    // Draw graph
    const svg = d3.select('#graph')
      .append('svg')
      .attr('viewBox', `0, 0, ${width}, ${height}`)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // Add legend
    const legend = svg.append('g')
      .attr('id', 'legend-arrow')
      .attr('transform', () => `scale(0.75) rotate(${degrees(angle(2)) + 89}) translate(-51,-498)`);
    legend.append('path')
        .attr('d', 'M51.5,13.3l-1.5,472l-1.5-472c0-0.8,0.7-1.5,1.5-1.5' +
        'C50.8,11.7,51.5,12.4,51.5,13.3L51.5,13.3z');
    legend.append('line')
      .attr('stroke-miterlimit', '10')
      .attr('x1', '50')
      .attr('y1', '13.3')
      .attr('x2', '26.4')
      .attr('y2', '55.9');
    legend.append('g')
      .attr('transform', 'rotate(90) scale(1.5) translate(60,-20)')
      .append('text')
      .text('Population');

    svg.selectAll('.axis')
        .data(d3.range(3))
        .enter()
        .append('line')
        .attr('class', 'axis')
        .attr('transform', (d) => `rotate(${degrees(angle(d))})`)
        .attr('x1', radius.range()[0])
        .attr('x2', radius.range()[1] * 1.05);

    svg.selectAll('.link')
        .data(links)
        .enter()
        .append('path')
        .attr('class', 'link')
        .attr('d', d3.hive
          .link()
          .angle((d) => (d ? angle(d.x) : 0))
          .radius((d) => (d ? radius(d.y) : 0)))
        .attr('data-s', (d) => d.source.id)
        .attr('data-t', (d) => d.target.id);

    svg.selectAll('.node')
        .data(nodes)
        .enter()
        .append('circle')
        .attr('class', (d) => `node ${d.x}`)
        .attr('data-name', (d) => d.name)
        .attr('transform', (d) => `rotate(${degrees(angle(d.x))})`)
        .attr('cx', (d) => radius(d.y))
        .attr('r', (d) => Math.sqrt(d.count * 4))
        .attr('data-id', (_, i) => i)
        .on('mousedown', (_, i) => {
          d3.selectAll('path').style('opacity', 0);
          d3.selectAll(`path[data-s="${i}"]`).style('opacity', 1);
          d3.selectAll(`path[data-t="${i}"]`).style('opacity', 1);
        })
        .on('mouseup', () => d3.selectAll('path').style('opacity', 1))
        .on('mouseout', () => d3.selectAll('path').style('opacity', 1))
        .append('svg:title')
        .text((d) => d.name);

    // Add aicraft
    svg.append('g')
      .attr('transform', 'scale(0.2) rotate(-70) translate(640,400)')
      .append('path')
      .attr('id', 'aircraft')
      .attr('d', 'm54.82,16.917c0.023,-7.053 10.66,-7.053 10.66,0.202l0,29.621l41.453,24.925l0,' +
      '10.947l-41.264,-13.58l0,22.12901l9.547,7.479l0,8.64101l-14.723,-4.57l-14.719,4.57l0,-8.6' +
      '4101l9.45,-7.479l0,-22.12901l-41.289,13.58l0,-10.947l40.885,-24.925l0,-29.823z');

    // Add labels to the axes
    svg.append('g')
      .attr('transform', () => `rotate(${degrees(angle(2)) - 180}) translate(-300,-3)`)
      .append('text')
      .text('Europe');
    svg.append('g')
      .attr('transform', () => `rotate(${degrees(angle(1))}) translate(300,-3)`)
      .append('text')
      .text('Asia');
    svg.append('g')
      .attr('transform', () => `rotate(${-degrees(angle(0))}) translate(-300,-3)`)
      .append('text')
      .text('N. America');
  }

  window.onload = init();
}(d3));
