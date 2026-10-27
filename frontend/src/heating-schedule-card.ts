import { LitElement, css, html, nothing, svg, type PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";

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
  formatDuration,
  formatTime,
  fromPts,
  moveEdge,
  removeSegment,
  bandOf,
  segmentEnd,
  sensitivity,
  type Band,
  setTemp,
  snap,
  splitSegment,
  tempAt,
  toPts,
  wallMinute,
  weeksEqual,
} from "./model";
import { describeSuggestion, markerOf, type Suggestion } from "./suggestions";

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
  /** Registries (HA 2024.4+), used by the panel to group cards by floor. */
  entities?: Record<string, { area_id?: string | null; device_id?: string | null }>;
  devices?: Record<string, { area_id?: string | null }>;
  areas?: Record<string, { area_id: string; name: string; floor_id?: string | null }>;
  floors?: Record<string, { floor_id: string; name: string; level?: number | null }>;
  connection: {
    subscribeMessage<T>(
      callback: (msg: T) => void,
      msg: Record<string, unknown>,
    ): Promise<() => Promise<void>>;
  };
  callWS<T>(msg: Record<string, unknown>): Promise<T>;
  callService(domain: string, service: string, data?: Record<string, unknown>): Promise<unknown>;
}

interface CardConfig {
  type: string;
  entity: string;
  name?: string;
  height?: number;
  /** Show a settings button that fires ``heating-schedule-settings`` (used by the panel). */
  settings?: boolean;
  /** Dashboard chart card: today's chart and legend only, nothing to edit. */
  readonly?: boolean;
}

export interface ScheduleInfo {
  entry_id: string;
  title: string;
  climate_entity: string;
  enabled: boolean;
  days: Week;
  current: { temp: number | null; next_change: string | null; next_temp: number | null };
  presence: {
    entities: string[];
    occupied: boolean | null;
  };
  profile: { days: Record<Day, number[]>; weeks: number } | null;
  limits: { min: number | null; max: number | null; step: number };
  /** Sensitivity band set in the settings (degrees); null = from the thermostat's entity. */
  band?: { below: number | null; above: number | null };
  switch_entity: string | null;
  sensor_entity: string | null;
  occupancy_entity: string | null;
  suggestions?: Suggestion[];
  ai_available?: boolean;
  /** A whole week proposed by the AI for a new thermostat. */
  ai_full?: { id: string; week: Week } | null;
}

// Brand icons are served by Home Assistant with a short-lived token (as the HA frontend does).
let brandsToken: Promise<string | null> | undefined;
let brandsTokenAt = 0;

function aiIconUrl(hass: Hass): Promise<string | null> {
  if (!brandsToken || Date.now() - brandsTokenAt > 20 * 60 * 1000) {
    brandsTokenAt = Date.now();
    brandsToken = hass
      .callWS<{ token: string }>({ type: "brands/access_token" })
      .then((r) => r.token)
      .catch(() => null);
  }
  const dark = (hass as { themes?: { darkMode?: boolean } }).themes?.darkMode;
  return brandsToken.then((token) =>
    token ? `/api/brands/integration/ai_task/${dark ? "dark_" : ""}icon.png?token=${token}` : null,
  );
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
  heating: [number, number][]; // [start minute, end minute] with hvac_action "heating"
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
  /** Plot width in px (the x axis maps the visible minutes onto it). */
  width: number;
}

/** Narrowest zoom: one hour across the chart. */
const MIN_SPAN = 60;
/** Tick spacings in minutes, the finest that fits is used. */
const TICK_STEPS = [15, 30, 60, 120, 180, 360];

const PAD = { l: 30, r: 8, t: 16, b: 20 };
/** Extra room under the plot for the presence strips (that day + typical). */
const STRIPS_H = 12;
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

export class HeatingScheduleCard extends LitElement {
  @property({ attribute: false }) hass?: Hass;

  @state() private _config?: CardConfig;
  @state() private _info?: ScheduleInfo;
  @state() private _error?: string;
  @state() private _modeBusy = false;
  @state() private _day: Day = dayOf(new Date());
  @state() private _draft?: Week;
  @state() private _selected?: number;
  @state() private _drag?: Drag;
  @state() private _history?: History;
  @state() private _width = 0;
  @state() private _copyOpen = false;
  @state() private _copyTargets: Day[] = [];
  @state() private _saving = false;
  /** Minute under the pointer (view mode only): tooltip with the line values. */
  @state() private _hover?: number;
  /** Suggestion being applied or dismissed. */
  @state() private _suggestBusy?: string;
  @state() private _aiBusy = false;
  @state() private _aiNote?: string;
  @state() private _aiIcon?: string | null;
  /** Visible minutes of the day [start, end): zoomed with the wheel or a pinch. */
  @state() private _view: [number, number] = [0, DAY_MIN];
  /** Touch: the tooltip stays a moment after the finger is lifted. */
  private _hoverTimer?: number;
  /** Touch points on the chart (x in px) and the pinch they make. */
  private _touches = new Map<number, number>();
  private _pinch?: { ids: [number, number]; a: number; b: number };
  /** Mouse drag panning a zoomed chart (view mode). */
  private _pan?: { pointerId: number; x0: number; start: number };

  private _unsub?: Promise<() => Promise<void>>;
  private _subscribeFailed = false;
  private _historyKey?: string;
  private _historyTimer?: number;
  private _resize?: ResizeObserver;
  private _observed?: Element;
  private _range?: [number, number];
  private _scale?: Scale;

  // -- configuration (set by the panel, or a dashboard for the chart card) ----

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

  // -- lifecycle --------------------------------------------------------------

  connectedCallback(): void {
    super.connectedCallback();
    this._historyTimer = window.setInterval(() => {
      if (this._config?.readonly) this._day = dayOf(new Date()); // a dashboard card follows today
      this._loadHistory(true);
    }, HISTORY_REFRESH_MS);
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
    window.clearTimeout(this._hoverTimer);
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

  /** Presence entities configured; without them no presence data is drawn. */
  private get _presence(): boolean {
    return !!this._info?.presence?.entities.length;
  }

  private async _loadHistory(force = false): Promise<void> {
    if (!this.hass || !this._config) return;
    const entity = this._config.entity;
    const occupancy = this._presence ? (this._info?.occupancy_entity ?? null) : null;
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
      const endMinute = end === now ? minuteOfDay(now) : DAY_MIN;
      const current: [number, number][] = [];
      const target: [number, number][] = [];
      const heating: [number, number][] = [];
      let heatFrom: number | undefined;
      let last = 0;
      for (const row of result[entity] ?? []) {
        const m = (last = wallMinute((row.lu ?? row.lc ?? 0) * 1000, date, last));
        const attrs = row.a ?? {};
        if (typeof attrs.current_temperature === "number") current.push([m, attrs.current_temperature]);
        if (typeof attrs.temperature === "number") target.push([m, attrs.temperature]);
        const heats = attrs.hvac_action === "heating";
        if (heats && heatFrom === undefined) heatFrom = m;
        if (!heats && heatFrom !== undefined) {
          if (m > heatFrom) heating.push([heatFrom, m]);
          heatFrom = undefined;
        }
      }
      if (heatFrom !== undefined && endMinute > heatFrom) heating.push([heatFrom, endMinute]);
      const toMinute = (row: HistoryRow) => wallMinute((row.lu ?? row.lc ?? 0) * 1000, date);
      const occupied: [number, number][] = [];
      const rows = occupancy ? (result[occupancy] ?? []) : [];
      rows.forEach((row, i) => {
        if (row.s !== "on") return;
        const from = toMinute(row);
        const to = i + 1 < rows.length ? toMinute(rows[i + 1]) : endMinute;
        if (to > from) occupied.push([from, to]);
      });
      this._history = { date, current, target, occupied, heating, end: endMinute };
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

  /** The thermostat's switching sensitivity, shown as a band around the schedule. */
  private get _band(): Band | undefined {
    if (!this.hass || !this._config) return undefined;
    return bandOf(
      this._info?.band,
      sensitivity(this._config.entity, this.hass.states, this.hass.entities),
    );
  }

  private _fmtBand({ below, above }: Band): string {
    if (below === above) return `±${this._fmtTemp(below)}`;
    if (!above) return `−${this._fmtTemp(below)}`;
    if (!below) return `+${this._fmtTemp(above)}`;
    return `−${this._fmtTemp(below)} / +${this._fmtTemp(above)}`;
  }

  private _yRange(pts: Pt[]): [number, number] {
    const band = this._band ?? { below: 0, above: 0 };
    const values = pts.flatMap((p) => [p.t - band.below, p.t + band.above]);
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
    // A disabled schedule: faded and darker, so it is obvious at a glance (not while editing).
    const off = !!this._info && !this._info.enabled && !this._draft;
    if (this._config.readonly) {
      return html`
        <ha-card class="readonly ${off ? "disabled" : ""}">
          ${this._config.name ? html`<div class="header"><div class="name">${name}</div></div>` : nothing}
          ${this._error ? html`<div class="error">${this._error}</div>` : nothing}
          ${this._info ? this._renderView() : nothing}
        </ha-card>
      `;
    }
    return html`
      <ha-card class=${off ? "disabled" : ""}>
        <div class="header">
          <div class="name">${name}</div>
          <div class="header-end">
            ${this._info
              ? html`<label class="toggle" title=${t.schedule}>
                  <ha-switch
                    aria-label=${t.schedule}
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

  /** The thermostat's mode icon; a button that turns it on or off where it supports both. */
  private _renderMode(climate: HassEntity, mode: string, icon: string) {
    const t = this._t;
    const next = climate.state === "off" ? "heat" : climate.state === "heat" ? "off" : undefined;
    const modes: string[] = climate.attributes.hvac_modes ?? [];
    if (!next || !modes.includes(next)) {
      return html`<ha-icon class="mode ${climate.state}" icon=${icon} title=${mode} aria-label=${mode}></ha-icon>`;
    }
    const label = `${mode}: ${next === "off" ? t.mode_turn_off : t.mode_turn_on}`;
    return html`<button
      class="mode ${climate.state}"
      title=${label}
      aria-label=${label}
      aria-pressed=${climate.state === "heat" ? "true" : "false"}
      .disabled=${this._modeBusy}
      @click=${() => this._setMode(next)}
    >
      <ha-icon icon=${icon}></ha-icon>
    </button>`;
  }

  private async _setMode(hvacMode: string): Promise<void> {
    if (!this.hass || !this._config) return;
    this._modeBusy = true;
    this._error = undefined;
    try {
      await this.hass.callService("climate", "set_hvac_mode", {
        entity_id: this._config.entity,
        hvac_mode: hvacMode,
      });
    } catch (err: any) {
      this._error = err?.message ?? String(err);
    } finally {
      this._modeBusy = false;
    }
  }

  private _renderStatus(climate?: HassEntity) {
    if (!climate) return nothing;
    const t = this._t;
    const attrs = climate.attributes;
    const mode = climate.state === "off" ? t.mode_off : climate.state === "heat" ? t.mode_heat : climate.state;
    const icon = climate.state === "off" ? "mdi:fire-off" : climate.state === "heat" ? "mdi:fire" : "mdi:thermostat";
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
        ${this._renderMode(climate, mode, icon)}
        ${next}
      </div>
      ${info?.enabled && climate.state === "off" ? html`<div class="hint">${t.off_hint}</div>` : nothing}
    `;
  }

  /** The chart and its legend, as on the read-only dashboard card. */
  private _renderView() {
    return html`
      <div class="chart ${this._draft ? "editing" : ""} ${this._zoomed ? "zoomed" : ""}">
        ${this._width ? this._renderChart() : nothing}${this._renderTooltip()}${this._renderZoomReset()}
      </div>
      ${this._renderLegend()}
    `;
  }

  private _renderBody() {
    const t = this._t;
    const today = dayOf(new Date());
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
      ${this._renderView()}
      ${this._renderSuggestions()}
      ${this._draft ? this._renderEditor() : this._renderSummary()}
    `;
  }

  private _renderLegend() {
    const t = this._t;
    const history = this._history;
    const historyHere = !!history && isoDate(history.date) === isoDate(lastDateOf(this._day));
    const showHistoryDate = historyHere && this._day !== dayOf(new Date());
    const heatMinutes = historyHere ? history!.heating.reduce((sum, [a, b]) => sum + b - a, 0) : 0;
    return html`
      <div class="legend">
        <span><i class="line schedule"></i>${t.legend_schedule}</span>
        <span><i class="line current"></i>${t.legend_current}</span>
        <span><i class="line target"></i>${t.legend_target}</span>
        ${this._band
          ? html`<span><i class="swatch band"></i>${t.legend_band}
              <b>${this._fmtBand(this._band)}</b></span>`
          : nothing}
        ${heatMinutes
          ? html`<span><i class="swatch heating"></i>${t.legend_heating} <b>${formatDuration(heatMinutes)}</b></span>`
          : nothing}
        ${this._presence && this._info?.occupancy_entity
          ? html`<span><i class="swatch actual"></i>${t.legend_presence}</span>`
          : nothing}
        ${this._presence && this._info?.profile?.weeks
          ? html`<span
              ><i class="swatch typical"></i>${t.legend_typical} (${this._info.profile.weeks}
              ${t.weeks})</span
            >`
          : nothing}
        ${showHistoryDate ? html`<span class="muted">${t.history_from} ${isoDate(history!.date)}</span>` : nothing}
      </div>
    `;
  }

  private _renderChart() {
    const pts = this._pts();
    const W = this._width;
    const H = this._config!.height ?? 220;
    const [lo, hi] = this._range ?? this._yRange(pts);
    const bottom = PAD.b + (this._presence ? STRIPS_H : 0);
    const plotW = W - PAD.l - PAD.r;
    const plotH = H - PAD.t - bottom;
    const [v0, v1] = this._view;
    const span = v1 - v0;
    const x = (m: number) => PAD.l + ((m - v0) / span) * plotW;
    const y = (v: number) => PAD.t + ((hi - v) / (hi - lo)) * plotH;
    this._scale = {
      x,
      y,
      minute: (px) => v0 + ((px - PAD.l) / plotW) * span,
      temp: (py) => hi - ((py - PAD.t) / plotH) * (hi - lo),
      lo,
      hi,
      width: plotW,
    };
    const editing = !!this._draft;
    const yStep = hi - lo > 12 ? 2 : 1;
    const yTicks: number[] = [];
    for (let v = Math.ceil(lo); v <= hi; v += yStep) yTicks.push(v);
    const maxTicks = W < 420 ? 4 : 8;
    const tickStep = TICK_STEPS.find((s) => span / s <= maxTicks) ?? 360;
    const xTicks: number[] = [];
    for (let m = Math.ceil(v0 / tickStep) * tickStep; m <= v1; m += tickStep) xTicks.push(m);

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
      const cy = (v: number) => y(clamp(v, lo, hi));
      if (cur.length) {
        currentPath = cur.map(([m, v], i) => `${i ? "L" : "M"}${x(m)},${cy(v)}`).join("");
        currentPath += `L${x(history!.end)},${cy(cur[cur.length - 1][1])}`;
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
    const band = this._band;

    return html`<svg
      width=${W}
      height=${H}
      @pointerdown=${this._onPointerDown}
      @pointermove=${this._onPointerMove}
      @pointerup=${this._onPointerUp}
      @pointercancel=${this._onPointerUp}
      @pointerleave=${this._onPointerLeave}
      @dblclick=${this._onDoubleClick}
      @wheel=${this._onWheel}
    >
      <defs>
        <clipPath id="plot"><rect x=${PAD.l} y="0" width=${plotW} height=${H}></rect></clipPath>
        <linearGradient id="fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" class="fill-top"></stop>
          <stop offset="1" class="fill-bottom"></stop>
        </linearGradient>
      </defs>
      ${yTicks.map(
        (v) => svg`<line class="grid" x1=${PAD.l} x2=${W - PAD.r} y1=${y(v)} y2=${y(v)}></line>
          <text class="axis" x=${PAD.l - 4} y=${y(v) + 3.5} text-anchor="end">${v}°</text>`,
      )}
      <g clip-path="url(#plot)">
      ${historyHere
        ? history!.heating.map(
            ([from, to]) => svg`<rect class="heating" x=${x(from)} y=${PAD.t}
              width=${Math.max(1, x(to) - x(from))} height=${plotH}></rect>`,
          )
        : nothing}
      ${xTicks.map(
        (m) => svg`<line class="grid" x1=${x(m)} x2=${x(m)} y1=${PAD.t} y2=${PAD.t + plotH}></line>
          <text class="axis" x=${x(m)} y=${H - 5}
            text-anchor=${m === v0 ? "start" : m === v1 ? "end" : "middle"}>${m % 60 ? formatTime(m) : m / 60}</text>`,
      )}
      <path class="area" d=${area}></path>
      ${band
        ? pts.map((p, i) => {
            const top = y(Math.min(p.t + band.above, hi));
            const height = y(Math.max(p.t - band.below, lo)) - top;
            return svg`<rect class="band" x=${x(p.m)} y=${top}
              width=${Math.max(0, x(segmentEnd(pts, i)) - x(p.m))} height=${Math.max(0, height)}></rect>`;
          })
        : nothing}
      ${this._presence && historyHere
        ? history!.occupied.map(
            ([from, to]) => svg`<rect class="presence-strip" x=${x(from)} y=${PAD.t + plotH + 1}
              width=${Math.max(1, x(to) - x(from))} height="5"></rect>`,
          )
        : nothing}
      ${this._renderProfile(x, plotW, PAD.t + plotH + 7)}
      ${currentPath ? svg`<path class="current" d=${currentPath}></path>` : nothing}
      <path class="schedule" d=${line}></path>
      ${this._selected !== undefined && editing && pts[this._selected]
        ? svg`<line class="selected" x1=${x(pts[this._selected].m)} x2=${x(segmentEnd(pts, this._selected))}
            y1=${y(pts[this._selected].t)} y2=${y(pts[this._selected].t)}></line>`
        : nothing}
      ${targetPath ? svg`<path class="target" d=${targetPath}></path>` : nothing}
      ${pts.map((p, i) => {
        const x1 = x(p.m);
        const x2 = x(segmentEnd(pts, i));
        return x2 - x1 > 26
          ? svg`<text class="label" x=${(x1 + x2) / 2} y=${y(p.t) - 5} text-anchor="middle">${this._fmtTemp(p.t)}</text>`
          : nothing;
      })}
      ${isToday
        ? svg`<line class="now" x1=${x(nowM)} x2=${x(nowM)} y1=${PAD.t - 6} y2=${PAD.t + plotH}></line>
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
      ${this._renderSuggestionMarkers(pts, x, y, plotH)}
      ${this._renderCrosshair(x, y, plotH)}
      </g>
    </svg>`;
  }

  private get _zoomed(): boolean {
    return this._view[1] - this._view[0] < DAY_MIN;
  }

  private _setView(start: number, span: number): void {
    const width = clamp(span, MIN_SPAN, DAY_MIN);
    const from = clamp(start, 0, DAY_MIN - width);
    this._view = [from, from + width];
  }

  private _resetZoom(): void {
    this._view = [0, DAY_MIN];
  }

  private _renderZoomReset() {
    if (!this._zoomed) return nothing;
    return html`<button
      class="zoom-reset"
      title=${this._t.zoom_reset}
      aria-label=${this._t.zoom_reset}
      @click=${this._resetZoom}
    >
      <ha-icon icon="mdi:magnify-minus-outline"></ha-icon>
    </button>`;
  }

  /** Wheel: zoom around the pointer; horizontal wheel (or shift) pans a zoomed chart. */
  private _onWheel(ev: WheelEvent): void {
    const scale = this._scale;
    if (!scale) return;
    const [v0, v1] = this._view;
    const span = v1 - v0;
    const unit = ev.deltaMode === 1 ? 33 : ev.deltaMode === 2 ? 400 : 1;
    const pan = Math.abs(ev.deltaX) > Math.abs(ev.deltaY) ? ev.deltaX : ev.shiftKey ? ev.deltaY : 0;
    if (pan) {
      if (!this._zoomed) return;
      ev.preventDefault();
      this._setView(v0 + ((pan * unit) / scale.width) * span, span);
      return;
    }
    const next = clamp(span * Math.exp(ev.deltaY * unit * 0.0015), MIN_SPAN, DAY_MIN);
    if (next === span && !this._zoomed) return; // the whole day already: let the page scroll
    ev.preventDefault();
    const at = clamp(scale.minute(this._local(ev)[0]), 0, DAY_MIN);
    this._setView(at - ((at - v0) / span) * next, next);
  }

  /** Two fingers: the minutes under them stay under them (zoom and pan at once). */
  private _onPinch(): void {
    const pinch = this._pinch;
    const scale = this._scale;
    if (!pinch || !scale) return;
    const p1 = this._touches.get(pinch.ids[0]);
    const p2 = this._touches.get(pinch.ids[1]);
    if (p1 === undefined || p2 === undefined || Math.abs(p2 - p1) < 20) return;
    const span = ((pinch.b - pinch.a) * scale.width) / (p2 - p1);
    if (!(span > 0)) return;
    const width = clamp(span, MIN_SPAN, DAY_MIN);
    // Keep the midpoint between the fingers fixed when the span is clamped.
    const mid = (pinch.a + pinch.b) / 2;
    const midPx = (p1 + p2) / 2 - PAD.l;
    this._setView(mid - (midPx / scale.width) * width, width);
  }

  private _trackTouch(ev: PointerEvent): boolean {
    if (ev.pointerType !== "touch") return false;
    this._touches.set(ev.pointerId, this._local(ev)[0]);
    if (this._touches.size === 2 && !this._pinch && this._scale) {
      const ids = [...this._touches.keys()] as [number, number];
      const [a, b] = ids.map((id) => this._scale!.minute(this._touches.get(id)!));
      this._pinch = { ids, a, b };
      this._drag = undefined;
      this._range = undefined;
      this._hover = undefined;
    }
    return !!this._pinch;
  }

  private _untrackTouch(ev: PointerEvent): void {
    this._touches.delete(ev.pointerId);
    if (this._pinch?.ids.includes(ev.pointerId)) this._pinch = undefined;
    if (this._pan?.pointerId === ev.pointerId) this._pan = undefined;
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

  /** Strip under the plot: typical occupancy of the selected weekday (stronger = more often). */
  private _renderProfile(x: (m: number) => number, plotW: number, top: number) {
    const profile = this._presence ? this._info?.profile : undefined;
    if (!profile?.weeks) return nothing;
    const slots = profile.days[this._day] ?? [];
    const width = (x(DAY_MIN) - x(0)) / slots.length;
    return slots.map((value, i) =>
      value > 0.02
        ? svg`<rect class="profile" x=${x(i * 15)} y=${top} width=${width + 0.5}
            height="5" fill-opacity=${0.45 + 0.55 * Math.min(1, value)}></rect>`
        : nothing,
    );
  }

  /** Line values at a minute: schedule always, measured and target only where history exists. */
  private _hoverValues(minute: number) {
    const history = this._history;
    const here =
      !!history && isoDate(history.date) === isoDate(lastDateOf(this._day)) && minute <= history.end;
    const at = (series: [number, number][]) => {
      let value: number | undefined;
      for (const [m, v] of series) {
        if (m > minute) break;
        value = v;
      }
      return value;
    };
    return {
      schedule: tempAt(this._pts(), minute),
      current: here ? at(history!.current) : undefined,
      target: here ? at(history!.target) : undefined,
    };
  }

  private _renderCrosshair(x: (m: number) => number, y: (t: number) => number, plotH: number) {
    const m = this._hover;
    if (m === undefined || this._draft || !this._scale) return nothing;
    const { lo, hi } = this._scale;
    const v = this._hoverValues(m);
    const cy = (t: number) => y(clamp(t, lo, hi));
    return svg`<g class="crosshair">
      <line x1=${x(m)} x2=${x(m)} y1=${PAD.t} y2=${PAD.t + plotH}></line>
      <circle class="dot schedule" cx=${x(m)} cy=${cy(v.schedule)} r="3.5"></circle>
      ${v.target !== undefined ? svg`<circle class="dot target" cx=${x(m)} cy=${cy(v.target)} r="3.5"></circle>` : nothing}
      ${v.current !== undefined ? svg`<circle class="dot current" cx=${x(m)} cy=${cy(v.current)} r="3.5"></circle>` : nothing}
    </g>`;
  }

  private _renderTooltip() {
    const m = this._hover;
    if (m === undefined || this._draft || !this._scale) return nothing;
    const t = this._t;
    const v = this._hoverValues(m);
    const px = this._scale.x(m);
    const side = px > this._width - 160 ? `right:${this._width - px + 12}px` : `left:${px + 12}px`;
    return html`<div class="tooltip" style=${side}>
      <b>${formatTime(m)}</b>
      <div><span><i class="line schedule"></i>${t.legend_schedule}</span><span>${this._fmtTemp(v.schedule)}</span></div>
      ${v.current !== undefined
        ? html`<div><span><i class="line current"></i>${t.legend_current}</span><span>${this._fmtTemp(v.current)}</span></div>`
        : nothing}
      ${v.target !== undefined
        ? html`<div><span><i class="line target"></i>${t.legend_target}</span><span>${this._fmtTemp(v.target)}</span></div>`
        : nothing}
    </div>`;
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

  // -- suggestions ----------------------------------------------------------

  /** Shown on the panel's cards only, and not while editing. */
  private get _suggestions(): Suggestion[] {
    if (!this._config?.settings || this._draft) return [];
    return this._info?.suggestions ?? [];
  }

  private get _aiFull() {
    if (!this._config?.settings || this._draft) return undefined;
    return this._info?.ai_full ?? undefined;
  }

  private _renderAiIcon(cls = "ai-icon") {
    if (this._aiIcon === undefined && this.hass) {
      this._aiIcon = null;
      aiIconUrl(this.hass).then((url) => (this._aiIcon = url));
    }
    return this._aiIcon
      ? html`<img class=${cls} src=${this._aiIcon} alt="AI" @error=${() => (this._aiIcon = null)} />`
      : html`<ha-icon class=${cls} icon="mdi:creation"></ha-icon>`;
  }

  private async _askAi(): Promise<void> {
    if (!this.hass || !this._config) return;
    this._aiBusy = true;
    this._aiNote = undefined;
    try {
      const result = await this.hass.callWS<{ count: number; info: ScheduleInfo }>({
        type: "heating_schedule/suggestion/ask_ai",
        entity_id: this._config.entity,
      });
      this._info = result.info;
      if (!result.count) this._aiNote = this._t.ai_none;
      this._error = undefined;
    } catch (err: any) {
      this._error = err?.message ?? String(err);
    } finally {
      this._aiBusy = false;
    }
  }

  private _renderSuggestionMarkers(
    pts: Pt[],
    x: (m: number) => number,
    y: (t: number) => number,
    plotH: number,
  ) {
    const scale = this._scale;
    if (!scale) return nothing;
    const cy = (t: number) => y(clamp(t, scale.lo, scale.hi));
    const full = this._aiFull?.week[this._day];
    const proposed = full ? toPts(full) : undefined;
    const fullPath = proposed
      ?.map((p, i) => (i ? `H${x(p.m)}V${cy(p.t)}` : `M${x(p.m)},${cy(p.t)}`))
      .join("")
      .concat(`H${x(DAY_MIN)}`);
    const fullLine = fullPath ? svg`<path class="suggestion-full" d=${fullPath}></path>` : nothing;
    return [fullLine, ...this._suggestions.map((s, i) => {
      if (!s.days.includes(this._day)) return nothing;
      const marker = markerOf(s);
      const before = tempAt(pts, s.start);
      const top = Math.min(cy(s.temp), cy(before));
      return svg`<g class="suggestion">
        <rect class="suggestion-diff" x=${x(s.start)} y=${top}
          width=${Math.max(1, x(s.end) - x(s.start))} height=${Math.abs(cy(s.temp) - cy(before))}></rect>
        <line x1=${x(marker.m)} x2=${x(marker.m)} y1=${cy(marker.t) - 4} y2=${PAD.t + plotH}></line>
        <circle cx=${x(marker.m)} cy=${cy(marker.t) - 13} r="9"></circle>
        <text x=${x(marker.m)} y=${cy(marker.t) - 9} text-anchor="middle">${i + 1}</text>
      </g>`;
    })];
  }

  private _renderSuggestions() {
    const list = this._suggestions;
    const full = this._aiFull;
    const t = this._t;
    if (!list.length && !full) {
      return this._aiNote ? html`<div class="suggestions"><div class="muted">${this._aiNote}</div></div>` : nothing;
    }
    const temp = (value: number) => this._fmtTemp(value);
    const buttons = (id: string) => html`<span class="buttons">
      <button ?disabled=${!!this._suggestBusy} @click=${() => this._suggestion("dismiss", id)}>
        ${t.suggest_dismiss}
      </button>
      <button class="primary" ?disabled=${!!this._suggestBusy} @click=${() => this._suggestion("apply", id)}>
        ${t.suggest_apply}
      </button>
    </span>`;
    return html`<div class="suggestions">
      ${full
        ? html`<div class="suggestion-row">
            ${this._renderAiIcon()}
            <span class="text">${t.ai_full}</span>
            ${buttons(full.id)}
          </div>`
        : nothing}
      ${list.map(
        (s, i) => html`<div class="suggestion-row">
          <span class="num">${i + 1}</span>
          ${s.source === "ai" ? this._renderAiIcon("ai-icon small") : nothing}
          <span class="text">${describeSuggestion(s, this._info?.days, t, temp)}</span>
          ${buttons(s.id)}
        </div>`,
      )}
    </div>`;
  }

  private async _suggestion(action: "apply" | "dismiss", id: string): Promise<void> {
    if (!this.hass || !this._config) return;
    this._suggestBusy = id;
    try {
      const result = await this.hass.callWS<ScheduleInfo | null>({
        type: `heating_schedule/suggestion/${action}`,
        entity_id: this._config.entity,
        suggestion_id: id,
      });
      if (result) this._info = result;
      this._error = undefined;
    } catch (err: any) {
      this._error = err?.message ?? String(err);
    } finally {
      this._suggestBusy = undefined;
    }
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
        ${this._config?.settings && this._info?.ai_available
          ? html`<button
              class="ai"
              title=${this._t.ai_ask}
              aria-label=${this._t.ai_ask}
              ?disabled=${this._aiBusy}
              @click=${this._askAi}
            >
              ${this._renderAiIcon()} ${this._aiBusy ? this._t.ai_busy : nothing}
            </button>`
          : nothing}
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
    if (this._trackTouch(ev)) return;
    if (!this._draft) {
      if (ev.pointerType === "mouse" && ev.button === 0 && this._zoomed) {
        (ev.currentTarget as Element).setPointerCapture(ev.pointerId);
        this._pan = { pointerId: ev.pointerId, x0: ev.clientX, start: this._view[0] };
      }
      this._onHover(ev); // touch: a tap shows the values
      return;
    }
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

  private _onPointerLeave(ev: PointerEvent): void {
    window.clearTimeout(this._hoverTimer);
    if (ev.pointerType === "mouse") this._hover = undefined;
    else this._hoverTimer = window.setTimeout(() => (this._hover = undefined), 3000);
  }

  private _onHover(ev: PointerEvent): void {
    if (this._draft || !this._scale) return;
    window.clearTimeout(this._hoverTimer);
    const minute = Math.round(this._scale.minute(this._local(ev)[0]) / 5) * 5;
    const [v0, v1] = this._view;
    this._hover = minute < v0 || minute > v1 ? undefined : Math.min(minute, DAY_MIN - 1);
  }

  private _onPointerMove(ev: PointerEvent): void {
    if (this._touches.has(ev.pointerId)) this._touches.set(ev.pointerId, this._local(ev)[0]);
    if (this._pinch) {
      ev.preventDefault();
      this._onPinch();
      return;
    }
    const pan = this._pan;
    if (pan && ev.pointerId === pan.pointerId && this._scale) {
      const span = this._view[1] - this._view[0];
      this._setView(pan.start - ((ev.clientX - pan.x0) / this._scale.width) * span, span);
      this._hover = undefined;
      return;
    }
    if (!this._draft) {
      this._onHover(ev);
      return;
    }
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
    this._untrackTouch(ev);
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
    if (!this._draft) {
      this._resetZoom();
      return;
    }
    if (!this._scale) return;
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
      --hs-typical: color-mix(in srgb, var(--hs-presence) 45%, #000);
      --hs-heating: var(--state-climate-heat-color, #ff8100);
      --hs-suggest: var(--orange-color, #ff9800);
    }
    ha-card {
      padding: 16px;
      box-sizing: border-box;
    }
    ha-card.disabled {
      background: color-mix(
        in srgb,
        var(--ha-card-background, var(--card-background-color, #fff)) 86%,
        #000
      );
    }
    ha-card.disabled > :not(.header) {
      filter: grayscale(0.75) brightness(0.92);
      opacity: 0.7;
    }
    ha-card.disabled .name {
      opacity: 0.7;
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
    button.mode {
      display: inline-flex;
      padding: 4px;
      background: none;
      border-radius: 50%;
      --mdc-icon-size: 20px;
    }
    button.mode:hover:not(:disabled) {
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
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
      --mdc-icon-size: 20px;
      color: var(--disabled-text-color, var(--secondary-text-color));
    }
    .mode.heat {
      color: var(--hs-current);
    }
    .profile {
      shape-rendering: crispEdges;
    }
    .presence-strip {
      fill: var(--hs-presence);
    }
    .profile {
      fill: var(--hs-typical);
    }
    .swatch {
      display: inline-block;
      width: 12px;
      height: 10px;
      border-radius: 2px;
      background: var(--hs-presence);
    }
    .swatch.typical {
      background: var(--hs-typical);
    }
    .swatch.heating {
      background: var(--hs-heating);
      opacity: 0.35;
    }
    .swatch.band {
      background: var(--hs-schedule);
      opacity: 0.3;
    }
    .heating {
      fill: var(--hs-heating);
      fill-opacity: 0.16;
    }
    .suggestion line {
      stroke: var(--hs-suggest);
      stroke-width: 1.2;
      stroke-dasharray: 2 2;
    }
    .suggestion circle {
      fill: var(--hs-suggest);
    }
    .suggestion text {
      fill: #fff;
      font-size: 11px;
      font-weight: 700;
    }
    .suggestion-diff {
      fill: none;
      stroke: var(--hs-suggest);
      stroke-width: 1.2;
      stroke-dasharray: 3 2;
    }
    .suggestions {
      display: grid;
      gap: 6px;
      margin-top: 10px;
    }
    .suggestion-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      padding: 6px 8px;
      border-radius: 8px;
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.08));
      font-size: 0.9em;
    }
    .suggestion-row .num {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: var(--hs-suggest);
      color: #fff;
      font-size: 0.75em;
      font-weight: 700;
    }
    .suggestion-row .text {
      flex: 1 1 12em;
      min-width: 0;
    }
    .suggestion-full {
      fill: none;
      stroke: var(--hs-suggest);
      stroke-width: 2;
      stroke-dasharray: 5 3;
    }
    .ai-icon {
      width: 20px;
      height: 20px;
      --mdc-icon-size: 20px;
      flex: none;
    }
    .ai-icon.small {
      width: 16px;
      height: 16px;
      --mdc-icon-size: 16px;
    }
    button.ai {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .suggestion-row .buttons {
      display: flex;
      gap: 6px;
      margin-left: auto;
    }
    .crosshair line {
      stroke: var(--primary-text-color);
      stroke-opacity: 0.35;
      stroke-width: 1;
    }
    .crosshair .dot {
      stroke: var(--card-background-color, #fff);
      stroke-width: 1.5;
    }
    .crosshair .dot.schedule {
      fill: var(--hs-schedule);
    }
    .crosshair .dot.current {
      fill: var(--hs-current);
    }
    .crosshair .dot.target {
      fill: var(--hs-target);
    }
    .tooltip {
      position: absolute;
      top: 4px;
      pointer-events: none;
      min-width: 130px;
      padding: 6px 10px;
      border-radius: 8px;
      background: var(--card-background-color, #fff);
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
      font-size: 0.78em;
      line-height: 1.5;
      font-variant-numeric: tabular-nums;
      z-index: 1;
    }
    .tooltip div {
      display: flex;
      justify-content: space-between;
      gap: 12px;
    }
    .tooltip span:first-child {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--secondary-text-color);
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
      position: relative;
      width: 100%;
      min-height: 120px;
      user-select: none;
      -webkit-user-select: none;
    }
    .chart svg {
      display: block;
      overflow: visible;
    }
    .chart svg {
      touch-action: pan-y; /* a horizontal swipe moves the tooltip, a vertical one scrolls; pinch zooms */
    }
    .chart.zoomed:not(.editing) svg {
      cursor: grab;
    }
    .zoom-reset {
      position: absolute;
      top: 0;
      right: 4px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      padding: 0;
      border-radius: 50%;
      --mdc-icon-size: 18px;
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
    .band {
      fill: var(--hs-schedule);
      fill-opacity: 0.18;
      pointer-events: none;
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
      pointer-events: none;
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

if (!customElements.get("heating-schedule-card")) {
  customElements.define("heating-schedule-card", HeatingScheduleCard);
}

/** Dashboard card: today's chart of one thermostat with its legend, read-only. */
export class HeatingScheduleChartCard extends HeatingScheduleCard {
  static getConfigForm() {
    return {
      schema: [
        { name: "entity", required: true, selector: { entity: { domain: "climate" } } },
        { name: "name", selector: { text: {} } },
        {
          name: "height",
          selector: { number: { min: 120, max: 600, mode: "box", unit_of_measurement: "px" } },
        },
      ],
      // HA labels entity and name itself.
      computeLabel: (field: { name: string }) => (field.name === "height" ? "Height" : undefined),
    };
  }

  static getStubConfig(hass: Hass) {
    const entity = Object.keys(hass.states).find((id) => id.startsWith("climate.")) ?? "";
    return { entity };
  }

  setConfig(config: CardConfig): void {
    super.setConfig({ ...config, settings: false, readonly: true });
  }

  getCardSize(): number {
    return 4;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 4, rows: "auto" };
  }
}

declare global {
  interface Window {
    customCards?: { type: string; name: string; description: string; preview?: boolean }[];
  }
}

if (!customElements.get("heating-schedule-chart-card")) {
  customElements.define("heating-schedule-chart-card", HeatingScheduleChartCard);
}

window.customCards = window.customCards ?? [];
if (!window.customCards.some((card) => card.type === "heating-schedule-chart-card")) {
  window.customCards.push({
    type: "heating-schedule-chart-card",
    name: "Heating Schedule chart",
    description: "Today's heating schedule of a thermostat as a temperature chart (read-only).",
    preview: true,
  });
}
