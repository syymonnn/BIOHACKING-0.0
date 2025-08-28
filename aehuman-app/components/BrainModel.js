import { useEffect, useRef } from 'react';

// Simple canvas-based 3D brain made of wireframe pyramids
export default function BrainModel() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let w, h;

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w;
      canvas.height = h;
    }
    resize();
    window.addEventListener('resize', resize);

    // Generate pyramids
    const pyramids = [];
    const colors = ['#ff00ff', '#00ffff', '#ffff00', '#ff9900', '#00ff66', '#ff0066', '#00ff99'];
    const count = 400;

    function randomPoint() {
      // random point inside sphere approx brain
      let x, y, z;
      do {
        x = (Math.random() * 2 - 1);
        y = (Math.random() * 2 - 1);
        z = (Math.random() * 2 - 1);
      } while (x * x + y * y + z * z > 1);
      // stretch slightly to mimic brain shape
      return [x * 1.2, y * 0.8, z];
    }

    for (let i = 0; i < count; i++) {
      const origin = randomPoint();
      const size = 0.03 + Math.random() * 0.04;
      const rot = [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI];
      pyramids.push({
        origin,
        position: [...origin],
        size,
        rot,
        color: colors[i % colors.length]
      });
    }

    const edges = [
      [0, 1], [0, 2], [0, 3],
      [1, 2], [2, 3], [3, 1]
    ];

    const baseVerts = [
      [0, 1, 0],
      [1, -1, 1],
      [-1, -1, 1],
      [0, -1, -1]
    ];

    function rotate(v, r) {
      let [x, y, z] = v;
      const [rx, ry, rz] = r;
      let cos = Math.cos, sin = Math.sin;
      // x
      let y1 = y * cos(rx) - z * sin(rx);
      let z1 = y * sin(rx) + z * cos(rx);
      let x1 = x;
      // y
      let x2 = x1 * cos(ry) + z1 * sin(ry);
      let z2 = -x1 * sin(ry) + z1 * cos(ry);
      let y2 = y1;
      // z
      let x3 = x2 * cos(rz) - y2 * sin(rz);
      let y3 = x2 * sin(rz) + y2 * cos(rz);
      let z3 = z2;
      return [x3, y3, z3];
    }

    let rotX = 0;
    let rotY = 0;
    let hover = false;

    canvas.addEventListener('mouseenter', () => { hover = true; });
    canvas.addEventListener('mouseleave', () => { hover = false; });

    function project(p) {
      const scale = 220;
      const perspective = scale / (scale + p[2] * 100);
      return [p[0] * perspective * 100 + w / 2, p[1] * perspective * 100 + h / 2];
    }

    function animate() {
      ctx.clearRect(0, 0, w, h);
      rotY += 0.003;
      rotX += 0.0015;

      pyramids.forEach(p => {
        // move toward center on hover
        const target = hover ? p.origin.map(v => v * 0.5) : p.origin;
        for (let i = 0; i < 3; i++) {
          p.position[i] += (target[i] - p.position[i]) * 0.05;
        }

        const verts = baseVerts.map(v => {
          let vert = [v[0] * p.size, v[1] * p.size, v[2] * p.size];
          vert = rotate(vert, p.rot);
          vert = [vert[0] + p.position[0], vert[1] + p.position[1], vert[2] + p.position[2]];
          vert = rotate(vert, [rotX, rotY, 0]);
          return vert;
        });

        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1;
        edges.forEach(([a, b]) => {
          const [x1, y1] = project(verts[a]);
          const [x2, y2] = project(verts[b]);
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        });
      });

      requestAnimationFrame(animate);
    }
    animate();

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div style={{width:'100%', height:'260px', margin:'1rem 0'}}>
      <canvas
        ref={canvasRef}
        style={{width:'100%', height:'100%', display:'block', background:'#000', borderRadius:'12px'}}
      />
    </div>
  );
}

