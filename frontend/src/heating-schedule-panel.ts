import { LitElement, css, html, nothing, type PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";

import type { Hass, ScheduleInfo, Vacation } from "./heating-schedule-card";
import { strings, type Strings } from "./i18n";
import { formatLeft, toLocalInput } from "./model";

interface Entry {
  entry_id: string;
  title: string;
  climate_entity: string;
}

interface Group {
  key: string;
  name?: string;
  entries: Entry[];
}

type Card = HTMLElement & { hass?: Hass; setConfig(config: Record<string, unknown>): void };

type Dialog =
  | { kind: "settings"; info: ScheduleInfo; data: Record<string, unknown> }
  | { kind: "add"; data: Record<string, unknown> };

const PRESENCE_DOMAINS = ["binary_sensor", "person", "device_tracker", "input_boolean", "switch", "light"];
const BAND_MAX = 10;

/** A sensitivity field: a number, or null when cleared (then read from the thermostat). */
function bandValue(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/**
 * ``ha-form`` and its selectors are lazy-loaded by the HA frontend. Opening a
 * card editor pulls them in; the entities card editor is a cheap way to do it.
 */
async function loadHaForm(): Promise<void> {
  if (customElements.get("ha-form")) return;
  try {
    const helpers = await (window as any).loadCardHelpers?.();
    const card = await helpers?.createCardElement({ type: "entities", entities: [] });
    await card?.constructor?.getConfigElement?.();
  } catch {
    // fall through: whenDefined below still resolves if HA loads it later
  }
  await Promise.race([
    customElements.whenDefined("ha-form"),
    new Promise((resolve) => setTimeout(resolve, 3000)),
  ]);
}

/** Sidebar panel: every thermostat's schedule card, plus their settings. */
export class HeatingSchedulePanel extends LitElement {
  @property({ attribute: false }) hass?: Hass;
  @property({ type: Boolean }) narrow = false;

  @state() private _entries?: Entry[];
  @state() private _error?: string;
  @state() private _dialog?: Dialog;
  @state() private _dialogError?: string;
  @state() private _busy = false;
  @state() private _vacation?: Vacation;
  @state() private _vacationError?: string;
  private _unsubVacation?: Promise<() => Promise<void>>;

  private _cards = new Map<string, Card>();
  private _loading = false;

  private get _t(): Strings {
    return strings(this.hass?.locale?.language ?? this.hass?.language);
  }

  private get _admin(): boolean {
    return this.hass?.user?.is_admin !== false;
  }

  connectedCallback(): void {
    super.connectedCallback();
    // Entries may have been added or removed while the panel was hidden.
    if (this._entries) this._load();
    this.addEventListener("heating-schedule-settings", this._onSettings);
    this._subscribeVacation();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener("heating-schedule-settings", this._onSettings);
    this._unsubVacation?.then((unsub) => unsub()).catch(() => undefined);
    this._unsubVacation = undefined;
  }

  protected willUpdate(changed: PropertyValues): void {
    if (changed.has("hass") && this.hass && !this._entries) this._load();
    if (changed.has("hass")) this._subscribeVacation();
  }

  private _subscribeVacation(): void {
    if (!this.hass || !this.isConnected || this._unsubVacation) return;
    const unsub = this.hass.connection.subscribeMessage<Vacation>(
      (vacation) => (this._vacation = vacation),
      { type: "heating_schedule/vacation/subscribe" },
    );
    this._unsubVacation = unsub;
    unsub.catch(() => {
      if (this._unsubVacation === unsub) this._unsubVacation = undefined;
    });
  }

  private async _setVacation(data: Record<string, unknown>): Promise<void> {
    if (!this.hass) return;
    this._vacationError = undefined;
    try {
      this._vacation = await this.hass.callWS<Vacation>({ type: "heating_schedule/vacation/set", ...data });
    } catch (err: any) {
      this._vacationError = err?.message ?? String(err);
    }
  }

  private _stepVacation(delta: number): void {
    const temp = (this._vacation?.temp ?? 18) + delta;
    if (temp >= 5 && temp <= 30) this._setVacation({ temp });
  }

  private _renderVacation() {
    const v = this._vacation;
    if (!v) return nothing;
    const t = this._t;
    const lang = this.hass?.locale?.language ?? this.hass?.language ?? "en";
    const temp = `${v.temp.toLocaleString(lang, { maximumFractionDigits: 1 })}°`;
    const until = v.until ? new Date(v.until) : undefined;
    const left = until
      ? formatLeft((until.getTime() - Date.now()) / 60000, t.vacation_day, t.vacation_days)
      : undefined;
    // Short, as on the day tabs: "Nd 8.11, 14:00".
    const untilText = until
      ? `${t.days[(until.getDay() + 6) % 7]} ${until.getDate()}.${until.getMonth() + 1}, ${toLocalInput(until).slice(11)}`
      : t.vacation_until_unset;
    return html`<section class="vacation ${v.active ? "on" : ""}">
      <div class="vacation-head">
        <ha-icon icon="mdi:bag-suitcase"></ha-icon>
        <h2>${t.vacation_title}</h2>
        <label class="vacation-switch">
          <span>${t.vacation_on}</span>
          <ha-switch
            .checked=${v.active}
            @change=${(ev: Event) => this._setVacation({ active: (ev.target as HTMLInputElement).checked })}
          ></ha-switch>
        </label>
      </div>
      <div class="vacation-fields">
        <div class="vacation-field">
          <span class="label">${t.vacation_temp}</span>
          <div class="stepper">
            <button aria-label=${t.vacation_lower} @click=${() => this._stepVacation(-0.5)}>−</button>
            <span class="value">${temp}</span>
            <button aria-label=${t.vacation_higher} @click=${() => this._stepVacation(0.5)}>+</button>
          </div>
        </div>
        <div class="vacation-field">
          <label class="label" for="vacation-until">${t.vacation_until}</label>
          <div class="until">
            <span class="until-text ${until ? "" : "unset"}">${untilText}</span>
            <!-- The native picker, invisible over the text: a tap opens it. -->
            <input
              id="vacation-until"
              type="datetime-local"
              .value=${until ? toLocalInput(until) : ""}
              @change=${(ev: Event) => {
                const value = (ev.target as HTMLInputElement).value;
                this._setVacation({ until: value ? new Date(value).toISOString() : null });
              }}
            />
            ${until
              ? html`<button
                  class="clear"
                  title=${t.vacation_until_clear}
                  aria-label=${t.vacation_until_clear}
                  @click=${() => this._setVacation({ until: null })}
                >
                  <ha-icon icon="mdi:close"></ha-icon>
                </button>`
              : nothing}
          </div>
        </div>
      </div>
      <p class="help">
        ${v.active
          ? html`${t.vacation_active.replace("{temp}", temp)}
            ${left ? t.vacation_left.replace("{left}", left) : t.vacation_until_none}`
          : t.vacation_hint}
      </p>
      ${this._vacationError ? html`<div class="error">${this._vacationError}</div>` : nothing}
    </section>`;
  }

  protected updated(): void {
    for (const card of this._cards.values()) card.hass = this.hass;
  }

  private async _load(): Promise<void> {
    if (!this.hass || this._loading) return;
    this._loading = true;
    try {
      const entries = await this.hass.callWS<Entry[]>({ type: "heating_schedule/list" });
      this._entries = entries.sort((a, b) => a.title.localeCompare(b.title));
      const present = new Set(entries.map((e) => e.climate_entity));
      for (const entity of [...this._cards.keys()]) {
        if (!present.has(entity)) this._cards.delete(entity);
      }
      this._error = undefined;
    } catch (err: any) {
      this._error = err?.message ?? String(err);
    } finally {
      this._loading = false;
    }
  }

  /** Entries grouped by the floor of the thermostat's area (entity area, else device area). */
  private _groups(entries: Entry[]): Group[] {
    const hass = this.hass;
    const areaOf = (entry: Entry) => {
      const ent = hass?.entities?.[entry.climate_entity];
      const areaId = ent?.area_id ?? (ent?.device_id ? hass?.devices?.[ent.device_id]?.area_id : undefined);
      return areaId ? hass?.areas?.[areaId] : undefined;
    };
    const groups = new Map<string, Group & { level: number; sort: Map<Entry, string> }>();
    for (const entry of entries) {
      const area = areaOf(entry);
      const floor = area?.floor_id ? hass?.floors?.[area.floor_id] : undefined;
      const key = floor?.floor_id ?? "";
      let group = groups.get(key);
      if (!group) {
        group = {
          key,
          name: floor?.name,
          entries: [],
          level: floor ? (floor.level ?? 0) : Number.POSITIVE_INFINITY,
          sort: new Map(),
        };
        groups.set(key, group);
      }
      group.entries.push(entry);
      group.sort.set(entry, area?.name ?? "");
    }
    const list = [...groups.values()].sort(
      (a, b) => a.level - b.level || (a.name ?? "").localeCompare(b.name ?? ""),
    );
    // by room (rooms without an area last), then by title
    const byRoom = (sort: Map<Entry, string>) => (a: Entry, b: Entry) => {
      const ra = sort.get(a)!;
      const rb = sort.get(b)!;
      return Number(!ra) - Number(!rb) || ra.localeCompare(rb) || a.title.localeCompare(b.title);
    };
    for (const g of list) g.entries.sort(byRoom(g.sort));
    return list;
  }

  private _renderCards(entries: Entry[]) {
    const groups = this._groups(entries);
    if (groups.length === 1 && !groups[0].name) {
      return html`<div class="cards">${entries.map((entry) => this._card(entry))}</div>`;
    }
    return groups.map(
      (g) => html`<section>
        <h2 class="floor">${g.name ?? this._t.panel_no_floor}</h2>
        <div class="cards">${g.entries.map((entry) => this._card(entry))}</div>
      </section>`,
    );
  }

  private _card(entry: Entry): Card {
    let card = this._cards.get(entry.climate_entity);
    if (!card) {
      card = document.createElement("heating-schedule-card") as Card;
      this._cards.set(entry.climate_entity, card);
    }
    card.setConfig(this._cardConfig(entry.climate_entity));
    card.hass = this.hass;
    return card;
  }

  private _cardConfig(entity: string) {
    return { type: "custom:heating-schedule-card", entity, settings: true };
  }

  // -- dialogs ----------------------------------------------------------------

  private _onSettings = async (ev: Event) => {
    const info = (ev as CustomEvent<{ info: ScheduleInfo }>).detail.info;
    await loadHaForm();
    this._dialogError = undefined;
    this._dialog = {
      kind: "settings",
      info,
      data: {
        title: info.title,
        presence_entities: info.presence.entities,
        band_below: info.band?.below ?? undefined,
        band_above: info.band?.above ?? undefined,
      },
    };
  };

  private async _openAdd(): Promise<void> {
    await loadHaForm();
    this._dialogError = undefined;
    this._dialog = { kind: "add", data: { init: "empty" } };
  }

  private _close(): void {
    if (!this._busy) this._dialog = undefined;
  }

  /** Any AI Task entity (the backend picks the preferred one). */
  private get _aiAvailable(): boolean {
    return Object.keys(this.hass?.states ?? {}).some((id) => id.startsWith("ai_task."));
  }

  private _schema(dialog: Dialog) {
    if (dialog.kind === "add") {
      const t = this._t;
      return [
        {
          name: "entity",
          required: true,
          selector: {
            entity: {
              filter: [{ domain: "climate" }],
              exclude_entities: (this._entries ?? []).map((e) => e.climate_entity),
            },
          },
        },
        ...(this._aiAvailable
          ? [
              {
                name: "init",
                selector: {
                  select: {
                    mode: "list",
                    options: [
                      { value: "empty", label: t.init_empty },
                      { value: "ai", label: t.init_ai },
                    ],
                  },
                },
              },
            ]
          : []),
      ];
    }
    return [
      { name: "title", required: true, selector: { text: {} } },
      {
        name: "presence_entities",
        selector: { entity: { multiple: true, filter: [{ domain: PRESENCE_DOMAINS }] } },
      },
      ...["band_below", "band_above"].map((name) => ({
        name,
        selector: {
          number: { min: 0, max: BAND_MAX, step: 0.1, mode: "box", unit_of_measurement: "°" },
        },
      })),
    ];
  }

  private _label = (field: { name: string }) =>
    (this._t as Record<string, unknown>)[`field_${field.name}`] as string ?? field.name;

  private _helper = (field: { name: string }) =>
    field.name.startsWith("band_") ? this._t.band_help : undefined;

  private async _run(action: () => Promise<unknown>): Promise<void> {
    this._busy = true;
    this._dialogError = undefined;
    try {
      await action();
      this._busy = false;
      this._dialog = undefined;
      await this._load();
    } catch (err: any) {
      this._busy = false;
      this._dialogError = err?.message ?? String(err);
    }
  }

  private _submit(): void {
    const dialog = this._dialog;
    if (!dialog || !this.hass) return;
    const hass = this.hass;
    if (dialog.kind === "add") {
      const entity = dialog.data.entity as string | undefined;
      if (!entity) return;
      const init = this._aiAvailable && dialog.data.init === "ai" ? "ai" : "empty";
      this._run(() => hass.callWS({ type: "heating_schedule/add", entity_id: entity, init }));
      return;
    }
    const data = dialog.data;
    const title = String(data.title ?? "").trim();
    if (!title) return;
    this._run(() =>
      hass.callWS({
        type: "heating_schedule/configure",
        entity_id: dialog.info.climate_entity,
        title,
        presence_entities: (data.presence_entities as string[] | undefined) ?? [],
        band_below: bandValue(data.band_below),
        band_above: bandValue(data.band_above),
      }),
    );
  }

  private _removeSchedule(): void {
    const dialog = this._dialog;
    if (dialog?.kind !== "settings" || !this.hass) return;
    const hass = this.hass;
    if (!confirm(this._t.remove_confirm.replace("{name}", dialog.info.title))) return;
    this._run(() =>
      hass.callWS({ type: "heating_schedule/remove", entity_id: dialog.info.climate_entity }),
    );
  }

  // -- render -----------------------------------------------------------------

  protected render() {
    const t = this._t;
    const entries = this._entries;
    return html`
      <div class="toolbar">
        <ha-menu-button .hass=${this.hass} .narrow=${this.narrow}></ha-menu-button>
        <div class="title">${t.panel_title}</div>
        ${this._admin
          ? html`<button class="tool" title=${t.panel_add} aria-label=${t.panel_add} @click=${this._openAdd}>
              <ha-icon icon="mdi:plus"></ha-icon>
            </button>`
          : nothing}
      </div>
      <div class="content">
        ${this._error ? html`<div class="error">${this._error}</div>` : nothing}
        ${entries && !entries.length ? html`<p class="empty">${t.panel_empty}</p>` : nothing}
        ${entries?.length ? this._renderVacation() : nothing}
        ${this._renderCards(entries ?? [])}
      </div>
      ${this._renderDialog()}
    `;
  }

  private _renderDialog() {
    const dialog = this._dialog;
    if (!dialog) return nothing;
    const t = this._t;
    const title = dialog.kind === "add" ? t.panel_add : dialog.info.title;
    return html`
      <div class="backdrop" @click=${this._close}></div>
      <div
        class="dialog"
        role="dialog"
        aria-modal="true"
        aria-label=${title}
        @keydown=${(ev: KeyboardEvent) => ev.key === "Escape" && this._close()}
      >
        <h2>${title}</h2>
        ${dialog.kind === "settings" ? this._renderClimate(dialog.info.climate_entity) : nothing}
        ${dialog.kind === "settings" ? html`<p class="help">${t.presence_help}</p>` : nothing}
        <ha-form
          .hass=${this.hass}
          .data=${dialog.data}
          .schema=${this._schema(dialog)}
          .computeLabel=${this._label}
          .computeHelper=${this._helper}
          .disabled=${this._busy}
          @value-changed=${(ev: CustomEvent) => {
            this._dialog = { ...dialog, data: ev.detail.value } as Dialog;
          }}
        ></ha-form>
        ${this._dialogError ? html`<div class="error">${this._dialogError}</div>` : nothing}
        <div class="buttons">
          ${dialog.kind === "settings"
            ? html`<button class="danger" .disabled=${this._busy} @click=${this._removeSchedule}>
                ${t.remove_schedule}
              </button>`
            : nothing}
          <span class="spacer"></span>
          <button .disabled=${this._busy} @click=${this._close}>${t.cancel}</button>
          <button class="primary" .disabled=${this._busy} @click=${this._submit}>
            ${dialog.kind === "add" ? t.add_apply : t.save}
          </button>
        </div>
      </div>
    `;
  }

  /** Read-only: which thermostat this schedule drives. */
  private _renderClimate(entity: string) {
    const name = this.hass?.states[entity]?.attributes.friendly_name;
    return html`<div class="climate">
      <span class="label">${this._t.field_entity}</span>
      <span>${name ? html`${name} <code>${entity}</code>` : html`<code>${entity}</code>`}</span>
    </div>`;
  }

  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
      background: var(--primary-background-color);
      color: var(--primary-text-color);
    }
    .toolbar {
      display: flex;
      align-items: center;
      gap: 4px;
      height: var(--header-height, 56px);
      padding: 0 12px;
      box-sizing: border-box;
      background: var(--app-header-background-color, var(--primary-color));
      color: var(--app-header-text-color, #fff);
      border-bottom: var(--app-header-border-bottom, none);
      font-size: 20px;
    }
    .title {
      flex: 1;
      margin-left: 12px;
    }
    button {
      font: inherit;
      font-size: 0.9em;
      color: var(--primary-text-color);
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
      border: 1px solid transparent;
      border-radius: 8px;
      padding: 8px 14px;
      cursor: pointer;
    }
    button:disabled {
      opacity: 0.45;
      cursor: default;
    }
    button.primary {
      background: var(--primary-color, #03a9f4);
      color: var(--text-primary-color, #fff);
    }
    button.danger {
      background: none;
      color: var(--error-color, #db4437);
      border-color: var(--error-color, #db4437);
    }
    button.tool {
      display: inline-flex;
      padding: 12px;
      background: none;
      color: inherit;
      font-size: inherit;
    }
    .content {
      padding: 16px;
      max-width: 1600px;
      margin: 0 auto;
      box-sizing: border-box;
    }
    .vacation {
      max-width: 560px;
      margin: 0 0 16px;
      padding: 16px;
      border-radius: var(--ha-card-border-radius, 12px);
      background: var(--card-background-color, #fff);
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
      box-sizing: border-box;
    }
    .vacation.on {
      border-color: var(--primary-color, #03a9f4);
    }
    .vacation-head {
      display: flex;
      align-items: center;
      gap: 10px;
      color: var(--primary-text-color);
    }
    .vacation-head ha-icon {
      color: var(--primary-color, #03a9f4);
    }
    .vacation-head h2 {
      flex: 1;
      margin: 0;
      font-size: 1.15em;
    }
    .vacation-switch {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--secondary-text-color);
      font-size: 0.9em;
    }
    .vacation-fields {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
      margin: 14px 0 10px;
    }
    .vacation-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 10px 12px;
      border-radius: 10px;
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
      min-width: 0;
    }
    .vacation-field .label {
      font-size: 0.8em;
      color: var(--secondary-text-color);
    }
    .stepper {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .stepper button {
      flex-shrink: 0;
      width: 36px;
      height: 36px;
      padding: 0;
      border-radius: 50%;
      font-size: 1.2em;
    }
    .stepper .value {
      font-size: 1.4em;
    }
    .until {
      position: relative;
      display: flex;
      align-items: center;
      gap: 4px;
      min-height: 36px;
    }
    .until-text {
      flex: 1;
      min-width: 0;
      font-size: 1.05em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .until-text.unset {
      color: var(--secondary-text-color);
    }
    .until input {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      cursor: pointer;
      color-scheme: light dark;
    }
    button.clear {
      position: relative;
      z-index: 1;
      display: inline-flex;
      padding: 6px;
      background: none;
      --mdc-icon-size: 18px;
    }
    .vacation .help {
      margin: 0;
    }
    .floor {
      margin: 8px 4px 12px;
      font-size: 1.3em;
      font-weight: 400;
      color: var(--primary-text-color);
    }
    section + section .floor {
      margin-top: 24px;
    }
    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 560px), 1fr));
      gap: 16px;
      align-items: start;
    }
    .empty,
    .help {
      color: var(--secondary-text-color);
    }
    .help {
      font-size: 0.9em;
      margin: 0 0 12px;
    }
    .error {
      color: var(--error-color, #db4437);
      margin: 8px 0;
    }
    .backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.45);
      z-index: 10;
    }
    .dialog {
      position: fixed;
      z-index: 11;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: min(520px, calc(100vw - 32px));
      max-height: calc(100vh - 32px);
      overflow: auto;
      box-sizing: border-box;
      padding: 20px 24px;
      border-radius: var(--ha-card-border-radius, 12px);
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
    }
    .climate {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 4px 8px;
      margin: 0 0 12px;
      padding: 8px 12px;
      border-radius: 8px;
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
    }
    .climate .label {
      color: var(--secondary-text-color);
      font-size: 0.9em;
    }
    code {
      font-size: 0.85em;
      color: var(--secondary-text-color);
    }
    h2 {
      margin: 0 0 8px;
      font-size: 1.3em;
      font-weight: 500;
    }
    .buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 16px;
    }
    .spacer {
      flex: 1;
    }
    @media (max-width: 600px) {
      .content {
        padding: 8px;
      }
      .cards {
        gap: 8px;
      }
    }
  `;
}

// Guarded: a stale and a new copy of the bundle may both load after an update.
if (!customElements.get("heating-schedule-panel")) {
  customElements.define("heating-schedule-panel", HeatingSchedulePanel);
}

declare global {
  interface HTMLElementTagNameMap {
    "heating-schedule-panel": HeatingSchedulePanel;
  }
}
