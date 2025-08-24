# Custom NSIS installer script for ClipPAilot
# Minimal approach to avoid orphan issues

# Custom installer initialization - basic cleanup only
!macro customInit
  # Close any running ClipPAilot processes first
  DetailPrint "Checking for running ClipPAilot processes..."
  nsExec::ExecToLog 'taskkill /f /im "ClipPAilot.exe" /t'
  
  # Simple check for existing installation
  ReadRegStr $0 HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\com.ronled.clippailot" "InstallLocation"
  ${If} $0 != ""
    MessageBox MB_OKCANCEL "ClipPAilot is already installed.$\r$\nContinue with installation?" IDCANCEL cancel_install
    cancel_install:
      Abort
  ${EndIf}
!macroend

# Enhanced uninstaller - thorough cleanup
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
  MessageBox MB_YESNO "Remove settings and downloads?" IDYES remove_data IDNO keep_data
  
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
    
    # Clean up ALL possible registry entries to prevent orphans
    DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\com.ronled.clippailot"
    DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\com.ronled.clippailot"
    DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\{com.ronled.clippailot}"
    DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\{com.ronled.clippailot}"
    
    DetailPrint "Uninstallation completed."
!macroend

# Standard installation completion
!macro customInstall
  DetailPrint "Installation completed successfully!"
!macroend
