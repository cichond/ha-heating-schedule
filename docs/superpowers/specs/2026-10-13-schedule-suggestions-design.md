# Sugestie zmian harmonogramu: projekt

Stan na 2026-10-13, integracja `heating_schedule` 0.9.0. Projekt powstał z rozmowy z użytkownikiem.
„(decyzja)” oznacza ustalenie użytkownika. „(moja decyzja)” oznacza wybór autora projektu, który
użytkownik może jeszcze zmienić. Wszystko inne zostaje dla wykonawcy.

## Po co

Użytkownik chce, żeby w pokoju było ciepło, **zanim** ktoś przyjdzie, i żeby nie grzać pustych pokoi.
Głównym motywem jest **ekonomia** (decyzja). Integracja zbiera już dane, z których da się wyczytać lepszy
harmonogram: typową obecność, historię grzania i ręczne zmiany temperatury. Teraz ma je wykorzystać
i **proponować** zmiany, które użytkownik zatwierdza jednym kliknięciem.

Przykład użytkownika: syn kilka razy dziennie podkręca temperaturę, bo jest mu zimno. Analizator ma to
zauważyć i zaproponować harmonogram bliższy temu, co faktycznie się ustawia.

## Cele

1. **Sugestie z danych (bez AI)**, liczone lokalnie i deterministycznie. Biorą pod uwagę:
   - **typową obecność:** istniejący profil, 96 kwadransów × 7 dni, średnia z około 8 tygodni;
   - **ręczne zmiany temperatury zadanej:** zmiany, których nie zrobiła integracja;
   - **czas nagrzewania pokoju**, mierzony automatycznie z historii (decyzja: „niech mierzy sam”).
     Start grzania przed typowym przyjściem jest przesuwany o ten czas.
2. **Rodzaje sugestii:** zmiana godziny punktu harmonogramu, podniesienie albo obniżenie temperatury
   przedziału (decyzja). (Moja decyzja:) także dodanie obniżki w długim, typowo pustym okresie.
   „Obniżenie temperatury” z prośby użytkownika obejmuje oba przypadki.
3. **Ręczne zmiany → kompromis, bliżej tego, co ktoś ustawia** (decyzja). (Moja decyzja:) nowa temperatura
   przedziału = obecna + ok. 75% różnicy do typowej ręcznie ustawianej wartości, zaokrąglona do kroku
   termostatu. Przykład: harmonogram 21°, syn ustawia 23°, sugestia 22,5° (albo 22°/23° przy kroku 1°).
   Działa w obie strony: stałe skręcanie temperatury prowadzi do sugestii obniżenia.
4. **AI (opcjonalnie):** przez `ai_task` w HA (u użytkownika `ai_task.openai_ai_task`).
   - **Nowy termostat:** w okienku dodawania termostatu w panelu użytkownik **wybiera**: pusty harmonogram
     (jak dziś) albo inicjalizacja z AI (decyzja). Przy wyborze AI integracja proponuje cały harmonogram na
     podstawie typu pokoju i danych obecności, jeśli są, a użytkownik go zatwierdza (decyzja). Bez AI w HA
     opcji „z AI” nie ma. (Moja decyzja:) do czasu zatwierdzenia termostat ma pusty harmonogram.
   - **Na żądanie:** ikona `ai_task` na karcie wysyła zapytanie. Propozycje AI trafiają na **tę samą listę
     sugestii** z „Zastosuj” i „Odrzuć” (decyzja).
   - **Bez AI w HA:** nie ma sugestii zależnych od typu pokoju ani harmonogramu dla nowego termostatu.
     Ikona AI się nie pokazuje (decyzja). Sugestie z danych działają normalnie.

## Czego nie robimy

- Żadnych zmian bez zatwierdzenia. Integracja niczego nie stosuje sama.
- Bez powiadomień. Sugestie widać tylko w panelu Ogrzewanie (decyzja).
- Bez uzasadnień przy sugestiach. Lista pokazuje tylko opis zmiany (decyzja).
- Typ pokoju nigdzie nie jest pokazywany ani edytowalny (decyzja).
- AI nie jest odpytywane samo z siebie. Zapytanie idzie tylko po kliknięciu ikony AI albo po wybraniu
  „z AI” przy dodawaniu termostatu (decyzja).
- Bez wpisywanego ręcznie czasu nagrzewania.

## Antycele: co by sprawiło, że użytkownik to wyłączy

Słowa użytkownika: „zbyt częste sugestie i zmiany o kilka minut. za dużo sugestii na raz”.

Reguły, które temu zapobiegają (moje decyzje; wartości w stałych, bez UI):

- **Progi istotności:** przesunięcie godziny o co najmniej 30 min, zmiana temperatury o co najmniej
  1° i nie mniej niż krok termostatu. Mniejszych zmian się nie pokazuje.
- **Najwyżej 2 sugestie naraz na termostat:** te o największym zysku, czyli zaoszczędzonych
  godzinostopniach albo usuniętym dyskomforcie. Kolejne pojawiają się po zastosowaniu albo odrzuceniu.
- **Analiza raz w tygodniu,** nie co godzinę. Lista nie zmienia się z dnia na dzień.
- **Spokój po zmianie:** po zastosowaniu sugestii albo ręcznej edycji harmonogramu danego termostatu
  przez około 2 tygodnie nie ma nowych sugestii dla tego termostatu.
- **Odrzucona sugestia nie wraca przez około 4 tygodnie** (decyzja: „przez kilka tygodni”). Ta sama albo
  bardzo podobna zmiana (ten sam punkt i dzień, podobny kierunek) jest w tym czasie pomijana.
- **Minimum danych:** sugestie z obecności dopiero przy profilu z co najmniej 3 tygodni. Dziś profile
  biura i łazienki P1 mają mniej niż 2 tygodnie.
- **Grupowanie dni:** ta sama zmiana dla kilku dni tygodnia (np. pn–pt) to jedna sugestia, nie pięć.

### Cykl życia listy (moja decyzja)

- Cotygodniowa analiza zapisuje **uszeregowaną kolejkę** sugestii per termostat. Pokazywane są
  najwyżej 2 z góry kolejki.
- Przy każdym wyświetleniu sugestia jest **sprawdzana z aktualnym harmonogramem**. Jeśli już nie pasuje,
  bo harmonogram zmieniono ręcznie albo inną sugestią, znika bez śladu.
- **Po odrzuceniu** jej miejsce od razu zajmuje następna z kolejki.
- **Po zastosowaniu** pozostała sugestia zostaje, o ile nadal pasuje. Przez około 2 tygodnie nie ma
  nowej analizy ani dobierania z kolejki dla tego termostatu.

### AI a reguły (moja decyzja)

- Zapytanie do AI to świadome kliknięcie, więc **omija** cotygodniowy rytm i 2-tygodniowy spokój.
- Propozycje AI **nie konkurują** o 2 miejsca z sugestiami z danych. Mają osobny limit, np. do 3,
  wyświetlane obok sugestii z danych, każda z ikoną AI. Dzięki temu kliknięcie zawsze coś pokazuje,
  albo komunikat „brak propozycji”.
- AI podlega **progom**, granicom termostatu i **pamięci odrzuceń** (4 tygodnie).
- **Harmonogram dla nowego termostatu** zastępuje cały harmonogram, więc nie podlega progom ani limitom.
  Musi być tylko poprawnym harmonogramem w granicach termostatu.

### Kto i gdzie

- Sugestie widać **tylko na kartach w panelu Ogrzewanie**, czyli tych tworzonych z `settings: true`
  albo pod nową, równoważną flagą panelu. Karty na zwykłych dashboardach ich nie pokazują ani nie subskrybują.
- **Stosować, odrzucać i pytać AI może każdy, kto ma dostęp do panelu** (decyzja). Panel ma
  `require_admin=False`, więc nowe komendy websocket **nie** są `require_admin`, tak samo jak dzisiejsze
  `heating_schedule/save`.

## Jak to wygląda (decyzja: wariant B z mockupów)

Na karcie, tylko w trybie podglądu:

- **Wykres:** ponumerowane znaczniki (pomarańczowe kółka z numerem i przerywaną linią pionową) w miejscu
  zmiany. Proponowany kształt można zaznaczyć delikatnym cieniem różnicy.
- **Pod wykresem lista sugestii:** numer, krótki opis zmiany i przyciski **Zastosuj** / **Odrzuć**.
  Przykłady opisów:
  - „Obniżka do 18° o 16:15 zamiast 17:30 (pn–pt)”,
  - „Wieczorne 20° o 20:45 zamiast 20:30”,
  - „Sypialnia Filipa: 22° zamiast 21° w godz. 6:00–8:00”.
- **Sugestie od AI** mają przy opisie małą ikonę `ai_task`.
- **Przycisk zapytania do AI** to ikona integracji `ai_task` z HA, nie napis (decyzja). Ikonę trzeba
  pobrać tak, jak robi to frontend HA (brands), bez wpisanego na sztywno linku z tokenem, bo token
  wygasa. Zapasowo `mdi:creation`.
- **Nowy termostat z propozycją AI:** proponowany harmonogram pokazany jak sugestia. Pomarańczowa
  przerywana linia na wykresie i jedna pozycja na liście („Harmonogram zaproponowany przez AI”)
  z Zastosuj / Odrzuć.
- **Zastosuj** zapisuje harmonogram tym samym mechanizmem co edycja (`heating_schedule/save`).
  Ręczna edycja działa jak dziś.

## Dane i ograniczenia

- **Recorder trzyma surową historię około 10 dni.** Analiza ręcznych zmian i czasu nagrzewania musi,
  tak jak profil obecności, **składać własne zagregowane statystyki** (np. co godzinę z recordera)
  i trzymać je w `.storage`. Nie wolno wymagać wydłużenia `purge_keep_days`.
- **Ręczna zmiana** to zmiana atrybutu `temperature` encji climate, której nie wywołała integracja.
  Integracja woła `climate.set_temperature` z własnym `Context()`. Kontekst pozwala odróżnić jej zmiany,
  można też porównywać z ostatnio ustawioną wartością. Zmiany z fizycznych przycisków termostatu (Z2M)
  przychodzą bez użytkownika HA i też się liczą jako ręczne.
- **Czas nagrzewania:** z historii `hvac_action` (`heating`), `current_temperature` i `temperature`.
  Przykładowa definicja: od podniesienia zadanej o ≥1° do osiągnięcia zadanej −0,5°. Wynik zapisany
  per termostat, np. jako mediana minut na stopień plus stałe opóźnienie. Szczegóły zostają dla wykonawcy.
  Kontekst z notatek: biuro ma szybką podłogówkę, łazienka P1 wolną (~1,5 h).
- **Kiedy dane się zbierają:** grzanie i ręczne zmiany dają sensowne dane tylko w sezonie, gdy
  termostaty są w trybie `heat`. Na 2026-10-12 harmonogramy są wyłączone. Brak danych = brak sugestii
  danego rodzaju, bez błędów.
- **Typ pokoju** jest potrzebny tylko AI. (Moja decyzja:) wystarczy przekazać AI nazwę termostatu oraz nazwę
  obszaru i piętra (jak przy grupowaniu w panelu). Zgadnie typ samo, bez osobnej listy słów kluczowych.
- **Wybór encji AI:** domyślna encja `ai_task` z ustawień HA, jeśli jest, w przeciwnym razie pierwsza
  dostępna. Brak encji = funkcje AI ukryte.
- **Walidacja odpowiedzi AI:** odpowiedź w ustalonej strukturze (`ai_task.generate_data` ze `structure`).
  Każda propozycja przechodzi przez te same filtry co sugestie z danych: progi, limit sztuk,
  `min_temp`/`max_temp`/krok termostatu, poprawny harmonogram (pierwszy punkt 00:00). Propozycje
  niespełniające filtrów są po cichu pomijane.
- **Prywatność i koszt:** dane obecności idą do dostawcy AI tylko przy zapytaniu, czyli po kliknięciu
  albo przy dodaniu termostatu z opcją „z AI”.
- Integracja w Pythonie, karta i panel w Lit/TypeScript. Testy: pytest (pytest-homeassistant-custom-component)
  i node:test dla czystej logiki. CI na GitHubie, wydania przez tag i HACS.
- **Logika analizy jako czyste funkcje bez importów HA**, testowalne osobno, jak `profile.py` i `schedule.py`.

## Zostawione wykonawcy

- Dokładne algorytmy: wykrywanie typowego przyjścia i wyjścia z profilu (np. przekroczenie progu
  prawdopodobieństwa), liczenie zysku, łączenie dni.
- Format przechowywania sugestii, odrzuceń i statystyk w `.storage`, komendy websocket
  (np. lista, zastosuj, odrzuć, zapytaj AI) i ich nazwy.
- Prompt i struktura odpowiedzi dla AI.
- Kolejność wdrażania. Rozsądnie jest najpierw pomiar nagrzewania i ręcznych zmian (dane zbierają się
  długo), potem sugestie z danych i UI, na końcu AI.
- Czy sugestie są widoczne w trybie edycji. Domyślnie nie.
