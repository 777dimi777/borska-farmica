# Storefront design sistem

Vizuelni pravac je čist, premium i lokalno autentičan: bela/warm-white površina, duboka šumska zelena i ograničene neutralne boje. Semantic CSS tokeni su `background #FBFCF9`, `foreground #18211C`, `surface #FFFFFF`, `surface-muted #F3F5F1`, `primary #123D2B`, `primary-strong #176B45`, `primary-hover #0F5135`, `secondary #EAF4EE`, `muted #647068`, `border #DDE5DF`, uz zasebne ring/success/warning/destructive tokene.

Body/UI koristi Manrope, a display naslovi Cormorant Garamond preko `next/font`, sa latin-ext podrškom. Serif se ne koristi za sitan UI. Fluidna skala koristi `clamp`, maksimalni container je 76rem, a spacing prati ritam od približno 8/12/16/24/32/48/64+ px.

Radius: 0.65rem za male kontrole, 1rem za standardne kartice i 1.6rem za velike površine. Shadow je diskretan i zeleno-neutralan. Button varijante su primary, secondary i ghost; svaka ima najmanje približno 44 px target. Focus koristi jasno vidljiv `ring`, a link/button semantika ostaje native.

Motion je ograničen na promenu boje, bordera i podizanje do 3 px. `prefers-reduced-motion` uklanja animacije i smooth scrolling. Breakpointi reorganizuju grid na 960/640 px; mobile menu je keyboard/Escape pristupačan i sprečava background scroll.

Odobren logo asset trenutno ne postoji. `Brand` zato koristi centralizovan tipografski fallback i monogram, bez generičke koze. Budući odobreni SVG treba postaviti na `apps/web/public/brand/borska-farmica-logo.svg`, zadržati proporcije/clear space i zameniti implementaciju samo unutar `Brand` komponente.
