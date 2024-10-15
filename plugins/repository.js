// https://codesandbox.io/s/github/manniL/nuxt-decouple-and-organize-api-calls?file=/plugins/repository.js:0-446
// https://blog.lichter.io/posts/nuxt-api-call-organization-and-decoupling/
// import createRepository from "@/api/repository";
import factoryRepository from '~/repositories/factory/FactoryRepository'
export default (ctx, inject) => {
  // inject the repository in the context (ctx.app.$repository)
  // And in the Vue instances (this.$repository in your components)

  inject('repository', factoryRepository(ctx.$axios))
  // You can reuse the repositoryWithAxios object:
  // inject("userRepository", repositoryWithAxios('/users'));
}
