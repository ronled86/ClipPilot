# Custom NSIS installer script for ClipPAilot
# Simple approach: basic detection and standard installer behavior

# Variables for existing installation detection
Var PreviousInstallDir
Var PreviousVersion

# Custom installer initialization - simple detection only
!macro customInit
  # Check for existing installation in registry
  ReadRegStr $PreviousInstallDir HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\com.ronled.clippailot" "InstallLocation"
  ReadRegStr $PreviousVersion HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\com.ronled.clippailot" "DisplayVersion"
  
  # Also check HKLM for system-wide installations
  ${If} $PreviousInstallDir == ""
    ReadRegStr $PreviousInstallDir HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\com.ronled.clippailot" "InstallLocation"
    ReadRegStr $PreviousVersion HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\com.ronled.clippailot" "DisplayVersion"
  ${EndIf}
  
  # If previous installation found, show simple warning
  ${If} $PreviousInstallDir != ""
    MessageBox MB_OKCANCEL|MB_ICONINFORMATION "ClipPAilot $PreviousVersion is already installed.$\r$\n$\r$\nPlease uninstall the existing version first using$\r$\nControl Panel > Programs and Features.$\r$\n$\r$\nContinue anyway?" IDCANCEL cancel_install
    
    cancel_install:
      Abort
  ${EndIf}
!macroend

# Standard uninstaller - clean removal
!macro customUnInstall
  DetailPrint "Uninstalling ClipPAilot..."
  
  # Close running application
  FindWindow $0 "" "ClipPAilot"
  ${If} $0 != 0
    DetailPrint "Closing ClipPAilot application..."
    SendMessage $0 ${WM_CLOSE} 0 0
    Sleep 2000
  ${EndIf}
  
  # Force close any remaining processes
  nsExec::ExecToLog 'taskkill /f /im "ClipPAilot.exe" /t'
  
  # Ask user about keeping data
  MessageBox MB_YESNO|MB_ICONQUESTION "Remove ClipPAilot settings and downloaded files?$\r$\n$\r$\nYes = Remove all data$\r$\nNo = Keep data for future use" IDYES remove_data IDNO keep_data
  
  remove_data:
    DetailPrint "Removing all user data..."
    RMDir /r "$LOCALAPPDATA\ClipPAilot"
    RMDir /r "$APPDATA\ClipPAilot"
    DeleteRegKey /ifempty HKCU "Software\ClipPAilot"
    Goto cleanup_files
    
  keep_data:
    DetailPrint "Preserving user settings and data..."
  
  cleanup_files:
    # Always remove application files
    DetailPrint "Removing application files..."
    RMDir /r "$INSTDIR"
    
    # Remove shortcuts
    Delete "$DESKTOP\ClipPAilot.lnk"
    Delete "$SMPROGRAMS\ClipPAilot.lnk"
    Delete "$SMPROGRAMS\ClipPAilot\*.*"
    RMDir "$SMPROGRAMS\ClipPAilot"
    
    DetailPrint "Uninstallation completed."
!macroend

# Standard installation completion
!macro customInstall
  DetailPrint "Installation completed successfully!"
!macroend
