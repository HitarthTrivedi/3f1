import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

export function AgentVisual() {
  // --- Responsive Logic ---
  const [dimensions, setDimensions] = useState({ radiusX: 300 });

  useEffect(() => {
    const handleResize = () => {
      // Use a single radius for the "circular" table in 3D space
      if (window.innerWidth < 640) {
        setDimensions({ radiusX: 130 });
      } else if (window.innerWidth < 1024) {
        setDimensions({ radiusX: 200 });
      } else {
        setDimensions({ radiusX: 280 });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { radiusX: r } = dimensions;


  // --- Mouse Parallax Logic ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Base tilt of the table is 60 degrees.
  // We add mouse interaction on top.
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [65, 55]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), { stiffness: 150, damping: 20 });


  // --- Configuration ---
  const agents = [
    {
      id: "analyst",
      name: "Analyst",
      role: "main",
      color: "from-blue-500 to-cyan-500",
      angle: 270, // Top (Back)
      delay: 0,
    },
    {
      id: "guest1",
      name: "Observer",
      role: "guest",
      color: "from-gray-500 to-slate-400",
      angle: 330,
      delay: 0.1,
    },
    {
      id: "critic",
      name: "Critic",
      role: "main",
      color: "from-purple-500 to-pink-500",
      angle: 30, // Bottom Right
      delay: 0.2,
    },
    {
      id: "guest2",
      name: "Observer",
      role: "guest",
      color: "from-gray-500 to-slate-400",
      angle: 90,
      delay: 0.3,
    },
    {
      id: "synthesizer",
      name: "Synthesizer",
      role: "main",
      color: "from-orange-500 to-amber-500",
      angle: 150, // Bottom Left
      delay: 0.4,
    },
    {
      id: "guest3",
      name: "Observer",
      role: "guest",
      color: "from-gray-500 to-slate-400",
      angle: 210,
      delay: 0.5,
    },
  ];

  // Get position on the circle circumference
  const getPosition = (angle: number, radius: number) => {
    const radian = (angle * Math.PI) / 180;
    return {
      x: Math.cos(radian) * radius,
      y: Math.sin(radian) * radius,
    };
  };

  return (
    <div
      className="relative w-full max-w-6xl h-[600px] mx-auto my-20 flex items-center justify-center"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: "1200px" }}
    >
      {/* 
        The Scene Container with Rotation.
        Everything inside shares the same 3D coordinate system.
        This ensures agents stick to the table.
      */}
      <motion.div
        className="relative flex items-center justify-center transform-style-3d"
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          width: r * 2.2,
          height: r * 2.2,
        }}
      >

        {/* 1. The Circular Table (Rotated in the plane) */}
        {/* Since the container is already rotated by 60deg (base), this circle will look like an oval. */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 shadow-2xl flex items-center justify-center overflow-hidden"
          style={{
            transform: "translateZ(0)", // Base plane
            backfaceVisibility: "hidden"
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute inset-0 bg-blue-500/10 backdrop-blur-sm" />
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: 'radial-gradient(circle at center, transparent 0%, #000 100%), linear-gradient(#4f4f4f 1px, transparent 1px), linear-gradient(90deg, #4f4f4f 1px, transparent 1px)',
              backgroundSize: '100% 100%, 40px 40px, 40px 40px'
            }}
          />
        </motion.div>

        {/* 2. Central Topic Hologram (Standing UP) */}
        <motion.div
          className="absolute pointer-events-none"
          style={{
            transform: "rotateX(-60deg) translateY(-40px) translateZ(20px)",
            // Counter-rotate to stand roughly upright relative to camera, or just perpendicular to table
            // Actually if table is RotX(60), to stand up we need RotX(-90)? 
            // Let's just bill-board it or put it perpendicular.
          }}
          animate={{ z: [0, 10, 0] }} // Floating up and down in local Z (which is world Up-ish)
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* We use a billboard technique here manually if we want it perfect, 
                but just laying it flat above table is also fine for a "hologram projection" look. */}
          <div className="w-12 h-12 rounded-full bg-primary/20 blur-xl" />
        </motion.div>


        {/* 3. Agents */}
        {agents.map((agent) => {
          // Position on the flat circle - moving them inward to sit comfortably on table
          const pos = getPosition(agent.angle, r * 0.85);
          const isMain = agent.role === 'main';

          return (
            <motion.div
              key={agent.id}
              className="absolute flex items-center justify-center"
              style={{
                borderRadius: '50%',
                transform: `translate3d(${pos.x}px, ${pos.y}px, 60px)`, // Sit higher 'above' table
                transformStyle: "preserve-3d"
              }}
            >
              {/* 
                 BILLBOARDING: 
                 The agent container is rotated 60deg X. 
                 To face the camera, we need to rotate X back by ~ -60deg (plus interaction).
                 We can use the inverse of the parent's rotation values if possible, 
                 or just a fixed approximate counter-rotation since perspective handles the rest.
              */}
              <motion.div
                className="relative group cursor-pointer"
                style={{
                  rotateX: useTransform(rotateX, (v) => -v), // Cancel out table tilt
                  rotateY: useTransform(rotateY, (v) => -v), // Cancel out table turn
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: agent.delay }}
              >
                {/* Avatar Wrapper */}
                <motion.div
                  className={`
                      relative rounded-full flex items-center justify-center shadow-lg transition-all duration-300
                      ${isMain ? 'w-24 h-24 md:w-32 md:h-32' : 'w-16 h-16 md:w-20 md:h-20 grayscale opacity-60'}
                      border-2 border-white/10 bg-slate-900/80 backdrop-blur-xl
                    `}
                  animate={{ y: [0, -8, 0] }} // Float 'up' in local Y (which is screen Y because of counter-rotation)
                  transition={{ duration: 3, repeat: Infinity, delay: agent.delay, ease: "easeInOut" }}
                >
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${agent.color} ${isMain ? 'opacity-90' : 'opacity-30'}`} />
                  <div className={`relative rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center ${isMain ? 'w-20 h-20 md:w-24 md:h-24' : 'w-12 h-12 md:w-16 md:h-16'}`}>
                    <span className={`font-bold ${isMain ? 'text-2xl' : 'text-base text-muted-foreground'}`}>
                      {agent.name.charAt(0)}
                    </span>
                  </div>

                  {/* Label */}
                  {isMain && (
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 text-white px-3 py-1.5 rounded-md text-sm pointer-events-none z-50 border border-white/20">
                      {agent.name}
                    </div>
                  )}
                </motion.div>

                {/* Reflection/Shadow on Table - This needs to NOT be counter-rotated. 
                      Actually, simpler to fake it or skip it to avoid complexity in this strictly 3D setup.
                  */}
              </motion.div>


              {/* Conversation Particle - Traveling along the table plane */}
              {isMain && (
                <motion.div
                  className="absolute rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,1)]"
                  style={{ width: 4, height: 4 }}
                  initial={{ x: 0, y: 0, opacity: 0 }} // relative to this agent's position (which is translated)
                  // Wait, "absolute" inside a translated div is relative to 0,0 of that div.
                  // But we want it to travel to Center (which is -pos.x, -pos.y relative to here).
                  animate={{
                    x: [0, -pos.x, 0],
                    y: [0, -pos.y, 0],
                    opacity: [0, 1, 0, 1, 0]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    delay: agent.delay + 1,
                    ease: "easeInOut"
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
