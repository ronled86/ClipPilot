# Custom NSIS installer script for ClipPAilot
# Clean upgrade process without confusing Un_A.exe popup

# Variables for upgrade detection
Var PreviousInstallDir
Var PreviousVersion
Var UpgradeMode

# Custom installer initialization with streamlined upgrade process
!macro customInit
  # Check for existing installation in registry
  ReadRegStr $PreviousInstallDir HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\{${UNINSTALL_APP_KEY}}" "InstallLocation"
  ReadRegStr $PreviousVersion HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\{${UNINSTALL_APP_KEY}}" "DisplayVersion"
  
  # If previous installation found, handle upgrade with single interaction
  ${If} $PreviousInstallDir != ""
    StrCpy $UpgradeMode "true"
    
    # Single comprehensive upgrade dialog with all options
    MessageBox MB_YESNO|MB_ICONQUESTION "ClipPAilot $PreviousVersion is already installed.$\r$\n$\r$\nUpgrade to version ${VERSION}?$\r$\n$\r$\n• Your settings and downloaded files will be preserved$\r$\n• ClipPAilot will be closed automatically if running$\r$\n• Installation will proceed without further prompts$\r$\n$\r$\nContinue with seamless upgrade?" IDYES proceed_upgrade IDNO cancel_install
    
    cancel_install:
      MessageBox MB_OK|MB_ICONINFORMATION "Installation cancelled by user."
      Abort
    
    proceed_upgrade:
      # Set installation directory to existing location for seamless upgrade
      StrCpy $INSTDIR $PreviousInstallDir
      
      # Automatically close running ClipPAilot process without additional prompts
      DetailPrint "Preparing seamless upgrade..."
      
      # Close ClipPAilot silently
      FindWindow $0 "" "ClipPAilot - YouTube Search & Download"
      ${If} $0 != 0
        DetailPrint "Closing ClipPAilot application..."
        SendMessage $0 ${WM_CLOSE} 0 0
        Sleep 3000  # Wait for graceful shutdown
        
        # Force close if still running
        FindWindow $0 "" "ClipPAilot - YouTube Search & Download"
        ${If} $0 != 0
          DetailPrint "Force closing ClipPAilot..."
          System::Call "kernel32::OpenProcess(i 1, i 0, i $0) i .r1"
          System::Call "kernel32::TerminateProcess(i r1, i 0)"
          System::Call "kernel32::CloseHandle(i r1)"
          Sleep 1000
        ${EndIf}
      ${EndIf}
      
      # Clean upgrade - remove old files but preserve user data
      DetailPrint "Removing old application files..."
      
      # Remove old application files (but not user data)
      Delete "$PreviousInstallDir\ClipPAilot.exe"
      Delete "$PreviousInstallDir\*.dll"
      RMDir /r "$PreviousInstallDir\resources\app.asar*"
      RMDir /r "$PreviousInstallDir\resources\electron.asar"
      RMDir /r "$PreviousInstallDir\swiftshader"
      RMDir /r "$PreviousInstallDir\locales"
      
      # Keep user data directories intact
      # $LOCALAPPDATA\ClipPAilot\* - settings, logs, downloads
      
      DetailPrint "Installing new version..."
  ${Else}
    StrCpy $UpgradeMode "false"
    DetailPrint "Fresh installation detected."
  ${EndIf}
!macroend

# Custom uninstaller section - only used for manual uninstalls
!macro customUnInstall
  # This is only called for manual uninstalls, not upgrades
  DetailPrint "Uninstalling ClipPAilot..."
  
  # Ask user about settings only for manual uninstalls
  MessageBox MB_YESNO|MB_ICONQUESTION "Do you want to remove your ClipPAilot settings, logs, and downloaded files?$\r$\n$\r$\nSelect 'No' to keep your data for future installations." IDYES delete_all_data IDNO keep_user_data
  
  delete_all_data:
    DetailPrint "Removing all user data..."
    # Remove application data folders
    RMDir /r "$LOCALAPPDATA\ClipPAilot"
    RMDir /r "$APPDATA\ClipPAilot"
    
    # Remove any cached data
    RMDir /r "$LOCALAPPDATA\Temp\clippailot-desktop"
    
    # Remove registry entries
    DeleteRegKey /ifempty HKCU "Software\ClipPAilot"
    
    Goto finish_uninstall
    
  keep_user_data:
    DetailPrint "Preserving user settings and data..."
  
  finish_uninstall:
    # Always clean up application files
    RMDir /r "$INSTDIR"
    
    # Remove shortcuts
    Delete "$DESKTOP\ClipPAilot.lnk"
    Delete "$SMPROGRAMS\ClipPAilot.lnk"
    Delete "$SMPROGRAMS\ClipPAilot\*.*"
    RMDir "$SMPROGRAMS\ClipPAilot"
    
    DetailPrint "Uninstallation completed."
!macroend

# Custom installer finish
!macro customInstall
  # Create registry entries for future upgrade detection
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\{${UNINSTALL_APP_KEY}}" "InstallLocation" "$INSTDIR"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\{${UNINSTALL_APP_KEY}}" "DisplayVersion" "${VERSION}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\{${UNINSTALL_APP_KEY}}" "Publisher" "Ron Lederer"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\{${UNINSTALL_APP_KEY}}" "DisplayName" "ClipPAilot"
  
  ${If} $UpgradeMode == "true"
    DetailPrint "Upgrade completed successfully!"
  ${Else}
    DetailPrint "Installation completed successfully!"
  ${EndIf}
  
  # No popup needed - installer's finish page will handle the completion message
!macroend
