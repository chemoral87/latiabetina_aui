export default (context, inject) => {
  // Only run on client side
  if (process.client) {
    const getDeviceInfo = () => {
      if (typeof window !== "undefined" && typeof window.UAParser !== "undefined") {
        const parser = new window.UAParser()
        return parser.getResult()
      }
      return null
    }

    const isIOS = () => {
      const result = getDeviceInfo()
      return result ? result.os.name === "iOS" : false
    }

    const isAndroid = () => {
      const result = getDeviceInfo()
      return result ? result.os.name === "Android" : false
    }

    const isMobile = () => {
      const result = getDeviceInfo()
      return result ? result.device.type === "mobile" : false
    }

    const isTablet = () => {
      const result = getDeviceInfo()
      return result ? result.device.type === "tablet" : false
    }

    const device = () => {
      const result = getDeviceInfo()
      return result ? result.device : {}
    }

    // Inject functions into Vue, context, and store
    inject("uaParser", {
      getDeviceInfo,
      isIOS,
      isAndroid,
      isMobile,
      isTablet,
      device,
    })
  }
}
