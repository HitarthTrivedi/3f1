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
      description: "Extracting patterns, parsing data, and forming logical structures.",
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
      description: "Identifying flaws, challenging assumptions, and rigorous cross-verification.",
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
      description: "Formulating resolutions, blending valid points into an optimal final state.",
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
          className="absolute inset-0 rounded-full bg-gradient-to-b from-background/80 to-muted/80 border-2 border-primary/20 shadow-[0_0_50px_rgba(255,102,0,0.1)] flex items-center justify-center overflow-hidden"
          style={{
            transform: "translateZ(0)", // Base plane
            backfaceVisibility: "hidden"
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute inset-0 bg-primary/5 backdrop-blur-sm" />
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.15] dark:opacity-30"
            style={{
              backgroundImage: 'radial-gradient(circle at center, transparent 0%, var(--background) 100%), linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)',
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
          <div className="w-12 h-12 rounded-full bg-primary/40 blur-xl animate-pulse" />
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
                      relative group rounded-full flex items-center justify-center shadow-lg transition-all duration-300
                      ${isMain ? 'w-24 h-24 md:w-32 md:h-32 border-foreground/30 hover:border-primary/50 grayscale opacity-100 hover:grayscale-0' : 'w-16 h-16 md:w-20 md:h-20 border-foreground/30 grayscale opacity-50'}
                      border-[3px] md:border-4 bg-background
                    `}
                  animate={{ y: [0, -8, 0] }} // Float 'up' in local Y (which is screen Y because of counter-rotation)
                  transition={{ duration: 3, repeat: Infinity, delay: agent.delay, ease: "easeInOut" }}
                >
                  {/* Colored glow layer, only visible on hover for main agents */}
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${agent.color} opacity-0 ${isMain ? 'group-hover:opacity-100' : ''} transition-opacity duration-300`} />

                  {/* Inner ring */}
                  <div className={`relative rounded-full bg-background flex items-center justify-center border-2 border-foreground/10 ${isMain ? 'w-[72px] h-[72px] md:w-[96px] md:h-[96px]' : 'w-10 h-10 md:w-14 md:h-14'} pointer-events-none group-hover:pointer-events-auto transition-colors duration-300`}>
                    <span className={`font-black font-logo transition-colors duration-300 ${isMain ? 'text-2xl text-foreground' : 'text-base text-muted-foreground'}`}>
                      {agent.name.charAt(0)}
                    </span>
                  </div>

                  {/* Label & Description Tooltip */}
                  {isMain && (
                    <div className="absolute bottom-[105%] md:bottom-[110%] left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 w-48 md:w-64 bg-background/95 backdrop-blur-xl border border-foreground/20 rounded-xl p-3 shadow-2xl pointer-events-none z-[100] translate-y-2 group-hover:translate-y-0 text-foreground">
                      {/* Triangle pointer */}
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-foreground/20">
                        <div className="absolute bottom-[1px] -left-[7px] border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[7px] border-t-background" />
                      </div>
                      <div className="font-black text-sm md:text-base mb-1 tracking-tight">{agent.name}</div>
                      <div className="text-[10px] md:text-xs text-muted-foreground font-medium leading-relaxed">
                        {agent.description}
                      </div>
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
