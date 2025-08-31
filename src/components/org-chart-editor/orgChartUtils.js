export const findNodeById = (id, formData) => {
  if (id === 'director') return { path: ['director'], data: formData.director };

  const [, officeIndexStr, depIndexStr, assIndexStr] = id.split('-');
  const officeIndex = parseInt(officeIndexStr, 10);

  if (!depIndexStr) return { path: ['offices', officeIndex], data: formData.offices[officeIndex] };

  const depIndex = parseInt(depIndexStr, 10);
  if (!assIndexStr) return { path: ['offices', officeIndex, 'deputies', depIndex], data: formData.offices[officeIndex].deputies[depIndex] };

  const assIndex = parseInt(assIndexStr, 10);
  return { path: ['offices', officeIndex, 'deputies', depIndex, 'assistants', assIndex], data: formData.offices[officeIndex].deputies[depIndex].assistants[assIndex] };
};

export const handleChange = (formData, setFormData, path, field, lang, value) => {
  setFormData((prev) => {
    const newData = JSON.parse(JSON.stringify(prev));
    let current = newData;
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    current[path[path.length - 1]][field][lang] = value;
    return newData;
  });
};

export const addNode = (formData, setFormData, setSelectedNodeId, level, parentPath) => {
  setFormData((prev) => {
    const newData = JSON.parse(JSON.stringify(prev));
    let current = newData;
    for (const key of parentPath) {
      current = current[key];
    }
    const newIndex = current.length;
    if (level === 'office') {
      current.push({ officeName: { en: '', tc: '', sc: '' }, deputies: [] });
      setSelectedNodeId(`office-${newIndex}`);
    } else if (level === 'deputy') {
      const officeIndex = parentPath[1];
      current.push({ title: { en: '', tc: '', sc: '' }, name: { en: '', tc: '', sc: '' }, responsibilities: [], assistants: [] });
      setSelectedNodeId(`deputy-${officeIndex}-${newIndex}`);
    } else if (level === 'assistant') {
      const officeIndex = parentPath[1];
      const depIndex = parentPath[3];
      current.push({ title: { en: '', tc: '', sc: '' }, name: { en: '', tc: '', sc: '' }, responsibilities: [] });
      setSelectedNodeId(`assistant-${officeIndex}-${depIndex}-${newIndex}`);
    }
    return newData;
  });
};

export const removeNode = (formData, setFormData, setSelectedNodeId, path) => {
  setFormData((prev) => {
    const newData = JSON.parse(JSON.stringify(prev));
    let current = newData;
    for (let i = 0; i < path.length - 2; i++) {
      current = current[path[i]];
    }
    const arrayKey = path[path.length - 2];
    const index = path[path.length - 1];
    current[arrayKey].splice(index, 1);
    return newData;
  });
  setSelectedNodeId('director');
};

export const moveNodeUp = (formData, setFormData, setSelectedNodeId, path) => {
  const index = path[path.length - 1];
  if (index <= 0) return;
  setFormData((prev) => {
    const newData = JSON.parse(JSON.stringify(prev));
    let current = newData;
    for (const key of path.slice(0, -1)) {
      current = current[key];
    }
    const temp = current[index - 1];
    current[index - 1] = current[index];
    current[index] = temp;
    return newData;
  });
  const newIndex = index - 1;
  let newId = getNewId(path, newIndex);
  setSelectedNodeId(newId);
};

export const moveNodeDown = (formData, setFormData, setSelectedNodeId, path) => {
  const index = path[path.length - 1];
  let parent = formData;
  for (const key of path.slice(0, -1)) {
    parent = parent[key];
  }
  if (index >= parent.length - 1) return;
  setFormData((prev) => {
    const newData = JSON.parse(JSON.stringify(prev));
    let current = newData;
    for (const key of path.slice(0, -1)) {
      current = current[key];
    }
    const temp = current[index + 1];
    current[index + 1] = current[index];
    current[index] = temp;
    return newData;
  });
  const newIndex = index + 1;
  let newId = getNewId(path, newIndex);
  setSelectedNodeId(newId);
};

const getNewId = (path, newIndex) => {
  if (path.length === 2) return `office-${newIndex}`;
  if (path.length === 4) return `deputy-${path[1]}-${newIndex}`;
  if (path.length === 6) return `assistant-${path[1]}-${path[3]}-${newIndex}`;
  return 'director';
};