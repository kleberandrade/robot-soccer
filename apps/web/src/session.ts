import {
  advance,
  createMatch,
  referee,
  type Match,
  type Action,
  type Config,
  type Strategy,
} from "@robot-soccer/engine";
import type { MatchRow } from "@robot-soccer/database";
export type Packet = MatchRow & { frames?: Match[] };
type Callbacks = {
  show: (s: Match) => void;
  row: (row: MatchRow | null) => void;
  message: (text: string) => void;
  busy: (value: boolean) => void;
  resetTrail: () => void;
};
export type Strategies = Record<"blue" | "yellow", Strategy>;
const advancing = (s: Match) =>
  ["running", "halftime", "timeout"].includes(s.phase);
export class MatchSession {
  state = createMatch();
  server: MatchRow | null = null;
  queue: Match[] = [];
  token = "";
  private inflight = false;
  private retryAt = 0;
  private active = true;
  constructor(private callbacks: Callbacks) {}
  resume() {
    this.active = true;
  }
  close() {
    this.active = false;
  }
  private receive(packet: Packet) {
    if (!this.active) return;
    this.server = packet;
    this.state = packet.state;
    this.callbacks.row(packet);
    if (packet.frames?.length) this.queue.push(...packet.frames);
    else {
      this.queue = [];
      this.callbacks.show(packet.state);
    }
  }
  private async request(
    url: string,
    method = "GET",
    data?: unknown,
  ): Promise<Packet> {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      },
      body: data ? JSON.stringify(data) : undefined,
      cache: "no-store",
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error ?? "Request failed");
    return result;
  }
  private error(error: unknown) {
    if (this.active)
      this.callbacks.message(
        error instanceof Error ? error.message : "Connection failed",
      );
  }
  async tick() {
    if (!this.active || this.inflight) return;
    if (!this.server) {
      this.previewTick();
      return;
    }
    const frame = this.queue.shift();
    if (frame) {
      this.callbacks.show(frame);
      return;
    }
    if (Date.now() < this.retryAt) return;
    this.retryAt = Date.now() + 1000;
    this.inflight = true;
    try {
      this.receive(await this.poll(this.server));
    } catch (e) {
      this.error(e);
    } finally {
      this.inflight = false;
    }
  }
  private previewTick() {
    if (advancing(this.state)) {
      this.state = advance(this.state, 6);
      this.callbacks.show(this.state);
    }
  }
  private poll(current: MatchRow) {
    const url = `/api/matches/${current.id}`;
    if (this.token && advancing(current.state))
      return this.request(url, "PATCH", {
        revision: current.revision,
        action: "advance",
        ticks: 120,
      });
    return this.request(url);
  }
  private async run(work: () => Promise<void>) {
    if (this.inflight) return;
    this.inflight = true;
    this.callbacks.busy(true);
    try {
      await work();
    } catch (e) {
      this.error(e);
    } finally {
      this.inflight = false;
      if (this.active) this.callbacks.busy(false);
    }
  }
  action(action: Action) {
    return this.run(async () => {
      this.queue = [];
      if (this.server) {
        const c = this.server;
        this.receive(
          await this.request(`/api/matches/${c.id}`, "PATCH", {
            revision: c.revision,
            action,
          }),
        );
      } else {
        this.state = referee(this.state, action);
        this.callbacks.show(this.state);
      }
      if (action === "reset") this.callbacks.resetTrail();
    });
  }
  connect(config: Config, strategies: Strategies, id?: string) {
    return this.run(async () => {
      const p = id
        ? await this.request(`/api/matches/${id}`)
        : await this.request("/api/matches", "POST", { config, strategies });
      this.queue = [];
      this.receive(p);
      this.callbacks.resetTrail();
      this.callbacks.message(`Server match connected · ${p.id}`);
    });
  }
  preview(config: Config, strategies: Strategies) {
    if (this.inflight) return;
    try {
      this.state = createMatch(config, strategies);
      this.server = null;
      this.queue = [];
      this.callbacks.row(null);
      this.callbacks.show(this.state);
      this.callbacks.resetTrail();
      this.callbacks.message("Local preview configured.");
    } catch {
      this.callbacks.message(
        "Invalid configuration: check field sizes and timings.",
      );
    }
  }
}
