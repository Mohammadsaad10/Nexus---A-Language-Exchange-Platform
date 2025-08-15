import { create } from 'zustand'
//zustnad store for theme management

export const useThemeStore = create((set) => ({
  theme : localStorage.getItem("Nexus-theme") || 'coffee', //check if there is a theme in local storage, if not set to 'coffee' as default theme.
  setTheme : (theme) => {
    localStorage.setItem("Nexus-theme",theme); //save theme to local storage
    set({ theme});
  },
}
));

//when website first loads, it will check for the theme in local storage, there will no theme in local storage, so it will set it to 'coffee' as default theme.
//when user changes the theme, it will save the theme to local storage and update the state.
//so when user refreshes the page, it will get the theme from local storage and set it to the state.
//this way the theme will persist even after page refresh.