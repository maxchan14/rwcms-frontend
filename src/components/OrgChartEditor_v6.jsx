import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Grid, Divider } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { mockOrgChartData } from '../mock/data';

const OrgChartEditor_v6 = () => {
  const [formData, setFormData] = useState(JSON.parse(JSON.stringify(mockOrgChartData)));
  const [expandedSections, setExpandedSections] = useState({});
  const toggleSection = (key) => {
    setExpandedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmCallback, setConfirmCallback] = useState(null);

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

  // Move functions for all levels
  const moveOffice = (officeIndex, direction) => {
    setFormData((prev) => {
      const newOffices = [...prev.offices];
      const [moved] = newOffices.splice(officeIndex, 1);
      newOffices.splice(officeIndex + direction, 0, moved);
      return { ...prev, offices: newOffices };
    });
  };

  const moveDeputy = (officeIndex, depIndex, direction) => {
    setFormData((prev) => {
      const newOffices = [...prev.offices];
      const newDeputies = [...newOffices[officeIndex].deputies];
      const [moved] = newDeputies.splice(depIndex, 1);
      newDeputies.splice(depIndex + direction, 0, moved);
      newOffices[officeIndex].deputies = newDeputies;
      return { ...prev, offices: newOffices };
    });
  };

  const moveAssistant = (officeIndex, depIndex, assIndex, direction) => {
    setFormData((prev) => {
      const newOffices = [...prev.offices];
      const newAssistants = [...newOffices[officeIndex].deputies[depIndex].assistants];
      const [moved] = newAssistants.splice(assIndex, 1);
      newAssistants.splice(assIndex + direction, 0, moved);
      newOffices[officeIndex].deputies[depIndex].assistants = newAssistants;
      return { ...prev, offices: newOffices };
    });
  };

  const moveResponsibility = (path, respIndex, direction) => {
    setFormData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev));
      let current = newData;
      for (const key of path) {
        current = current[key];
      }
      const [moved] = current.splice(respIndex, 1);
      current.splice(respIndex + direction, 0, moved);
      return newData;
    });
  };

  const addOffice = (insertIndex) => {
    setFormData((prev) => {
      const newOffices = [...prev.offices];
      newOffices.splice(insertIndex + 1, 0, {
        officeName: { en: '', tc: '', sc: '' },
        deputies: [],
      });
      return { ...prev, offices: newOffices };
    });
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
          if (key.startsWith(`${officeIndex}-`)) {
            delete newExpanded[key];
          }
        });
        return newExpanded;
      });
    });
    setConfirmOpen(true);
  };

  const addDeputy = (officeIndex, insertIndex) => {
    setFormData((prev) => {
      const newOffices = [...prev.offices];
      const newDeputies = [...newOffices[officeIndex].deputies];
      newDeputies.splice(insertIndex + 1, 0, {
        branchTitle: { en: '', tc: '', sc: '' },
        personName: { en: '', tc: '', sc: '' },
        responsibilities: [],
        assistants: [],
      });
      newOffices[officeIndex].deputies = newDeputies;
      return { ...prev, offices: newOffices };
    });
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
          if (key.startsWith(`${officeIndex}-${depIndex}-`)) {
            delete newExpanded[key];
          }
        });
        return newExpanded;
      });
    });
    setConfirmOpen(true);
  };

  const addAssistant = (officeIndex, depIndex, insertIndex) => {
    setFormData((prev) => {
      const newOffices = [...prev.offices];
      const newAssistants = [...newOffices[officeIndex].deputies[depIndex].assistants];
      newAssistants.splice(insertIndex + 1, 0, {
        branchTitle: { en: '', tc: '', sc: '' },
        personName: { en: '', tc: '', sc: '' },
        responsibilities: [],
      });
      newOffices[officeIndex].deputies[depIndex].assistants = newAssistants;
      return { ...prev, offices: newOffices };
    });
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
        delete newExpanded[`${officeIndex}-${depIndex}-${assIndex}-resp`];
        return newExpanded;
      });
    });
    setConfirmOpen(true);
  };

  const addResponsibility = (path, insertIndex) => {
    setFormData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev));
      let current = newData;
      for (const key of path) {
        current = current[key];
      }
      current.splice(insertIndex + 1, 0, { en: '', tc: '', sc: '' });
      return newData;
    });
  };

  const removeResponsibility = (path, respIndex) => {
    let currentResp;
    setFormData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev));
      let current = newData;
      for (const key of path) {
        current = current[key];
      }
      currentResp = current[respIndex];
      return newData; // Capture for confirm
    });
    const desc = currentResp.en.substring(0, 50) + (currentResp.en.length > 50 ? '...' : '') || 'this responsibility';
    setConfirmMessage(`Are you sure you want to remove the responsibility: "${desc}"? This action cannot be undone.`);
    setConfirmCallback(() => () => {
      setFormData((prev) => {
        const newData = JSON.parse(JSON.stringify(prev));
        let current = newData;
        for (const key of path) {
          current = current[key];
        }
        current.splice(respIndex, 1);
        return newData;
      });
    });
    setConfirmOpen(true);
  };

  const renderButtons = (isFirst, isLast, onAdd, onRemove, onUp, onDown) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
      <Tooltip title="Add new below"><IconButton onClick={onAdd} size="small"><AddIcon /></IconButton></Tooltip>
      <Tooltip title="Remove"><IconButton onClick={onRemove} size="small" color="error"><RemoveIcon /></IconButton></Tooltip>
      <Tooltip title="Move up"><IconButton onClick={onUp} disabled={isFirst} size="small"><ArrowUpwardIcon /></IconButton></Tooltip>
      <Tooltip title="Move down"><IconButton onClick={onDown} disabled={isLast} size="small"><ArrowDownwardIcon /></IconButton></Tooltip>
    </Box>
  );

  return (
    <Box sx={{ p: 2, backgroundColor: 'white', borderRadius: 2, boxShadow: 1, width: '100%' }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Edit Organisation Chart</Typography>
      <Typography variant="body2" sx={{ mb: 4 }}>
        Update names, titles and responsibilities in each language column. Changes update the diagram and text pages automatically.
      </Typography>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={12}>
          <TextField label="Revision Date" fullWidth value={formData.revisionDate} onChange={(e) => handleChange(['revisionDate'], e.target.value)} />
        </Grid>
      </Grid>

      <Typography variant="h6" sx={{ mb: 2 }}>Director</Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={4}>
          <TextField label="Name (EN)" fullWidth value={formData.director.name.en} onChange={(e) => handleChange(['director', 'name', 'en'], e.target.value)} />
        </Grid>
        <Grid size={4}>
          <TextField label="Name (TC)" fullWidth value={formData.director.name.tc} onChange={(e) => handleChange(['director', 'name', 'tc'], e.target.value)} />
        </Grid>
        <Grid size={4}>
          <TextField label="Name (SC)" fullWidth value={formData.director.name.sc} onChange={(e) => handleChange(['director', 'name', 'sc'], e.target.value)} />
        </Grid>
      </Grid>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={4}>
          <TextField label="Title (EN)" fullWidth value={formData.director.title.en} onChange={(e) => handleChange(['director', 'title', 'en'], e.target.value)} />
        </Grid>
        <Grid size={4}>
          <TextField label="Title (TC)" fullWidth value={formData.director.title.tc} onChange={(e) => handleChange(['director', 'title', 'tc'], e.target.value)} />
        </Grid>
        <Grid size={4}>
          <TextField label="Title (SC)" fullWidth value={formData.director.title.sc} onChange={(e) => handleChange(['director', 'title', 'sc'], e.target.value)} />
        </Grid>
      </Grid>

      <Typography variant="h6" sx={{ mb: 2 }}>Offices</Typography>
      {formData.offices.map((office, officeIndex) => (
        <Grid container spacing={2} key={officeIndex} sx={{ mb: 2 }}>
          <Grid size={1}>
            {renderButtons(
              officeIndex === 0,
              officeIndex === formData.offices.length - 1,
              () => addOffice(officeIndex),
              () => removeOffice(officeIndex),
              () => moveOffice(officeIndex, -1),
              () => moveOffice(officeIndex, 1)
            )}
          </Grid>
          <Grid size={11}>
            <Grid container spacing={2}>
              <Grid size={12}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                    '&:hover': { backgroundColor: 'action.hover' },
                  }}
                  onClick={() => toggleSection(`office-${officeIndex}`)}
                >
                  <Typography variant="h6">Office</Typography>
                  <IconButton size="small">
                    {expandedSections[`office-${officeIndex}`] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Box>
              </Grid>
              <Grid size={4}>
                <TextField label="Office Name (EN)*" fullWidth value={office.officeName.en} onChange={(e) => handleChange(['offices', officeIndex, 'officeName', 'en'], e.target.value)} />
              </Grid>
              <Grid size={4}>
                <TextField label="Office Name (TC)*" fullWidth value={office.officeName.tc} onChange={(e) => handleChange(['offices', officeIndex, 'officeName', 'tc'], e.target.value)} />
              </Grid>
              <Grid size={4}>
                <TextField label="Office Name (SC)*" fullWidth value={office.officeName.sc} onChange={(e) => handleChange(['offices', officeIndex, 'officeName', 'sc'], e.target.value)} />
              </Grid>
            </Grid>
            <Collapse in={expandedSections[`office-${officeIndex}`]} timeout="auto" unmountOnExit>
              {office.deputies.map((deputy, depIndex) => (
                <Grid container spacing={2} key={depIndex} sx={{ mb: 2, pl: 2, borderLeft: '2px solid #e0e0e0' }}>
                  <Grid size={1}>
                    {renderButtons(
                      depIndex === 0,
                      depIndex === office.deputies.length - 1,
                      () => addDeputy(officeIndex, depIndex),
                      () => removeDeputy(officeIndex, depIndex),
                      () => moveDeputy(officeIndex, depIndex, -1),
                      () => moveDeputy(officeIndex, depIndex, 1)
                    )}
                  </Grid>
                  <Grid size={11}>
                    <Grid container spacing={2}>
                      <Grid size={12}>
                        <Typography variant="subtitle1">Deputy Director</Typography>
                      </Grid>
                      <Grid size={4}>
                        <TextField label="Branch Title (EN)*" fullWidth value={deputy.branchTitle.en} onChange={(e) => handleChange(['offices', officeIndex, 'deputies', depIndex, 'branchTitle', 'en'], e.target.value)} />
                      </Grid>
                      <Grid size={4}>
                        <TextField label="Branch Title (TC)*" fullWidth value={deputy.branchTitle.tc} onChange={(e) => handleChange(['offices', officeIndex, 'deputies', depIndex, 'branchTitle', 'tc'], e.target.value)} />
                      </Grid>
                      <Grid size={4}>
                        <TextField label="Branch Title (SC)*" fullWidth value={deputy.branchTitle.sc} onChange={(e) => handleChange(['offices', officeIndex, 'deputies', depIndex, 'branchTitle', 'sc'], e.target.value)} />
                      </Grid>
                      <Grid size={4}>
                        <TextField label="Person Name (EN)*" fullWidth value={deputy.personName.en} onChange={(e) => handleChange(['offices', officeIndex, 'deputies', depIndex, 'personName', 'en'], e.target.value)} />
                      </Grid>
                      <Grid size={4}>
                        <TextField label="Person Name (TC)*" fullWidth value={deputy.personName.tc} onChange={(e) => handleChange(['offices', officeIndex, 'deputies', depIndex, 'personName', 'tc'], e.target.value)} />
                      </Grid>
                      <Grid size={4}>
                        <TextField label="Person Name (SC)*" fullWidth value={deputy.personName.sc} onChange={(e) => handleChange(['offices', officeIndex, 'deputies', depIndex, 'personName', 'sc'], e.target.value)} />
                      </Grid>
                    </Grid>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mt: 1,
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease',
                        '&:hover': { backgroundColor: 'action.hover' },
                      }}
                      onClick={() => toggleSection(`${officeIndex}-${depIndex}-resp`)}
                    >
                      <Typography variant="body1">
                        Responsibilities ({deputy.responsibilities.length} items)
                      </Typography>
                      <IconButton size="small">
                        {expandedSections[`${officeIndex}-${depIndex}-resp`] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </Box>
                    <Collapse in={expandedSections[`${officeIndex}-${depIndex}-resp`]} timeout="auto" unmountOnExit>
                      {deputy.responsibilities.map((resp, respIndex) => (
                        <Grid container spacing={2} key={respIndex} sx={{ mb: 2 }}>
                          <Grid size={1}>
                            {renderButtons(
                              respIndex === 0,
                              respIndex === deputy.responsibilities.length - 1,
                              () => addResponsibility(['offices', officeIndex, 'deputies', depIndex, 'responsibilities'], respIndex),
                              () => removeResponsibility(['offices', officeIndex, 'deputies', depIndex, 'responsibilities'], respIndex),
                              () => moveResponsibility(['offices', officeIndex, 'deputies', depIndex, 'responsibilities'], respIndex, -1),
                              () => moveResponsibility(['offices', officeIndex, 'deputies', depIndex, 'responsibilities'], respIndex, 1)
                            )}
                          </Grid>
                          <Grid size={11}>
                            <Grid container spacing={2} alignItems="stretch">
                              <Grid size={4}>
                                <TextField multiline rows={5} fullWidth value={resp.en} onChange={(e) => handleChange(['offices', officeIndex, 'deputies', depIndex, 'responsibilities', respIndex, 'en'], e.target.value)} />
                              </Grid>
                              <Grid size={4}>
                                <TextField multiline rows={5} fullWidth value={resp.tc} onChange={(e) => handleChange(['offices', officeIndex, 'deputies', depIndex, 'responsibilities', respIndex, 'tc'], e.target.value)} />
                              </Grid>
                              <Grid size={4}>
                                <TextField multiline rows={5} fullWidth value={resp.sc} onChange={(e) => handleChange(['offices', officeIndex, 'deputies', depIndex, 'responsibilities', respIndex, 'sc'], e.target.value)} />
                              </Grid>
                            </Grid>
                          </Grid>
                        </Grid>
                      ))}
                    </Collapse>
                    <Divider sx={{ my: 2 }} />
                    {deputy.assistants.map((assistant, assIndex) => (
                      <Grid container spacing={2} key={assIndex} sx={{ mb: 2, pl: 4, borderLeft: '2px solid #e0e0e0' }}>
                        <Grid size={1}>
                          {renderButtons(
                            assIndex === 0,
                            assIndex === deputy.assistants.length - 1,
                            () => addAssistant(officeIndex, depIndex, assIndex),
                            () => removeAssistant(officeIndex, depIndex, assIndex),
                            () => moveAssistant(officeIndex, depIndex, assIndex, -1),
                            () => moveAssistant(officeIndex, depIndex, assIndex, 1)
                          )}
                        </Grid>
                        <Grid size={11}>
                          <Grid container spacing={2}>
                            <Grid size={12}>
                              <Typography variant="subtitle2">Assistant Director</Typography>
                            </Grid>
                            <Grid size={4}>
                              <TextField label="Branch Title (EN)*" fullWidth value={assistant.branchTitle.en} onChange={(e) => handleChange(['offices', officeIndex, 'deputies', depIndex, 'assistants', assIndex, 'branchTitle', 'en'], e.target.value)} />
                            </Grid>
                            <Grid size={4}>
                              <TextField label="Branch Title (TC)*" fullWidth value={assistant.branchTitle.tc} onChange={(e) => handleChange(['offices', officeIndex, 'deputies', depIndex, 'assistants', assIndex, 'branchTitle', 'tc'], e.target.value)} />
                            </Grid>
                            <Grid size={4}>
                              <TextField label="Branch Title (SC)*" fullWidth value={assistant.branchTitle.sc} onChange={(e) => handleChange(['offices', officeIndex, 'deputies', depIndex, 'assistants', assIndex, 'branchTitle', 'sc'], e.target.value)} />
                            </Grid>
                            <Grid size={4}>
                              <TextField label="Person Name (EN)*" fullWidth value={assistant.personName.en} onChange={(e) => handleChange(['offices', officeIndex, 'deputies', depIndex, 'assistants', assIndex, 'personName', 'en'], e.target.value)} />
                            </Grid>
                            <Grid size={4}>
                              <TextField label="Person Name (TC)*" fullWidth value={assistant.personName.tc} onChange={(e) => handleChange(['offices', officeIndex, 'deputies', depIndex, 'assistants', assIndex, 'personName', 'tc'], e.target.value)} />
                            </Grid>
                            <Grid size={4}>
                              <TextField label="Person Name (SC)*" fullWidth value={assistant.personName.sc} onChange={(e) => handleChange(['offices', officeIndex, 'deputies', depIndex, 'assistants', assIndex, 'personName', 'sc'], e.target.value)} />
                            </Grid>
                          </Grid>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              mt: 1,
                              cursor: 'pointer',
                              transition: 'background-color 0.2s ease',
                              '&:hover': { backgroundColor: 'action.hover' },
                            }}
                            onClick={() => toggleSection(`${officeIndex}-${depIndex}-${assIndex}-resp`)}
                          >
                            <Typography variant="body1">
                              Responsibilities ({assistant.responsibilities.length} items)
                            </Typography>
                            <IconButton size="small">
                              {expandedSections[`${officeIndex}-${depIndex}-${assIndex}-resp`] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                          </Box>
                          <Collapse in={expandedSections[`${officeIndex}-${depIndex}-${assIndex}-resp`]} timeout="auto" unmountOnExit>
                            {assistant.responsibilities.map((resp, respIndex) => (
                              <Grid container spacing={2} key={respIndex} sx={{ mb: 2 }}>
                                <Grid size={1}>
                                  {renderButtons(
                                    respIndex === 0,
                                    respIndex === assistant.responsibilities.length - 1,
                                    () => addResponsibility(['offices', officeIndex, 'deputies', depIndex, 'assistants', assIndex, 'responsibilities'], respIndex),
                                    () => removeResponsibility(['offices', officeIndex, 'deputies', depIndex, 'assistants', assIndex, 'responsibilities'], respIndex),
                                    () => moveResponsibility(['offices', officeIndex, 'deputies', depIndex, 'assistants', assIndex, 'responsibilities'], respIndex, -1),
                                    () => moveResponsibility(['offices', officeIndex, 'deputies', depIndex, 'assistants', assIndex, 'responsibilities'], respIndex, 1)
                                  )}
                                </Grid>
                                <Grid size={11}>
                                  <Grid container spacing={2} alignItems="stretch">
                                    <Grid size={4}>
                                      <TextField multiline rows={5} fullWidth value={resp.en} onChange={(e) => handleChange(['offices', officeIndex, 'deputies', depIndex, 'assistants', assIndex, 'responsibilities', respIndex, 'en'], e.target.value)} />
                                    </Grid>
                                    <Grid size={4}>
                                      <TextField multiline rows={5} fullWidth value={resp.tc} onChange={(e) => handleChange(['offices', officeIndex, 'deputies', depIndex, 'assistants', assIndex, 'responsibilities', respIndex, 'tc'], e.target.value)} />
                                    </Grid>
                                    <Grid size={4}>
                                      <TextField multiline rows={5} fullWidth value={resp.sc} onChange={(e) => handleChange(['offices', officeIndex, 'deputies', depIndex, 'assistants', assIndex, 'responsibilities', respIndex, 'sc'], e.target.value)} />
                                    </Grid>
                                  </Grid>
                                </Grid>
                              </Grid>
                            ))}
                          </Collapse>
                          <Divider sx={{ my: 2 }} />
                        </Grid>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              ))}
            </Collapse>
          </Grid>
        </Grid>
      ))}
      
      {/* Add button for new office at the end */}
      {formData.offices.length === 0 && (
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid size={1}>
            {renderButtons(
              true, // Disable up/down for add row
              true,
              () => addOffice(formData.offices.length - 1), // Add at end
              () => {}, // No remove for add row
              () => {}, 
              () => {}
            )}
          </Grid>
          <Grid size={11}>
            {/* Empty content for add row */}
          </Grid>
        </Grid>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Box>
          <Button variant="outlined" sx={{ mr: 1 }}>Preview Diagram</Button>
          <Button variant="outlined">Preview Text</Button>
        </Box>
        <Button variant="contained" color="primary">Save Changes</Button>
      </Box>

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

export default OrgChartEditor_v6;