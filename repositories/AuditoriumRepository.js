import CommonRepository from "./factory/CommonRepository"

export default ($axios) => ({
  ...CommonRepository($axios)("/auditorium"),
})
