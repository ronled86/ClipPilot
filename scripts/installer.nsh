# Custom NSIS installer script for ClipPAilot
# Ensures complete removal of all application data and residues

# Custom uninstaller section to remove all traces
!macro customUnInstall
  # Remove application data folders
  RMDir /r "$LOCALAPPDATA\clippailot-desktop"
  RMDir /r "$APPDATA\clippailot-desktop"
  RMDir /r "$LOCALAPPDATA\ClipPAilot"
  RMDir /r "$APPDATA\ClipPAilot"
  
  # Remove any cached data
  RMDir /r "$LOCALAPPDATA\Temp\clippailot-desktop"
  RMDir /r "$TEMP\clippailot-desktop"
  
  # Remove registry entries
  DeleteRegKey /ifempty HKCU "Software\clippailot-desktop"
  DeleteRegKey /ifempty HKCU "Software\ClipPAilot"
  
  # Clean up any remaining files in installation directory
  Delete "$INSTDIR\*.*"
  RMDir /r "$INSTDIR"
  
  # Remove shortcuts if they exist
  Delete "$DESKTOP\ClipPAilot.lnk"
  Delete "$SMPROGRAMS\ClipPAilot.lnk"
  Delete "$SMPROGRAMS\ClipPAilot\*.*"
  RMDir "$SMPROGRAMS\ClipPAilot"
!macroend
