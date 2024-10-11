export default function (context) {
  // Ensure we are on client side
  if (process.client) {
    window.addEventListener('beforeunload', (event) => {
      event.preventDefault()
      event.returnValue = 'Realmente desea salir?'
    })
  }
}
