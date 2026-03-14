Set WshShell = CreateObject("WScript.Shell")

' Start Backend (hidden)
WshShell.Run "cmd /c cd /d """ & Replace(WScript.ScriptFullName, "start-silent.vbs", "") & "be"" && java -jar target\car-rental-system-be-0.0.1-SNAPSHOT.jar > backend.log 2>&1", 0, False

' Wait 15 seconds for backend
WScript.Sleep 15000

' Start Frontend (hidden)
WshShell.Run "cmd /c cd /d """ & Replace(WScript.ScriptFullName, "start-silent.vbs", "") & "fe"" && npx serve dist -l 3000 -s > frontend.log 2>&1", 0, False

' Wait 3 seconds
WScript.Sleep 3000

' Start Cloudflare Tunnel (hidden)
Dim cfConfig
cfConfig = CreateObject("WScript.Shell").ExpandEnvironmentStrings("%USERPROFILE%") & "\.cloudflared\config-evfleet.yml"
WshShell.Run "cmd /c cloudflared tunnel --config """ & cfConfig & """ run > tunnel.log 2>&1", 0, False

' Show notification
MsgBox "EV Fleet started!" & vbCrLf & vbCrLf & "Frontend:  https://fpt.tokyo" & vbCrLf & "Backend:   https://api.fpt.tokyo" & vbCrLf & vbCrLf & "Logs: backend.log, frontend.log, tunnel.log" & vbCrLf & "To stop: run stop.bat", vbInformation, "EV Fleet"
