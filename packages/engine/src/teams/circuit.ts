import {
  type Observation,
  type Command,
  clamp,
  direction,
  isActive,
  robotRadius,
} from "../model";
import { navigate, approachBall, restartTarget } from "./navigation";
/** Circuit: a striker attacks while a second robot supports behind the ball. */
export function circuit(o: Observation): Command[] {
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
      if (r.role === "striker") return navigate(o, r, approachBall(o, r));
      // Support stays outside both goal areas to avoid a second participating robot.
      const limit =
        s.config.length / 2 -
        s.config.goalAreaDepth -
        s.config.goalArcDepth -
        robotRadius(s.config) -
        0.03;
      return navigate(o, r, {
        x: clamp(s.ball.x - sign * 0.19, -limit, limit),
        y: clamp(
          s.ball.y + (s.ball.y > 0 ? -0.18 : 0.18),
          -s.config.width * 0.32,
          s.config.width * 0.32,
        ),
      });
    });
}
