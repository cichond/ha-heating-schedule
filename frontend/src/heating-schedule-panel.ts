import { LitElement, css, html, nothing, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import type { Hass } from "./heating-schedule-card";
import { strings, type Strings } from "./i18n";

interface Entry {
  entry_id: string;
  title: string;
  climate_entity: string;
}

type Card = HTMLElement & { hass?: Hass; setConfig(config: Record<string, unknown>): void };

/** Sidebar panel: the schedule card of every configured thermostat. */
@customElement("heating-schedule-panel")
export class HeatingSchedulePanel extends LitElement {
  @property({ attribute: false }) hass?: Hass;
  @property({ type: Boolean }) narrow = false;

  @state() private _entries?: Entry[];
  @state() private _error?: string;

  private _cards = new Map<string, Card>();
  private _loading = false;

  private get _t(): Strings {
    return strings(this.hass?.locale?.language ?? this.hass?.language);
  }

  connectedCallback(): void {
    super.connectedCallback();
    // Entries may have been added or removed while the panel was hidden.
    if (this._entries) this._load();
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
      this._entries = entries.sort((a, b) => this._name(a).localeCompare(this._name(b)));
      this._error = undefined;
    } catch (err: any) {
      this._error = err?.message ?? String(err);
    } finally {
      this._loading = false;
    }
  }

  private _name(entry: Entry): string {
    return this.hass?.states[entry.climate_entity]?.attributes.friendly_name ?? entry.title;
  }

  private _card(entry: Entry): Card {
    let card = this._cards.get(entry.climate_entity);
    if (!card) {
      card = document.createElement("heating-schedule-card") as Card;
      card.setConfig({ type: "custom:heating-schedule-card", entity: entry.climate_entity });
      this._cards.set(entry.climate_entity, card);
    }
    card.hass = this.hass;
    return card;
  }

  protected render() {
    const t = this._t;
    const entries = this._entries;
    return html`
      <div class="toolbar">
        <ha-menu-button .hass=${this.hass} .narrow=${this.narrow}></ha-menu-button>
        <div class="title">${t.panel_title}</div>
        <a
          class="settings"
          href="/config/integrations/integration/heating_schedule"
          title=${t.panel_settings}
          aria-label=${t.panel_settings}
        >
          <ha-icon icon="mdi:cog"></ha-icon>
        </a>
      </div>
      <div class="content">
        ${this._error ? html`<ha-alert alert-type="error">${this._error}</ha-alert>` : nothing}
        ${entries && !entries.length ? html`<p class="empty">${t.panel_empty}</p>` : nothing}
        <div class="cards">${(entries ?? []).map((entry) => this._card(entry))}</div>
      </div>
    `;
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
    .settings {
      display: inline-flex;
      padding: 12px;
      color: inherit;
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
    .empty {
      color: var(--secondary-text-color);
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
