import { LitElement, css, html, nothing, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import type { Hass, ScheduleInfo } from "./heating-schedule-card";
import { strings, type Strings } from "./i18n";

interface Entry {
  entry_id: string;
  title: string;
  climate_entity: string;
}

type Card = HTMLElement & { hass?: Hass; setConfig(config: Record<string, unknown>): void };

type Dialog =
  | { kind: "settings"; info: ScheduleInfo; data: Record<string, unknown> }
  | { kind: "add"; data: Record<string, unknown> };

const SMOOTH_KEY = "heating-schedule.smooth";

function loadSmooth(): boolean {
  try {
    return localStorage.getItem(SMOOTH_KEY) === "1";
  } catch {
    return false;
  }
}

const PRESENCE_DOMAINS = ["binary_sensor", "person", "device_tracker", "input_boolean", "switch", "light"];

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
@customElement("heating-schedule-panel")
export class HeatingSchedulePanel extends LitElement {
  @property({ attribute: false }) hass?: Hass;
  @property({ type: Boolean }) narrow = false;

  @state() private _entries?: Entry[];
  @state() private _error?: string;
  @state() private _dialog?: Dialog;
  @state() private _dialogError?: string;
  @state() private _busy = false;
  /** Per browser: smooth temperature curve on all cards. */
  @state() private _smooth = loadSmooth();

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
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener("heating-schedule-settings", this._onSettings);
  }

  protected willUpdate(changed: PropertyValues): void {
    if (changed.has("hass") && this.hass && !this._entries) this._load();
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
    return { type: "custom:heating-schedule-card", entity, settings: true, smooth: this._smooth };
  }

  private _toggleSmooth(): void {
    this._smooth = !this._smooth;
    try {
      localStorage.setItem(SMOOTH_KEY, this._smooth ? "1" : "0");
    } catch {
      // private mode: keep it for this visit only
    }
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
        empty_setback: info.presence.setback,
        empty_delay: info.presence.delay,
      },
    };
  };

  private async _openAdd(): Promise<void> {
    await loadHaForm();
    this._dialogError = undefined;
    this._dialog = { kind: "add", data: {} };
  }

  private _close(): void {
    if (!this._busy) this._dialog = undefined;
  }

  private _schema(dialog: Dialog) {
    if (dialog.kind === "add") {
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
      ];
    }
    return [
      { name: "title", required: true, selector: { text: {} } },
      {
        name: "presence_entities",
        selector: { entity: { multiple: true, filter: [{ domain: PRESENCE_DOMAINS }] } },
      },
      {
        name: "empty_setback",
        selector: {
          number: { min: 0, max: 10, step: 0.5, mode: "box", unit_of_measurement: "°C" },
        },
      },
      {
        name: "empty_delay",
        selector: {
          number: { min: 1, max: 480, step: 1, mode: "box", unit_of_measurement: "min" },
        },
      },
    ];
  }

  private _label = (field: { name: string }) =>
    (this._t as Record<string, unknown>)[`field_${field.name}`] as string ?? field.name;

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
      this._run(() => hass.callWS({ type: "heating_schedule/add", entity_id: entity }));
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
        empty_setback: Number(data.empty_setback ?? 0),
        empty_delay: Number(data.empty_delay ?? 30),
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
        <button
          class="tool ${this._smooth ? "on" : ""}"
          title=${t.smooth}
          aria-label=${t.smooth}
          aria-pressed=${this._smooth ? "true" : "false"}
          @click=${this._toggleSmooth}
        >
          <ha-icon icon=${this._smooth ? "mdi:chart-bell-curve-cumulative" : "mdi:chart-line-stacked"}></ha-icon>
        </button>
        ${this._admin
          ? html`<button class="tool" title=${t.panel_add} aria-label=${t.panel_add} @click=${this._openAdd}>
              <ha-icon icon="mdi:plus"></ha-icon>
            </button>`
          : nothing}
      </div>
      <div class="content">
        ${this._error ? html`<div class="error">${this._error}</div>` : nothing}
        ${entries && !entries.length ? html`<p class="empty">${t.panel_empty}</p>` : nothing}
        <div class="cards">${(entries ?? []).map((entry) => this._card(entry))}</div>
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
    button.tool:not(.on) {
      opacity: 0.6;
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

declare global {
  interface HTMLElementTagNameMap {
    "heating-schedule-panel": HeatingSchedulePanel;
  }
}
