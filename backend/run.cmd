@echo off
setlocal
set "JAVA_HOME=%USERPROFILE%\.jdk\corretto-21"
set "PATH=%JAVA_HOME%\bin;%PATH%"

echo [MantiFix] Iniciando servidor Backend Java...
java -jar target\mantifix-backend-1.0.0.jar
