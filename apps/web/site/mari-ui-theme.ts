// ÜRETİLMİŞ DOSYA — elle düzenlemeyin. "npx @mari-ui/cli theme" ile mari-ui.config.json'dan üretildi.
// @mari-ui/native (veya token değerlerine doğrudan erişmek isteyen başka bir platform) için.
export const mariTheme = {
  "light": {
    "mode": "light",
    "name": "light",
    "color": {
      "primary": {
        "text": "#78340b",
        "solid": "#78340b",
        "solidContrast": "#ffffff",
        "solidHover": "#572608",
        "subtle": "#f8d0b8",
        "subtleContrast": "#78340b",
        "border": "#78340b"
      },
      "accent": {
        "text": "#7b432b",
        "solid": "#ae5e3d",
        "solidContrast": "#ffffff",
        "solidHover": "#7b432b",
        "subtle": "#f1e0d8",
        "subtleContrast": "#7b432b",
        "border": "#ae5e3d"
      },
      "success": {
        "text": "#047857",
        "solid": "#047857",
        "solidContrast": "#ffffff",
        "solidHover": "#065f46",
        "subtle": "#d1fae5",
        "subtleContrast": "#047857",
        "border": "#059669"
      },
      "error": {
        "text": "#b91c1c",
        "solid": "#dc2626",
        "solidContrast": "#ffffff",
        "solidHover": "#b91c1c",
        "subtle": "#fee2e2",
        "subtleContrast": "#b91c1c",
        "border": "#dc2626"
      },
      "warning": {
        "text": "#92400e",
        "solid": "#fbbf24",
        "solidContrast": "#201c19",
        "solidHover": "#fcd34d",
        "subtle": "#fef3c7",
        "subtleContrast": "#b45309",
        "border": "#b45309"
      },
      "info": {
        "text": "#0369a1",
        "solid": "#0369a1",
        "solidContrast": "#ffffff",
        "solidHover": "#075985",
        "subtle": "#e0f2fe",
        "subtleContrast": "#0369a1",
        "border": "#0284c7"
      },
      "neutral": {
        "text": "#6e5e50",
        "solid": "#6e5e50",
        "solidContrast": "#ffffff",
        "solidHover": "#4f4136",
        "subtle": "#f3ece2",
        "subtleContrast": "#5c4c3f",
        "border": "#6e5e50"
      },
      "canvas": {
        "surface": "#fbf8f3",
        "surfaceAlt": "#f3ece2",
        "border": "#e7dccd",
        "input": "#9a8878",
        "ring": "#78340b",
        "scrim": "rgb(25 24 34 / 0.45)",
        "foreground": "#2b1d14",
        "muted": "#6b5a4c",
        "disabled": "#bcb5cf",
        "rating": "#facc15",
        "ratingStroke": "#facc15"
      }
    },
    "colorOverrides": {
      "surface": "#fbf8f3",
      "surface-alt": "#f3ece2",
      "border": "#e7dccd",
      "input": "#9a8878",
      "foreground": "#2b1d14",
      "muted": "#6b5a4c",
      "neutral": "#6e5e50",
      "neutral-solid": "#6e5e50",
      "neutral-solid-hover": "#4f4136",
      "neutral-subtle": "#f3ece2",
      "neutral-subtle-contrast": "#5c4c3f",
      "neutral-border": "#6e5e50"
    },
    "spacing": {
      "0": "0px",
      "1": "0.25rem",
      "2": "0.5rem",
      "3": "0.75rem",
      "4": "1rem",
      "5": "1.25rem",
      "6": "1.5rem",
      "8": "2rem",
      "10": "2.5rem",
      "12": "3rem",
      "16": "4rem",
      "20": "5rem",
      "24": "6rem",
      "32": "8rem",
      "0.5": "0.125rem",
      "1.5": "0.375rem",
      "2.5": "0.625rem"
    },
    "radius": {
      "none": "0px",
      "sm": "0.375rem",
      "md": "0.75rem",
      "lg": "1.125rem",
      "xl": "1.5rem",
      "full": "9999px"
    },
    "fontFamily": {
      "sans": "\"Inter Variable\", \"Inter\", ui-sans-serif, system-ui, sans-serif",
      "mono": "\"JetBrains Mono\", ui-monospace, SFMono-Regular, monospace",
      "heading": "\"Playfair Display Variable\", \"Playfair Display\", Georgia, serif"
    },
    "fontSize": {
      "xs": "0.75rem",
      "sm": "0.875rem",
      "md": "1rem",
      "lg": "1.125rem",
      "xl": "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem"
    },
    "fontWeight": {
      "normal": "400",
      "medium": "500",
      "semibold": "600",
      "bold": "700"
    },
    "lineHeight": {
      "tight": "1.25",
      "normal": "1.5",
      "relaxed": "1.75"
    },
    "shadow": {
      "none": "none",
      "sm": "0 1px 2px 0 rgb(0 0 0 / 0.025)",
      "md": "0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
      "lg": "0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -4px rgb(0 0 0 / 0.05)",
      "xl": "0 20px 25px -5px rgb(0 0 0 / 0.05), 0 8px 10px -6px rgb(0 0 0 / 0.05)"
    },
    "zIndex": {
      "dropdown": 1100,
      "sticky": 1000,
      "drawer": 1200,
      "modal": 1300,
      "toast": 1400,
      "tooltip": 1500
    },
    "duration": {
      "fast": "210ms",
      "normal": "350ms",
      "slow": "490ms"
    },
    "easing": {
      "standard": "cubic-bezier(0, 0, 0.2, 1)",
      "decelerate": "cubic-bezier(0, 0, 0.2, 1)",
      "accelerate": "cubic-bezier(0.4, 0, 1, 1)"
    },
    "breakpoint": {
      "sm": "640px",
      "md": "768px",
      "lg": "1024px",
      "xl": "1280px",
      "2xl": "1536px"
    },
    "effects": {
      "shadow": "soft",
      "motion": "calm"
    }
  },
  "dark": {
    "mode": "dark",
    "name": "dark",
    "color": {
      "primary": {
        "text": "#ed8342",
        "solid": "#d65e15",
        "solidContrast": "#000000",
        "solidHover": "#ed8342",
        "subtle": "#261104",
        "subtleContrast": "#d65e15",
        "border": "#d65e15"
      },
      "accent": {
        "text": "#d2977e",
        "solid": "#ddb09d",
        "solidContrast": "#201c19",
        "solidHover": "#e8c9bc",
        "subtle": "#301a11",
        "subtleContrast": "#d2977e",
        "border": "#d2977e"
      },
      "success": {
        "text": "#34d399",
        "solid": "#6ee7b7",
        "solidContrast": "#201c19",
        "solidHover": "#a7f3d0",
        "subtle": "#064e3b",
        "subtleContrast": "#34d399",
        "border": "#34d399"
      },
      "error": {
        "text": "#fca5a5",
        "solid": "#fca5a5",
        "solidContrast": "#201c19",
        "solidHover": "#fecaca",
        "subtle": "#7f1d1d",
        "subtleContrast": "#fca5a5",
        "border": "#f87171"
      },
      "warning": {
        "text": "#fbbf24",
        "solid": "#fcd34d",
        "solidContrast": "#201c19",
        "solidHover": "#fde68a",
        "subtle": "#78350f",
        "subtleContrast": "#fbbf24",
        "border": "#fbbf24"
      },
      "info": {
        "text": "#7dd3fc",
        "solid": "#7dd3fc",
        "solidContrast": "#201c19",
        "solidHover": "#bae6fd",
        "subtle": "#0c4a6e",
        "subtleContrast": "#7dd3fc",
        "border": "#38bdf8"
      },
      "neutral": {
        "text": "#bcb5cf",
        "solid": "#bcb5cf",
        "solidContrast": "#201c19",
        "solidHover": "#e2dfef",
        "subtle": "#242331",
        "subtleContrast": "#bcb5cf",
        "border": "#898398"
      },
      "canvas": {
        "surface": "#191822",
        "surfaceAlt": "#242331",
        "border": "#403b54",
        "input": "#79718e",
        "ring": "#ed8342",
        "scrim": "rgb(25 24 34 / 0.7)",
        "foreground": "#f1effa",
        "muted": "#bcb5cf",
        "disabled": "#403b54",
        "rating": "#facc15",
        "ratingStroke": "#facc15"
      }
    },
    "spacing": {
      "0": "0px",
      "1": "0.25rem",
      "2": "0.5rem",
      "3": "0.75rem",
      "4": "1rem",
      "5": "1.25rem",
      "6": "1.5rem",
      "8": "2rem",
      "10": "2.5rem",
      "12": "3rem",
      "16": "4rem",
      "20": "5rem",
      "24": "6rem",
      "32": "8rem",
      "0.5": "0.125rem",
      "1.5": "0.375rem",
      "2.5": "0.625rem"
    },
    "radius": {
      "none": "0px",
      "sm": "0.375rem",
      "md": "0.75rem",
      "lg": "1.125rem",
      "xl": "1.5rem",
      "full": "9999px"
    },
    "fontFamily": {
      "sans": "\"Inter Variable\", \"Inter\", ui-sans-serif, system-ui, sans-serif",
      "mono": "\"JetBrains Mono\", ui-monospace, SFMono-Regular, monospace",
      "heading": "\"Playfair Display Variable\", \"Playfair Display\", Georgia, serif"
    },
    "fontSize": {
      "xs": "0.75rem",
      "sm": "0.875rem",
      "md": "1rem",
      "lg": "1.125rem",
      "xl": "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem"
    },
    "fontWeight": {
      "normal": "400",
      "medium": "500",
      "semibold": "600",
      "bold": "700"
    },
    "lineHeight": {
      "tight": "1.25",
      "normal": "1.5",
      "relaxed": "1.75"
    },
    "shadow": {
      "none": "none",
      "sm": "0 1px 2px 0 rgb(0 0 0 / 0.025)",
      "md": "0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
      "lg": "0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -4px rgb(0 0 0 / 0.05)",
      "xl": "0 20px 25px -5px rgb(0 0 0 / 0.05), 0 8px 10px -6px rgb(0 0 0 / 0.05)"
    },
    "zIndex": {
      "dropdown": 1100,
      "sticky": 1000,
      "drawer": 1200,
      "modal": 1300,
      "toast": 1400,
      "tooltip": 1500
    },
    "duration": {
      "fast": "210ms",
      "normal": "350ms",
      "slow": "490ms"
    },
    "easing": {
      "standard": "cubic-bezier(0, 0, 0.2, 1)",
      "decelerate": "cubic-bezier(0, 0, 0.2, 1)",
      "accelerate": "cubic-bezier(0.4, 0, 1, 1)"
    },
    "breakpoint": {
      "sm": "640px",
      "md": "768px",
      "lg": "1024px",
      "xl": "1280px",
      "2xl": "1536px"
    },
    "effects": {
      "shadow": "soft",
      "motion": "calm"
    }
  },
  "themes": {},
  "radiusDensity": "lg",
  "spacingDensity": "comfortable"
} as const;
