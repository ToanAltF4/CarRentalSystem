Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

Dim projectDir, userProfile, javaCmd
projectDir = Replace(WScript.ScriptFullName, "start-silent.vbs", "")
userProfile = WshShell.ExpandEnvironmentStrings("%USERPROFILE%")

' Auto-detect Java 21 from Scoop
Dim scoopJava
scoopJava = userProfile & "\scoop\apps\temurin21-jdk\current\bin\java.exe"
If fso.FileExists(scoopJava) Then
    javaCmd = """" & scoopJava & """"
Else
    javaCmd = "java"
End If

' Start Backend (hidden)
WshShell.Run "cmd /c cd /d """ & projectDir & "be"" && " & javaCmd & " -jar target\car-rental-system-be-0.0.1-SNAPSHOT.jar > backend.log 2>&1", 0, False

' Wait 15 seconds for backend
WScript.Sleep 15000

' Start Frontend (hidden)
WshShell.Run "cmd /c cd /d """ & projectDir & "fe"" && npx serve dist -l 4000 -s > frontend.log 2>&1", 0, False

' Wait 3 seconds
WScript.Sleep 3000

' Start Cloudflare Tunnel (hidden)
Dim cfConfig
cfConfig = userProfile & "\.cloudflared\config-evfleet.yml"
WshShell.Run "cmd /c cloudflared tunnel --config """ & cfConfig & """ run > tunnel.log 2>&1", 0, False

' Show notification
MsgBox "EV Fleet started!" & vbCrLf & vbCrLf & "Frontend:  https://fpt.tokyo" & vbCrLf & "Backend:   https://api.fpt.tokyo" & vbCrLf & vbCrLf & "Logs: backend.log, frontend.log, tunnel.log" & vbCrLf & "To stop: run stop.bat", vbInformation, "EV Fleet"
