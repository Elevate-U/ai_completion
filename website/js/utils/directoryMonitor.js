// Configuration object for directory monitoring
const directoryMonitorConfig = {
  directoryPath: '/Users/evergreenwu/ai_tools_resource/data',
  updateInterval: 300000, // 5 minutes in milliseconds
  getFileListScript: '/ai_tools_resource/scripts/get_file_list.py',
};

// Function to check for changes in the directory
async function checkForChanges() {
  try {
    const response = await fetch(directoryMonitorConfig.getFileListScript);
    if (!response.ok) {
      throw new Error('HTTP error! status: ' + response.status); // Changed to string concatenation
    }
    const _fileList = await response.json();
    // TODO: Implement logic to compare the new file list to the cached file list
    // and update the website content accordingly.
  } catch (_error) {
    /* Failed to get file list, ignore */
  }
}

// Function to start monitoring the directory
export function startDirectoryMonitor() {
  setInterval(checkForChanges, directoryMonitorConfig.updateInterval);
}
