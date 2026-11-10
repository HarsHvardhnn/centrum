// The cell chosen in the issue window's summary bar. The e-prescription, e-referral and e-ZLA windows read it
// when they build the document, so the chosen cell travels with the request.
let current = "";

export const getIssueCellId = () => current;
export const setIssueCellId = (id) => {
  current = id || "";
};
