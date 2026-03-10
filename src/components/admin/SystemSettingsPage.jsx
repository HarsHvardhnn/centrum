import React from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/userContext";
import {
  User,
  Users,
  ShieldCheck,
  Clock,
  Stethoscope,
  BarChart3,
  FileStack,
  MessageSquare,
  Trash2,
  ArrowRight,
  Server,
  Newspaper,
  Package,
  CalendarCheck,
} from "lucide-react";

const settingsCards = [
  {
    id: "profile",
    title: "Mój profil",
    description:
      "Zarządzanie danymi osobowymi użytkownika, aktualizacja numeru telefonu oraz zmiana hasła dostępu",
    icon: User,
    to: "/administracja/profil",
    roles: ["admin", "doctor", "receptionist"],
  },
  {
    id: "user-settings",
    title: "Ustawienia użytkowników",
    description:
      "Zarządzanie kontami użytkowników, role, uprawnienia oraz lista personelu i pacjentów",
    icon: Users,
    to: "/administracja/konta",
    roles: ["admin"],
  },
  {
    id: "2fa",
    title: "Uwierzytelnianie 2FA",
    description:
      "Konfiguracja wieloskładnikowej weryfikacji tożsamości w celu zwiększenia bezpieczeństwa logowania",
    icon: ShieldCheck,
    to: "/administracja/bezpieczenstwo/2fa",
    roles: ["admin", "doctor", "receptionist"],
  },
  {
    id: "schedule",
    title: "Harmonogram",
    description:
      "Definiowanie godzin dostępności, planowanie przerw oraz zarządzanie kalendarzem pracy lekarza",
    icon: Clock,
    to: "/lekarz/ustawienia",
    roles: ["doctor"],
  },
  {
    id: "visit-templates",
    title: "Szablony wizyty",
    description:
      "Tworzenie i edycja predefiniowanych opisów medycznych wykorzystywanych w trakcie karty badania",
    icon: Stethoscope,
    to: "/administracja/szablony-dokumentow",
    roles: ["admin", "doctor"],
  },
  {
    id: "visit-config",
    title: "Konfiguracja wizyty",
    description:
      "Ustawienia wizyt, terminów i konfiguracja rezerwacji (tylko administrator)",
    icon: CalendarCheck,
    to: "/administracja/konfiguracja-wizyt",
    roles: ["admin"],
  },
  {
    id: "reports",
    title: "Raporty",
    description:
      "Generowanie szczegółowych zestawień statystycznych oraz raportów z przeprowadzonych wizyt",
    icon: BarChart3,
    to: "/administracja/dane",
    roles: ["admin", "doctor", "receptionist"],
  },
  {
    id: "document-templates",
    title: "Szablony dokumentów",
    description:
      "Zarządzanie repozytorium plików i wzorów dokumentacji do uzupełnienia danymi pacjenta",
    icon: FileStack,
    to: "/administracja/repo-dokumentow",
    roles: ["admin"],
  },
  {
    id: "sms",
    title: "Ustawienia SMS",
    description:
      "Szablony wiadomości SMS, wysyłanie powiadomień oraz konfiguracja komunikacji z pacjentami",
    icon: MessageSquare,
    to: "/administracja/sms",
    roles: ["admin"],
  },
  {
    id: "permanent-delete",
    title: "Trwale usuwanie",
    description:
      "Trwałe usuwanie rekordów z bazy danych, statystyki usunięć oraz zarządzanie danymi usuniętymi z systemu",
    icon: Trash2,
    to: "/administracja/trwale-usuwanie",
    roles: ["admin"],
  },
  {
    id: "ip-config",
    title: "Konfiguracja IP",
    description:
      "Ustawienia adresów IP i dostępu sieciowego do systemu (tylko administrator)",
    icon: Server,
    to: "/administracja/konfiguracja-ip",
    roles: ["admin"],
  },
  {
    id: "news",
    title: "Aktualności",
    description:
      "Zarządzanie aktualnościami i komunikatami wyświetlanymi na stronie",
    icon: Newspaper,
    to: "/administracja/aktualnosci",
    roles: ["admin"],
  },
  {
    id: "services",
    title: "Usługi",
    description:
      "Zarządzanie usługami medycznymi oferowanymi w placówce",
    icon: Package,
    to: "/administracja/uslugi",
    roles: ["admin"],
  },
];

const SettingsCard = ({ card }) => {
  const navigate = useNavigate();
  const Icon = card.icon;

  const handleClick = () => {
    navigate(card.to);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      className="bg-white rounded-lg border border-gray-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5 hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-shadow cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
    >
      <div className="flex items-start gap-3">
        <span
          className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-lg bg-gray-100 text-teal-600"
          aria-hidden
        >
          <Icon size={22} strokeWidth={2} />
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-800 mb-2">{card.title}</h3>
          <p className="text-sm text-gray-500 leading-snug mb-4">{card.description}</p>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:underline">
            Zarządzaj
            <ArrowRight size={16} className="flex-shrink-0" />
          </span>
        </div>
      </div>
    </div>
  );
};

const SystemSettingsPage = () => {
  const { user } = useUser();
  const role = user?.role || "admin";

  const visibleCards = settingsCards.filter(
    (card) => card.roles.includes(role)
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="w-full max-w-6xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Ustawienia systemowe
          </h1>
          <p className="text-sm text-gray-500">
            Konfiguruj system według swoich potrzeb i preferencji
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleCards.map((card) => (
            <SettingsCard key={card.id} card={card} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SystemSettingsPage;
