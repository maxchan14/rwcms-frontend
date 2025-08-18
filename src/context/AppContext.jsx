import React, { createContext, useState, useEffect } from 'react';
import { getCurrentUser, getCurrentPermissions } from '../api'; // Import the updated API functions

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null); // Initial null
  const [permissions, setPermissions] = useState([]); // New state for permissions
  const [selectedFolder, setSelectedFolder] = useState(null); // e.g., { id: 'folderA', name: 'folderA' }
  const [selectedItem, setSelectedItem] = useState(null); // e.g., file details
  const [pathError, setPathError] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]); // For multi-selection in FileTable

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);

        const perms = await getCurrentPermissions();
        setPermissions(perms);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        setCurrentUser({ username: 'Guest', isSiteAdmin: false }); // Fallback object
        setPermissions([]); // Fallback
      }
    };
    fetchData();
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        permissions, // Provide permissions in context
        selectedFolder,
        setSelectedFolder,
        selectedItem,
        setSelectedItem,
        pathError,
        setPathError,
        selectedIds,
        setSelectedIds,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};