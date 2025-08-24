# Custom NSIS installer script for ClipPAilot
# Enhanced with version summary and clear messaging

# Custom finish page configuration
!include "MUI2.nsh"

# Hide console windows during uninstall process
ShowUninstDetails hide
ShowInstDetails show

# Suppress external program output during uninstall
!define NSISUNZ_QUIET

# Make uninstaller run silently without showing temporary files
RequestExecutionLevel user
SilentInstall normal
SilentUnInstall normal

# Ensure we're using the full build version with explicit fallback
!ifndef buildVersion
  !define buildVersion "1.1.0.2"
!endif

# Define the version at compile time for consistent use
# NOTE: Update this version number when creating new releases!
# This should match the buildVersion in electron-builder.yml
!define FULL_VERSION "1.1.0"
!define BUILD_VERSION "1.1.0.2"

# Define publisher information with explicit fallback
# Use the publisher name directly since COMPANY_NAME may not be set by electron-builder
!ifdef COMPANY_NAME
  !define PUBLISHER_NAME "${COMPANY_NAME}"
!else
  !define PUBLISHER_NAME "Ron Lederer"
!endif

# Define finish page text with version details
!define MUI_FINISHPAGE_TITLE "ClipPAilot Installation Complete"  
!define MUI_FINISHPAGE_TEXT "ClipPAilot version ${BUILD_VERSION} has been successfully installed.$\r$\n$\r$\nInstallation Summary:$\r$\n• Version: ${BUILD_VERSION}$\r$\n• Date: August 24, 2025$\r$\n$\r$\nClick Finish to close this wizard."
!define MUI_FINISHPAGE_RUN_TEXT "Launch ClipPAilot now"

# Custom function to ensure installation directory is shown correctly
Function .onInstSuccess
  DetailPrint "Installation completed successfully to: $INSTDIR"
  # Update the finish page text to include the actual installation path
  StrCpy $0 "ClipPAilot version ${BUILD_VERSION} has been successfully installed.$\r$\n$\r$\nInstallation Summary:$\r$\n• Version: ${BUILD_VERSION}$\r$\n• Date: August 24, 2025$\r$\n$\r$\nClick Finish to close this wizard."
FunctionEnd

# Custom function to update finish page with actual installation path
Function .onGUIEnd
  # This will be called when the finish page is displayed
FunctionEnd

# Custom installer initialization with detailed version checking
!macro customInit
  # Close any running ClipPAilot processes first
  DetailPrint "Checking for running ClipPAilot processes..."
  nsExec::ExecToStack 'taskkill /f /im "ClipPAilot.exe" /t'
  Pop $0 # Get return code
  Pop $1 # Get output (ignore it for cleaner install)
  
  # Check for existing installation and get version details
  ReadRegStr $0 HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\com.ronled.clippailot" "InstallLocation"
  ReadRegStr $1 HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\com.ronled.clippailot" "DisplayVersion"
  
  ${If} $0 != ""
    ${If} $1 != ""
      StrCpy $2 "ClipPAilot is already installed.$\r$\n$\r$\nInstalled Version: $1$\r$\nNew Version: ${BUILD_VERSION}$\r$\nInstallation Path: $0$\r$\n$\r$\nOptions:$\r$\n• Click 'OK' to upgrade/reinstall$\r$\n• Click 'Cancel' to abort installation$\r$\n$\r$\nNote: Your settings and data will be preserved."
    ${Else}
      StrCpy $2 "ClipPAilot is already installed.$\r$\n$\r$\nInstalled Version: Unknown$\r$\nNew Version: ${BUILD_VERSION}$\r$\nInstallation Path: $0$\r$\n$\r$\nOptions:$\r$\n• Click 'OK' to upgrade/reinstall$\r$\n• Click 'Cancel' to abort installation$\r$\n$\r$\nNote: Your settings and data will be preserved."
    ${EndIf}
    MessageBox MB_OKCANCEL "$2" IDOK continue_install IDCANCEL cancel_install
    
    continue_install:
      # Clean up any duplicate registry entries before proceeding
      DetailPrint "Cleaning up existing installation entries..."
      DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\com.ronled.clippailot"
      DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\{com.ronled.clippailot}"
      DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\{com.ronled.clippailot}"
      DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\b1255e10-cd0b-5b1f-8f88-b8677e4b5483"
      Goto end_init
    
    cancel_install:
      Abort
      
    end_init:
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
  nsExec::ExecToStack 'taskkill /f /im "ClipPAilot.exe" /t'
  Pop $0 # Get return code
  Pop $1 # Get output (ignore it for cleaner uninstall)
  
  # Ask user about keeping data with clear explanation
  MessageBox MB_YESNO|MB_ICONQUESTION "Do you want to remove your personal data?$\r$\n$\r$\nThis includes:$\r$\n• Your ClipPAilot settings and preferences$\r$\n• Downloaded videos and audio files$\r$\n• Search history and bookmarks$\r$\n• Application logs and cache$\r$\n$\r$\nSelect 'Yes' to delete all your data$\r$\nSelect 'No' to keep your data for future installations" IDYES remove_data IDNO keep_data
  
  remove_data:
    DetailPrint "Removing all user data..."
    RMDir /r "$LOCALAPPDATA\ClipPAilot"
    RMDir /r "$APPDATA\ClipPAilot"
    DeleteRegKey /ifempty HKCU "Software\ClipPAilot"
    Goto cleanup_files
    
  keep_data:
    DetailPrint "Preserving user settings and data..."
    # Even when keeping data, we must remove the uninstall registry entry to prevent orphans
    DetailPrint "Note: Removing installation registry entries to prevent duplicate listings"
  
  cleanup_files:
    # Always remove application files
    DetailPrint "Removing application files..."
    RMDir /r "$INSTDIR"
    
    # Remove shortcuts
    Delete "$DESKTOP\ClipPAilot.lnk"
    Delete "$SMPROGRAMS\ClipPAilot.lnk"
    Delete "$SMPROGRAMS\ClipPAilot\*.*"
    RMDir "$SMPROGRAMS\ClipPAilot"
    
    # ALWAYS clean up installation registry entries to prevent orphans
    # This is crucial - even when keeping user data, the installation entry must be removed
    DetailPrint "Cleaning up installation registry entries..."
    DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\com.ronled.clippailot"
    DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\com.ronled.clippailot"
    DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\{com.ronled.clippailot}"
    DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\{com.ronled.clippailot}"
    DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\b1255e10-cd0b-5b1f-8f88-b8677e4b5483"
    # Clean up any possible variations with different casing or formatting
    DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\ClipPAilot"
    DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\ClipPAilot"
    DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\{ClipPAilot}"
    DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\{ClipPAilot}"
    
    DetailPrint "Uninstallation completed."
!macroend

# Enhanced installation completion with single registry entry
!macro customInstall
  # Installation completed successfully!
  DetailPrint "Installation completed successfully!"
  DetailPrint "Installed ClipPAilot version: ${BUILD_VERSION}"
  DetailPrint "Installation directory: $INSTDIR"
  
  # Clean up any duplicate registry entries first - including the specific GUID we found
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\com.ronled.clippailot"
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\{com.ronled.clippailot}"
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\{com.ronled.clippailot}"
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\b1255e10-cd0b-5b1f-8f88-b8677e4b5483"
  
  # Create ONLY ONE registry entry to prevent duplicates with complete publisher information
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\com.ronled.clippailot" "DisplayName" "ClipPAilot"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\com.ronled.clippailot" "DisplayVersion" "${BUILD_VERSION}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\com.ronled.clippailot" "Publisher" "${PUBLISHER_NAME}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\com.ronled.clippailot" "Contact" "${PUBLISHER_NAME}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\com.ronled.clippailot" "HelpLink" "https://github.com/ronled86/ClipPilot"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\com.ronled.clippailot" "URLInfoAbout" "https://github.com/ronled86/ClipPilot"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\com.ronled.clippailot" "InstallLocation" "$INSTDIR"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\com.ronled.clippailot" "UninstallString" "$INSTDIR\Uninstall ClipPAilot.exe"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\com.ronled.clippailot" "QuietUninstallString" "$INSTDIR\Uninstall ClipPAilot.exe /S"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\com.ronled.clippailot" "InstallDate" "20250824"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\com.ronled.clippailot" "DisplayIcon" "$INSTDIR\resources\icon.ico"
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\com.ronled.clippailot" "NoModify" 1
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\com.ronled.clippailot" "NoRepair" 1
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\com.ronled.clippailot" "WindowsInstaller" 0
  
  # Calculate and write installation size (estimate in KB)
  # ClipPAilot with tools is approximately 350MB = 358400 KB
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\com.ronled.clippailot" "EstimatedSize" 358400
  
  # Additional version information for complete Windows integration
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\com.ronled.clippailot" "Version" "${BUILD_VERSION}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\com.ronled.clippailot" "VersionMajor" "1"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\com.ronled.clippailot" "VersionMinor" "0"
  
  # Force write the build version to ensure it shows up correctly in Windows Programs
  DetailPrint "Setting DisplayVersion to: ${BUILD_VERSION}"
  DetailPrint "Setting Publisher to: ${PUBLISHER_NAME}"
  
  # Additional force-write to ensure version is not overwritten by electron-builder
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\com.ronled.clippailot" "Version" "${BUILD_VERSION}"
  
  DetailPrint "Registry entries created successfully."
!macroend

# Additional macro to ensure version is set correctly after default installation
!macro customFinish
  DetailPrint "Final step: Ensuring correct version in registry..."
  
  # Force overwrite key registry entries to ensure they show correctly in Windows Programs
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\com.ronled.clippailot" "DisplayVersion" "${BUILD_VERSION}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\com.ronled.clippailot" "Publisher" "${PUBLISHER_NAME}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\com.ronled.clippailot" "Version" "${BUILD_VERSION}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\com.ronled.clippailot" "DisplayIcon" "$INSTDIR\resources\icon.ico"
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\com.ronled.clippailot" "EstimatedSize" 358400
  
  DetailPrint "Final DisplayVersion set to: ${BUILD_VERSION}"
  DetailPrint "Final Publisher set to: ${PUBLISHER_NAME}"
  DetailPrint "Final Version set to: ${BUILD_VERSION}"
  DetailPrint "Final Installation Location: $INSTDIR"
  DetailPrint "Final Estimated Size set to: 358400 KB (~350 MB)"
!macroend
