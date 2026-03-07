import React from "react";
import { useLocation, Link } from "react-router-dom";
import { useUser } from "../../context/userContext";
import {
  Home,
  Stethoscope,
  Calendar,
  Users,
  Pill,
  FilePlus,
  FileCheck,
  FileEdit,
  History,
  TrendingUp,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

const SECTION_HEADING = "text-xs font-bold uppercase tracking-wider text-gray-500";
const ACTIVE_BG = "#e2f6f7";
const ICON_SIZE = 20;
const SIDEBAR_OPEN_WIDTH = 256;   // w-64
const SIDEBAR_COLLAPSED_WIDTH = 80; // w-20

const NavItem = ({ icon, label, to, isActive, onClick, isExternal, externalHref, collapsed }) => {
  const baseClass =
    "flex items-center rounded-lg text-sm transition-colors";
  const paddingClass = collapsed ? "px-0 py-2.5 justify-center" : "px-3 py-2.5";
  const activeClass = isActive
    ? "font-medium"
    : "text-gray-700 hover:bg-gray-100";

  const iconEl = (
    <span
      className="shrink-0 flex items-center justify-center"
      style={{
        color: isActive ? "#0d9488" : "#4b5563",
        width: ICON_SIZE,
        height: ICON_SIZE,
      }}
    >
      {icon}
    </span>
  );

  const content = collapsed ? (
    iconEl
  ) : (
    <>
      <span className="mr-3">{iconEl}</span>
      <span className="truncate">{label}</span>
    </>
  );

  const style = isActive ? { backgroundColor: ACTIVE_BG, color: "#0f766e" } : {};
  const className = `w-full ${baseClass} ${paddingClass} ${activeClass} ${collapsed ? "flex justify-center" : "text-left"}`;

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={className}
        style={style}
        title={collapsed ? label : undefined}
      >
        {content}
      </button>
    );
  }

  if (isExternal && externalHref) {
    return (
      <a
        href={externalHref}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        title={collapsed ? label : undefined}
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      to={to || "#"}
      className={className}
      style={style}
      title={collapsed ? label : undefined}
    >
      {content}
    </Link>
  );
};

const SidebarSection = ({ title, children, dividerAbove, collapsed }) => (
  <div className={`mb-5 ${dividerAbove ? "border-t border-gray-200 pt-4" : ""}`}>
    {!collapsed && (
      <h2 className={`${SECTION_HEADING} mb-2 px-3`}>{title}</h2>
    )}
    <div className="space-y-0.5">{children}</div>
  </div>
);

/**
 * New sidebar matching the design: NAWIGACJA, SZYBKIE AKCJE, SYSTEMOWE, Wyloguj się.
 * Previous component: UtilComponents/Sidebar.jsx (kept, not used).
 */
const AppSidebar = ({ isOpen = true, toggleSidebar, isDarkMode, toggleTheme }) => {
  const location = useLocation();
  const { user } = useUser();
  const currentPath = location.pathname;

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/logowanie";
  };

  const wizytyPath =
    user?.role === "admin" || user?.role === "receptionist"
      ? "/lekarze"
      : `/lekarze/wizyty/${user?.d_id || ""}`;
  const isWizytyActive =
    currentPath === "/lekarze" || currentPath.startsWith("/lekarze/wizyty");

  const collapsed = !isOpen;

  return (
    <aside
      className="fixed left-0 top-16 z-[9] h-[calc(100vh-4rem)] shrink-0 overflow-y-auto overflow-x-hidden border-r border-gray-200 bg-gray-50/95 pt-4 pb-6 transition-[width] duration-300 ease-in-out"
      style={{ width: isOpen ? SIDEBAR_OPEN_WIDTH : SIDEBAR_COLLAPSED_WIDTH }}
    >
      {/* Toggle button */}
      <div className={`flex mb-4 ${collapsed ? "justify-center px-0" : "justify-end px-3"}`}>
        <button
          type="button"
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
          title={isOpen ? "Zwiń menu" : "Rozwiń menu"}
          aria-label={isOpen ? "Zwiń menu" : "Rozwiń menu"}
        >
          {isOpen ? (
            <PanelLeftClose size={22} strokeWidth={2} />
          ) : (
            <PanelLeftOpen size={22} strokeWidth={2} />
          )}
        </button>
      </div>

      <nav className={collapsed ? "px-2" : "px-3"}>
        {/* NAWIGACJA */}
        <SidebarSection title="Nawigacja" collapsed={collapsed}>
          <NavItem
            icon={<Home size={ICON_SIZE} strokeWidth={2} />}
            label="Panel główny"
            to="/administracja"
            isActive={currentPath === "/administracja"}
            collapsed={collapsed}
          />
          <NavItem
            icon={<Stethoscope size={ICON_SIZE} strokeWidth={2} />}
            label="Wizyty lekarskie"
            to={wizytyPath}
            isActive={isWizytyActive}
            collapsed={collapsed}
          />
          <NavItem
            icon={<Calendar size={ICON_SIZE} strokeWidth={2} />}
            label="Kalendarz"
            to="/administracja/kalendarz"
            isActive={currentPath === "/administracja/kalendarz"}
            collapsed={collapsed}
          />
          <NavItem
            icon={<Users size={ICON_SIZE} strokeWidth={2} />}
            label="Lista pacjentów"
            to="/pacjenci"
            isActive={currentPath === "/pacjenci"}
            collapsed={collapsed}
          />
        </SidebarSection>

        {/* SZYBKIE AKCJE */}
        <SidebarSection title="Szybkie akcje" dividerAbove collapsed={collapsed}>
          <NavItem
            icon={<Pill size={ICON_SIZE} strokeWidth={2} />}
            label="E-recepta"
            to="#"
            isActive={false}
            collapsed={collapsed}
          />
          <NavItem
            icon={<FilePlus size={ICON_SIZE} strokeWidth={2} />}
            label="E-skierowanie"
            to="#"
            isActive={false}
            collapsed={collapsed}
          />
          <NavItem
            icon={<FileCheck size={ICON_SIZE} strokeWidth={2} />}
            label="e-ZLA"
            isExternal
            externalHref="https://www.zus.pl/ezus/logowanie?logout-manually=true"
            collapsed={collapsed}
          />
          <NavItem
            icon={<FileEdit size={ICON_SIZE} strokeWidth={2} />}
            label="Utwórz dokument"
            to="/wizyta/utworz"
            isActive={currentPath === "/wizyta/utworz"}
            collapsed={collapsed}
          />
        </SidebarSection>

        {/* SYSTEMOWE */}
        <SidebarSection title="Systemowe" dividerAbove collapsed={collapsed}>
          <NavItem
            icon={<History size={ICON_SIZE} strokeWidth={2} />}
            label="Historia wizyt"
            to="/klinika"
            isActive={currentPath === "/klinika"}
            collapsed={collapsed}
          />
          <NavItem
            icon={<TrendingUp size={ICON_SIZE} strokeWidth={2} />}
            label="Rozliczenia"
            to="/administracja/rozliczenia"
            isActive={currentPath === "/administracja/rozliczenia"}
            collapsed={collapsed}
          />
          <NavItem
            icon={<Settings size={ICON_SIZE} strokeWidth={2} />}
            label="Ustawienia"
            to="/ustawienia"
            isActive={currentPath === "/ustawienia"}
            collapsed={collapsed}
          />
        </SidebarSection>

        {/* Separator + Wyloguj się */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <NavItem
            icon={<LogOut size={ICON_SIZE} strokeWidth={2} />}
            label="Wyloguj się"
            onClick={handleLogout}
            isActive={false}
            collapsed={collapsed}
          />
        </div>
      </nav>
    </aside>
  );
};

export default AppSidebar;
