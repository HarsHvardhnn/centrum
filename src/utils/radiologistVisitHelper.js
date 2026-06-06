/** Fixed visit / consultation type for radiologist specialty appointments. */

export const RADIOLOGIST_VISIT_TYPE_LABEL = "Badanie USG";



const normalizeToken = (value) =>

  String(value ?? "")

    .trim()

    .toLowerCase()

    .normalize("NFD")

    .replace(/[\u0300-\u036f]/g, "");



/** True when specialization name/key indicates radiologist (e.g. RADIOLOGIST, Radiologia). */

export const isRadiologistSpecializationName = (name) => {

  const n = normalizeToken(name);

  if (!n) return false;

  return (

    n === "radiologist" ||

    n === "radiolog" ||

    n === "radiologia" ||

    n.includes("radiolog")

  );

};



const pushSpecLabel = (names, value) => {

  if (value == null) return;

  if (Array.isArray(value)) {

    value.forEach((item) => pushSpecLabel(names, item));

    return;

  }

  if (typeof value === "string") {

    names.push(value);

    return;

  }

  if (typeof value === "object") {

    if (value.name) names.push(value.name);

    if (value.key) names.push(value.key);

    if (value.slug) names.push(value.slug);

    if (value.title) names.push(value.title);

  }

};



const collectSpecializationNames = (doctorOrEntity) => {

  if (!doctorOrEntity || typeof doctorOrEntity !== "object") return [];

  const names = [];



  pushSpecLabel(names, doctorOrEntity.specialty);

  pushSpecLabel(names, doctorOrEntity.specialization);

  pushSpecLabel(names, doctorOrEntity.specializations);

  pushSpecLabel(names, doctorOrEntity.department);



  const doctor = doctorOrEntity.doctor ?? doctorOrEntity.doctorId;

  if (doctor && typeof doctor === "object" && doctor !== doctorOrEntity) {

    names.push(...collectSpecializationNames(doctor));

  }



  return names;

};



const collectSpecializationIds = (entity) => {

  if (!entity || typeof entity !== "object") return [];

  const ids = [];

  const pushId = (v) => {

    if (v == null) return;

    if (Array.isArray(v)) v.forEach(pushId);

    else if (typeof v === "string" || typeof v === "number") ids.push(String(v));

    else if (typeof v === "object") {

      const id = v._id ?? v.id;

      if (id != null) ids.push(String(id));

    }

  };

  pushId(entity.specializationId);

  pushId(entity.specialization);

  pushId(entity.specializations);

  const doctor = entity.doctor ?? entity.doctorId;

  if (doctor && typeof doctor === "object" && doctor !== entity) {

    ids.push(...collectSpecializationIds(doctor));

  }

  return ids;

};



/** True when the doctor (or appointment's doctor) has radiologist specialty. */

export const isRadiologistDoctor = (doctorOrAppointment, specializationsList) => {

  if (!doctorOrAppointment) return false;

  if (collectSpecializationNames(doctorOrAppointment).some(isRadiologistSpecializationName)) {

    return true;

  }

  if (specializationsList?.length) {

    return collectSpecializationIds(doctorOrAppointment).some((id) =>

      isRadiologistSpecializationId(id, specializationsList)

    );

  }

  return false;

};



/** True when appointment is tied to a radiologist (by doctor specialty). */

export const isRadiologistAppointment = (appointment, specializationsList) => {

  if (!appointment) return false;

  return isRadiologistDoctor(appointment, specializationsList);

};



/** Lookup specialization record by id and check if radiologist. */

export const isRadiologistSpecializationId = (specializationId, specializationsList = []) => {

  if (!specializationId) return false;

  const id = String(specializationId);

  const spec = (specializationsList || []).find(

    (s) => String(s._id ?? s.id) === id

  );

  return spec ? isRadiologistSpecializationName(spec.name) : false;

};



/** Fields to send when creating/updating a radiologist appointment. */

export const getRadiologistVisitTypeFields = () => ({

  visitType: RADIOLOGIST_VISIT_TYPE_LABEL,

  visitReason: RADIOLOGIST_VISIT_TYPE_LABEL,

  consultationType: RADIOLOGIST_VISIT_TYPE_LABEL,

});

