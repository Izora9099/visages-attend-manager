import type { Config } from "tailwindcss";

// FACE.IT tokens live in src/index.css as hex custom properties. Wrapping them in
// color-mix() lets Tailwind's opacity modifiers work (bg-primary/10, ring-signal/40).
const token = (name: string) =>
  `color-mix(in srgb, var(--${name}) calc(<alpha-value> * 100%), transparent)`;

export default {
  darkMode: ["variant", ["&:is(.dark *)", '&:is([data-theme="dark"] *)']],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans"', "system-ui", "-apple-system", '"Segoe UI"', "sans-serif"],
        display: ["Archivo", '"IBM Plex Sans"', "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", '"SFMono-Regular"', "monospace"],
      },
      colors: {
        // FACE.IT names
        paper: token("paper"),
        surface: {
          DEFAULT: token("surface"),
          sunken: token("surface-sunken"),
          2: token("surface-sunken"), // legacy alias
        },
        hairline: token("hairline"),
        line: token("line"),
        ink: {
          DEFAULT: token("ink"),
          muted: token("ink-muted"),
        },
        signal: {
          DEFAULT: token("signal"),
          soft: token("signal-soft"),
          strong: token("signal-strong"),
        },
        navy: token("navy"),
        scan: {
          DEFAULT: token("scan"),
          pale: token("scan-pale"),
        },
        present: { DEFAULT: token("present"), soft: token("present-soft") },
        late: { DEFAULT: token("late"), soft: token("late-soft") },
        absent: { DEFAULT: token("absent"), soft: token("absent-soft") },
        excused: { DEFAULT: token("excused"), soft: token("excused-soft") },
        rail: {
          DEFAULT: token("rail"),
          active: token("rail-active"),
          hairline: token("rail-hairline"),
          ink: token("rail-ink"),
          muted: token("rail-muted"),
        },
        chart: {
          1: token("chart-1"),
          2: token("chart-2"),
          3: token("chart-3"),
          other: token("chart-other"),
          grid: token("chart-grid"),
          axis: token("chart-axis"),
        },
        seq: {
          1: token("seq-1"),
          2: token("seq-2"),
          3: token("seq-3"),
          4: token("seq-4"),
          5: token("seq-5"),
        },
        focus: token("focus"),

        // shadcn/ui semantic names, aliased onto FACE.IT tokens in index.css
        border: token("border"),
        input: token("input"),
        ring: token("ring"),
        background: token("background"),
        foreground: token("foreground"),
        primary: {
          DEFAULT: token("primary"),
          hover: token("primary-hover"),
          foreground: token("primary-foreground"),
        },
        secondary: {
          DEFAULT: token("secondary"),
          foreground: token("secondary-foreground"),
        },
        destructive: {
          DEFAULT: token("destructive"),
          foreground: token("destructive-foreground"),
        },
        muted: {
          DEFAULT: token("muted"),
          foreground: token("muted-foreground"),
        },
        accent: {
          DEFAULT: token("accent"),
          foreground: token("accent-foreground"),
          soft: token("signal-soft"), // legacy alias
        },
        success: token("success"),
        warning: token("warning"),
        popover: {
          DEFAULT: token("popover"),
          foreground: token("popover-foreground"),
        },
        card: {
          DEFAULT: token("card"),
          foreground: token("card-foreground"),
        },
        sidebar: {
          DEFAULT: token("sidebar-background"),
          foreground: token("sidebar-foreground"),
          primary: token("sidebar-primary"),
          "primary-foreground": token("sidebar-primary-foreground"),
          accent: token("sidebar-accent"),
          "accent-foreground": token("sidebar-accent-foreground"),
          border: token("sidebar-border"),
          ring: token("sidebar-ring"),
        },
      },
      borderRadius: {
        xs: "var(--radius-xs)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
      height: {
        "control-sm": "var(--control-sm)",
        "control-md": "var(--control-md)",
        "control-lg": "var(--control-lg)",
        header: "var(--header-height)",
      },
      width: {
        rail: "var(--rail-width)",
        "rail-collapsed": "var(--rail-collapsed)",
      },
      spacing: {
        rail: "var(--rail-width)",
        "rail-collapsed": "var(--rail-collapsed)",
      },
      maxWidth: {
        content: "var(--content-max)",
        prose: "640px",
      },
      transitionDuration: {
        120: "120ms",
      },
      transitionTimingFunction: {
        DEFAULT: "cubic-bezier(0, 0, 0.2, 1)",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        "fade-up": { "0%": { opacity: "0", transform: "translateY(4px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        "scale-in": { "0%": { opacity: "0", transform: "scale(0.98)" }, "100%": { opacity: "1", transform: "scale(1)" } },
        shimmer: { "100%": { transform: "translateX(100%)" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "fade-up": "fade-up 0.25s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        shimmer: "shimmer 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
