export class Discord extends EventTarget {
  ws: WebSocket|null = null
  #token: string
  #timer: number|null = null
  #ackHeartbeat: boolean = true
  #seq: number|null = null

  constructor(token: string) {
    super()
    this.#token = token
  }

  start() {
    this.ws = new WebSocket('wss://gateway.discord.gg/?v=10&encoding=json')
    this.ws.onmessage = (ev: MessageEvent) => {
      const data = JSON.parse(ev.data)
      this.#seq = data.s
      // Hello
      if (data.op == 10) {
        if (this.#timer) {
          clearInterval(this.#timer)
        }
        this.#timer = setInterval(() => {
          if (!this.#ackHeartbeat) {
            this.#ackHeartbeat = true
            this.#timer && clearInterval(this.#timer)
            this.ws?.close()
            return
          }
          this.#ackHeartbeat = false
          // Heartbeat
          this.ws?.send(JSON.stringify({ op: 1, d: this.#seq }))
        }, data.d.heartbeat_interval)
      }
      // Heartbeat ACK
      if (data.op == 11) {
        this.#ackHeartbeat = true
      }
      // Dispatch
      if (data.op == 0) {
        this.dispatchEvent(new CustomEvent(data.t, { detail: data.d }))
      }
    }
    this.ws.onopen = (_ev: Event) => {
      // Identify
      this.ws?.send(JSON.stringify({
        op: 2,
        d: {
          token: this.#token,
          intents: 1<<7 | 1<<0,
          properties: {
            os: 'linux',
            browser: 'vcwatcher',
            device: 'vcwatcher',
          },
        },
      }))
    }
    this.ws.onclose = () => setTimeout(() => this.start(), 10000)
  }
}
