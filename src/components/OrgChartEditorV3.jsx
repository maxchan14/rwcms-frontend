import React, { useState } from 'react';
import { Box, Tabs, Tab, Typography, TextField, Button, Grid, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { mockOrgChartData } from '../mock/data';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const OrgChartEditorV3 = () => {
  const [formData, setFormData] = useState(JSON.parse(JSON.stringify(mockOrgChartData)));
  const [tabValue, setTabValue] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmCallback, setConfirmCallback] = useState(null);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleConfirm = () => {
    if (confirmCallback) confirmCallback();
    setConfirmOpen(false);
  };

  const handleCancel = () => setConfirmOpen(false);

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

  const addOffice = () => {
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
    });
    setConfirmOpen(true);
  };

  const addDeputy = (officeIndex) => {
    setFormData((prev) => {
      const newOffices = [...prev.offices];
      newOffices[officeIndex].deputies.push({
        title: { en: '', tc: '', sc: '' },
        name: { en: '', tc: '', sc: '' },
        responsibilities: [],
        assistants: [],
      });
      return { ...prev, offices: newOffices };
    });
  };

  const removeDeputy = (officeIndex, depIndex) => {
    const deputy = formData.offices[officeIndex].deputies[depIndex];
    const name = deputy.name.en || 'this deputy director';
    setConfirmMessage(`Are you sure you want to remove the deputy director: ${name}? This action cannot be undone.`);
    setConfirmCallback(() => () => {
      setFormData((prev) => {
        const newOffices = [...prev.offices];
        newOffices[officeIndex].deputies = newOffices[officeIndex].deputies.filter((_, index) => index !== depIndex);
        return { ...prev, offices: newOffices };
      });
    });
    setConfirmOpen(true);
  };

  const addAssistant = (officeIndex, depIndex) => {
    setFormData((prev) => {
      const newOffices = [...prev.offices];
      newOffices[officeIndex].deputies[depIndex].assistants.push({
        title: { en: '', tc: '', sc: '' },
        name: { en: '', tc: '', sc: '' },
        responsibilities: [],
      });
      return { ...prev, offices: newOffices };
    });
  };

  const removeAssistant = (officeIndex, depIndex, assIndex) => {
    const assistant = formData.offices[officeIndex].deputies[depIndex].assistants[assIndex];
    const name = assistant.name.en || 'this assistant director';
    setConfirmMessage(`Are you sure you want to remove the assistant director: ${name}? This action cannot be undone.`);
    setConfirmCallback(() => () => {
      setFormData((prev) => {
        const newOffices = [...prev.offices];
        newOffices[officeIndex].deputies[depIndex].assistants = newOffices[officeIndex].deputies[depIndex].assistants.filter((_, index) => index !== assIndex);
        return { ...prev, offices: newOffices };
      });
    });
    setConfirmOpen(true);
  };

  const addResponsibility = (path) => {
    setFormData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev));
      let current = newData;
      for (const key of path) {
        current = current[key];
      }
      current.push({ en: '', tc: '', sc: '' });
      return newData;
    });
  };

  const removeResponsibility = (path, respIndex) => {
    setFormData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev));
      let current = newData;
      for (const key of path) {
        current = current[key];
      }
      current.splice(respIndex, 1);
      return newData;
    });
  };

  return (
    <Box sx={{ p: 2, backgroundColor: 'white', borderRadius: 2, boxShadow: 1, width: '100%' }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Edit Organisation Chart (Tabbed Multi-View)</Typography>
      <Typography variant="body2" sx={{ mb: 4 }}>
        Use tabs to switch between views: Structure (add/remove items), Details (edit names/titles), and Responsibilities (edit lists).
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="org chart tabs">
          <Tab label="Structure" />
          <Tab label="Details" />
          <Tab label="Responsibilities" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Typography variant="h6" sx={{ mb: 2 }}>Structure View</Typography>
        <TextField
          label="Revision Date"
          fullWidth
          value={formData.revisionDate}
          onChange={(e) => handleChange(['revisionDate'], e.target.value)}
          sx={{ mb: 4 }}
        />
        <Typography variant="subtitle1">Director</Typography>
        <Box sx={{ ml: 2, mb: 2 }}>
          <Typography>{formData.director.name.en || 'Unnamed Director'}</Typography>
        </Box>
        <Typography variant="subtitle1">Offices</Typography>
        {formData.offices.map((office, officeIndex) => (
          <Box key={officeIndex} sx={{ ml: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography>{office.officeName.en || 'Unnamed Office'}</Typography>
              <IconButton color="error" onClick={() => removeOffice(officeIndex)}><RemoveIcon /></IconButton>
              <Button startIcon={<AddIcon />} onClick={() => addDeputy(officeIndex)}>Add Deputy</Button>
            </Box>
            {office.deputies.map((deputy, depIndex) => (
              <Box key={depIndex} sx={{ ml: 4, mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography>{deputy.name.en || 'Unnamed Deputy'}</Typography>
                  <IconButton color="error" onClick={() => removeDeputy(officeIndex, depIndex)}><RemoveIcon /></IconButton>
                  <Button startIcon={<AddIcon />} onClick={() => addAssistant(officeIndex, depIndex)}>Add Assistant</Button>
                </Box>
                {deputy.assistants.map((assistant, assIndex) => (
                  <Box key={assIndex} sx={{ ml: 6 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography>{assistant.name.en || 'Unnamed Assistant'}</Typography>
                      <IconButton color="error" onClick={() => removeAssistant(officeIndex, depIndex, assIndex)}><RemoveIcon /></IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        ))}
        <Button startIcon={<AddIcon />} onClick={addOffice}>Add Office</Button>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" sx={{ mb: 2 }}>Details View (Names & Titles)</Typography>
        <Typography variant="subtitle1">Director</Typography>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid size={4}><TextField label="Name (EN)" value={formData.director.name.en} onChange={(e) => handleChange(['director', 'name', 'en'], e.target.value)} fullWidth /></Grid>
          <Grid size={4}><TextField label="Name (TC)" value={formData.director.name.tc} onChange={(e) => handleChange(['director', 'name', 'tc'], e.target.value)} fullWidth /></Grid>
          <Grid size={4}><TextField label="Name (SC)" value={formData.director.name.sc} onChange={(e) => handleChange(['director', 'name', 'sc'], e.target.value)} fullWidth /></Grid>
          <Grid size={4}><TextField label="Title (EN)" value={formData.director.title.en} onChange={(e) => handleChange(['director', 'title', 'en'], e.target.value)} fullWidth /></Grid>
          <Grid size={4}><TextField label="Title (TC)" value={formData.director.title.tc} onChange={(e) => handleChange(['director', 'title', 'tc'], e.target.value)} fullWidth /></Grid>
          <Grid size={4}><TextField label="Title (SC)" value={formData.director.title.sc} onChange={(e) => handleChange(['director', 'title', 'sc'], e.target.value)} fullWidth /></Grid>
        </Grid>
        {formData.offices.map((office, officeIndex) => (
          <Box key={officeIndex} sx={{ mb: 4 }}>
            <Typography variant="subtitle1">Office {officeIndex + 1}</Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid size={4}><TextField label="Office Name (EN)" value={office.officeName.en} onChange={(e) => handleChange(['offices', officeIndex, 'officeName', 'en'], e.target.value)} fullWidth /></Grid>
              <Grid size={4}><TextField label="Office Name (TC)" value={office.officeName.tc} onChange={(e) => handleChange(['offices', officeIndex, 'officeName', 'tc'], e.target.value)} fullWidth /></Grid>
              <Grid size={4}><TextField label="Office Name (SC)" value={office.officeName.sc} onChange={(e) => handleChange(['offices', officeIndex, 'officeName', 'sc'], e.target.value)} fullWidth /></Grid>
            </Grid>
            {office.deputies.map((deputy, depIndex) => (
              <Box key={depIndex} sx={{ ml: 2, mb: 2 }}>
                <Typography variant="body1">Deputy {depIndex + 1}</Typography>
                <Grid container spacing={2} sx={{ mb: 1 }}>
                  <Grid size={4}><TextField label="Branch Title (EN)" value={deputy.title.en} onChange={(e) => handleChange(['offices', officeIndex, 'deputies', depIndex, 'title', 'en'], e.target.value)} fullWidth /></Grid>
                  <Grid size={4}><TextField label="Branch Title (TC)" value={deputy.title.tc} onChange={(e) => handleChange(['offices', officeIndex, 'deputies', depIndex, 'title', 'tc'], e.target.value)} fullWidth /></Grid>
                  <Grid size={4}><TextField label="Branch Title (SC)" value={deputy.title.sc} onChange={(e) => handleChange(['offices', officeIndex, 'deputies', depIndex, 'title', 'sc'], e.target.value)} fullWidth /></Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid size={4}><TextField label="Person Name (EN)" value={deputy.name.en} onChange={(e) => handleChange(['offices', officeIndex, 'deputies', depIndex, 'name', 'en'], e.target.value)} fullWidth /></Grid>
                  <Grid size={4}><TextField label="Person Name (TC)" value={deputy.name.tc} onChange={(e) => handleChange(['offices', officeIndex, 'deputies', depIndex, 'name', 'tc'], e.target.value)} fullWidth /></Grid>
                  <Grid size={4}><TextField label="Person Name (SC)" value={deputy.name.sc} onChange={(e) => handleChange(['offices', officeIndex, 'deputies', depIndex, 'name', 'sc'], e.target.value)} fullWidth /></Grid>
                </Grid>
                {deputy.assistants.map((assistant, assIndex) => (
                  <Box key={assIndex} sx={{ ml: 4, mt: 2 }}>
                    <Typography variant="body2">Assistant {assIndex + 1}</Typography>
                    <Grid container spacing={2} sx={{ mb: 1 }}>
                      <Grid size={4}><TextField label="Branch Title (EN)" value={assistant.title.en} onChange={(e) => handleChange(['offices', officeIndex, 'deputies', depIndex, 'assistants', assIndex, 'title', 'en'], e.target.value)} fullWidth /></Grid>
                      <Grid size={4}><TextField label="Branch Title (TC)" value={assistant.title.tc} onChange={(e) => handleChange(['offices', officeIndex, 'deputies', depIndex, 'assistants', assIndex, 'title', 'tc'], e.target.value)} fullWidth /></Grid>
                      <Grid size={4}><TextField label="Branch Title (SC)" value={assistant.title.sc} onChange={(e) => handleChange(['offices', officeIndex, 'deputies', depIndex, 'assistants', assIndex, 'title', 'sc'], e.target.value)} fullWidth /></Grid>
                    </Grid>
                    <Grid container spacing={2}>
                      <Grid size={4}><TextField label="Person Name (EN)" value={assistant.name.en} onChange={(e) => handleChange(['offices', officeIndex, 'deputies', depIndex, 'assistants', assIndex, 'name', 'en'], e.target.value)} fullWidth /></Grid>
                      <Grid size={4}><TextField label="Person Name (TC)" value={assistant.name.tc} onChange={(e) => handleChange(['offices', officeIndex, 'deputies', depIndex, 'assistants', assIndex, 'name', 'tc'], e.target.value)} fullWidth /></Grid>
                      <Grid size={4}><TextField label="Person Name (SC)" value={assistant.name.sc} onChange={(e) => handleChange(['offices', officeIndex, 'deputies', depIndex, 'assistants', assIndex, 'name', 'sc'], e.target.value)} fullWidth /></Grid>
                    </Grid>
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        ))}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" sx={{ mb: 2 }}>Responsibilities View</Typography>
        {formData.offices.map((office, officeIndex) => (
          <Box key={officeIndex} sx={{ mb: 4 }}>
            <Typography variant="subtitle1">Office {officeIndex + 1}: {office.officeName.en}</Typography>
            {office.deputies.map((deputy, depIndex) => (
              <Box key={depIndex} sx={{ ml: 2, mb: 2 }}>
                <Typography variant="body1">Deputy {depIndex + 1}: {deputy.name.en}</Typography>
                <Button startIcon={<AddIcon />} onClick={() => addResponsibility(['offices', officeIndex, 'deputies', depIndex, 'responsibilities'])}>Add Responsibility</Button>
                {deputy.responsibilities.map((resp, respIndex) => (
                  <Grid key={respIndex} container spacing={2} sx={{ mt: 1 }}>
                    <Grid size={4}><TextField multiline rows={3} value={resp.en} onChange={(e) => handleChange(['offices', officeIndex, 'deputies', depIndex, 'responsibilities', respIndex, 'en'], e.target.value)} fullWidth /></Grid>
                    <Grid size={4}><TextField multiline rows={3} value={resp.tc} onChange={(e) => handleChange(['offices', officeIndex, 'deputies', depIndex, 'responsibilities', respIndex, 'tc'], e.target.value)} fullWidth /></Grid>
                    <Grid size={3}><TextField multiline rows={3} value={resp.sc} onChange={(e) => handleChange(['offices', officeIndex, 'deputies', depIndex, 'responsibilities', respIndex, 'sc'], e.target.value)} fullWidth /></Grid>
                    <Grid size={1}><IconButton color="error" onClick={() => removeResponsibility(['offices', officeIndex, 'deputies', depIndex, 'responsibilities'], respIndex)}><RemoveIcon /></IconButton></Grid>
                  </Grid>
                ))}
                {deputy.assistants.map((assistant, assIndex) => (
                  <Box key={assIndex} sx={{ ml: 4, mt: 2 }}>
                    <Typography variant="body2">Assistant {assIndex + 1}: {assistant.name.en}</Typography>
                    <Button startIcon={<AddIcon />} onClick={() => addResponsibility(['offices', officeIndex, 'deputies', depIndex, 'assistants', assIndex, 'responsibilities'])}>Add Responsibility</Button>
                    {assistant.responsibilities.map((resp, respIndex) => (
                      <Grid key={respIndex} container spacing={2} sx={{ mt: 1 }}>
                        <Grid size={4}><TextField multiline rows={3} value={resp.en} onChange={(e) => handleChange(['offices', officeIndex, 'deputies', depIndex, 'assistants', assIndex, 'responsibilities', respIndex, 'en'], e.target.value)} fullWidth /></Grid>
                        <Grid size={4}><TextField multiline rows={3} value={resp.tc} onChange={(e) => handleChange(['offices', officeIndex, 'deputies', depIndex, 'assistants', assIndex, 'responsibilities', respIndex, 'tc'], e.target.value)} fullWidth /></Grid>
                        <Grid size={3}><TextField multiline rows={3} value={resp.sc} onChange={(e) => handleChange(['offices', officeIndex, 'deputies', depIndex, 'assistants', assIndex, 'responsibilities', respIndex, 'sc'], e.target.value)} fullWidth /></Grid>
                        <Grid size={1}><IconButton color="error" onClick={() => removeResponsibility(['offices', officeIndex, 'deputies', depIndex, 'assistants', assIndex, 'responsibilities'], respIndex)}><RemoveIcon /></IconButton></Grid>
                      </Grid>
                    ))}
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        ))}
      </TabPanel>

      <Dialog open={confirmOpen} onClose={handleCancel}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent><DialogContentText>{confirmMessage}</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleConfirm} color="error">Confirm</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrgChartEditorV3;