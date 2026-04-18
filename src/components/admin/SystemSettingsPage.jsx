import React, { useState } from "react";
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
  GraduationCap,
  LayoutGrid,
} from "lucide-react";
import SpecializationManagement from "./SpecializationManagement";

const settingsCards = [
  {
    id: "profile",
    title: "My profile",
    description:
      "Manage your personal data, update your phone number, and change your password",
    icon: User,
    to: "/administracja/profil",
    roles: ["admin", "doctor", "receptionist"],
  },
  {
    id: "user-settings",
    title: "User accounts",
    description:
      "Manage user accounts, roles, permissions, and staff and patient lists",
    icon: Users,
    to: "/administracja/konta",
    roles: ["admin"],
  },
  {
    id: "2fa",
    title: "Two-factor authentication (2FA)",
    description:
      "Configure multi-factor identity verification to strengthen login security",
    icon: ShieldCheck,
    to: "/administracja/bezpieczenstwo/2fa",
    roles: ["admin", "doctor", "receptionist"],
  },
  {
    id: "schedule",
    title: "Schedule",
    description:
      "Set availability hours, plan breaks, and manage the doctor’s work calendar",
    icon: Clock,
    to: "/lekarz/ustawienia",
    roles: ["doctor"],
  },
  {
    id: "visit-templates",
    title: "Visit templates",
    description:
      "Create and edit predefined medical descriptions used during examination notes",
    icon: Stethoscope,
    to: "/administracja/szablony-dokumentow",
    roles: ["admin", "doctor"],
  },
  {
    id: "visit-config",
    title: "Appointment configuration",
    description:
      "Appointment settings, time slots, and booking configuration (admin only)",
    icon: CalendarCheck,
    to: "/administracja/konfiguracja-wizyt",
    roles: ["admin"],
  },
  {
    id: "reports",
    title: "Reports",
    description:
      "Generate detailed statistics and reports from completed visits",
    icon: BarChart3,
    to: "/administracja/dane",
    roles: ["admin", "doctor", "receptionist"],
  },
  {
    id: "document-templates",
    title: "Document templates",
    description:
      "Manage the file repository and documentation templates filled with patient data",
    icon: FileStack,
    to: "/administracja/repo-dokumentow",
    roles: ["admin"],
  },
  {
    id: "sms",
    title: "SMS settings",
    description:
      "SMS message templates, sending notifications, and patient communication settings",
    icon: MessageSquare,
    to: "/administracja/sms",
    roles: ["admin"],
  },
  {
    id: "permanent-delete",
    title: "Permanent deletion",
    description:
      "Permanently delete database records, deletion statistics, and manage purged data",
    icon: Trash2,
    to: "/administracja/trwale-usuwanie",
    roles: ["admin"],
  },
  {
    id: "ip-config",
    title: "IP configuration",
    description:
      "IP addresses and network access to the system (administrator only)",
    icon: Server,
    to: "/administracja/konfiguracja-ip",
    roles: ["admin"],
  },
  {
    id: "news",
    title: "News",
    description:
      "Manage news and announcements shown on the website",
    icon: Newspaper,
    to: "/administracja/aktualnosci",
    roles: ["admin"],
  },
  {
    id: "services",
    title: "Services",
    description:
      "Manage medical services offered by the facility",
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
            Manage
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
  const [activeTab, setActiveTab] = useState("overview");

  const visibleCards = settingsCards.filter(
    (card) => card.roles.includes(role)
  );

  const showSpecializationsTab = role === "admin";

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="w-full max-w-6xl mx-auto px-4 py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            System settings
          </h1>
          <p className="text-sm text-gray-500">
            Configure the system to match your needs and preferences
          </p>
        </header>

        {showSpecializationsTab && (
          <div
            className="flex flex-wrap gap-2 border-b border-gray-200 mb-8"
            role="tablist"
            aria-label="Settings sections"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "overview"}
              onClick={() => setActiveTab("overview")}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 -mb-px transition-colors ${
                activeTab === "overview"
                  ? "border-teal-600 text-teal-700 bg-white"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <LayoutGrid size={18} aria-hidden />
              Overview
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "specializations"}
              onClick={() => setActiveTab("specializations")}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 -mb-px transition-colors ${
                activeTab === "specializations"
                  ? "border-teal-600 text-teal-700 bg-white"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <GraduationCap size={18} aria-hidden />
              Medical specialties
            </button>
          </div>
        )}

        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleCards.map((card) => (
              <SettingsCard key={card.id} card={card} />
            ))}
          </div>
        )}

        {showSpecializationsTab && activeTab === "specializations" && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 md:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Medical specialties
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Add and edit specialties assigned to doctors when creating accounts and in bookings.
              </p>
            </div>
            <SpecializationManagement />
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemSettingsPage;
