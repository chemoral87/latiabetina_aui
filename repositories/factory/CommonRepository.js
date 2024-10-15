let multipart = {
  accept: "application/json",
  headers: { "Content-Type": "multipart/form-data" }
};
export default $axios => resource => ({
  index(params) {
    if (params) {
      return $axios.$get(`${resource}`, { params: params });
    } else {
      return $axios.$get(`${resource}`);
    }
  },

  initialCatalog(params = {}) {
    return $axios.$get(`${resource}/initialCatalog`, { params: params });
  },

  show(id) {
    return $axios.$get(`${resource}/${id}`);
  },

  filter(params, headers) {
    return $axios.$get(`${resource}/filter`, {
      params: params,
      headers
    });
  },

  create(payload) {
    return $axios.$post(`${resource}`, payload);
  },

  createForm(payload) {
    return $axios.$post(`${resource}`, payload, multipart);
  },

  update(id, payload) {
    return $axios.$put(`${resource}/${id}`, payload);
  },

  updateForm(id, payload) {
    return $axios.$post(`${resource}/${id}`, payload, multipart);
  },

  // belongsToMany
  children(id, payload) {
    return $axios.$put(`${resource}/${id}/children`, payload);
  },

  delete(id) {
    return $axios.$delete(`${resource}/${id}`);
  },
  change(payload) {
    return $axios.$post(`${resource}/change`, payload);
  },
  generate() {
    return $axios.$post(`${resource}/generate`);
  },
  fetch(params = {}) {
    return $axios.$get(`${resource}/fetch`, { params: params });
  }
});
