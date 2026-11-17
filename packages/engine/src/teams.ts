import type { Observation, Strategy } from "./model";
import { koativa } from "./teams/koativa";
import { circuit } from "./teams/circuit";
export { koativa, circuit };
export function autonomous(observation: Observation, strategy: Strategy) {
  return strategy === "balanced" ? koativa(observation) : circuit(observation);
}
