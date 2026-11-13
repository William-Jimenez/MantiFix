@echo off
setlocal
set "JAVA_HOME=%USERPROFILE%\.jdk\corretto-21"
set "PATH=%JAVA_HOME%\bin;%PATH%"

echo [MantiFix] Compilando Backend Java...
if not exist "target\classes" mkdir "target\classes"
if not exist "target\test-classes" mkdir "target\test-classes"

dir /s /b src\main\java\*.java > sources_main.txt
javac -d target\classes -encoding UTF-8 @sources_main.txt
del sources_main.txt

dir /s /b src\test\java\*.java > sources_test.txt
javac -cp target\classes -d target\test-classes -encoding UTF-8 @sources_test.txt
del sources_test.txt

jar -cfe target\mantifix-backend-1.0.0.jar com.mantifix.MantiFixServer -C target\classes .
echo [MantiFix] Compilacion finalizada exitosamente: target\mantifix-backend-1.0.0.jar
