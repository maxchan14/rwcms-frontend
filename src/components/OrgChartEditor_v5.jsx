import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Card, CardContent, Tooltip, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { mockOrgChartData } from '../mock/data';

const OrgChartEditor_v5 = () => {
  const [data, setData] = useState(JSON.parse(JSON.stringify(mockOrgChartData)));
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmCallback, setConfirmCallback] = useState(null);

  const handleConfirm = () => {
    if (confirmCallback) confirmCallback();
    setConfirmOpen(false);
  };

  const handleCancel = () => setConfirmOpen(false);

  const swapItems = (parentPath, idx1, idx2) => {
    setData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev));
      let current = newData;
      for (const key of parentPath) {
        current = current[key];
      }
      [current[idx1], current[idx2]] = [current[idx2], current[idx1]];
      return newData;
    });
  };

  const removeItem = (parentPath, idx) => {
    setData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev));
      let current = newData;
      for (const key of parentPath) {
        current = current[key];
      }
      current.splice(idx, 1);
      return newData;
    });
  };

  const addItem = (parentPath, newItem) => {
    setData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev));
      let current = newData;
      for (const key of parentPath) {
        current = current[key];
      }
      current.push(newItem);
      return newData;
    });
  };

  const updateField = (path, lang, value) => {
    setData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev));
      let current = newData;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]][lang] = value;
      return newData;
    });
  };

  const renderFields = (node, path, fieldKey) => (
    <>
      <TextField
        label={`${fieldKey} (EN)`}
        value={node[fieldKey]?.en || ''}
        onChange={(e) => updateField([...path, fieldKey], 'en', e.target.value)}
        fullWidth
        size="small"
        sx={{ mb: 1 }}
      />
      <TextField
        label={`${fieldKey} (TC)`}
        value={node[fieldKey]?.tc || ''}
        onChange={(e) => updateField([...path, fieldKey], 'tc', e.target.value)}
        fullWidth
        size="small"
        sx={{ mb: 1 }}
      />
      <TextField
        label={`${fieldKey} (SC)`}
        value={node[fieldKey]?.sc || ''}
        onChange={(e) => updateField([...path, fieldKey], 'sc', e.target.value)}
        fullWidth
        size="small"
        sx={{ mb: 1 }}
      />
    </>
  );

  const renderResponsibilities = (responsibilities, pathToResp) => (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2">Responsibilities</Typography>
      {responsibilities.map((resp, respIdx) => (
        <Box key={respIdx} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{ flex: 1 }}>
            <TextField
              label="EN"
              multiline
              value={resp.en || ''}
              onChange={(e) => updateField([...pathToResp, respIdx, 'en'], '', e.target.value)} // Note: pathToResp + idx + field
              fullWidth
              size="small"
            />
            <TextField
              label="TC"
              multiline
              value={resp.tc || ''}
              onChange={(e) => updateField([...pathToResp, respIdx, 'tc'], '', e.target.value)}
              fullWidth
              size="small"
              sx={{ mt: 1 }}
            />
            <TextField
              label="SC"
              multiline
              value={resp.sc || ''}
              onChange={(e) => updateField([...pathToResp, respIdx, 'sc'], '', e.target.value)}
              fullWidth
              size="small"
              sx={{ mt: 1 }}
            />
          </Box>
          <Box>
            <Tooltip title="Move Up">
              <IconButton onClick={() => swapItems(pathToResp, respIdx, respIdx - 1)} disabled={respIdx === 0}>
                <ArrowUpwardIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Move Down">
              <IconButton onClick={() => swapItems(pathToResp, respIdx, respIdx + 1)} disabled={respIdx === responsibilities.length - 1}>
                <ArrowDownwardIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Remove">
              <IconButton color="error" onClick={() => {
                setConfirmMessage('Remove this responsibility?');
                setConfirmCallback(() => () => removeItem(pathToResp, respIdx));
                setConfirmOpen(true);
              }}>
                <RemoveIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      ))}
      <Button startIcon={<AddIcon />} onClick={() => addItem(pathToResp, { en: '', tc: '', sc: '' })}>Add Responsibility</Button>
    </Box>
  );

  const renderCard = (node, path, idx, siblingsLength, type) => (
    <Card sx={{ m: 1, minWidth: 300 }}>
      <CardContent>
        <Typography variant="h6">{(type === 'director' ? node.name?.en : node.officeName?.en || node.personName?.en || node.branchTitle?.en) || 'Unnamed'}</Typography>
        {type === 'director' && (
          <>
            {renderFields(node, path, 'name')}
            {renderFields(node, path, 'title')}
          </>
        )}
        {type === 'office' && renderFields(node, path, 'officeName')}
        {(type === 'deputy' || type === 'assistant') && (
          <>
            {renderFields(node, path, 'branchTitle')}
            {renderFields(node, path, 'personName')}
            {node.responsibilities && renderResponsibilities(node.responsibilities, [...path, 'responsibilities'])}
          </>
        )}
        <Box sx={{ mt: 1 }}>
          <Tooltip title="Move Up" arrow>
            <span>
              <IconButton aria-label="move up" onClick={() => swapItems(path.slice(0, -1), idx, idx - 1)} disabled={idx === 0 || type === 'director'}>
                <ArrowUpwardIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Move Down" arrow>
            <span>
              <IconButton aria-label="move down" onClick={() => swapItems(path.slice(0, -1), idx, idx + 1)} disabled={idx === siblingsLength - 1 || type === 'director'}>
                <ArrowDownwardIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Remove" arrow>
            <span>
              <IconButton aria-label="remove" color="error" onClick={() => {
                setConfirmMessage('Remove this item?');
                setConfirmCallback(() => () => removeItem(path.slice(0, -1), idx));
                setConfirmOpen(true);
              }} disabled={type === 'director'}>
                <RemoveIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
        <Box sx={{ pl: 2, display: 'flex', flexWrap: 'wrap' }}>
          {node.deputies?.map((child, childIdx) => renderCard(child, [...path, 'deputies', childIdx], childIdx, node.deputies.length, 'deputy'))}
          {node.assistants?.map((child, childIdx) => renderCard(child, [...path, 'assistants', childIdx], childIdx, node.assistants.length, 'assistant'))}
        </Box>
        {type === 'office' && (
          <Button startIcon={<AddIcon />} onClick={() => addItem([...path, 'deputies'], {
            branchTitle: { en: '', tc: '', sc: '' },
            personName: { en: '', tc: '', sc: '' },
            responsibilities: [],
            assistants: [],
          })}>Add Deputy</Button>
        )}
        {type === 'deputy' && (
          <Button startIcon={<AddIcon />} onClick={() => addItem([...path, 'assistants'], {
            branchTitle: { en: '', tc: '', sc: '' },
            personName: { en: '', tc: '', sc: '' },
            responsibilities: [],
          })}>Add Assistant</Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
      {renderCard(data.director, ['director'], 0, 1, 'director')}
      {data.offices.map((office, idx) => renderCard(office, ['offices', idx], idx, data.offices.length, 'office'))}
      <Button startIcon={<AddIcon />} onClick={() => addItem(['offices'], {
        officeName: { en: '', tc: '', sc: '' },
        deputies: [],
      })}>Add Office</Button>
      <Dialog open={confirmOpen} onClose={handleCancel}>
        <DialogTitle>Confirm Removal</DialogTitle>
        <DialogContent><DialogContentText>{confirmMessage}</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleConfirm} color="error">Confirm</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrgChartEditor_v5;