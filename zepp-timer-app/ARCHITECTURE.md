# Architektura Subprojektu: `zepp-timer-app` (Zepp OS 3.0)

Dokument ten definiuje standardy architektoniczne, podział odpowiedzialności oraz dobre praktyki deweloperskie dla aplikacji smartwatcha **Apto-Timer** na platformę **Zepp OS 3.0** (urządzenie referencyjne: **Amazfit Balance**, okrągły ekran AMOLED **480×480 px**).

---

## 1. Zasada Trójpodziału Ekranu (Triad Pattern)

Każdy ekran w katalogu `page/` musi być podzielony na trzy ściśle odseparowane pliki:

```text
page/gt/<screen_name>/
├── index.page.js    # Widok & Cykl życia (ZOS Runtime Controller)
├── index.class.js   # Logika Domenowa & Maszyna Stanów (Pure JS)
└── index.style.js   # Koordynaty & Style Geometrii (ZOS Layout)
```

### 1.1. `*.page.js` — Kontroler Widoku i Cyklu Życia
- **Zakres:** Integracja z runtime Zepp OS (`Page({ ... })`), rejestracja cyklu życia (`onInit`, `build`, `onDestroy`).
- **Widżety:** Jednorazowe tworzenie widżetów (`hmUI.createWidget`) oraz mutowanie ich właściwości (`widget.setProperty(hmUI.prop.MORE, { ... })`).
- **Zdarzenia:** Rejestracja listenerów dotyku (`addEventListener(hmUI.event.CLICK_DOWN, ...)`) i delegowanie akcji do instancji klasy logicznej (`index.class.js`).
- **Zarządzanie Timerem Sprzętowym:** Uruchamianie i bezwzględne zatrzymywanie timerów `@zos/timer` (`createTimer`, `stopTimer`) – w `onDestroy()` oraz podczas pauzy/zakończenia.

### 1.2. `*.class.js` — Czysta Logika i Stan (Pure JS)
- **Zakres:** Reprezentacja maszyny stanów ekranu (`IDLE`, `RUNNING`, `PAUSED`, `FINISHED`), obliczenia upływu czasu, stanu progresu i delegowanie do `utils/`.
- **Rygorystyczna Granica:** **Całkowity zakaz importu pakietów `@zos/*`**, `@zeppos/*`, DOM lub specyficznych API urządzenia.
- **Testowalność:** Kod w tym pliku musi być w 100% wykonywalny i testowalny w standardowym środowisku Node.js/Jest/Vitest bez mocków SDK.

### 1.3. `*.style.js` — Style i Geometria Wyświetlacza
- **Zakres:** Eksport stałych i obiektów konfiguracyjnych dla `hmUI.createWidget`.
- **Przeliczanie wymiarów:** Użycie helpera `px()` z `@zos/utils` lub stałych geometrycznych bazujących na tarczy 480×480 px.
- **Wyśrodkowanie widżetów łukowych (`ARC`):** Kontener musi posiadać `x: 0, y: 0, w: 480, h: 480`, a środek `center_x: 240, center_y: 240`.

---

## 2. Architektura Modułowa i Przepływ Danych

```text
┌────────────────────────────────────────────────────────┐
│                   zepp-timer-app                       │
│                                                        │
│  ┌───────────────────────┐    ┌─────────────────────┐  │
│  │   page/**/*.page.js   │◄───┤  page/**/*.style.js │  │
│  │   (@zos/ui, @zos/timer)│    │  (px, coordinates)  │  │
│  └───────────┬───────────┘    └─────────────────────┘  │
│              │ (events & ticks)                        │
│              ▼                                         │
│  ┌───────────────────────┐                             │
│  │   page/**/*.class.js  │                             │
│  │   (Pure Domain State) │                             │
│  └───────────┬───────────┘                             │
│              │                                         │
│      ┌───────┴────────┐                                │
│      ▼                ▼                                │
│  ┌──────────────┐ ┌───────────────────┐                │
│  │ utils/format │ │ utils/timerEngine │                │
│  │ (Pure JS)    │ │ (Pure Math)       │                │
│  └──────────────┘ └───────────────────┘                │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │                     services/                    │  │
│  │  • haptic.js   (Vibrator via @zos/sensor)        │  │
│  │  • storage.js  (Presets via @zos/storage / fs)   │  │
│  │  • appState.js (Inter-screen routing & session)  │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

---

## 3. Komponenty Systemowe

### 3.1. Narzędzia Czyste (`utils/`)
- `utils/timerEngine.js`:
  - Przeliczanie upływu czasu, proporcji postępu (`0.0` – `1.0`).
  - Przeliczanie kątów łuku zegarowego: od `-90°` (godzina 12:00) do `270°` (pełny obrót zgodnie z ruchem wskazówek zegara).
  - Obliczanie przyrostu czasu dla zadanych interwałów ticków (np. 33 ms).
- `utils/format.js`:
  - Formatowanie milisekund do formatu `mm:ss` (np. `15000` ms -> `00:15`).
  - Zaokrąglanie i formatowanie w górę/dół (np. `Math.ceil(ms / 1000)` dla naturalnego odliczania sekund).

### 3.2. Usługi Platformowe (`services/`)
- `services/haptic.js`:
  - Obsługa wibracji haptycznych za pośrednictwem sensora `@zos/sensor` (`Vibrator`).
  - Zdefiniowane profile wibracji (np. krótki impuls przy starcie/pauzie, sekwencja alarmowa po zakończeniu odliczania).
- `services/storage.js`:
  - Zapis i odczyt presetów czasowych użytkownika oraz preferencji za pomocą `LocalStorage` (`@zos/storage`) lub JSON (`@zos/fs`).
- `services/appState.js`:
  - Zarządzanie stanem współdzielonym między ekranami (`sessionStorage`, parametry `@zos/router`, `globalData`).

---

## 4. Rygory Wydajnościowe i Stabilności Zepp OS 3.0

1. **Brak alokacji w pętli animacji (~30 FPS):**
   - Interwał odświeżania wynosi ok. 33 ms (`@zos/timer`).
   - W callbacku timera nie wolno tworzyć nowych obiektów widżetów ani alokować zbędnych struktur pamięci.
   - Aktualizacja widoku wyłącznie przez `widget.setProperty(hmUI.prop.MORE, { ... })`.
2. **Gwarancja czyszczenia zasobów (Anti-Leak):**
   - Każdy identyfikator timera zwrócony przez `timer.createTimer` musi zostać zatrzymany przez `timer.stopTimer`.
   - `onDestroy()` w każdym pliku `*.page.js` bezwzględnie zwalnia timery, sensory haptyczne i listenery.
3. **Obsługa dotyku bez niewidocznych warstw blokujących:**
   - Unikamy pełnoekranowych przycisków z `alpha: 0`.
   - Eventy `hmUI.event.CLICK_DOWN` rejestrujemy bezpośrednio na widocznych widżetach tekstowych, ikonach lub dedykowanych ramkach dotykowych.

---

## 5. Strategia Testowania (TDD & QA)

- **Testy jednostkowe (`tests/`):**
  - Wszystkie moduły w `utils/` oraz klasy w `page/**/*.class.js` są w 100% objęte testami jednostkowymi uruchamianymi bez emulatora.
  - Pokrycie przypadków brzegowych: `0 ms`, ujemny czas, szybkie naprzemienne wywołania `start`/`pause`, przejścia stanów.
- **Weryfikacja na emulatorze / tarczy fizycznej:**
  - Płynność animacji łuku na profilu `Balance 2` (480×480 px).
  - Poprawność wycentrowania i brak migotania ramek bufora.
