# Sugestie harmonogramu: plan wdrożenia

Projekt: [specs/2026-10-13-schedule-suggestions-design.md](../specs/2026-10-13-schedule-suggestions-design.md)
(zaakceptowany 2026-10-13). Punkt startowy: 0.9.0.

Zasady pracy w każdym etapie:

- Logika jako czyste funkcje bez importów HA, z testami pytest pisanymi najpierw.
- Integracja HA testowana pytest-homeassistant-custom-component, frontend przez tsc i node:test.
- Przed tagiem trzeba przejść `ruff check`, `ruff format --check`, `npx tsc --noEmit`, `npm test`
  oraz mieć zielone CI na `main`.
- Każdy etap kończy się osobnym wydaniem: tag, HACS, restart HA (za zgodą użytkownika), sprawdzenie logów.
- Etap 1 wydajemy jak najszybciej, bo dane zbierają się tygodniami.

## Etap 1 (0.10.0): zbieranie danych, bez UI (wydane 2026-10-13)

Cel: od teraz liczyć czas nagrzewania i ręczne zmiany temperatury, tak jak dziś profil obecności.

Zrobione inaczej niż w pierwszej wersji planu: **ręczna zmiana to odchylenie zadanej od harmonogramu**,
a nie rozpoznawanie po kontekście wywołania. Z2M odsyła stan z własnym kontekstem, więc rozpoznawanie
po kontekście by nie działało. Odchylenie jest odporne na to i nie wymaga rejestru kontekstów.

1. **`stats.py`** (czyste funkcje bez importów, wzorem `profile.py`):
   - **`deviation_slots(samples, start, end, planned)`:** dla każdego kwadransu średnia ważona czasem
     różnica `zadana − planned(kwadrans)`, gdy termostat grzał. Kwadranse grzane krócej niż przez
     połowę czasu są pomijane.
   - **`ManualStats`:** dla każdego dnia tygodnia i kwadransu `avg` (średnie odchylenie), `share`
     (udział próbek z |odchyleniem| ≥ 0,25°) i `count`. Średnia krocząca z około 8 tygodni.
     `reset(day, slots)` czyści kwadranse po zmianie harmonogramu.
   - **`heatup_runs(samples)`:** epizody od podniesienia zadanej o ≥1° (pokój ≥1° poniżej) do
     `current ≥ zadana − 0,5`. Przerwane (zmiana zadanej, wyłączenie, ponad 6 h) są odrzucane.
     Nie wymaga `hvac_action`, więc działa też z localtuya.
   - **`HeatupStats`:** ostatnie 20 epizodów, mediana minut na stopień (od 3 epizodów).
2. **Zbieranie** w `controller.py`: `_async_history_tick` co godzinę (profil i statystyki), historia
   climate z atrybutami od `last_sample` minus 6 h. Odchylenia liczone **tylko przy włączonym
   harmonogramie**. Zapis w `.storage/heating_schedule.stats`, uzupełnienie wstecz do 14 dni.
   Zbieranie działa dla każdego termostatu.
3. **Zmiana harmonogramu** (`async_update` z `days`) czyści odchylenia kwadransów, w których zmieniła
   się planowana temperatura.
4. **`as_dict`:** dochodzi `stats` (`manual_weeks`, `heatup_runs`, `heatup_minutes_per_degree`).
5. **Testy:** `tests/test_stats.py` (czyste) i `tests/test_stats_recorder.py` (recorder).

## Etap 2 (0.11.0): analizator sugestii (backend) (wydane 2026-10-13)

Jak zbudowane: `suggest.py` (czyste funkcje). Każda sugestia to jedna operacja „ustaw [start, end) na
temp” dla kilku dni, a `expect` to temperatury wokół zmiany. Dzięki temu zastosowanie jednej sugestii nie
unieważnia innej w innej części dnia. Stan sugestii jest w `.storage/heating_schedule.stats` (pole
`suggestions`). Analiza sprawdzana jest w godzinnym cyklu, a wykonuje się raz na 7 dni i poza przerwą po
zmianie. Komendy websocket mają pole `suggestion_id`, bo `id` to numer komunikatu.

1. **`suggest.py`** (czyste funkcje). Wejście: harmonogram, profil (może go nie być), `ManualStats`,
   `HeatupStats`, granice termostatu (`min`/`max`/`step`), lista odrzuceń, teraz. Wyjście: uszeregowana
   lista `Suggestion` z polami:
   - `id`: stabilny hash rodzaju, dni, punktu i kierunku;
   - `kind`: `shift` / `temp` / `setback`;
   - `days`;
   - `description_key` z parametrami (tekst tłumaczy frontend);
   - `days_after`: harmonogram po zmianie;
   - `gain`;
   - `source`: `data` albo `ai`.

   Reguły:
   - **Przyjście i wyjście z profilu:** pierwszy kwadrans powyżej progu (np. 0,5) po co najmniej 1 h
     poniżej. Start grzania = przyjście − (opóźnienie + stopnie × min/°) z `HeatupStats`, a bez statystyk
     zostaje bieżąca godzina.
   - **`shift`:** punkt podnoszący temperaturę przesuwany na wyliczony start. Punkt obniżający przesuwany
     na typowe wyjście. Tylko gdy różnica wynosi ≥30 min.
   - **`setback`:** nowa obniżka w przedziale ≥3 h typowo pustym (prawdopodobieństwo < 0,1). Temperatura
     obniżki = najniższa temperatura z harmonogramu tego dnia. Obniżka kończy się o czas nagrzewania przed
     kolejnym przyjściem.
   - **`temp`:** przedział, w którym `ManualStats` pokazuje ręczne zmiany w ≥40% dni. Nowa temperatura =
     obecna + 75% średniej różnicy, zaokrąglona do kroku. Musi się różnić o ≥1° i ≥ krok.
   - **Grupowanie:** takie same `days_after` dla różnych dni łączymy w jedną sugestię (np. pn–pt).
   - **Odrzucenia:** pomijamy `id` odrzucone w ciągu 28 dni.
   - **Zysk:** zaoszczędzone godzinostopnie dla `shift`/`setback`, dla `temp` liczba ręcznych zmian.
     Sortowanie po zysku.
   - **Minimum danych:** sugestie z obecności wymagają `profile.weeks() ≥ 3`, sugestie `temp`
     ręcznych zmian z ≥3 różnych tygodni.
   - Testy dla każdej reguły z przykładami z projektu: biuro (obniżka 16:15 zamiast 17:30), syn (22,5°).
     Testy progów, grupowania, odrzuceń i braku danych.
2. **Stan sugestii** w `.storage/heating_schedule.stats` (albo osobnym pliku), dla każdego termostatu:
   kolejka, `last_analysis`, `quiet_until`, odrzucenia (`id` → data), propozycje AI.
3. **Cykl:**
   - Analiza raz w tygodniu, w stałej godzinie, np. pn 4:00, i tylko jeśli `now ≥ quiet_until`.
   - Po zapisie harmonogramu (save z UI albo zastosowanie sugestii) `quiet_until = now + 14 dni`.
   - Przy każdym `as_dict` każda pozycja z kolejki jest sprawdzana z aktualnym harmonogramem:
     jej punkt wyjściowy musi nadal istnieć. Pozycje, które już nie pasują, znikają.
   - Pokazujemy najwyżej 2 pozycje z danych i najwyżej 3 z AI.
4. **Websocket** (bez `require_admin`, decyzja użytkownika):
   - `heating_schedule/suggestion/apply` (`entity_id`, `id`): zapis `days_after`, potem `quiet_until`;
   - `heating_schedule/suggestion/dismiss` (`entity_id`, `id`).

   `as_dict` dostaje pole `suggestions`: lista widocznych pozycji z `id`, `kind`, `source`, `days`,
   `description_key` i parametrami oraz współrzędnymi znacznika (dzień, minuta, temperatura).
5. **Usługa** `heating_schedule.analyze` (opcjonalna, do debugowania): wymusza analizę z pominięciem rytmu.

## Etap 3 (0.12.0): UI sugestii (wariant B)

1. **Karta** (`heating-schedule-card.ts`), tylko gdy `settings: true` (karty w panelu):
   - znaczniki na wykresie: pomarańczowe kółko z numerem i przerywaną linią pionową, tylko dla wybranego
     dnia, jeśli sugestia go dotyczy;
   - lekki cień różnicy między obecnym a proponowanym harmonogramem dla wybranego dnia;
   - pod wykresem lista: numer, opis (i18n z `description_key` i parametrów), przyciski **Zastosuj**
     i **Odrzuć**; przy pozycjach od AI mała ikona AI;
   - w trybie edycji sugestii nie ma.
2. **i18n** pl/en: opisy dla `shift`, `temp`, `setback` i zakresów dni (pn–pt, weekend, pojedyncze dni).
3. **Strona testowa** `frontend/dev`: przykładowe sugestie w mocku (`?suggest`), zrzuty z
   `screenshot.mjs` na szerokości 720 i 400 px.
4. Testy node:test dla formatowania opisów i zakresów dni.

## Etap 4 (0.13.0): AI

1. **Wybór encji:** domyślna encja `ai_task` z ustawień HA (preferencje `ai_task`), w przeciwnym razie
   pierwsza dostępna. `as_dict` dostaje `ai_available: bool`.
2. **`ai.py`:**
   - budowanie zapytania do `ai_task.generate_data` z `structure` (lista zmian: dni, punkty `HH:MM`
     → temperatura) i instrukcją w języku HA;
   - kontekst: nazwa termostatu, obszaru i piętra, harmonogram, profil zagregowany do godzin, `ManualStats`
     w skrócie, `HeatupStats`, granice termostatu;
   - parsowanie i walidacja: poprawny harmonogram, granice, krok, progi 30 min/1°, odrzucenia;
     pozycje niepoprawne są pomijane, zostają najwyżej 3;
   - testy na zapisanych odpowiedziach: poprawne, śmieciowe, przekraczające granice.
3. **Websocket** `heating_schedule/suggestion/ask_ai` (`entity_id`): wywołanie, zapis propozycji
   z `source: ai`, odpowiedź. Gdy nie ma propozycji, zwraca pustą listę, a karta pokazuje „brak propozycji”.
   Pomija tygodniowy rytm i `quiet_until`.
4. **Nowy termostat:**
   - w okienku dodawania w panelu wybór „Pusty harmonogram” / „Z AI”; drugą opcję widać tylko przy
     `ai_available`;
   - `heating_schedule/add` dostaje `init: "empty" | "ai"`; przy `ai` po utworzeniu wpisu idzie zapytanie
     o cały harmonogram;
   - wynik to jedna pozycja `kind: full` (bez progów i limitów, tylko walidacja harmonogramu),
     do zatwierdzenia na karcie;
   - do tego czasu harmonogram jest pusty.
5. **Ikona:** ikona marki `ai_task` pobierana jak we frontendzie HA (brands URL). Przed implementacją
   trzeba sprawdzić we frontendzie HA 2026.x, jak budowany jest adres i token. Zapasowo `mdi:creation`.
   Kliknięcie z animacją ładowania, błędy pokazywane w karcie.
6. Test integracyjny z zamockowaną usługą `ai_task.generate_data`.

## Dokumentacja i porządki (w każdym etapie)

- Aktualizacja README: encje, websocket, panel.
- Notatka w homelab `uslugi/home-assistant.md` (commit po zgodzie użytkownika).
- Po etapie 3 zadanie w Vikunji (projekt Home Assistant): „sprawdzić pierwsze sugestie po ~3 tygodniach”,
  z terminem.

## Ryzyka

- **Mało danych przed sezonem:** harmonogramy są wyłączone, więc etapy 2–3 mogą długo nic nie pokazywać.
  Testy i mock muszą to pokrywać, a etap 1 trzeba wydać szybko.
- **Termostaty localtuya (łazienki):** brak `hvac_action` oznacza brak statystyk nagrzewania. Wtedy
  zostaje bieżąca godzina startu, bez przesuwania.
- **Odchylenia tylko przy włączonym harmonogramie:** dopóki harmonogramy są wyłączone, nie zbierają się
  dane o ręcznych zmianach. Czas nagrzewania zbiera się zawsze.
