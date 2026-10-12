import { LitElement, css, html, nothing, svg, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { strings, type Strings } from "./i18n";
import {
  DAYS,
  DAY_MIN,
  TIME_STEP,
  type Day,
  type Pt,
  type Week,
  clamp,
  cloneWeek,
  dayOf,
  dropEmpty,
  formatTime,
  fromPts,
  moveEdge,
  removeSegment,
  segmentEnd,
  setTemp,
  snap,
  splitSegment,
  toPts,
  weeksEqual,
} from "./model";

// -- Home Assistant types (the subset used here) ------------------------------

interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, any>;
}

export interface Hass {
  states: Record<string, HassEntity>;
  language: string;
  locale?: { language: string };
  user?: { is_admin: boolean };
  connection: {
    subscribeMessage<T>(
      callback: (msg: T) => void,
      msg: Record<string, unknown>,
    ): Promise<() => Promise<void>>;
  };
  callWS<T>(msg: Record<string, unknown>): Promise<T>;
}

interface CardConfig {
  type: string;
  entity: string;
  name?: string;
  height?: number;
  /** Show a settings button that fires ``heating-schedule-settings`` (used by the panel). */
  settings?: boolean;
}

export interface ScheduleInfo {
  entry_id: string;
  title: string;
  climate_entity: string;
  enabled: boolean;
  days: Week;
  current: { temp: number | null; next_change: string | null; next_temp: number | null };
  effective: { temp: number | null; reason: "schedule" | "empty" };
  presence: {
    entities: string[];
    occupied: boolean | null;
    empty: boolean;
    setback: number;
    delay: number;
  };
  profile: { days: Record<Day, number[]>; weeks: number } | null;
  limits: { min: number | null; max: number | null; step: number };
  switch_entity: string | null;
  sensor_entity: string | null;
  occupancy_entity: string | null;
}

interface HistoryRow {
  s: string;
  a?: Record<string, any>;
  lu?: number;
  lc?: number;
}

interface History {
  date: Date;
  current: [number, number][]; // [minute, value]
  target: [number, number][];
  occupied: [number, number][]; // [start minute, end minute]
  end: number;
}

interface Drag {
  kind: "seg" | "edge";
  index: number;
  pointerId: number;
  x0: number;
  y0: number;
  moved: boolean;
}

interface Scale {
  x: (m: number) => number;
  y: (t: number) => number;
  minute: (px: number) => number;
  temp: (py: number) => number;
  lo: number;
  hi: number;
}

const PAD = { l: 30, r: 8, t: 16, b: 20 };
const HISTORY_REFRESH_MS = 5 * 60 * 1000;

function minuteOfDay(date: Date): number {
  return date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** The most recent date (today or earlier) that falls on ``day``. */
function lastDateOf(day: Day): Date {
  const today = startOfDay(new Date());
  const back = (DAYS.indexOf(dayOf(today)) - DAYS.indexOf(day) + 7) % 7;
  return new Date(today.getFullYear(), today.getMonth(), today.getDate() - back);
}

function isoDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

@customElement("heating-schedule-card")
export class HeatingScheduleCard extends LitElement {
  @property({ attribute: false }) hass?: Hass;

  @state() private _config?: CardConfig;
  @state() private _info?: ScheduleInfo;
  @state() private _error?: string;
  @state() private _day: Day = dayOf(new Date());
  @state() private _draft?: Week;
  @state() private _selected?: number;
  @state() private _drag?: Drag;
  @state() private _history?: History;
  @state() private _width = 0;
  @state() private _copyOpen = false;
  @state() private _copyTargets: Day[] = [];
  @state() private _saving = false;

  private _unsub?: Promise<() => Promise<void>>;
  private _subscribeFailed = false;
  private _historyKey?: string;
  private _historyTimer?: number;
  private _resize?: ResizeObserver;
  private _observed?: Element;
  private _range?: [number, number];
  private _scale?: Scale;

  // -- Lovelace API -----------------------------------------------------------

  static getConfigForm() {
    return {
      schema: [
        { name: "entity", required: true, selector: { entity: { domain: "climate" } } },
        { name: "name", selector: { text: {} } },
        { name: "height", selector: { number: { min: 120, max: 600, mode: "box", unit_of_measurement: "px" } } },
      ],
    };
  }

  static getStubConfig(hass: Hass) {
    const entity = Object.keys(hass.states).find((id) => id.startsWith("climate.")) ?? "";
    return { entity };
  }

  setConfig(config: CardConfig): void {
    if (!config?.entity) throw new Error("entity is required");
    if (this._config?.entity !== config.entity) {
      this._unsubscribe();
      this._info = undefined;
      this._history = undefined;
      this._historyKey = undefined;
      this._draft = undefined;
      this._error = undefined;
      this._subscribeFailed = false;
    }
    this._config = config;
  }

  getCardSize(): number {
    return 6;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6, rows: "auto" };
  }

  // -- lifecycle --------------------------------------------------------------

  connectedCallback(): void {
    super.connectedCallback();
    this._historyTimer = window.setInterval(() => this._loadHistory(true), HISTORY_REFRESH_MS);
    this._resize = new ResizeObserver((entries) => {
      const width = Math.floor(entries[0].contentRect.width);
      if (width && width !== this._width) this._width = width;
    });
    this._observed = undefined;
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._unsubscribe();
    window.clearInterval(this._historyTimer);
    this._resize?.disconnect();
  }

  protected updated(changed: PropertyValues): void {
    if (this.hass && this._config && !this._unsub && !this._subscribeFailed) this._subscribe();
    if (changed.has("_day") || changed.has("hass") || changed.has("_info")) this._loadHistory();
    const chart = this.renderRoot.querySelector(".chart");
    if (chart && chart !== this._observed) {
      this._observed = chart;
      this._resize?.disconnect();
      this._resize?.observe(chart);
    }
  }

  private get _t(): Strings {
    return strings(this.hass?.locale?.language ?? this.hass?.language);
  }

  private _subscribe(): void {
    const entity = this._config!.entity;
    this._unsub = this.hass!.connection.subscribeMessage<ScheduleInfo>(
      (info) => {
        this._info = info;
        this._error = undefined;
      },
      { type: "heating_schedule/subscribe", entity_id: entity },
    );
    this._unsub.catch((err) => {
      this._subscribeFailed = true;
      this._unsub = undefined;
      this._error = err?.code === "not_found" ? this._t.not_found : (err?.message ?? String(err));
    });
  }

  private _unsubscribe(): void {
    this._unsub?.then((unsub) => unsub()).catch(() => undefined);
    this._unsub = undefined;
  }

  private async _loadHistory(force = false): Promise<void> {
    if (!this.hass || !this._config) return;
    const entity = this._config.entity;
    const occupancy = this._info?.occupancy_entity ?? null;
    const date = lastDateOf(this._day);
    const key = `${entity}|${occupancy}|${isoDate(date)}`;
    if (!force && key === this._historyKey) return;
    this._historyKey = key;

    const now = new Date();
    const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    const end = dayEnd < now ? dayEnd : now;
    try {
      const result = await this.hass.callWS<Record<string, HistoryRow[]>>({
        type: "history/history_during_period",
        start_time: date.toISOString(),
        end_time: end.toISOString(),
        entity_ids: occupancy ? [entity, occupancy] : [entity],
        minimal_response: false,
        no_attributes: false,
        significant_changes_only: false,
      });
      if (key !== this._historyKey) return;
      const current: [number, number][] = [];
      const target: [number, number][] = [];
      for (const row of result[entity] ?? []) {
        const ts = (row.lu ?? row.lc ?? 0) * 1000;
        const m = clamp((ts - date.getTime()) / 60000, 0, DAY_MIN);
        const attrs = row.a ?? {};
        if (typeof attrs.current_temperature === "number") current.push([m, attrs.current_temperature]);
        if (typeof attrs.temperature === "number") target.push([m, attrs.temperature]);
      }
      const endMinute = end === now ? minuteOfDay(now) : DAY_MIN;
      const toMinute = (row: HistoryRow) =>
        clamp(((row.lu ?? row.lc ?? 0) * 1000 - date.getTime()) / 60000, 0, DAY_MIN);
      const occupied: [number, number][] = [];
      const rows = occupancy ? (result[occupancy] ?? []) : [];
      rows.forEach((row, i) => {
        if (row.s !== "on") return;
        const from = toMinute(row);
        const to = i + 1 < rows.length ? toMinute(rows[i + 1]) : endMinute;
        if (to > from) occupied.push([from, to]);
      });
      this._history = { date, current, target, occupied, end: endMinute };
    } catch (err) {
      this._history = undefined;
    }
  }

  // -- data helpers -----------------------------------------------------------

  private _week(): Week | undefined {
    return this._draft ?? this._info?.days;
  }

  private _pts(day: Day = this._day): Pt[] {
    const week = this._week();
    return week ? toPts(week[day]) : [{ m: 0, t: 20 }];
  }

  private _setPts(pts: Pt[], day: Day = this._day): void {
    if (!this._draft) return;
    this._draft = { ...this._draft, [day]: fromPts(pts) };
  }

  private get _limits(): { min: number; max: number; step: number } {
    const limits = this._info?.limits;
    return { min: limits?.min ?? 5, max: limits?.max ?? 35, step: limits?.step || 0.5 };
  }

  private _fmtTemp(value: number | null | undefined): string {
    if (value === null || value === undefined || Number.isNaN(value)) return "–";
    const lang = this.hass?.locale?.language ?? this.hass?.language ?? "en";
    return `${value.toLocaleString(lang, { maximumFractionDigits: 1 })}°`;
  }

  private _yRange(pts: Pt[]): [number, number] {
    const values = pts.map((p) => p.t);
    const history = this._history;
    if (history && isoDate(history.date) === isoDate(lastDateOf(this._day))) {
      values.push(...history.current.map((v) => v[1]));
    }
    const current = this.hass?.states[this._config!.entity]?.attributes.current_temperature;
    if (typeof current === "number" && this._day === dayOf(new Date())) values.push(current);
    let lo = Math.floor(Math.min(...values)) - 1;
    let hi = Math.ceil(Math.max(...values)) + 1;
    if (hi - lo < 6) {
      const pad = (6 - (hi - lo)) / 2;
      lo = Math.floor(lo - pad);
      hi = Math.ceil(hi + pad);
    }
    return [lo, hi];
  }

  // -- render -----------------------------------------------------------------

  protected render() {
    if (!this._config) return nothing;
    const t = this._t;
    const climate = this.hass?.states[this._config.entity];
    const name =
      this._config.name ??
      this._info?.title ??
      climate?.attributes.friendly_name ??
      this._config.entity;
    return html`
      <ha-card>
        <div class="header">
          <div class="name">${name}</div>
          <div class="header-end">
            ${this._info
              ? html`<label class="toggle">
                  <span>${t.schedule}</span>
                  <ha-switch
                    .checked=${this._info.enabled}
                    .disabled=${!!this._draft}
                    @change=${this._toggleEnabled}
                  ></ha-switch>
                </label>`
              : nothing}
            ${this._config.settings && this._info && this.hass?.user?.is_admin !== false
              ? html`<button
                  class="settings"
                  title=${t.panel_settings}
                  aria-label=${t.panel_settings}
                  @click=${this._openSettings}
                >
                  <ha-icon icon="mdi:cog"></ha-icon>
                </button>`
              : nothing}
          </div>
        </div>
        ${this._renderStatus(climate)}
        ${this._error ? html`<div class="error">${this._error}</div>` : nothing}
        ${this._info ? this._renderBody() : nothing}
      </ha-card>
    `;
  }

  private _openSettings(): void {
    this.dispatchEvent(
      new CustomEvent("heating-schedule-settings", {
        detail: { info: this._info },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _renderStatus(climate?: HassEntity) {
    if (!climate) return nothing;
    const t = this._t;
    const attrs = climate.attributes;
    const mode = climate.state === "off" ? t.mode_off : climate.state === "heat" ? t.mode_heat : climate.state;
    const info = this._info;
    let next: unknown = nothing;
    if (info?.enabled && info.current.next_change && info.current.next_temp !== null) {
      const when = new Date(info.current.next_change);
      const sameDay = isoDate(when) === isoDate(new Date());
      const label = `${sameDay ? "" : `${t.days[DAYS.indexOf(dayOf(when))]} `}${formatTime(minuteOfDay(when))}`;
      next = html`<span class="next">${t.next} ${this._fmtTemp(info.current.next_temp)} ${t.at} ${label}</span>`;
    }
    return html`
      <div class="status">
        <span class="current">${this._fmtTemp(attrs.current_temperature)}</span>
        <span class="target">${t.target} ${this._fmtTemp(attrs.temperature)}</span>
        <span class="mode ${climate.state}">${mode}</span>
        ${this._renderPresenceChip()}
        ${next}
      </div>
      ${this._renderOverride()}
      ${info?.enabled && climate.state === "off" ? html`<div class="hint">${t.off_hint}</div>` : nothing}
    `;
  }

  private _renderPresenceChip() {
    const presence = this._info?.presence;
    if (!presence?.entities.length) return nothing;
    const t = this._t;
    const label =
      presence.occupied === null
        ? t.presence_unknown
        : presence.occupied
          ? t.presence_yes
          : t.presence_no;
    return html`<span class="mode presence ${presence.occupied ? "on" : ""}">${label}</span>`;
  }

  private _renderOverride() {
    const info = this._info;
    if (!info?.enabled || info.effective.reason === "schedule") return nothing;
    const t = this._t;
    const temp = this._fmtTemp(info.effective.temp);
    const text = `${t.override_empty} ${temp} (−${this._fmtTemp(info.presence.setback)})`;
    return html`<div class="override">${text}</div>`;
  }

  private _renderBody() {
    const t = this._t;
    const today = dayOf(new Date());
    const history = this._history;
    const showHistoryDate =
      history && this._day !== today && isoDate(history.date) === isoDate(lastDateOf(this._day));
    return html`
      <div class="days">
        ${DAYS.map(
          (day, i) => html`<button
            class="day ${day === this._day ? "selected" : ""} ${day === today ? "today" : ""}"
            @click=${() => this._selectDay(day)}
          >
            ${t.days[i]}
          </button>`,
        )}
      </div>
      <div class="chart ${this._draft ? "editing" : ""}">${this._width ? this._renderChart() : nothing}</div>
      <div class="legend">
        <span><i class="line schedule"></i>${t.legend_schedule}</span>
        <span><i class="line current"></i>${t.legend_current}</span>
        <span><i class="line target"></i>${t.legend_target}</span>
        ${this._info?.profile?.weeks
          ? html`<span
              ><i class="swatch typical"></i>${t.legend_typical} (${this._info.profile.weeks}
              ${t.weeks})</span
            >`
          : nothing}
        ${this._info?.occupancy_entity
          ? html`<span><i class="swatch actual"></i>${t.legend_presence}</span>`
          : nothing}
        ${showHistoryDate ? html`<span class="muted">${t.history_from} ${isoDate(history!.date)}</span>` : nothing}
      </div>
      ${this._draft ? this._renderEditor() : this._renderSummary()}
    `;
  }

  private _renderChart() {
    const pts = this._pts();
    const W = this._width;
    const H = this._config!.height ?? 220;
    const [lo, hi] = this._range ?? this._yRange(pts);
    const plotW = W - PAD.l - PAD.r;
    const plotH = H - PAD.t - PAD.b;
    const x = (m: number) => PAD.l + (m / DAY_MIN) * plotW;
    const y = (v: number) => PAD.t + ((hi - v) / (hi - lo)) * plotH;
    this._scale = {
      x,
      y,
      minute: (px) => ((px - PAD.l) / plotW) * DAY_MIN,
      temp: (py) => hi - ((py - PAD.t) / plotH) * (hi - lo),
      lo,
      hi,
    };
    const editing = !!this._draft;
    const yStep = hi - lo > 12 ? 2 : 1;
    const yTicks: number[] = [];
    for (let v = Math.ceil(lo); v <= hi; v += yStep) yTicks.push(v);
    const xTicks = W < 420 ? [0, 6, 12, 18, 24] : [0, 3, 6, 9, 12, 15, 18, 21, 24];

    let line = `M${x(0)},${y(pts[0].t)}`;
    pts.forEach((p, i) => {
      line += `H${x(segmentEnd(pts, i))}`;
      if (i + 1 < pts.length) line += `V${y(pts[i + 1].t)}`;
    });
    const area = `${line}V${y(lo)}H${x(0)}Z`;

    const history = this._history;
    const historyHere = history && isoDate(history.date) === isoDate(lastDateOf(this._day));
    let currentPath = "";
    let targetPath = "";
    if (historyHere) {
      const cur = history!.current;
      if (cur.length) {
        currentPath = cur.map(([m, v], i) => `${i ? "L" : "M"}${x(m)},${y(clamp(v, lo, hi))}`).join("");
        currentPath += `L${x(history!.end)},${y(clamp(cur[cur.length - 1][1], lo, hi))}`;
      }
      const tgt = history!.target;
      if (tgt.length) {
        targetPath = `M${x(tgt[0][0])},${y(clamp(tgt[0][1], lo, hi))}`;
        for (let i = 1; i < tgt.length; i++) {
          targetPath += `H${x(tgt[i][0])}V${y(clamp(tgt[i][1], lo, hi))}`;
        }
        targetPath += `H${x(history!.end)}`;
      }
    }

    const isToday = this._day === dayOf(new Date());
    const nowM = minuteOfDay(new Date());
    const currentTemp = this.hass?.states[this._config!.entity]?.attributes.current_temperature;
    const drag = this._drag;

    return html`<svg
      width=${W}
      height=${H}
      @pointerdown=${this._onPointerDown}
      @pointermove=${this._onPointerMove}
      @pointerup=${this._onPointerUp}
      @pointercancel=${this._onPointerUp}
      @dblclick=${this._onDoubleClick}
    >
      <defs>
        <linearGradient id="fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" class="fill-top"></stop>
          <stop offset="1" class="fill-bottom"></stop>
        </linearGradient>
      </defs>
      ${this._renderProfile(x, plotW, H)}
      ${yTicks.map(
        (v) => svg`<line class="grid" x1=${PAD.l} x2=${W - PAD.r} y1=${y(v)} y2=${y(v)}></line>
          <text class="axis" x=${PAD.l - 4} y=${y(v) + 3.5} text-anchor="end">${v}°</text>`,
      )}
      ${xTicks.map(
        (h) => svg`<line class="grid" x1=${x(h * 60)} x2=${x(h * 60)} y1=${PAD.t} y2=${H - PAD.b}></line>
          <text class="axis" x=${x(h * 60)} y=${H - 5} text-anchor=${h === 0 ? "start" : h === 24 ? "end" : "middle"}>${h}</text>`,
      )}
      <path class="area" d=${area}></path>
      ${historyHere
        ? history!.occupied.map(
            ([from, to]) => svg`<rect class="presence-strip" x=${x(from)} y=${H - PAD.b - 5}
              width=${Math.max(1, x(to) - x(from))} height="5"></rect>`,
          )
        : nothing}
      ${targetPath ? svg`<path class="target" d=${targetPath}></path>` : nothing}
      ${currentPath ? svg`<path class="current" d=${currentPath}></path>` : nothing}
      <path class="schedule" d=${line}></path>
      ${this._selected !== undefined && editing && pts[this._selected]
        ? svg`<line class="selected" x1=${x(pts[this._selected].m)} x2=${x(segmentEnd(pts, this._selected))}
            y1=${y(pts[this._selected].t)} y2=${y(pts[this._selected].t)}></line>`
        : nothing}
      ${pts.map((p, i) => {
        const x1 = x(p.m);
        const x2 = x(segmentEnd(pts, i));
        return x2 - x1 > 26
          ? svg`<text class="label" x=${(x1 + x2) / 2} y=${y(p.t) - 5} text-anchor="middle">${this._fmtTemp(p.t)}</text>`
          : nothing;
      })}
      ${isToday
        ? svg`<line class="now" x1=${x(nowM)} x2=${x(nowM)} y1=${PAD.t - 6} y2=${H - PAD.b}></line>
          ${typeof currentTemp === "number"
            ? svg`<circle class="now-dot" cx=${x(nowM)} cy=${y(clamp(currentTemp, lo, hi))} r="4"></circle>`
            : nothing}`
        : nothing}
      ${editing
        ? svg`${pts.map(
            (p, i) => svg`<rect class="hit seg" data-kind="seg" data-i=${i}
              x=${x(p.m)} y=${y(p.t) - 14} width=${Math.max(0, x(segmentEnd(pts, i)) - x(p.m))} height="28"></rect>`,
          )}
          ${pts.slice(1).map(
            (p, k) => svg`<rect class="hit edge" data-kind="edge" data-i=${k + 1}
              x=${x(p.m) - 9} y=${PAD.t} width="18" height=${plotH}></rect>`,
          )}
          ${this._edgeLabels(pts, x).map(
            (p) => svg`<text class="edge-label" x=${x(p.m)} y=${PAD.t - 4} text-anchor="middle">${formatTime(p.m)}</text>`,
          )}`
        : nothing}
      ${drag?.moved ? this._renderDragLabel(pts, drag) : nothing}
    </svg>`;
  }

  /** Edge time labels that do not overlap (the selected segment's edges win). */
  private _edgeLabels(pts: Pt[], x: (m: number) => number): Pt[] {
    const edges = pts.slice(1);
    const sel = this._selected;
    const preferred = new Set(sel === undefined ? [] : [sel, sel + 1]);
    const order = edges
      .map((p, k) => ({ p, k: k + 1 }))
      .sort((a, b) => Number(preferred.has(b.k)) - Number(preferred.has(a.k)));
    const shown: Pt[] = [];
    for (const { p } of order) {
      if (shown.every((q) => Math.abs(x(q.m) - x(p.m)) >= 34)) shown.push(p);
    }
    return shown;
  }

  /** Background shading: typical occupancy of the selected weekday. */
  private _renderProfile(x: (m: number) => number, plotW: number, H: number) {
    const profile = this._info?.profile;
    if (!profile?.weeks) return nothing;
    const slots = profile.days[this._day] ?? [];
    const width = plotW / slots.length;
    return slots.map((value, i) =>
      value > 0.02
        ? svg`<rect class="profile" x=${x(i * 15)} y=${PAD.t} width=${width + 0.5}
            height=${H - PAD.t - PAD.b} fill-opacity=${Math.min(0.35, value * 0.35)}></rect>`
        : nothing,
    );
  }

  private _renderDragLabel(pts: Pt[], drag: Drag) {
    const s = this._scale!;
    const p = pts[drag.index];
    if (!p) return nothing;
    const text =
      drag.kind === "seg"
        ? this._fmtTemp(p.t)
        : `${formatTime(p.m)}`;
    const cx = drag.kind === "seg" ? (s.x(p.m) + s.x(segmentEnd(pts, drag.index))) / 2 : s.x(p.m);
    const cy = s.y(p.t) - 22;
    return svg`<g class="drag-label">
      <rect x=${cx - 24} y=${cy - 12} width="48" height="18" rx="4"></rect>
      <text x=${cx} y=${cy + 1} text-anchor="middle">${text}</text>
    </g>`;
  }

  private _renderSummary() {
    const pts = this._pts();
    return html`
      <div class="points">
        ${pts.map(
          (p, i) => html`<span class="chip">${formatTime(p.m)}–${formatTime(segmentEnd(pts, i))}
            <b>${this._fmtTemp(p.t)}</b></span>`,
        )}
      </div>
      <div class="actions">
        <span class="spacer"></span>
        <button class="primary" @click=${this._startEdit}>${this._t.edit}</button>
      </div>
    `;
  }

  private _renderEditor() {
    const t = this._t;
    const pts = this._pts();
    const sel = this._selected !== undefined ? pts[this._selected] : undefined;
    const { step } = this._limits;
    const dirty = this._info ? !weeksEqual(this._draft!, this._info.days) : true;
    return html`
      ${sel
        ? html`<div class="segment">
            ${this._selected! > 0
              ? html`<button class="icon" @click=${() => this._shiftStart(-TIME_STEP)}>‹</button>`
              : nothing}
            <span class="range">${formatTime(sel.m)}–${formatTime(segmentEnd(pts, this._selected!))}</span>
            ${this._selected! > 0
              ? html`<button class="icon" @click=${() => this._shiftStart(TIME_STEP)}>›</button>`
              : nothing}
            <span class="spacer"></span>
            <button class="icon" @click=${() => this._bump(-step)}>−</button>
            <span class="temp">${this._fmtTemp(sel.t)}</span>
            <button class="icon" @click=${() => this._bump(step)}>+</button>
            <span class="spacer"></span>
            <button @click=${this._split}>${t.split}</button>
            <button @click=${this._remove} .disabled=${pts.length <= 1}>${t.remove}</button>
          </div>`
        : html`<div class="hint">${t.edit_hint}</div>`}
      ${this._copyOpen ? this._renderCopy() : nothing}
      <div class="actions">
        <button @click=${() => (this._copyOpen = !this._copyOpen)}>${t.copy}</button>
        <span class="spacer"></span>
        <button @click=${this._cancel}>${t.cancel}</button>
        <button class="primary" @click=${this._save} .disabled=${!dirty || this._saving}>${t.save}</button>
      </div>
    `;
  }

  private _renderCopy() {
    const t = this._t;
    const toggle = (day: Day) => {
      this._copyTargets = this._copyTargets.includes(day)
        ? this._copyTargets.filter((d) => d !== day)
        : [...this._copyTargets, day];
    };
    const preset = (days: readonly Day[]) => {
      this._copyTargets = days.filter((d) => d !== this._day);
    };
    return html`<div class="copy">
      ${DAYS.map(
        (day, i) => html`<button
          class="day ${this._copyTargets.includes(day) ? "selected" : ""}"
          .disabled=${day === this._day}
          @click=${() => toggle(day)}
        >
          ${t.days[i]}
        </button>`,
      )}
      <span class="presets">
        <button @click=${() => preset(DAYS.slice(0, 5))}>${t.workdays}</button>
        <button @click=${() => preset(DAYS.slice(5))}>${t.weekend}</button>
        <button @click=${() => preset(DAYS)}>${t.all}</button>
        <button class="primary" .disabled=${!this._copyTargets.length} @click=${this._applyCopy}>
          ${t.copy_apply}
        </button>
      </span>
    </div>`;
  }

  // -- actions ----------------------------------------------------------------

  private _selectDay(day: Day): void {
    this._day = day;
    this._selected = undefined;
    this._copyTargets = [];
  }

  private _startEdit(): void {
    if (!this._info) return;
    this._draft = cloneWeek(this._info.days);
    this._selected = undefined;
  }

  private _cancel(): void {
    this._draft = undefined;
    this._selected = undefined;
    this._copyOpen = false;
    this._copyTargets = [];
  }

  private async _save(): Promise<void> {
    if (!this._draft || !this.hass) return;
    this._saving = true;
    try {
      this._info = await this.hass.callWS<ScheduleInfo>({
        type: "heating_schedule/save",
        entity_id: this._config!.entity,
        days: this._draft,
      });
      this._cancel();
      this._error = undefined;
    } catch (err: any) {
      this._error = err?.message ?? String(err);
    } finally {
      this._saving = false;
    }
  }

  private async _toggleEnabled(ev: Event): Promise<void> {
    const enabled = (ev.target as HTMLInputElement).checked;
    try {
      await this.hass!.callWS({ type: "heating_schedule/save", entity_id: this._config!.entity, enabled });
    } catch (err: any) {
      this._error = err?.message ?? String(err);
    }
  }

  private _bump(delta: number): void {
    if (this._selected === undefined) return;
    const { min, max, step } = this._limits;
    const pts = this._pts();
    const value = clamp(snap(pts[this._selected].t + delta, step), min, max);
    this._setPts(setTemp(pts, this._selected, value));
  }

  private _shiftStart(delta: number): void {
    const i = this._selected;
    if (i === undefined || i === 0) return;
    const pts = this._pts();
    const moved = moveEdge(pts, i, pts[i].m + delta);
    const cleaned = dropEmpty(moved);
    if (cleaned.length !== moved.length) this._selected = undefined;
    this._setPts(cleaned);
  }

  private _split(): void {
    if (this._selected === undefined) return;
    const split = splitSegment(this._pts(), this._selected);
    if (split) {
      this._setPts(split);
      this._selected += 1;
    }
  }

  private _remove(): void {
    if (this._selected === undefined) return;
    this._setPts(removeSegment(this._pts(), this._selected));
    this._selected = undefined;
  }

  private _applyCopy(): void {
    if (!this._draft) return;
    const source = this._draft[this._day];
    const next = { ...this._draft };
    for (const day of this._copyTargets) next[day] = source.map((p) => ({ ...p }));
    this._draft = next;
    this._copyOpen = false;
    this._copyTargets = [];
  }

  // -- pointer editing --------------------------------------------------------

  private _local(ev: PointerEvent | MouseEvent): [number, number] {
    const rect = (ev.currentTarget as Element).getBoundingClientRect();
    return [ev.clientX - rect.left, ev.clientY - rect.top];
  }

  private _onPointerDown(ev: PointerEvent): void {
    if (!this._draft) return;
    const target = ev.target as Element;
    const kind = target.getAttribute("data-kind") as Drag["kind"] | null;
    if (!kind) {
      this._selected = undefined;
      return;
    }
    ev.preventDefault();
    (ev.currentTarget as Element).setPointerCapture(ev.pointerId);
    const index = Number(target.getAttribute("data-i"));
    this._range = this._yRange(this._pts());
    this._drag = { kind, index, pointerId: ev.pointerId, x0: ev.clientX, y0: ev.clientY, moved: false };
    if (kind === "seg") this._selected = index;
  }

  private _onPointerMove(ev: PointerEvent): void {
    const drag = this._drag;
    if (!drag || ev.pointerId !== drag.pointerId || !this._scale) return;
    if (!drag.moved && Math.hypot(ev.clientX - drag.x0, ev.clientY - drag.y0) < 4) return;
    drag.moved = true;
    const [px, py] = this._local(ev);
    const pts = this._pts();
    if (drag.kind === "seg") {
      const { min, max, step } = this._limits;
      const value = clamp(snap(this._scale.temp(py), step), Math.max(min, this._scale.lo), Math.min(max, this._scale.hi));
      if (value !== pts[drag.index].t) this._setPts(setTemp(pts, drag.index, value));
    } else {
      const minute = snap(this._scale.minute(px), TIME_STEP);
      if (minute !== pts[drag.index].m) this._setPts(moveEdge(pts, drag.index, minute));
    }
    this.requestUpdate();
  }

  private _onPointerUp(ev: PointerEvent): void {
    const drag = this._drag;
    if (!drag || ev.pointerId !== drag.pointerId) return;
    if (drag.kind === "edge" && drag.moved) {
      const pts = this._pts();
      const cleaned = dropEmpty(pts);
      if (cleaned.length !== pts.length) this._selected = undefined;
      this._setPts(cleaned);
    }
    this._drag = undefined;
    this._range = undefined;
  }

  private _onDoubleClick(ev: MouseEvent): void {
    if (!this._draft || !this._scale) return;
    const target = ev.target as Element;
    if (target.getAttribute("data-kind") !== "seg") return;
    const index = Number(target.getAttribute("data-i"));
    const [px] = this._local(ev);
    const split = splitSegment(this._pts(), index, this._scale.minute(px));
    if (split) {
      this._setPts(split);
      this._selected = index + 1;
    }
  }

  static styles = css`
    :host {
      --hs-schedule: var(--primary-color, #03a9f4);
      --hs-current: var(--state-climate-heat-color, #ff8100);
      --hs-target: var(--secondary-text-color, #727272);
      --hs-now: var(--error-color, #db4437);
      --hs-grid: var(--divider-color, rgba(127, 127, 127, 0.2));
      --hs-presence: var(--green-color, #4caf50);
    }
    ha-card {
      padding: 16px;
      box-sizing: border-box;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .name {
      font-size: 1.15em;
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .header-end {
      display: flex;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
    }
    button.settings {
      display: inline-flex;
      padding: 6px;
      background: none;
      color: var(--secondary-text-color);
      --mdc-icon-size: 20px;
    }
    .toggle {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--secondary-text-color);
      font-size: 0.9em;
    }
    .status {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 4px 12px;
      margin: 6px 0 4px;
    }
    .current {
      font-size: 1.8em;
      font-weight: 400;
    }
    .target,
    .next {
      color: var(--secondary-text-color);
    }
    .mode {
      font-size: 0.8em;
      padding: 1px 8px;
      border-radius: 10px;
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.15));
      color: var(--secondary-text-color);
    }
    .mode.heat {
      background: var(--hs-current);
      color: #fff;
    }
    .mode.presence.on {
      background: var(--hs-presence);
      color: #fff;
    }
    .override {
      display: inline-block;
      margin: 2px 0 4px;
      padding: 2px 10px;
      border-radius: 10px;
      font-size: 0.85em;
      background: var(--warning-color, #ffa600);
      color: #fff;
    }
    .profile {
      shape-rendering: crispEdges;
    }
    .profile,
    .presence-strip {
      fill: var(--hs-presence);
    }
    .swatch {
      display: inline-block;
      width: 12px;
      height: 10px;
      border-radius: 2px;
      background: var(--hs-presence);
    }
    .swatch.typical {
      opacity: 0.35;
    }
    .hint {
      color: var(--secondary-text-color);
      font-size: 0.85em;
      margin: 4px 0;
    }
    .error {
      color: var(--error-color, #db4437);
      margin: 8px 0;
    }
    .days,
    .copy {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin: 8px 0;
    }
    .days .day {
      flex: 1;
    }
    button {
      font: inherit;
      font-size: 0.9em;
      color: var(--primary-text-color);
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
      border: 1px solid transparent;
      border-radius: 8px;
      padding: 6px 10px;
      cursor: pointer;
      min-width: 0;
    }
    button:disabled {
      opacity: 0.45;
      cursor: default;
    }
    button.selected,
    button.primary {
      background: var(--primary-color, #03a9f4);
      color: var(--text-primary-color, #fff);
    }
    button.today:not(.selected) {
      border-color: var(--primary-color, #03a9f4);
    }
    button.icon {
      width: 32px;
      padding: 6px 0;
      font-size: 1.1em;
      line-height: 1;
    }
    .chart {
      width: 100%;
      min-height: 120px;
      user-select: none;
      -webkit-user-select: none;
    }
    .chart svg {
      display: block;
      overflow: visible;
    }
    .chart.editing svg {
      touch-action: none;
    }
    .grid {
      stroke: var(--hs-grid);
      stroke-width: 1;
    }
    .axis,
    .edge-label {
      fill: var(--secondary-text-color);
      font-size: 10px;
    }
    .label {
      fill: var(--hs-schedule);
      font-size: 11px;
      font-weight: 500;
    }
    .fill-top {
      stop-color: var(--hs-schedule);
      stop-opacity: 0.25;
    }
    .fill-bottom {
      stop-color: var(--hs-schedule);
      stop-opacity: 0.02;
    }
    .area {
      fill: url(#fill);
    }
    .schedule {
      fill: none;
      stroke: var(--hs-schedule);
      stroke-width: 2.5;
      stroke-linejoin: round;
    }
    svg .selected {
      stroke: var(--accent-color, #ff9800);
      stroke-width: 5;
      stroke-linecap: round;
    }
    svg .current {
      fill: none;
      stroke: var(--hs-current);
      stroke-width: 1.8;
      stroke-linejoin: round;
    }
    svg .target {
      fill: none;
      stroke: var(--hs-target);
      stroke-width: 1.5;
      stroke-dasharray: 4 3;
    }
    .now {
      stroke: var(--hs-now);
      stroke-width: 1.5;
      stroke-dasharray: 3 3;
    }
    .now-dot {
      fill: var(--hs-current);
      stroke: var(--card-background-color, #fff);
      stroke-width: 2;
    }
    .hit {
      fill: transparent;
    }
    .hit.seg {
      cursor: ns-resize;
    }
    .hit.edge {
      cursor: ew-resize;
    }
    .edge-label {
      font-size: 9px;
    }
    .drag-label rect {
      fill: var(--primary-text-color);
      opacity: 0.85;
    }
    .drag-label text {
      fill: var(--card-background-color, #fff);
      font-size: 11px;
      font-weight: 500;
    }
    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 4px 14px;
      font-size: 0.8em;
      color: var(--secondary-text-color);
      margin-top: 4px;
    }
    .legend span {
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }
    .line {
      display: inline-block;
      width: 16px;
      height: 0;
      border-top: 2.5px solid var(--hs-schedule);
    }
    .line.current {
      border-top: 2px solid var(--hs-current);
    }
    .line.target {
      border-top: 2px dashed var(--hs-target);
    }
    .muted {
      opacity: 0.8;
    }
    .points {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 10px;
    }
    .chip {
      font-size: 0.8em;
      padding: 3px 8px;
      border-radius: 10px;
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
    }
    .segment {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px;
      margin-top: 10px;
    }
    .segment .range {
      font-variant-numeric: tabular-nums;
    }
    .segment .temp {
      min-width: 3em;
      text-align: center;
      font-weight: 500;
    }
    .presets {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-left: auto;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 10px;
    }
    .spacer {
      flex: 1;
    }
  `;
}

declare global {
  interface Window {
    customCards?: { type: string; name: string; description: string; preview?: boolean }[];
  }
}

window.customCards = window.customCards ?? [];
if (!window.customCards.some((card) => card.type === "heating-schedule-card")) {
  window.customCards.push({
    type: "heating-schedule-card",
    name: "Heating Schedule",
    description: "Weekly thermostat schedule as a temperature chart, editable by dragging.",
    preview: true,
  });
}
