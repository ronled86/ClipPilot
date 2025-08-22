# Custom NSIS installer script for ClipPilot
# Ensures complete removal of all application data and residues

# Custom uninstaller section to remove all traces
!macro customUnInstall
  # Remove application data folders
  RMDir /r "$LOCALAPPDATA\clippilot-desktop"
  RMDir /r "$APPDATA\clippilot-desktop"
  RMDir /r "$LOCALAPPDATA\ClipPilot"
  RMDir /r "$APPDATA\ClipPilot"
  
  # Remove any cached data
  RMDir /r "$LOCALAPPDATA\Temp\clippilot-desktop"
  RMDir /r "$TEMP\clippilot-desktop"
  
  # Remove registry entries
  DeleteRegKey /ifempty HKCU "Software\clippilot-desktop"
  DeleteRegKey /ifempty HKCU "Software\ClipPilot"
  
  # Clean up any remaining files in installation directory
  Delete "$INSTDIR\*.*"
  RMDir /r "$INSTDIR"
  
  # Remove shortcuts if they exist
  Delete "$DESKTOP\ClipPilot.lnk"
  Delete "$SMPROGRAMS\ClipPilot.lnk"
  Delete "$SMPROGRAMS\ClipPilot\*.*"
  RMDir "$SMPROGRAMS\ClipPilot"
!macroend
