// Register service worker for PWA support on Chrome/Android
export default () => {
  if (process.client && "serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      // navigator.serviceWorker.register("/sw.js").then(
      //   // (registration) => {},
      //   // (err) => {}
      // )
    })
  }
}
