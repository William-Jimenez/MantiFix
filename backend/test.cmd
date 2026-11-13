@echo off
setlocal
set "JAVA_HOME=%USERPROFILE%\.jdk\corretto-21"
set "PATH=%JAVA_HOME%\bin;%PATH%"

echo [MantiFix] Ejecutando pruebas automatizadas del Backend Java...
java -cp "target\classes;target\test-classes" com.mantifix.MantiFixTestSuite
