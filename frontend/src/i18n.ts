const STRINGS = {
  en: {
    days: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
    schedule: "Schedule",
    now: "Now",
    target: "target",
    next: "next",
    at: "at",
    mode_off: "off",
    mode_heat: "heating",
    off_hint: "The thermostat is off. The schedule only sets the target temperature.",
    legend_schedule: "schedule",
    legend_current: "temperature",
    legend_target: "actual target",
    history_from: "history from",
    edit: "Edit",
    save: "Save",
    cancel: "Cancel",
    split: "Split",
    remove: "Remove",
    copy: "Copy day to…",
    copy_apply: "Copy",
    workdays: "Mon–Fri",
    weekend: "Weekend",
    all: "All",
    edit_hint:
      "Drag a level up or down, drag a boundary sideways. Double-click a level to split it. Tap a level for more options.",
    not_found:
      "This thermostat has no schedule. Add it under Settings → Devices & services → Heating Schedule.",
  },
  pl: {
    days: ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"],
    schedule: "Harmonogram",
    now: "Teraz",
    target: "zadana",
    next: "następnie",
    at: "o",
    mode_off: "wyłączony",
    mode_heat: "grzanie",
    off_hint: "Termostat jest wyłączony. Harmonogram ustawia tylko temperaturę zadaną.",
    legend_schedule: "harmonogram",
    legend_current: "temperatura",
    legend_target: "zadana (faktyczna)",
    history_from: "historia z",
    edit: "Edytuj",
    save: "Zapisz",
    cancel: "Anuluj",
    split: "Podziel",
    remove: "Usuń",
    copy: "Kopiuj dzień na…",
    copy_apply: "Kopiuj",
    workdays: "Pn–Pt",
    weekend: "Weekend",
    all: "Wszystkie",
    edit_hint:
      "Przeciągnij poziom w górę lub w dół, a granicę w bok. Dwuklik na poziomie dzieli go na dwa. Dotknij poziomu, żeby zobaczyć więcej opcji.",
    not_found:
      "Ten termostat nie ma harmonogramu. Dodaj go w Ustawienia → Urządzenia i usługi → Harmonogram ogrzewania.",
  },
};

export type Strings = (typeof STRINGS)["en"];

export function strings(language: string | undefined): Strings {
  return language?.startsWith("pl") ? STRINGS.pl : STRINGS.en;
}
