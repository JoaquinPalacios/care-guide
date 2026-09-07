export function marketingMotionBootstrapScript(): string {
  return `(function(){try{var m=window.matchMedia("(prefers-reduced-motion: reduce)");document.documentElement.setAttribute("data-mk-motion",m.matches?"reduce":"enhance");}catch(e){}})();`;
}
