/**
 * Inline script (first in <body>) — runs before paint to avoid noir-magenta flash
 * and apply legacy localStorage ids. Keep in sync with components/dev/theme-switcher.tsx.
 */
export function getThemeInitScript(): string {
  return `(function(){try{var k="ve-dev-theme";var l={"damascus-steel":"damascus-steel-dark","inflow-light":"crm-light","ivory-champagne":"noir-magenta","emerald-marble":"noir-magenta","emerald-marble-light":"noir-magenta","leopard":"noir-magenta","leopard-light":"noir-magenta","obsidian-gold":"noir-magenta","obsidian-gold-light":"noir-magenta","midnight-amethyst":"noir-magenta","midnight-amethyst-light":"noir-magenta"};var t=["noir-magenta","noir-magenta-light","vera-classic","vera-classic-light","crm-dark","crm-light","damascus-steel-dark","damascus-steel-light"];var lt={"crm-light":1,"noir-magenta-light":1,"vera-classic-light":1,"damascus-steel-light":1};var s=localStorage.getItem(k);if(!s)return;var r=l[s]||s;if(t.indexOf(r)<0)r="noir-magenta";var d=document.documentElement;d.setAttribute("data-theme",r);d.classList.toggle("dark",!lt[r])}catch(e){}})();`;
}
