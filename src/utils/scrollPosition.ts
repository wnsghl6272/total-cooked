const SCROLL_KEY = 'recipe-search-scroll';

export const saveScrollPosition = () => {
  sessionStorage.setItem(SCROLL_KEY, window.scrollY.toString());
};

export const restoreScrollPosition = () => {
  const savedPosition = sessionStorage.getItem(SCROLL_KEY);
  if (savedPosition !== null) {
    window.scrollTo(0, parseInt(savedPosition));
    sessionStorage.removeItem(SCROLL_KEY);
  }
}; 