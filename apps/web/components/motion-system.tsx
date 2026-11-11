"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
  type PointerEvent,
} from "react";
import {
  motion,
  MotionConfig,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { Pause, Play } from "lucide-react";

const MotionPreference = createContext({
  paused: false,
  systemPause: false,
  toggle: () => {},
});
export function MotionProvider({ children }: { children: ReactNode }) {
  const [manualPause, setManualPause] = useState(false);
  const [systemPause, setSystemPause] = useState(false);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setSystemPause(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const paused = manualPause || systemPause;
  useEffect(() => {
    document.documentElement.dataset.motion = paused ? "paused" : "playing";
  }, [paused]);
  return (
    <MotionPreference.Provider
      value={{ paused, systemPause, toggle: () => setManualPause((p) => !p) }}
    >
      <MotionConfig reducedMotion={paused ? "always" : "user"}>
        {children}
      </MotionConfig>
    </MotionPreference.Provider>
  );
}
export const useMotionPreference = () => useContext(MotionPreference);
export function MotionToggle() {
  const { paused, systemPause, toggle } = useMotionPreference();
  return (
    <button
      className="motion-toggle"
      onClick={toggle}
      disabled={systemPause}
      aria-label={paused ? "Resume animations" : "Pause animations"}
      aria-pressed={paused}
      title={
        systemPause
          ? "Animations reduced by your device settings"
          : paused
            ? "Resume animations"
            : "Pause animations"
      }
    >
      {paused ? <Play size={14} /> : <Pause size={14} />}
    </button>
  );
}
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const { paused } = useMotionPreference();
  return (
    <motion.div
      className={className}
      initial={{ y: paused ? 0 : 22 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{
        duration: paused ? 0 : 0.7,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
export function TiltCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const { paused } = useMotionPreference();
  const x = useMotionValue(0),
    y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [3, -3]), {
    stiffness: 170,
    damping: 24,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-3, 3]), {
    stiffness: 170,
    damping: 24,
  });
  function move(e: PointerEvent<HTMLDivElement>) {
    if (paused || e.pointerType !== "mouse") return;
    const bounds = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - bounds.left) / bounds.width - 0.5);
    y.set((e.clientY - bounds.top) / bounds.height - 0.5);
  }
  return (
    <motion.div
      className={"tilt-card " + className}
      style={{
        rotateX: paused ? 0 : rotateX,
        rotateY: paused ? 0 : rotateY,
        transformPerspective: 1000,
      }}
      onPointerMove={move}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}
