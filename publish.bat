gatsby clean && ^
gatsby build && ^
robocopy public publish ^
    /MIR ^
    /XD ".vscode" ^
    && ^
code publish
