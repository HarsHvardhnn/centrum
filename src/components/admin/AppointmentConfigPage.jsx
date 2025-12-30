import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Save, RotateCcw, AlertCircle, Info } from "lucide-react";
import { useLoader } from "../../context/LoaderContext";
import appointmentConfigService from "../../helpers/appointmentConfigHelper";

const AppointmentConfigPage = () => {
  const { showLoader, hideLoader } = useLoader();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [configs, setConfigs] = useState([]);
  const [editedValues, setEditedValues] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  // Translation mapping from English to Polish
  const translateToPolish = (text) => {
    const translations = {
      // Common terms
      'appointment': 'wizyta',
      'appointments': 'wizyty',
      'patient': 'pacjent',
      'patients': 'pacjenci',
      'doctor': 'lekarz',
      'doctors': 'lekarze',
      'schedule': 'harmonogram',
      'time': 'czas',
      'date': 'data',
      'duration': 'czas trwania',
      'status': 'status',
      'booking': 'rezerwacja',
      'cancellation': 'anulowanie',
      'notification': 'powiadomienie',
      'notifications': 'powiadomienia',
      'sms': 'SMS',
      'email': 'email',
      'reminder': 'przypomnienie',
      'reminders': 'przypomnienia',
      'confirmation': 'potwierdzenie',
      'automatic': 'automatyczny',
      'manual': 'ręczny',
      'enabled': 'włączony',
      'disabled': 'wyłączony',
      'active': 'aktywny',
      'inactive': 'nieaktywny',
      'default': 'domyślny',
      'maximum': 'maksymalny',
      'minimum': 'minimalny',
      'limit': 'limit',
      'interval': 'interwał',
      'buffer': 'bufor',
      'advance': 'z wyprzedzeniem',
      'reschedule': 'przełożenie',
      'checkin': 'zameldowanie',
      'checkout': 'wymeldowanie',
      'waiting': 'oczekiwanie',
      'queue': 'kolejka',
      'priority': 'priorytet',
      'urgent': 'pilny',
      'emergency': 'nagły',
      'followup': 'kontrola',
      'consultation': 'konsultacja',
      'examination': 'badanie',
      'treatment': 'leczenie',
      'prescription': 'recepta',
      'referral': 'skierowanie',
      'report': 'raport',
      'history': 'historia',
      'record': 'rekord',
      'profile': 'profil',
      'account': 'konto',
      'user': 'użytkownik',
      'admin': 'administrator',
      'receptionist': 'recepcjonista',
      'nurse': 'pielęgniarka',
      'specialist': 'specjalista',
      'clinic': 'przychodnia',
      'hospital': 'szpital',
      'department': 'oddział',
      'specialization': 'specjalizacja',
      'service': 'usługa',
      'services': 'usługi',
      'fee': 'opłata',
      'payment': 'płatność',
      'billing': 'faktura',
      'invoice': 'faktura',
      'receipt': 'paragon',
      'insurance': 'ubezpieczenie',
      'coverage': 'pokrycie',
      'discount': 'zniżka',
      'tax': 'podatek',
      'total': 'suma',
      'subtotal': 'suma częściowa',
      'amount': 'kwota',
      'price': 'cena',
      'cost': 'koszt',
      'free': 'darmowy',
      'paid': 'płatny',
      'unpaid': 'nieopłacony',
      'pending': 'oczekujący',
      'approved': 'zatwierdzony',
      'rejected': 'odrzucony',
      'completed': 'zakończony',
      'cancelled': 'anulowany',
      'confirmed': 'potwierdzony',
      'unconfirmed': 'niepotwierdzony',
      'scheduled': 'zaplanowany',
      'unscheduled': 'niezaplanowany',
      'available': 'dostępny',
      'unavailable': 'niedostępny',
      'busy': 'zajęty',
      'online': 'online',
      'offline': 'stacjonarny',
      'remote': 'zdalny',
      'in-person': 'osobiście',
      'virtual': 'wirtualny',
      'physical': 'fizyczny',
      'digital': 'cyfrowy',
      'paper': 'papierowy',
      'electronic': 'elektroniczny',
      
      // Specific configuration terms from your API
      'default appointment duration': 'domyślny czas trwania wizyty',
      'default slot duration': 'domyślny czas trwania slotu',
      'booking buffer time': 'czas buforowy rezerwacji',
      'default temporary password': 'domyślne tymczasowe hasło',
      'minutes': 'minuty',
      'minute': 'minuta',
      'slot': 'slot',
      'slots': 'sloty',
      'generation': 'generowanie',
      'prevents': 'zapobiega',
      'prevents booking': 'zapobiega rezerwacji',
      'too close': 'zbyt blisko',
      'current time': 'aktualny czas',
      'temporary': 'tymczasowy',
      'password': 'hasło',
      'new patients': 'nowi pacjenci',
      'security': 'bezpieczeństwo',
      'appointment': 'wizyta',
      'available slots': 'dostępne sloty',
      'buffer time': 'czas buforowy',
      'booking slots': 'sloty rezerwacji',
      'system': 'system',
      'database': 'baza danych',
      'server': 'serwer',
      'client': 'klient',
      'api': 'API',
      'integration': 'integracja',
      'sync': 'synchronizacja',
      'backup': 'kopia zapasowa',
      'restore': 'przywracanie',
      'update': 'aktualizacja',
      'upgrade': 'uaktualnienie',
      'downgrade': 'obniżenie',
      'migration': 'migracja',
      'deployment': 'wdrożenie',
      'configuration': 'konfiguracja',
      'settings': 'ustawienia',
      'preferences': 'preferencje',
      'options': 'opcje',
      'parameters': 'parametry',
      'variables': 'zmienne',
      'constants': 'stałe',
      'functions': 'funkcje',
      'methods': 'metody',
      'algorithms': 'algorytmy',
      'logic': 'logika',
      'rules': 'zasady',
      'policies': 'polityki',
      'procedures': 'procedury',
      'protocols': 'protokoły',
      'standards': 'standardy',
      'guidelines': 'wytyczne',
      'requirements': 'wymagania',
      'specifications': 'specyfikacje',
      'documentation': 'dokumentacja',
      'manual': 'instrukcja',
      'guide': 'przewodnik',
      'tutorial': 'samouczek',
      'help': 'pomoc',
      'support': 'wsparcie',
      'contact': 'kontakt',
      'about': 'o',
      'version': 'wersja',
      'release': 'wydanie',
      'build': 'kompilacja',
      'patch': 'łatka',
      'fix': 'poprawka',
      'bug': 'błąd',
      'error': 'błąd',
      'warning': 'ostrzeżenie',
      'info': 'informacja',
      'debug': 'debugowanie',
      'test': 'test',
      'testing': 'testowanie',
      'quality': 'jakość',
      'performance': 'wydajność',
      'security': 'bezpieczeństwo',
      'privacy': 'prywatność',
      'confidentiality': 'poufność',
      'authentication': 'uwierzytelnianie',
      'authorization': 'autoryzacja',
      'permission': 'uprawnienie',
      'access': 'dostęp',
      'jwt': 'JWT',
      'token': 'token',
      'refresh': 'odświeżanie',
      'expiry': 'wygaśnięcie',
      'expiration': 'wygaśnięcie',
      'days': 'dni',
      'security': 'bezpieczeństwo',
      'role': 'rola',
      'privilege': 'przywilej',
      'right': 'prawo',
      'responsibility': 'odpowiedzialność',
      'duty': 'obowiązek',
      'task': 'zadanie',
      'job': 'praca',
      'work': 'praca',
      'activity': 'aktywność',
      'action': 'akcja',
      'operation': 'operacja',
      'process': 'proces',
      'workflow': 'przepływ pracy',
      'pipeline': 'pipeline',
      'queue': 'kolejka',
      'stack': 'stos',
      'buffer': 'bufor',
      'cache': 'pamięć podręczna',
      'memory': 'pamięć',
      'storage': 'magazyn',
      'disk': 'dysk',
      'file': 'plik',
      'folder': 'folder',
      'directory': 'katalog',
      'path': 'ścieżka',
      'url': 'URL',
      'link': 'link',
      'reference': 'odniesienie',
      'pointer': 'wskaźnik',
      'index': 'indeks',
      'key': 'klucz',
      'value': 'wartość',
      'data': 'dane',
      'information': 'informacja',
      'content': 'treść',
      'text': 'tekst',
      'string': 'ciąg',
      'number': 'liczba',
      'integer': 'liczba całkowita',
      'float': 'liczba zmiennoprzecinkowa',
      'boolean': 'wartość logiczna',
      'array': 'tablica',
      'list': 'lista',
      'object': 'obiekt',
      'class': 'klasa',
      'instance': 'instancja',
      'method': 'metoda',
      'function': 'funkcja',
      'procedure': 'procedura',
      'routine': 'rutyna',
      'script': 'skrypt',
      'code': 'kod',
      'program': 'program',
      'application': 'aplikacja',
      'software': 'oprogramowanie',
      'hardware': 'sprzęt',
      'device': 'urządzenie',
      'machine': 'maszyna',
      'computer': 'komputer',
      'server': 'serwer',
      'client': 'klient',
      'browser': 'przeglądarka',
      'website': 'strona internetowa',
      'webpage': 'strona internetowa',
      'page': 'strona',
      'site': 'strona',
      'domain': 'domena',
      'host': 'host',
      'network': 'sieć',
      'internet': 'internet',
      'intranet': 'intranet',
      'extranet': 'ekstranet',
      'lan': 'LAN',
      'wan': 'WAN',
      'wifi': 'WiFi',
      'ethernet': 'Ethernet',
      'bluetooth': 'Bluetooth',
      'usb': 'USB',
      'hdmi': 'HDMI',
      'vga': 'VGA',
      'display': 'wyświetlacz',
      'monitor': 'monitor',
      'screen': 'ekran',
      'resolution': 'rozdzielczość',
      'pixel': 'piksel',
      'color': 'kolor',
      'image': 'obraz',
      'picture': 'zdjęcie',
      'photo': 'zdjęcie',
      'video': 'wideo',
      'audio': 'audio',
      'sound': 'dźwięk',
      'music': 'muzyka',
      'voice': 'głos',
      'speech': 'mowa',
      'language': 'język',
      'locale': 'lokalizacja',
      'region': 'region',
      'country': 'kraj',
      'state': 'stan',
      'city': 'miasto',
      'address': 'adres',
      'location': 'lokalizacja',
      'position': 'pozycja',
      'coordinate': 'współrzędna',
      'latitude': 'szerokość geograficzna',
      'longitude': 'długość geograficzna',
      'timezone': 'strefa czasowa',
      'calendar': 'kalendarz',
      'schedule': 'harmonogram',
      'agenda': 'agenda',
      'event': 'wydarzenie',
      'meeting': 'spotkanie',
      'conference': 'konferencja',
      'session': 'sesja',
      'appointment': 'wizyta',
      'booking': 'rezerwacja',
      'reservation': 'rezerwacja',
      'registration': 'rejestracja',
      'enrollment': 'zapis',
      'subscription': 'subskrypcja',
      'membership': 'członkostwo',
      'account': 'konto',
      'profile': 'profil',
      'user': 'użytkownik',
      'customer': 'klient',
      'client': 'klient',
      'patient': 'pacjent',
      'doctor': 'lekarz',
      'nurse': 'pielęgniarka',
      'staff': 'personel',
      'employee': 'pracownik',
      'manager': 'menedżer',
      'supervisor': 'przełożony',
      'director': 'dyrektor',
      'administrator': 'administrator',
      'admin': 'admin',
      'superuser': 'superużytkownik',
      'guest': 'gość',
      'visitor': 'odwiedzający',
      'anonymous': 'anonimowy',
      'public': 'publiczny',
      'private': 'prywatny',
      'personal': 'osobisty',
      'individual': 'indywidualny',
      'group': 'grupa',
      'team': 'zespół',
      'organization': 'organizacja',
      'company': 'firma',
      'business': 'biznes',
      'enterprise': 'przedsiębiorstwo',
      'corporation': 'korporacja',
      'institution': 'instytucja',
      'facility': 'obiekt',
      'building': 'budynek',
      'office': 'biuro',
      'clinic': 'przychodnia',
      'hospital': 'szpital',
      'medical': 'medyczny',
      'health': 'zdrowie',
      'healthcare': 'opieka zdrowotna',
      'medicine': 'medycyna',
      'treatment': 'leczenie',
      'therapy': 'terapia',
      'diagnosis': 'diagnoza',
      'prognosis': 'rokowanie',
      'symptom': 'objaw',
      'condition': 'stan',
      'disease': 'choroba',
      'illness': 'choroba',
      'disorder': 'zaburzenie',
      'syndrome': 'zespół',
      'infection': 'infekcja',
      'injury': 'uraz',
      'wound': 'rana',
      'pain': 'ból',
      'ache': 'ból',
      'fever': 'gorączka',
      'temperature': 'temperatura',
      'pressure': 'ciśnienie',
      'pulse': 'puls',
      'heartbeat': 'bicie serca',
      'breathing': 'oddychanie',
      'respiration': 'oddychanie',
      'blood': 'krew',
      'urine': 'mocz',
      'stool': 'stolec',
      'sample': 'próbka',
      'test': 'test',
      'examination': 'badanie',
      'checkup': 'kontrola',
      'screening': 'badanie przesiewowe',
      'scan': 'skanowanie',
      'xray': 'RTG',
      'mri': 'MRI',
      'ct': 'CT',
      'ultrasound': 'ultrasonografia',
      'biopsy': 'biopsja',
      'surgery': 'operacja',
      'operation': 'operacja',
      'procedure': 'procedura',
      'intervention': 'interwencja',
      'therapy': 'terapia',
      'treatment': 'leczenie',
      'medication': 'lek',
      'medicine': 'lek',
      'drug': 'lek',
      'pill': 'tabletka',
      'tablet': 'tabletka',
      'capsule': 'kapsułka',
      'injection': 'zastrzyk',
      'vaccine': 'szczepionka',
      'immunization': 'immunizacja',
      'prescription': 'recepta',
      'dosage': 'dawka',
      'dose': 'dawka',
      'frequency': 'częstotliwość',
      'duration': 'czas trwania',
      'side effect': 'efekt uboczny',
      'allergy': 'alergia',
      'reaction': 'reakcja',
      'contraindication': 'przeciwwskazanie',
      'warning': 'ostrzeżenie',
      'precaution': 'ostrożność',
      'instruction': 'instrukcja',
      'guideline': 'wytyczna',
      'protocol': 'protokół',
      'standard': 'standard',
      'quality': 'jakość',
      'safety': 'bezpieczeństwo',
      'efficacy': 'skuteczność',
      'effectiveness': 'skuteczność',
      'efficiency': 'wydajność',
      'performance': 'wydajność',
      'outcome': 'wynik',
      'result': 'wynik',
      'conclusion': 'wniosek',
      'summary': 'podsumowanie',
      'report': 'raport',
      'document': 'dokument',
      'record': 'rekord',
      'file': 'plik',
      'data': 'dane',
      'information': 'informacja',
      'knowledge': 'wiedza',
      'experience': 'doświadczenie',
      'skill': 'umiejętność',
      'expertise': 'ekspertyza',
      'competence': 'kompetencja',
      'qualification': 'kwalifikacja',
      'certification': 'certyfikacja',
      'license': 'licencja',
      'permit': 'pozwolenie',
      'authorization': 'autoryzacja',
      'approval': 'zatwierdzenie',
      'consent': 'zgoda',
      'agreement': 'umowa',
      'contract': 'kontrakt',
      'terms': 'warunki',
      'conditions': 'warunki',
      'policy': 'polityka',
      'rule': 'zasada',
      'regulation': 'regulacja',
      'law': 'prawo',
      'legal': 'prawny',
      'ethical': 'etyczny',
      'moral': 'moralny',
      'professional': 'profesjonalny',
      'academic': 'akademicki',
      'clinical': 'kliniczny',
      'research': 'badania',
      'study': 'badanie',
      'trial': 'próba',
      'experiment': 'eksperyment',
      'analysis': 'analiza',
      'evaluation': 'ocena',
      'assessment': 'ocena',
      'review': 'przegląd',
      'audit': 'audyt',
      'inspection': 'inspekcja',
      'monitoring': 'monitorowanie',
      'surveillance': 'nadzór',
      'supervision': 'nadzór',
      'management': 'zarządzanie',
      'administration': 'administracja',
      'leadership': 'przywództwo',
      'governance': 'zarządzanie',
      'control': 'kontrola',
      'oversight': 'nadzór',
      'coordination': 'koordynacja',
      'collaboration': 'współpraca',
      'cooperation': 'współpraca',
      'partnership': 'partnerstwo',
      'alliance': 'sojusz',
      'network': 'sieć',
      'community': 'społeczność',
      'society': 'społeczeństwo',
      'population': 'populacja',
      'demographic': 'demograficzny',
      'statistic': 'statystyka',
      'trend': 'trend',
      'pattern': 'wzorzec',
      'behavior': 'zachowanie',
      'habit': 'nawyk',
      'lifestyle': 'styl życia',
      'culture': 'kultura',
      'tradition': 'tradycja',
      'custom': 'zwyczaj',
      'practice': 'praktyka',
      'method': 'metoda',
      'technique': 'technika',
      'approach': 'podejście',
      'strategy': 'strategia',
      'tactic': 'taktyka',
      'plan': 'plan',
      'program': 'program',
      'project': 'projekt',
      'initiative': 'inicjatywa',
      'campaign': 'kampania',
      'mission': 'misja',
      'vision': 'wizja',
      'goal': 'cel',
      'objective': 'cel',
      'target': 'cel',
      'aim': 'cel',
      'purpose': 'cel',
      'intention': 'intencja',
      'motivation': 'motywacja',
      'inspiration': 'inspiracja',
      'innovation': 'innowacja',
      'creativity': 'kreatywność',
      'imagination': 'wyobraźnia',
      'invention': 'wynalazek',
      'discovery': 'odkrycie',
      'breakthrough': 'przełom',
      'advancement': 'postęp',
      'progress': 'postęp',
      'development': 'rozwój',
      'growth': 'wzrost',
      'improvement': 'poprawa',
      'enhancement': 'ulepszenie',
      'optimization': 'optymalizacja',
      'efficiency': 'wydajność',
      'productivity': 'produktywność',
      'performance': 'wydajność',
      'achievement': 'osiągnięcie',
      'success': 'sukces',
      'victory': 'zwycięstwo',
      'triumph': 'triumf',
      'accomplishment': 'osiągnięcie',
      'milestone': 'kamień milowy',
      'landmark': 'punkt orientacyjny',
      'benchmark': 'punkt odniesienia',
      'standard': 'standard',
      'criteria': 'kryteria',
      'requirement': 'wymaganie',
      'specification': 'specyfikacja',
      'parameter': 'parametr',
      'variable': 'zmienna',
      'constant': 'stała',
      'factor': 'czynnik',
      'element': 'element',
      'component': 'komponent',
      'part': 'część',
      'piece': 'kawałek',
      'unit': 'jednostka',
      'module': 'moduł',
      'section': 'sekcja',
      'chapter': 'rozdział',
      'paragraph': 'akapit',
      'sentence': 'zdanie',
      'word': 'słowo',
      'term': 'termin',
      'phrase': 'fraza',
      'expression': 'wyrażenie',
      'language': 'język',
      'vocabulary': 'słownictwo',
      'dictionary': 'słownik',
      'glossary': 'słownik',
      'definition': 'definicja',
      'meaning': 'znaczenie',
      'sense': 'sens',
      'concept': 'koncepcja',
      'idea': 'pomysł',
      'thought': 'myśl',
      'opinion': 'opinia',
      'view': 'pogląd',
      'perspective': 'perspektywa',
      'angle': 'kąt',
      'aspect': 'aspekt',
      'dimension': 'wymiar',
      'level': 'poziom',
      'degree': 'stopień',
      'extent': 'zakres',
      'scope': 'zakres',
      'range': 'zakres',
      'scale': 'skala',
      'size': 'rozmiar',
      'magnitude': 'wielkość',
      'volume': 'objętość',
      'capacity': 'pojemność',
      'quantity': 'ilość',
      'amount': 'kwota',
      'number': 'liczba',
      'count': 'liczba',
      'total': 'suma',
      'sum': 'suma',
      'average': 'średnia',
      'mean': 'średnia',
      'median': 'mediana',
      'mode': 'moda',
      'maximum': 'maksimum',
      'minimum': 'minimum',
      'peak': 'szczyt',
      'valley': 'dolina',
      'high': 'wysoki',
      'low': 'niski',
      'big': 'duży',
      'small': 'mały',
      'large': 'duży',
      'tiny': 'malutki',
      'huge': 'ogromny',
      'massive': 'masywny',
      'enormous': 'ogromny',
      'giant': 'gigantyczny',
      'microscopic': 'mikroskopijny',
      'infinite': 'nieskończony',
      'finite': 'skończony',
      'limited': 'ograniczony',
      'unlimited': 'nieograniczony',
      'restricted': 'ograniczony',
      'unrestricted': 'nieograniczony',
      'free': 'wolny',
      'bound': 'związany',
      'open': 'otwarty',
      'closed': 'zamknięty',
      'public': 'publiczny',
      'secret': 'tajny',
      'confidential': 'poufny',
      'classified': 'tajny',
      'sensitive': 'wrażliwy',
      'critical': 'krytyczny',
      'important': 'ważny',
      'significant': 'znaczący',
      'major': 'główny',
      'minor': 'pomniejszy',
      'primary': 'podstawowy',
      'secondary': 'wtórny',
      'main': 'główny',
      'sub': 'pod',
      'super': 'super',
      'hyper': 'hiper',
      'ultra': 'ultra',
      'mega': 'mega',
      'giga': 'giga',
      'tera': 'tera',
      'peta': 'peta',
      'exa': 'exa',
      'zetta': 'zetta',
      'yotta': 'yotta',
      'kilo': 'kilo',
      'hecto': 'hekto',
      'deca': 'deka',
      'deci': 'decy',
      'centi': 'centy',
      'milli': 'mili',
      'micro': 'mikro',
      'nano': 'nano',
      'pico': 'piko',
      'femto': 'femto',
      'atto': 'atto',
      'zepto': 'zepto',
      'yocto': 'yocto'
    };

    // Convert to lowercase for case-insensitive matching
    const lowerText = text.toLowerCase();
    
    // Check for exact matches first
    if (translations[lowerText]) {
      return translations[lowerText];
    }
    
    // Check for common phrases and patterns
    const phraseTranslations = {
      'default appointment duration in minutes': 'domyślny czas trwania wizyty w minutach',
      'default slot duration in minutes for available slots generation': 'domyślny czas trwania slotu w minutach dla generowania dostępnych slotów',
      'buffer time in minutes for booking (prevents booking slots too close to current time)': 'czas buforowy w minutach dla rezerwacji (zapobiega rezerwacji slotów zbyt blisko aktualnego czasu)',
      'default temporary password for new patients': 'domyślne tymczasowe hasło dla nowych pacjentów',
      'in minutes': 'w minutach',
      'for booking': 'dla rezerwacji',
      'prevents booking slots too close to current time': 'zapobiega rezerwacji slotów zbyt blisko aktualnego czasu',
      'for available slots generation': 'dla generowania dostępnych slotów',
      'for new patients': 'dla nowych pacjentów',
      'jwt_expiry_time': 'Czas wygaśnięcia tokena dostępu (JWT)',
      'refresh_token_expiry_days': 'Czas wygaśnięcia tokena odświeżającego (w dniach)',
      'jwt expiry time': 'czas wygaśnięcia tokena dostępu (JWT)',
      'refresh token expiry days': 'czas wygaśnięcia tokena odświeżającego (w dniach)',
      'access token': 'token dostępu',
      'refresh token': 'token odświeżający',
      'expiry time': 'czas wygaśnięcia',
      'expiry days': 'dni wygaśnięcia'
    };
    
    // Check for phrase matches
    for (const [phrase, translation] of Object.entries(phraseTranslations)) {
      if (lowerText.includes(phrase)) {
        return lowerText.replace(phrase, translation);
      }
    }
    
    // Check for partial matches (for compound words)
    const words = lowerText.split(/[\s\-_]+/);
    const translatedWords = words.map(word => translations[word] || word);
    
    // If all words were translated, join them
    if (translatedWords.every((word, index) => word !== words[index])) {
      return translatedWords.join(' ');
    }
    
    // Try to translate individual words and join them
    const partiallyTranslated = translatedWords.join(' ');
    if (partiallyTranslated !== lowerText) {
      return partiallyTranslated;
    }
    
    // Return original text if no translation found
    return text;
  };

  // Fetch all configuration settings
  useEffect(() => {
    fetchConfigurations();
  }, []);

  // Track changes to determine if save button should be enabled
  useEffect(() => {
    const hasAnyChanges = Object.keys(editedValues).length > 0;
    setHasChanges(hasAnyChanges);
  }, [editedValues]);

  const fetchConfigurations = async () => {
    try {
      setLoading(true);
      setError(null);
      showLoader();

      const response = await appointmentConfigService.getAllConfigs();
      if (response.success) {
        setConfigs(response.data);
        
        // Initialize editedValues with current values
        const initialValues = {};
        response.data.forEach(config => {
          initialValues[config.key] = config.value;
        });
        setEditedValues(initialValues);
      } else {
        setError("Nie udało się pobrać konfiguracji.");
      }
    } catch (err) {
      console.error("Error fetching configurations:", err);
      setError("Wystąpił błąd podczas pobierania konfiguracji.");
    } finally {
      setLoading(false);
      hideLoader();
    }
  };

  // Handle input change for configuration values
  const handleInputChange = (key, value, valueType) => {
    let processedValue = value;
    
    // Convert value based on its type
    if (valueType === "number") {
      processedValue = value === "" ? "" : Number(value);
    } else if (valueType === "boolean") {
      processedValue = value === "true";
    }
    
    setEditedValues(prev => ({
      ...prev,
      [key]: processedValue
    }));
  };

  // Save all changed configuration values
  const handleSaveAll = async () => {
    try {
      showLoader();
      setError(null);
      
      const changedKeys = Object.keys(editedValues);
      if (changedKeys.length === 0) {
        toast.info("Brak zmian do zapisania");
        return;
      }
      
      const savePromises = changedKeys.map(key => {
        const config = configs.find(c => c.key === key);
        if (config && config.value !== editedValues[key]) {
          return appointmentConfigService.updateConfig(key, { value: editedValues[key] });
        }
        return null;
      }).filter(Boolean);
      
      if (savePromises.length === 0) {
        toast.info("Brak zmian do zapisania");
        return;
      }
      
      const results = await Promise.all(savePromises);
      const allSuccessful = results.every(result => result.success);
      
      if (allSuccessful) {
        toast.success("Wszystkie zmiany zostały zapisane");
        fetchConfigurations(); // Refresh data
      } else {
        toast.error("Nie udało się zapisać niektórych zmian");
        // Refresh to get current state
        fetchConfigurations();
      }
    } catch (err) {
      console.error("Error saving configurations:", err);
      toast.error("Wystąpił błąd podczas zapisywania konfiguracji");
    } finally {
      hideLoader();
    }
  };

  // Reset a single configuration to its default value
  const handleReset = async (key) => {
    try {
      showLoader();
      
      const response = await appointmentConfigService.resetConfig(key);
      
      if (response.success) {
        toast.success(`Konfiguracja ${key} została zresetowana do wartości domyślnej`);
        
        // Update local state
        setConfigs(prev => 
          prev.map(config => 
            config.key === key ? { ...config, value: response.data.value } : config
          )
        );
        
        // Update edited values
        setEditedValues(prev => ({
          ...prev,
          [key]: response.data.value
        }));
      } else {
        toast.error(`Nie udało się zresetować konfiguracji ${key}`);
      }
    } catch (err) {
      console.error(`Error resetting configuration ${key}:`, err);
      toast.error(`Wystąpił błąd podczas resetowania konfiguracji ${key}`);
    } finally {
      hideLoader();
    }
  };

  // Check if a value has been changed from its original
  const isValueChanged = (key) => {
    const config = configs.find(c => c.key === key);
    return config && editedValues[key] !== undefined && config.value !== editedValues[key];
  };

  // Render input field based on value type
  const renderInputField = (config) => {
    const { key, valueType, validation, editable } = config;
    const value = editedValues[key] !== undefined ? editedValues[key] : config.value;
    
    if (!editable) {
      return <div className="text-gray-500 italic">{value.toString()}</div>;
    }
    
    switch (valueType) {
      case "string":
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(key, e.target.value, valueType)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
            disabled={!editable}
          />
        );
      
      case "number":
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleInputChange(key, e.target.value, valueType)}
            min={config.validation?.min}
            max={config.validation?.max}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
            disabled={!editable}
          />
        );
      
      case "boolean":
        return (
          <select
            value={value.toString()}
            onChange={(e) => handleInputChange(key, e.target.value, valueType)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
            disabled={!editable}
          >
            <option value="true">Tak</option>
            <option value="false">Nie</option>
          </select>
        );
      
      default:
        return (
          <input
            type="text"
            value={value.toString()}
            onChange={(e) => handleInputChange(key, e.target.value, valueType)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
            disabled={!editable}
          />
        );
    }
  };

  // Group configurations by category
  const groupedConfigs = configs.reduce((acc, config) => {
    const category = config.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(config);
    return acc;
  }, {});

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-teal-700 mb-6">Konfiguracja Wizyt</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded flex items-center">
          <AlertCircle className="mr-2" size={20} />
          {error}
        </div>
      )}
      
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
        <div className="flex items-start">
          <Info className="text-blue-500 mr-2 mt-1" size={20} />
          <div>
            <h3 className="font-medium text-blue-800">Informacja</h3>
            <p className="text-sm text-blue-700">
              Ta strona pozwala na zarządzanie konfiguracją systemu wizyt. Zmiany w tych ustawieniach
              wpłyną na działanie całego systemu. Używaj z rozwagą.
            </p>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      ) : (
        <>
          <div className="flex justify-end mb-4">
            <button
              onClick={handleSaveAll}
              disabled={!hasChanges}
              className={`flex items-center px-4 py-2 rounded-lg ${
                hasChanges 
                  ? 'bg-teal-600 text-white hover:bg-teal-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Save size={16} className="mr-2" />
              Zapisz wszystkie zmiany
            </button>
          </div>
          
          {Object.entries(groupedConfigs).map(([category, categoryConfigs]) => (
            <div key={category} className="mb-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-4 capitalize">
                {category === 'appointment' ? 'Wizyty' : 
                 category === 'jwt' || category === 'security' ? 'Bezpieczeństwo (JWT)' : 
                 translateToPolish(category)}
              </h2>
              
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nazwa
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Wartość
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Opis
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Akcje
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categoryConfigs.map((config) => (
                      <tr key={config.key} className={isValueChanged(config.key) ? 'bg-yellow-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{translateToPolish(config.displayName || config.key)}</div>
                          <div className="text-xs text-gray-500">{config.key}</div>
                        </td>
                        <td className="px-6 py-4">
                          {renderInputField(config)}
                          {config.validation && (
                            <div className="text-xs text-gray-500 mt-1">
                              {config.validation.min !== undefined && config.validation.max !== undefined
                                ? `Min: ${config.validation.min}, Maks: ${config.validation.max}`
                                : config.validation.min !== undefined
                                ? `Min: ${config.validation.min}`
                                : config.validation.max !== undefined
                                ? `Maks: ${config.validation.max}`
                                : ''}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600">{translateToPolish(config.description)}</div>
                          <div className="text-xs text-gray-500 mt-1">Typ: {translateToPolish(config.valueType)}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {config.editable && (
                            <button
                              onClick={() => handleReset(config.key)}
                              className="text-blue-600 hover:text-blue-800 flex items-center ml-auto"
                              title="Resetuj do wartości domyślnej"
                            >
                              <RotateCcw size={16} />
                              <span className="ml-1">Resetuj</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default AppointmentConfigPage;
