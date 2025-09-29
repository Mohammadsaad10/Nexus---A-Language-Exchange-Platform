import React from 'react'
import { useThemeStore } from '../store/useThemeStore'
import { PaletteIcon } from 'lucide-react';
import { THEMES } from '../constants/constants';

const ThemeSelector = () => {
  const { theme, setTheme } = useThemeStore();
  return (
    <div className="dropdown dropdown-end"> {/* dropdown-end makes the dropdown appear on the bottom side of the trigger */}
     {/* DROPDOWN TRIGGER */}
      <button tabIndex={0} className="btn btn-ghost btn-circle">{/*tabIndex{0} makes the button focusable for keyboard navigation*/}
        <PaletteIcon className="size-5" />
      </button>

      <div
        //  makes the element focusable for keyboard navigation
        tabIndex={0}
        className="dropdown-content mt-2 p-1 shadow-2xl bg-base-200 backdrop-blur-lg rounded-2xl
        w-56 border border-base-content/10 max-h-80 overflow-y-auto"
      >
        <div className="space-y-1"> {/* space-y-1 adds vertical spacing between the buttons */}
          {THEMES.map((themeOption) => (
            <button
              key={themeOption.name}
              className={`
              w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-colors
              ${
                theme === themeOption.name    /* if the theme is the same as the theme option name, then same theme is applied to the button (in theme selector) */
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-base-content/5"
              }
            `}
              onClick={() => setTheme(themeOption.name)}
            >
              <PaletteIcon className="size-4" />
              <span className="text-sm font-medium">{themeOption.label}</span>
              {/* THEME PREVIEW COLORS */}
              <div className="ml-auto flex gap-1">
                {themeOption.colors.map((color, i) => (
                  <span
                    key={i}
                    className="size-2 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </button>
          ))}
        </div> 

      </div>

    </div>
  )
}

export default ThemeSelector