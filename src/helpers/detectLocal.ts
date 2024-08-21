const detectLocal = (): Boolean => {
  return location.hostname === "localhost" || location.hostname === "127.0.0.1"
}

export default detectLocal;