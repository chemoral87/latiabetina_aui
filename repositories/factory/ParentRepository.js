let multipart = {
  accept: "application/json",
  headers: { "Content-Type": "multipart/form-data" }
};
export default $axios => resource => ({
  index(parent_id, params) {
    if (params) {
      return $axios.$get(`${resource}/${parent_id}`, { params: params });
    } else {
      return $axios.$get(`${resource}/${parent_id}`);
    }
  },

  show(parent_id, id) {
    return $axios.$get(`${resource}/${parent_id}/${id}`);
  },

  filter(parent_id, params, headers) {
    return $axios.$get(`${resource}/${parent_id}/filter`, {
      params: params,
      headers
    });
  },

  create(parent_id, payload) {
    return $axios.$post(`${resource}/${parent_id}`, payload);
  },

  createForm(parent_id, payload) {
    return $axios.$post(`${resource}/${parent_id}`, payload, multipart);
  },

  update(parent_id, id, payload) {
    return $axios.$put(`${resource}/${parent_id}/${id}`, payload);
  },

  updateForm(parent_id, id, payload) {
    return $axios.$post(`${resource}/${parent_id}/${id}`, payload, multipart);
  },

  delete(parent_id, id) {
    return $axios.$delete(`${resource}/${parent_id}/${id}`);
  }
});
