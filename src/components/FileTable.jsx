import React, { useEffect, useState, useContext } from 'react';
import { DataGridPro } from '@mui/x-data-grid-pro';
import FolderIcon from '@mui/icons-material/Folder';
import DescriptionIcon from '@mui/icons-material/Description';
import ImageIcon from '@mui/icons-material/Image';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import Tooltip from '@mui/material/Tooltip';
import { getItems } from '../api';
import { AppContext } from '../context/AppContext';
import Button from '@mui/material/Button';
import ArrowDropDown from '@mui/icons-material/ArrowDropDown';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box'; // Added for alignment

const FileTable = () => {
  const [files, setFiles] = useState([]);
  const { selectedFolder, setSelectedFolder, setSelectedItem, selectedIds, setSelectedIds } = useContext(AppContext);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 100 });
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    const fetchFiles = async () => {
      let path = selectedFolder?.path || '/';
      if (path !== '/' && !path.endsWith('/')) {
        path += '/';
      }
      const data = await getItems(path);
      const mappedData = data.map((item) => ({
        id: item.itemId,
        name: item.name,
        path: item.isFolder ? (item.path.endsWith('/') ? item.path : `${item.path}/`) : item.path, // Folders end with '/'
        type: item.isFolder ? 'folder' : getFileType(item.name),
        size: item.isFolder ? '-' : formatSize(item.fileSize),
        modifiedBy: item.modifiedByUsername,
        modifiedDate: formatDate(item.modifiedDate),
        status: getStatus(item),
      }));
      setFiles(mappedData);
      setSelectedIds([]); // Reset selection on folder change
      // Reset pagination to first page when files change
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
    };
    fetchFiles();
  }, [selectedFolder]);

  const getFileType = (name) => {
    const ext = name.toLowerCase().split('.').pop();
    if (['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(ext)) return 'image';
    if (['doc', 'docx', 'pdf', 'txt'].includes(ext)) return 'description';
    return 'file';
  };

  const formatSize = (size) => {
    if (size === 0) return '-';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(size) / Math.log(k));
    return parseFloat((size / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatus = (item) => {
    if (item.pendingDeletion) return 'Pending Deletion';
    if (item.deletedOnProduction) return 'Deleted on Production';
    if (item.pendingRename) return 'Pending Rename';
    if (item.pendingMove) return 'Pending Move';
    if (item.lockedById) return 'Locked';
    if (item.publishedToProduction) return 'Published';
    if (item.publishedToStaging) return 'Published to Staging';
    return 'Draft';
  };

  const getIcon = (type) => {
    if (type === 'folder') return <FolderIcon sx={{ mr: 1 }} />;
    if (type === 'image') return <ImageIcon sx={{ mr: 1 }} />;
    if (type === 'description') return <DescriptionIcon sx={{ mr: 1 }} />;
    return <InsertDriveFileIcon sx={{ mr: 1 }} />;
  };

  const columns = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {getIcon(params.row.type)}
          {params.value}
        </Box>
      ),
    },
    { field: 'size', headerName: 'Size', width: 100 },
    {
      field: 'modified',
      headerName: 'Modified',
      flex: 1,
      valueGetter: (value, row) => `${row.modifiedBy} • ${row.modifiedDate}`,
    },
    { field: 'status', headerName: 'Status', width: 150 },
    { 
      field: 'edit', 
      headerName: 'Edit', 
      width: 100, 
      renderCell: (params) => params.row.type === 'folder' ? '—' : <Tooltip title="Edit this file"><span>Edit</span></Tooltip>
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      renderCell: () => <Tooltip title="More actions"><MoreHorizIcon /></Tooltip>,
    },
  ];

  const handlePageSizeChange = (e) => {
    const value = e.target.value;
    const newSize = value === 'All' ? files.length : parseInt(value, 10);
    setPaginationModel((prev) => ({ ...prev, pageSize: newSize, page: 0 }));
  };

  const handleSelectOptionsClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSelectOptionsClose = () => {
    setAnchorEl(null);
  };

  const handleSelectAll = () => {
    setSelectedIds(files.map((file) => file.id));
    handleSelectOptionsClose();
  };

  const handleSelectNone = () => {
    setSelectedIds([]);
    handleSelectOptionsClose();
  };

  const start = paginationModel.page * paginationModel.pageSize + 1;
  const end = Math.min(start + paginationModel.pageSize - 1, files.length);

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <DataGridPro
        rows={files}
        columns={columns}
        getRowId={(row) => row.id}
        checkboxSelection
        disableRowSelectionOnClick={true} // Prevent row clicks from toggling checkboxes
        selectionModel={selectedIds}
        onSelectionModelChange={(newModel) => {
          setSelectedIds(newModel);
          if (newModel.length === 1) {
            const selectedRow = files.find((row) => row.id === newModel[0]);
            setSelectedItem(selectedRow);
          } else {
            setSelectedItem(null);
          }
        }}
        onRowClick={(params) => {
          setSelectedItem(params.row); // Set for details view without checking box
        }}
        onRowDoubleClick={(params) => {
          if (params.row.type === 'folder') {
            setSelectedFolder({
              id: params.row.id,
              name: params.row.name,
              path: params.row.path,
            });
            setSelectedItem(null);
          }
        }}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pagination
        sx={{
          '& .MuiDataGrid-row:hover': { backgroundColor: '#f0f0f0' }, // Hover effect
          '& .MuiDataGrid-footerContainer': { backgroundColor: '#fafafa' }, // Themed footer
        }}
        slots={{
          toolbar: () => (
            <div style={{ padding: '8px', backgroundColor: '#fafafa', borderBottom: '1px solid #e0e0e0' }}>
              <Button
                endIcon={<ArrowDropDown />}
                onClick={handleSelectOptionsClick}
                variant="text"
              >
                Select Options
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleSelectOptionsClose}
              >
                <MenuItem onClick={handleSelectAll}>Select All</MenuItem>
                <MenuItem onClick={handleSelectNone}>Select None</MenuItem>
              </Menu>
            </div>
          ),
          pagination: () => (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', backgroundColor: '#fafafa' }}>
              <div>{files.length > 0 ? `${start}-${end} of ${files.length}` : '0 of 0'}</div>
              <div>
                Show
                <select
                  style={{ marginLeft: 8, marginRight: 8 }}
                  onChange={handlePageSizeChange}
                  value={paginationModel.pageSize === files.length ? 'All' : paginationModel.pageSize}
                >
                  <option>20</option>
                  <option>50</option>
                  <option>100</option>
                  <option>All</option>
                </select>
              </div>
              <div>
                <Button
                  size="small"
                  disabled={paginationModel.page === 0}
                  onClick={() => setPaginationModel((prev) => ({ ...prev, page: prev.page - 1 }))}
                >
                  Prev
                </Button>
                <Button
                  size="small"
                  disabled={end >= files.length}
                  onClick={() => setPaginationModel((prev) => ({ ...prev, page: prev.page + 1 }))}
                >
                  Next
                </Button>
              </div>
            </div>
          ),
        }}
      />
    </div>
  );
};

export default FileTable;