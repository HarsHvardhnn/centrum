import React from "react";

/**
 * Shared phone country codes and FlagIcon for use across admin and user forms.
 * Add new countries here so they appear everywhere (CompleteRegistrationModal,
 * AddAppointmentForm, DemographicForm, DetailsForm, Settings).
 */
export const PHONE_COUNTRY_CODES = [
  { code: "+48", country: "Polska", flag: "PL", maxLength: 9, default: true },
  { code: "+380", country: "Ukraina", flag: "UA", maxLength: 9 },
  { code: "+49", country: "Niemcy", flag: "DE", maxLength: 11 },
  { code: "+44", country: "Wielka Brytania", flag: "GB", maxLength: 10 },
  { code: "+34", country: "Hiszpania", flag: "ES", maxLength: 9 },
  { code: "+33", country: "Francja", flag: "FR", maxLength: 9 },
  { code: "+43", country: "Austria", flag: "AT", maxLength: 10 },
  { code: "+39", country: "Włochy", flag: "IT", maxLength: 10 },
  { code: "+420", country: "Czechy", flag: "CZ", maxLength: 9 },
  { code: "+1", country: "USA", flag: "US", maxLength: 10 },
  // Additional European countries
  { code: "+31", country: "Holandia", flag: "NL", maxLength: 9 },
  { code: "+32", country: "Belgia", flag: "BE", maxLength: 9 },
  { code: "+41", country: "Szwajcaria", flag: "CH", maxLength: 9 },
  { code: "+47", country: "Norwegia", flag: "NO", maxLength: 8 },
  { code: "+46", country: "Szwecja", flag: "SE", maxLength: 9 },
  { code: "+45", country: "Dania", flag: "DK", maxLength: 8 },
  { code: "+353", country: "Irlandia", flag: "IE", maxLength: 9 },
  { code: "+421", country: "Słowacja", flag: "SK", maxLength: 9 },
  { code: "+36", country: "Węgry", flag: "HU", maxLength: 9 },
  { code: "+40", country: "Rumunia", flag: "RO", maxLength: 10 },
];

export function FlagIcon({ countryCode, className = "w-4 h-4" }) {
  const flags = {
    PL: (<svg viewBox="0 0 640 480" className={className}><g fillRule="evenodd"><rect width="640" height="480" fill="#fff"/><rect width="640" height="240" y="240" fill="#dc143c"/></g></svg>),
    UA: (<svg viewBox="0 0 640 480" className={className}><g fillRule="evenodd"><rect width="640" height="240" fill="#005bbb"/><rect width="640" height="240" y="240" fill="#ffd700"/></g></svg>),
    DE: (<svg viewBox="0 0 640 480" className={className}><g fillRule="evenodd"><rect width="640" height="160" fill="#000"/><rect width="640" height="160" y="160" fill="#dd0000"/><rect width="640" height="160" y="320" fill="#ffce00"/></g></svg>),
    GB: (<svg viewBox="0 0 640 480" className={className}><g fillRule="evenodd"><rect width="640" height="480" fill="#012169"/><path d="M0 0l640 480M640 0L0 480" stroke="#fff" strokeWidth="3"/><path d="M0 0l640 480M640 0L0 480" stroke="#C8102E" strokeWidth="2"/><path d="M320 0v480M0 240h640" stroke="#fff" strokeWidth="6"/><path d="M320 0v480M0 240h640" stroke="#C8102E" strokeWidth="4"/></g></svg>),
    ES: (<svg viewBox="0 0 640 480" className={className}><g fillRule="evenodd"><rect width="640" height="480" fill="#c60b1e"/><rect width="640" height="240" y="120" fill="#ffc400"/></g></svg>),
    FR: (<svg viewBox="0 0 640 480" className={className}><g fillRule="evenodd"><rect width="213.3" height="480" fill="#fff"/><rect width="213.3" height="480" x="213.3" fill="#00267f"/><rect width="213.3" height="480" x="426.6" fill="#f31830"/></g></svg>),
    AT: (<svg viewBox="0 0 640 480" className={className}><g fillRule="evenodd"><rect width="640" height="160" fill="#fff"/><rect width="640" height="160" y="160" fill="#c8102e"/><rect width="640" height="160" y="320" fill="#fff"/></g></svg>),
    IT: (<svg viewBox="0 0 640 480" className={className}><g fillRule="evenodd"><rect width="213.3" height="480" fill="#fff"/><rect width="213.3" height="480" x="213.3" fill="#009246"/><rect width="213.3" height="480" x="426.6" fill="#ce2b37"/></g></svg>),
    CZ: (<svg viewBox="0 0 640 480" className={className}><g fillRule="evenodd"><rect width="640" height="240" fill="#fff"/><rect width="640" height="240" y="240" fill="#d7141a"/><path d="M0 0l320 240L0 480z" fill="#11457e"/></g></svg>),
    US: (<svg viewBox="0 0 640 480" className={className}><g fillRule="evenodd"><rect width="640" height="480" fill="#fff"/><rect width="640" height="37" fill="#b22234"/><rect width="640" height="37" y="74" fill="#b22234"/><rect width="640" height="37" y="148" fill="#b22234"/><rect width="640" height="37" y="222" fill="#b22234"/><rect width="640" height="37" y="296" fill="#b22234"/><rect width="640" height="37" y="370" fill="#b22234"/><rect width="320" height="259" fill="#3c3b6e"/></g></svg>),
    // New: Holandia, Belgia, Szwajcaria, Norwegia, Szwecja, Dania, Irlandia, Słowacja, Węgry, Rumunia
    NL: (<svg viewBox="0 0 640 480" className={className}><g fillRule="evenodd"><rect width="640" height="160" fill="#ae1c28"/><rect width="640" height="160" y="160" fill="#fff"/><rect width="640" height="160" y="320" fill="#21468b"/></g></svg>),
    BE: (<svg viewBox="0 0 640 480" className={className}><g fillRule="evenodd"><rect width="213.3" height="480" fill="#000"/><rect width="213.3" height="480" x="213.3" fill="#fae017"/><rect width="213.3" height="480" x="426.6" fill="#ae1c28"/></g></svg>),
    CH: (<svg viewBox="0 0 640 480" className={className}><g fillRule="evenodd"><rect width="640" height="480" fill="#ff0000"/><path fill="#fff" d="M170 0h300v480H170z"/><path fill="#ff0000" d="M320 0h120v480H320z"/><path fill="#ff0000" d="M170 180h300v120H170z"/></g></svg>),
    NO: (<svg viewBox="0 0 640 480" className={className}><g fillRule="evenodd"><path fill="#ed2939" d="M0 0h640v480H0z"/><path fill="#fff" d="M180 0h120v480H180z"/><path fill="#fff" d="M0 180h640v120H0z"/><path fill="#002664" d="M210 0h60v480h-60z"/><path fill="#002664" d="M0 210h640v60H0z"/></g></svg>),
    SE: (<svg viewBox="0 0 640 480" className={className}><g fillRule="evenodd"><rect width="640" height="480" fill="#006aa7"/><path fill="#fecc00" d="M0 0h240v480H0z"/><path fill="#fecc00" d="M0 180h640v120H0z"/></g></svg>),
    DK: (<svg viewBox="0 0 640 480" className={className}><g fillRule="evenodd"><rect width="640" height="480" fill="#c8102e"/><path fill="#fff" d="M0 0h180v480H0z"/><path fill="#fff" d="M0 180h640v120H0z"/><path fill="#c8102e" d="M0 210h640v60H0z"/><path fill="#c8102e" d="M210 0h60v480h-60z"/></g></svg>),
    IE: (<svg viewBox="0 0 640 480" className={className}><g fillRule="evenodd"><rect width="213.3" height="480" fill="#009a49"/><rect width="213.3" height="480" x="213.3" fill="#fff"/><rect width="213.3" height="480" x="426.6" fill="#ff7900"/></g></svg>),
    SK: (<svg viewBox="0 0 640 480" className={className}><g fillRule="evenodd"><rect width="640" height="160" fill="#fff"/><rect width="640" height="160" y="160" fill="#0b4ea2"/><rect width="640" height="160" y="320" fill="#c8102e"/><path fill="#fff" d="M0 0h240v480H0z"/><path fill="#0b4ea2" d="M0 0h160v480H0z"/><path fill="#c8102e" d="M0 200h640v80H0z"/></g></svg>),
    HU: (<svg viewBox="0 0 640 480" className={className}><g fillRule="evenodd"><rect width="640" height="160" fill="#c8102e"/><rect width="640" height="160" y="160" fill="#fff"/><rect width="640" height="160" y="320" fill="#477050"/></g></svg>),
    RO: (<svg viewBox="0 0 640 480" className={className}><g fillRule="evenodd"><rect width="213.3" height="480" fill="#002b7f"/><rect width="213.3" height="480" x="213.3" fill="#fcd116"/><rect width="213.3" height="480" x="426.6" fill="#ce1126"/></g></svg>),
  };
  return flags[countryCode] ?? <span className={className}>🏳️</span>;
}
