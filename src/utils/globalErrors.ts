export const registerGlobalErrors = () => {
  window.onerror = (message, source, lineno, colno, error) => {
    console.error("Global error:", error);
  };

  window.onunhandledrejection = (event) => {
    console.error("Unhandled promise:", event.reason);
  };
};
