import React, { ChangeEvent, useState } from "react";

import { styled } from "@mui/system";
import { IconButton, TextField } from "@mui/material";
import FileOpenIcon from "@mui/icons-material/FileOpen";

const HiddenInput = styled("input")`
    display: none;
`;

const FileInput: React.FC<{ onChange: Function; accept: string }> = ({ onChange, accept }) => {
    const [fileName, setFileName] = useState("");

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setFileName(file.name);
            onChange(file);
        }
    };

    return (
        <TextField
            variant="standard"
            type="text"
            InputProps={{
                readOnly: true,
                value: fileName ? fileName : "",
                startAdornment: (
                    <IconButton component="label">
                        <FileOpenIcon />
                        <HiddenInput
                            accept={accept}
                            type="file"
                            hidden
                            onChange={handleFileChange}
                            name="[licenseFile]"
                        />
                    </IconButton>
                )
            }}
        ></TextField>
    );
};

export default FileInput;
