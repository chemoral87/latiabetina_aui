const multipart = {
  accept: "application/json",
  headers: { "Content-Type": "multipart/form-data" }
};
export default $axios => resource => ({
  index(parentId, params) {
    if (params) {
      return $axios.$get(`${resource}/${parentId}`, { params });
    } else {
      return $axios.$get(`${resource}/${parentId}`);
    }
  },

  show(parentId, id) {
    return $axios.$get(`${resource}/${parentId}/${id}`);
  },

  filter(parentId, params, headers) {
    return $axios.$get(`${resource}/${parentId}/filter`, {
      params,
      headers
    });
  },

  create(parentId, payload) {
    return $axios.$post(`${resource}/${parentId}`, payload);
  },

  createForm(parentId, payload) {
    return $axios.$post(`${resource}/${parentId}`, payload, multipart);
  },

  update(parentId, id, payload) {
    return $axios.$put(`${resource}/${parentId}/${id}`, payload);
  },

  updateForm(parentId, id, payload) {
    return $axios.$post(`${resource}/${parentId}/${id}`, payload, multipart);
  },

  delete(parentId, id) {
    return $axios.$delete(`${resource}/${parentId}/${id}`);
  }
});
