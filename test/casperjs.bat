@ECHO OFF
set CASPER_PATH=
set CASPER_BIN=%CASPER_PATH%\bin\
set ARGV=%*

call phantomjs "%CASPER_BIN%bootstrap.js" --casper-path="%CASPER_PATH%" --cli %ARGV%