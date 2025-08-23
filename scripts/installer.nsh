# Custom NSIS installer script for ClipPAilot
# Handles upgrades and settings preservation with user choice

# Variables for upgrade detection
Var PreviousInstallDir
Var PreviousVersion
Var UpgradeMode

# Custom installer initialization
!macro customInit
  # Check for existing installation
  ReadRegStr $PreviousInstallDir HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\{${UNINSTALL_APP_KEY}}" "InstallLocation"
  ReadRegStr $PreviousVersion HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\{${UNINSTALL_APP_KEY}}" "DisplayVersion"
  
  # If previous installation found
  ${If} $PreviousInstallDir != ""
    StrCpy $UpgradeMode "true"
    MessageBox MB_YESNO|MB_ICONQUESTION "ClipPAilot $PreviousVersion is already installed.$\r$\n$\r$\nDo you want to upgrade to version ${VERSION}?$\r$\n$\r$\nYour settings and preferences will be preserved." IDYES upgrade IDNO cancel
    
    cancel:
      Abort
    
    upgrade:
      # Silently uninstall previous version but preserve settings
      ExecWait '"$PreviousInstallDir\Uninstall ClipPAilot.exe" /S /PRESERVESETTINGS=1'
  ${EndIf}
!macroend

# Custom header for installer
!macro customHeader
  !define MUI_COMPONENTSPAGE_TEXT_TOP "Choose the components you want to install:"
  !define MUI_FINISHPAGE_SHOWREADME
  !define MUI_FINISHPAGE_SHOWREADME_TEXT "Show release notes"
  !define MUI_FINISHPAGE_SHOWREADME_FUNCTION ShowReleaseNotes
!macroend

# Function to show release notes
Function ShowReleaseNotes
  ExecShell "open" "https://github.com/ronled86/ClipPAilot/releases/latest"
FunctionEnd

# Custom uninstaller section with user choice for settings
!macro customUnInstall
  # Check if this is a silent upgrade (preserve settings)
  ${GetParameters} $R0
  ${GetOptions} $R0 "/PRESERVESETTINGS=" $R1
  
  ${If} $R1 == "1"
    # Silent upgrade mode - don't delete settings
    DetailPrint "Upgrading ClipPAilot - preserving user settings..."
  ${Else}
    # Normal uninstall - ask user about settings
    MessageBox MB_YESNO|MB_ICONQUESTION "Do you want to remove your ClipPAilot settings and downloaded files?$\r$\n$\r$\nSelect 'No' to keep your settings for future installations." IDYES delete_settings IDNO keep_settings
    
    delete_settings:
      DetailPrint "Removing user settings and data..."
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
      
      Goto finish_uninstall
      
    keep_settings:
      DetailPrint "Preserving user settings..."
      # Only remove application files, keep settings
  ${EndIf}
  
  finish_uninstall:
  # Always clean up application files
  Delete "$INSTDIR\*.*"
  RMDir /r "$INSTDIR"
  
  # Remove shortcuts
  Delete "$DESKTOP\ClipPAilot.lnk"
  Delete "$SMPROGRAMS\ClipPAilot.lnk"
  Delete "$SMPROGRAMS\ClipPAilot\*.*"
  RMDir "$SMPROGRAMS\ClipPAilot"
!macroend

# Custom installer finish
!macro customInstall
  # Create registry entries for upgrade detection
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\{${UNINSTALL_APP_KEY}}" "InstallLocation" "$INSTDIR"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\{${UNINSTALL_APP_KEY}}" "DisplayVersion" "${VERSION}"
  
  ${If} $UpgradeMode == "true"
    DetailPrint "Upgrade completed successfully!"
    MessageBox MB_OK|MB_ICONINFORMATION "ClipPAilot has been successfully upgraded to version ${VERSION}.$\r$\n$\r$\nYour settings and preferences have been preserved."
  ${Else}
    DetailPrint "Installation completed successfully!"
  ${EndIf}
!macroend
