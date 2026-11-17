import {
  type Observation,
  type Command,
  clamp,
  direction,
  isActive,
} from "../model";
import { navigate, approachBall, restartTarget } from "./navigation";
/** Koativa: a striker follows the ball, one defender screens the keeper. */
export function koativa(o: Observation): Command[] {
  const s = o.state,
    sign = direction(o.team, s.period);
  return s.robots
    .filter((r) => r.team === o.team && isActive(r))
    .map((r) => {
      const restart = restartTarget(o, r);
      if (restart) return navigate(o, r, restart);
      if (r.role === "keeper")
        return navigate(o, r, {
          x: -sign * (s.config.length / 2 - s.config.robotSide * 0.8),
          y: clamp(
            s.ball.y,
            -s.config.goalWidth * 0.4,
            s.config.goalWidth * 0.4,
          ),
        });
      if (r.role === "defender")
        return navigate(o, r, {
          x: -sign * s.config.length * 0.27,
          y: clamp(s.ball.y * 0.7, -s.config.width * 0.3, s.config.width * 0.3),
        });
      return navigate(o, r, approachBall(o, r));
    });
}
