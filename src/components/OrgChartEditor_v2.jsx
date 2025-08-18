import React, { useState } from 'react';
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, TextField, Button, Grid, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { mockOrgChartData } from '../mock/data';

const OrgChartEditor_v2 = () => {
  const [formData, setFormData] = useState(JSON.parse(JSON.stringify(mockOrgChartData)));
  const [expandedSections, setExpandedSections] = useState({ director: true });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmCallback, setConfirmCallback] = useState(null);

  const toggleSection = (key) => {
    setExpandedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleConfirm = () => {
    if (confirmCallback) {
      confirmCallback();
    }
    setConfirmOpen(false);
  };

  const handleCancel = () => {
    setConfirmOpen(false);
  };

  const handleChange = (path, value) => {
    setFormData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev));
      let current = newData;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return newData;
    });
  };

  const updateField = (path, lang, value) => {
    setFormData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev));
      let current = newData;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]][lang] = value;
      return newData;
    });
  };

  const addOffice = () => {
    const newIndex = formData.offices.length;
    setFormData((prev) => ({
      ...prev,
      offices: [
        ...prev.offices,
        {
          officeName: { en: '', tc: '', sc: '' },
          deputies: [],
        },
      ],
    }));
    setExpandedSections((prev) => ({
      ...prev,
      [`office-${newIndex}`]: true, // Auto-expand new office
    }));
  };

  const removeOffice = (officeIndex) => {
    const office = formData.offices[officeIndex];
    const name = office.officeName.en || 'this office';
    setConfirmMessage(`Are you sure you want to remove the office: ${name}? This action cannot be undone.`);
    setConfirmCallback(() => () => {
      setFormData((prev) => ({
        ...prev,
        offices: prev.offices.filter((_, index) => index !== officeIndex),
      }));
      setExpandedSections((prev) => {
        const newExpanded = { ...prev };
        Object.keys(newExpanded).forEach((key) => {
          if (key.startsWith(`office-${officeIndex}`)) {
            delete newExpanded[key];
          }
        });
        return newExpanded;
      });
    });
    setConfirmOpen(true);
  };

  const addDeputy = (officeIndex) => {
    const newIndex = formData.offices[officeIndex].deputies.length;
    setFormData((prev) => {
      const newOffices = [...prev.offices];
      newOffices[officeIndex].deputies.push({
        branchTitle: { en: '', tc: '', sc: '' },
        personName: { en: '', tc: '', sc: '' },
        responsibilities: [],
        assistants: [],
      });
      return { ...prev, offices: newOffices };
    });
    setExpandedSections((prev) => ({
      ...prev,
      [`office-${officeIndex}-deputy-${newIndex}`]: true, // Auto-expand new deputy
    }));
  };

  const removeDeputy = (officeIndex, depIndex) => {
    const deputy = formData.offices[officeIndex].deputies[depIndex];
    const name = deputy.personName.en || 'this deputy director';
    setConfirmMessage(`Are you sure you want to remove the deputy director: ${name}? This action cannot be undone.`);
    setConfirmCallback(() => () => {
      setFormData((prev) => {
        const newOffices = [...prev.offices];
        newOffices[officeIndex].deputies = newOffices[officeIndex].deputies.filter((_, index) => index !== depIndex);
        return { ...prev, offices: newOffices };
      });
      setExpandedSections((prev) => {
        const newExpanded = { ...prev };
        Object.keys(newExpanded).forEach((key) => {
          if (key.startsWith(`office-${officeIndex}-deputy-${depIndex}`)) {
            delete newExpanded[key];
          }
        });
        return newExpanded;
      });
    });
    setConfirmOpen(true);
  };

  const addAssistant = (officeIndex, depIndex) => {
    const newIndex = formData.offices[officeIndex].deputies[depIndex].assistants.length;
    setFormData((prev) => {
      const newOffices = [...prev.offices];
      newOffices[officeIndex].deputies[depIndex].assistants.push({
        branchTitle: { en: '', tc: '', sc: '' },
        personName: { en: '', tc: '', sc: '' },
        responsibilities: [],
      });
      return { ...prev, offices: newOffices };
    });
    setExpandedSections((prev) => ({
      ...prev,
      [`office-${officeIndex}-deputy-${depIndex}-assistant-${newIndex}`]: true, // Auto-expand new assistant
    }));
  };

  const removeAssistant = (officeIndex, depIndex, assIndex) => {
    const assistant = formData.offices[officeIndex].deputies[depIndex].assistants[assIndex];
    const name = assistant.personName.en || 'this assistant director';
    setConfirmMessage(`Are you sure you want to remove the assistant director: ${name}? This action cannot be undone.`);
    setConfirmCallback(() => () => {
      setFormData((prev) => {
        const newOffices = [...prev.offices];
        newOffices[officeIndex].deputies[depIndex].assistants = newOffices[officeIndex].deputies[depIndex].assistants.filter((_, index) => index !== assIndex);
        return { ...prev, offices: newOffices };
      });
      setExpandedSections((prev) => {
        const newExpanded = { ...prev };
        Object.keys(newExpanded).forEach((key) => {
          if (key.startsWith(`office-${officeIndex}-deputy-${depIndex}-assistant-${assIndex}`)) {
            delete newExpanded[key];
          }
        });
        return newExpanded;
      });
    });
    setConfirmOpen(true);
  };

  const addResponsibility = (path, parentKey) => {
    setFormData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev));
      let current = newData;
      for (const key of path) {
        current = current[key];
      }
      current.push({ en: '', tc: '', sc: '' });
      return newData;
    });
    setExpandedSections((prev) => ({
      ...prev,
      [parentKey]: true, // Auto-expand the responsibilities section
    }));
  };

  const removeResponsibility = (path, respIndex) => {
    const newData = JSON.parse(JSON.stringify(formData));
    let current = newData;
    for (const key of path) {
      current = current[key];
    }
    const resp = current[respIndex];
    const desc = resp.en.substring(0, 50) + (resp.en.length > 50 ? '...' : '') || 'this responsibility';
    setConfirmMessage(`Are you sure you want to remove the responsibility: "${desc}"? This action cannot be undone.`);
    setConfirmCallback(() => () => {
      current.splice(respIndex, 1);
      setFormData(newData);
    });
    setConfirmOpen(true);
  };

  return (
    <Box sx={{ p: 2, backgroundColor: 'white', borderRadius: 2, boxShadow: 1, width: '100%' }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Edit Organisation Chart (Accordion Wizard)</Typography>
      <Typography variant="body2" sx={{ mb: 4 }}>
        Update names, titles and responsibilities in each language column. Changes update the diagram and text pages automatically.
      </Typography>

      <Grid container spacing={2} direction="row" sx={{ mb: 4 }}>
        <Grid size={12}>
          <TextField label="Revision Date" fullWidth value={formData.revisionDate} onChange={(e) => handleChange(['revisionDate'], e.target.value)} sx={{ '& .MuiInputBase-root': { height: '56px' } }} />
        </Grid>
      </Grid>

      <Accordion expanded={expandedSections['director'] ?? false} onChange={() => toggleSection('director')}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Director</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2} direction="row" sx={{ mb: 2 }}>
            <Grid size={4}>
              <TextField label="Name (EN)" fullWidth value={formData.director.name.en} onChange={(e) => updateField(['director', 'name'], 'en', e.target.value)} sx={{ '& .MuiInputBase-root': { height: '56px' } }} />
            </Grid>
            <Grid size={4}>
              <TextField label="Name (TC)" fullWidth value={formData.director.name.tc} onChange={(e) => updateField(['director', 'name'], 'tc', e.target.value)} sx={{ '& .MuiInputBase-root': { height: '56px' } }} />
            </Grid>
            <Grid size={4}>
              <TextField label="Name (SC)" fullWidth value={formData.director.name.sc} onChange={(e) => updateField(['director', 'name'], 'sc', e.target.value)} sx={{ '& .MuiInputBase-root': { height: '56px' } }} />
            </Grid>
          </Grid>
          <Grid container spacing={2} direction="row" sx={{ mb: 4 }}>
            <Grid size={4}>
              <TextField label="Title (EN)" fullWidth value={formData.director.title.en} onChange={(e) => updateField(['director', 'title'], 'en', e.target.value)} sx={{ '& .MuiInputBase-root': { height: '56px' } }} />
            </Grid>
            <Grid size={4}>
              <TextField label="Title (TC)" fullWidth value={formData.director.title.tc} onChange={(e) => updateField(['director', 'title'], 'tc', e.target.value)} sx={{ '& .MuiInputBase-root': { height: '56px' } }} />
            </Grid>
            <Grid size={4}>
              <TextField label="Title (SC)" fullWidth value={formData.director.title.sc} onChange={(e) => updateField(['director', 'title'], 'sc', e.target.value)} sx={{ '& .MuiInputBase-root': { height: '56px' } }} />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {formData.offices.map((office, officeIndex) => (
        <Accordion key={officeIndex} expanded={expandedSections[`office-${officeIndex}`] ?? false} onChange={() => toggleSection(`office-${officeIndex}`)}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <Typography variant="h6">Office {officeIndex + 1}: {office.officeName.en || 'Unnamed'}</Typography>
              <Button variant="text" color="error" startIcon={<RemoveIcon />} onClick={(e) => { e.stopPropagation(); removeOffice(officeIndex); }}>
                Remove Office
              </Button>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2} direction="row" sx={{ mb: 4 }}>
              <Grid size={4}>
                <TextField label="Office Name (EN)*" fullWidth value={office.officeName.en} onChange={(e) => updateField(['offices', officeIndex, 'officeName'], 'en', e.target.value)} sx={{ '& .MuiInputBase-root': { height: '56px' } }} />
              </Grid>
              <Grid size={4}>
                <TextField label="Office Name (TC)*" fullWidth value={office.officeName.tc} onChange={(e) => updateField(['offices', officeIndex, 'officeName'], 'tc', e.target.value)} sx={{ '& .MuiInputBase-root': { height: '56px' } }} />
              </Grid>
              <Grid size={4}>
                <TextField label="Office Name (SC)*" fullWidth value={office.officeName.sc} onChange={(e) => updateField(['offices', officeIndex, 'officeName'], 'sc', e.target.value)} sx={{ '& .MuiInputBase-root': { height: '56px' } }} />
              </Grid>
            </Grid>

            {office.deputies.map((deputy, depIndex) => (
              <Accordion key={depIndex} expanded={expandedSections[`office-${officeIndex}-deputy-${depIndex}`] ?? false} onChange={() => toggleSection(`office-${officeIndex}-deputy-${depIndex}`)} sx={{ ml: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <Typography variant="subtitle1">Deputy Director {depIndex + 1}: {deputy.personName.en || 'Unnamed'}</Typography>
                    <Button variant="text" color="error" startIcon={<RemoveIcon />} onClick={(e) => { e.stopPropagation(); removeDeputy(officeIndex, depIndex); }}>
                      Remove Deputy
                    </Button>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2} direction="row" sx={{ mb: 2 }}>
                    <Grid size={4}>
                      <TextField label="Branch Title (EN)*" fullWidth value={deputy.branchTitle.en} onChange={(e) => updateField(['offices', officeIndex, 'deputies', depIndex, 'branchTitle'], 'en', e.target.value)} sx={{ '& .MuiInputBase-root': { height: '56px' } }} />
                    </Grid>
                    <Grid size={4}>
                      <TextField label="Branch Title (TC)*" fullWidth value={deputy.branchTitle.tc} onChange={(e) => updateField(['offices', officeIndex, 'deputies', depIndex, 'branchTitle'], 'tc', e.target.value)} sx={{ '& .MuiInputBase-root': { height: '56px' } }} />
                    </Grid>
                    <Grid size={4}>
                      <TextField label="Branch Title (SC)*" fullWidth value={deputy.branchTitle.sc} onChange={(e) => updateField(['offices', officeIndex, 'deputies', depIndex, 'branchTitle'], 'sc', e.target.value)} sx={{ '& .MuiInputBase-root': { height: '56px' } }} />
                    </Grid>
                  </Grid>
                  <Grid container spacing={2} direction="row" sx={{ mb: 2 }}>
                    <Grid size={4}>
                      <TextField label="Person Name (EN)*" fullWidth value={deputy.personName.en} onChange={(e) => updateField(['offices', officeIndex, 'deputies', depIndex, 'personName'], 'en', e.target.value)} sx={{ '& .MuiInputBase-root': { height: '56px' } }} />
                    </Grid>
                    <Grid size={4}>
                      <TextField label="Person Name (TC)*" fullWidth value={deputy.personName.tc} onChange={(e) => updateField(['offices', officeIndex, 'deputies', depIndex, 'personName'], 'tc', e.target.value)} sx={{ '& .MuiInputBase-root': { height: '56px' } }} />
                    </Grid>
                    <Grid size={4}>
                      <TextField label="Person Name (SC)*" fullWidth value={deputy.personName.sc} onChange={(e) => updateField(['offices', officeIndex, 'deputies', depIndex, 'personName'], 'sc', e.target.value)} sx={{ '& .MuiInputBase-root': { height: '56px' } }} />
                    </Grid>
                  </Grid>

                  <Accordion expanded={expandedSections[`office-${officeIndex}-deputy-${depIndex}-resp`] ?? false} onChange={() => toggleSection(`office-${officeIndex}-deputy-${depIndex}-resp`)} sx={{ ml: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="body1">Responsibilities ({deputy.responsibilities.length} items)</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {deputy.responsibilities.map((resp, respIndex) => (
                        <Box key={respIndex} sx={{ mb: 2 }}>
                          <Grid container spacing={2} direction="row" alignItems="stretch" sx={{ mb: 1 }}>
                            <Grid size={4}>
                              <TextField multiline rows={5} fullWidth value={resp.en} onChange={(e) => updateField(['offices', officeIndex, 'deputies', depIndex, 'responsibilities', respIndex], 'en', e.target.value)} />
                            </Grid>
                            <Grid size={4}>
                              <TextField multiline rows={5} fullWidth value={resp.tc} onChange={(e) => updateField(['offices', officeIndex, 'deputies', depIndex, 'responsibilities', respIndex], 'tc', e.target.value)} />
                            </Grid>
                            <Grid size={4}>
                              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <TextField multiline rows={5} fullWidth value={resp.sc} onChange={(e) => updateField(['offices', officeIndex, 'deputies', depIndex, 'responsibilities', respIndex], 'sc', e.target.value)} sx={{ flex: 1 }} />
                                <Button variant="text" color="error" startIcon={<RemoveIcon />} onClick={() => removeResponsibility(['offices', officeIndex, 'deputies', depIndex, 'responsibilities'], respIndex)} sx={{ mt: 1 }}>
                                  Remove
                                </Button>
                              </Box>
                            </Grid>
                          </Grid>
                        </Box>
                      ))}
                      <Button startIcon={<AddIcon />} onClick={() => addResponsibility(['offices', officeIndex, 'deputies', depIndex, 'responsibilities'], `office-${officeIndex}-deputy-${depIndex}-resp`)} variant="outlined" sx={{ mt: 2 }}>
                        Add Responsibility
                      </Button>
                    </AccordionDetails>
                  </Accordion>

                  {deputy.assistants.map((assistant, assIndex) => (
                    <Accordion key={assIndex} expanded={expandedSections[`office-${officeIndex}-deputy-${depIndex}-assistant-${assIndex}`] ?? false} onChange={() => toggleSection(`office-${officeIndex}-deputy-${depIndex}-assistant-${assIndex}`)} sx={{ ml: 4 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                          <Typography variant="subtitle2">Assistant Director {assIndex + 1}: {assistant.personName.en || 'Unnamed'}</Typography>
                          <Button variant="text" color="error" startIcon={<RemoveIcon />} onClick={(e) => { e.stopPropagation(); removeAssistant(officeIndex, depIndex, assIndex); }}>
                            Remove Assistant
                          </Button>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={2} direction="row" sx={{ mb: 2 }}>
                          <Grid size={4}>
                            <TextField label="Branch Title (EN)*" fullWidth value={assistant.branchTitle.en} onChange={(e) => updateField(['offices', officeIndex, 'deputies', depIndex, 'assistants', assIndex, 'branchTitle'], 'en', e.target.value)} sx={{ '& .MuiInputBase-root': { height: '56px' } }} />
                          </Grid>
                          <Grid size={4}>
                            <TextField label="Branch Title (TC)*" fullWidth value={assistant.branchTitle.tc} onChange={(e) => updateField(['offices', officeIndex, 'deputies', depIndex, 'assistants', assIndex, 'branchTitle'], 'tc', e.target.value)} sx={{ '& .MuiInputBase-root': { height: '56px' } }} />
                          </Grid>
                          <Grid size={4}>
                            <TextField label="Branch Title (SC)*" fullWidth value={assistant.branchTitle.sc} onChange={(e) => updateField(['offices', officeIndex, 'deputies', depIndex, 'assistants', assIndex, 'branchTitle'], 'sc', e.target.value)} sx={{ '& .MuiInputBase-root': { height: '56px' } }} />
                          </Grid>
                        </Grid>
                        <Grid container spacing={2} direction="row" sx={{ mb: 2 }}>
                          <Grid size={4}>
                            <TextField label="Person Name (EN)*" fullWidth value={assistant.personName.en} onChange={(e) => updateField(['offices', officeIndex, 'deputies', depIndex, 'assistants', assIndex, 'personName'], 'en', e.target.value)} sx={{ '& .MuiInputBase-root': { height: '56px' } }} />
                          </Grid>
                          <Grid size={4}>
                            <TextField label="Person Name (TC)*" fullWidth value={assistant.personName.tc} onChange={(e) => updateField(['offices', officeIndex, 'deputies', depIndex, 'assistants', assIndex, 'personName'], 'tc', e.target.value)} sx={{ '& .MuiInputBase-root': { height: '56px' } }} />
                          </Grid>
                          <Grid size={4}>
                            <TextField label="Person Name (SC)*" fullWidth value={assistant.personName.sc} onChange={(e) => updateField(['offices', officeIndex, 'deputies', depIndex, 'assistants', assIndex, 'personName'], 'sc', e.target.value)} sx={{ '& .MuiInputBase-root': { height: '56px' } }} />
                          </Grid>
                        </Grid>

                        <Accordion expanded={expandedSections[`office-${officeIndex}-deputy-${depIndex}-assistant-${assIndex}-resp`] ?? false} onChange={() => toggleSection(`office-${officeIndex}-deputy-${depIndex}-assistant-${assIndex}-resp`)} sx={{ ml: 2 }}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="body1">Responsibilities ({assistant.responsibilities.length} items)</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            {assistant.responsibilities.map((resp, respIndex) => (
                              <Box key={respIndex} sx={{ mb: 2 }}>
                                <Grid container spacing={2} direction="row" alignItems="stretch" sx={{ mb: 1 }}>
                                  <Grid size={4}>
                                    <TextField multiline rows={5} fullWidth value={resp.en} onChange={(e) => updateField(['offices', officeIndex, 'deputies', depIndex, 'assistants', assIndex, 'responsibilities', respIndex], 'en', e.target.value)} />
                                  </Grid>
                                  <Grid size={4}>
                                    <TextField multiline rows={5} fullWidth value={resp.tc} onChange={(e) => updateField(['offices', officeIndex, 'deputies', depIndex, 'assistants', assIndex, 'responsibilities', respIndex], 'tc', e.target.value)} />
                                  </Grid>
                                  <Grid size={4}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                      <TextField multiline rows={5} fullWidth value={resp.sc} onChange={(e) => updateField(['offices', officeIndex, 'deputies', depIndex, 'assistants', assIndex, 'responsibilities', respIndex], 'sc', e.target.value)} sx={{ flex: 1 }} />
                                      <Button variant="text" color="error" startIcon={<RemoveIcon />} onClick={() => removeResponsibility(['offices', officeIndex, 'deputies', depIndex, 'assistants', assIndex, 'responsibilities'], respIndex)} sx={{ mt: 1 }}>
                                        Remove
                                      </Button>
                                    </Box>
                                  </Grid>
                                </Grid>
                              </Box>
                            ))}
                            <Button startIcon={<AddIcon />} onClick={() => addResponsibility(['offices', officeIndex, 'deputies', depIndex, 'assistants', assIndex, 'responsibilities'], `office-${officeIndex}-deputy-${depIndex}-assistant-${assIndex}-resp`)} variant="outlined" sx={{ mt: 2 }}>
                              Add Responsibility
                            </Button>
                          </AccordionDetails>
                        </Accordion>
                      </AccordionDetails>
                    </Accordion>
                  ))}

                  <Button startIcon={<AddIcon />} onClick={() => addAssistant(officeIndex, depIndex)} variant="outlined" sx={{ mt: 2, ml: 4 }}>
                    Add Assistant Director
                  </Button>
                </AccordionDetails>
              </Accordion>
            ))}

            <Button startIcon={<AddIcon />} onClick={() => addDeputy(officeIndex)} variant="outlined" sx={{ mt: 2 }}>
              Add Deputy Director
            </Button>
          </AccordionDetails>
        </Accordion>
      ))}

      <Button startIcon={<AddIcon />} onClick={addOffice} variant="outlined" sx={{ mt: 4 }}>
        Add Office
      </Button>

      <Dialog open={confirmOpen} onClose={handleCancel}>
        <DialogTitle>Confirm Removal</DialogTitle>
        <DialogContent>
          <DialogContentText>{confirmMessage}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleConfirm} color="error">Confirm</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrgChartEditor_v2;