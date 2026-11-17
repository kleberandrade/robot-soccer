import type {
  PublicRoom,
  RoomConnection,
  RoomInvitations,
} from "./room-client-types";
type Callbacks = {
  room: (r: PublicRoom) => void;
  connection: (c: RoomConnection) => void;
  invitations: (i: RoomInvitations | null) => void;
  message: (m: string) => void;
  busy: (b: boolean) => void;
};
export function browserRoomKey() {
  return btoa(
    String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))),
  )
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}
export class PrivateRoomSession {
  private connection: RoomConnection | null = null;
  private room: PublicRoom | null = null;
  private busy = false;
  private polling = false;
  private closed = false;
  private generation = 0;
  private joiningKey = "";
  constructor(
    private callbacks: Callbacks,
    private transport: typeof fetch = (input, init) => fetch(input, init),
    private keyFactory = browserRoomKey,
  ) {}
  private setActive(active: boolean) {
    this.closed = !active;
    this.generation++;
  }
  resume() {
    this.setActive(true);
  }
  close() {
    this.setActive(false);
  }
  private receive(next: PublicRoom, generation = this.generation) {
    if (this.closed || generation !== this.generation) return;
    if (this.room?.id === next.id && this.room.revision > next.revision) return;
    this.room = next;
    this.callbacks.room(next);
  }
  private async request(
    path: string,
    key: string,
    method = "GET",
    value?: unknown,
  ) {
    const response = await this.transport(path, {
        method,
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: value === undefined ? undefined : JSON.stringify(value),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }),
      data = await response.json();
    if (!response.ok) throw new Error(data.error ?? "The room request failed.");
    return data;
  }
  private setBusy(value: boolean) {
    this.busy = value;
    if (!this.closed) this.callbacks.busy(value);
  }
  private async run(job: () => Promise<void>) {
    if (this.busy || this.closed) return;
    this.setBusy(true);
    this.callbacks.message("");
    try {
      await job();
    } catch (e) {
      if (!this.closed)
        this.callbacks.message(
          e instanceof Error ? e.message : "Connection failed.",
        );
    } finally {
      this.setBusy(false);
    }
  }
  private open(
    connection: RoomConnection,
    room: PublicRoom,
    invitations: RoomInvitations | null = null,
  ) {
    if (this.closed) return;
    this.generation++;
    this.room = null;
    this.connection = connection;
    this.callbacks.connection(connection);
    this.callbacks.invitations(invitations);
    this.receive(room);
  }
  connect(connection: RoomConnection) {
    return this.run(async () =>
      this.open(
        connection,
        await this.request(`/api/rooms/${connection.id}`, connection.key),
      ),
    );
  }
  create(name: string, operator: string) {
    return this.run(async () => {
      const r = await this.request("/api/rooms", operator, "POST", { name });
      this.open({ id: r.room.id, key: r.key }, r.room, {
        ...r.invitations,
        spectatorKey: r.spectatorKey,
      });
    });
  }
  join(code: string, name: string) {
    return this.run(async () => {
      this.joiningKey ||= this.keyFactory();
      const result = await this.request("/api/rooms/join", "", "POST", {
        code,
        name,
        key: this.joiningKey,
      });
      this.open({ id: result.room.id, key: this.joiningKey }, result.room);
      this.joiningKey = "";
    });
  }
  action(action: string, extra: object = {}) {
    return this.run(() => this.update(action, extra));
  }
  private async update(action: string, extra: object) {
    const c = this.connection;
    if (!c || !this.room) return;
    try {
      this.receive(
        await this.request(`/api/rooms/${c.id}`, c.key, "PATCH", {
          revision: this.room.revision,
          action,
          ...extra,
        }),
      );
    } catch (e) {
      this.receive(await this.request(`/api/rooms/${c.id}`, c.key));
      throw e;
    }
  }
  private clockNeeded() {
    return (
      this.room?.role === "host" &&
      ["halftime", "timeout"].includes(this.room.match.phase)
    );
  }
  private canPoll() {
    return !this.closed && !this.busy && !this.polling;
  }
  private pollFailure(e: unknown, generation: number) {
    if (this.closed || generation !== this.generation) return;
    this.callbacks.message(
      e instanceof Error ? e.message : "Room connection lost.",
    );
  }
  async poll() {
    const c = this.connection;
    if (!c || !this.canPoll()) return;
    this.polling = true;
    const generation = this.generation;
    try {
      const current = await this.request(`/api/rooms/${c.id}`, c.key);
      this.receive(current, generation);
      if (generation === this.generation && this.clockNeeded())
        await this.action("clock");
    } catch (e) {
      this.pollFailure(e, generation);
    } finally {
      this.polling = false;
    }
  }
}
