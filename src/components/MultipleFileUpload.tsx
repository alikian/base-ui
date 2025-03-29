import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Button, Typography, Paper, LinearProgress, Snackbar, Alert } from '@mui/material';
import { styled } from '@mui/system';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import BaseService from '../BaseService';
import { Document } from '../models';


const DropzoneContainer = styled(Paper)(() => ({
    width: '100%',
    height: '150px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    border: `2px dashed `,
    cursor: 'pointer',
    overflowY: 'auto',
    transition: 'background-color 0.3s ease',
}));

interface MultipleFileUploadProps {
    onUploadComplete: () => void;
    baseId: string;
}

interface Progress {
    [key: string]: number;
}

const MultipleFileUpload: React.FC<MultipleFileUploadProps> = ({ onUploadComplete, baseId }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState<boolean>(false);
    const [progress, setProgress] = useState<Progress>({});
    const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(true);
    const baseService = new BaseService();

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setFiles(acceptedFiles);
        setProgress({});
    }, []);

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        multiple: true,
    });

    const handleUpload = async () => {
        if (!files.length) return;

        setUploading(true);
        setProgress({});
        setSuccess(true);

        try {
            const fileData: { fileName: string; fileType: string }[] = files.map((file: File) => ({
                fileName: file.name,
                fileType: file.type,
            }));
            console.log('fileData', fileData);

            const data = await baseService.generatePresign(baseId,fileData);

            const uploadPromises = files.map(async (file, index) => {
                const url = data[index];
    
                try {
                    const response = await axios.put(url, file, {
                        headers: { 'Content-Type': file.type },
                        onUploadProgress: (progressEvent) => {
                            const progressPercentage = progressEvent.total
                                ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
                                : 0;
                            setProgress((prevProgress) => ({
                                ...prevProgress,
                                [file.name]: progressPercentage,
                            }));
                        },
                    });
    
                    console.log('File uploaded successfully:', response);
    
                    // Call the provided code to create a document
                    const documentData = {
                        baseId,
                        documentValue: file.name,
                        documentType: 'File',
                        createdAt: Date.now(),
                    };
                    const newDocument = await baseService.createDocument(baseId, documentData as Document);
                    console.log('Document added:', newDocument);
    
                    return response.data;
                } catch (error) {
                    console.error('Error uploading file:', error);
                    setSuccess(false);
                    setOpenSnackbar(true);
                    return null;
                }
            });

            await Promise.all(uploadPromises);

            setUploading(false);
            setSuccess(true);
            setOpenSnackbar(true);
            onUploadComplete();
            setFiles([]);
            setProgress({});
            // setOpenDialog(false); // Close dialog after successful upload

        } catch (error) {
            console.error('Error uploading files:', error);
            setUploading(false);
            setSuccess(false);
            setOpenSnackbar(true);
        }
    };


    // Add the rest of the component logic here...

    return (
        <div>
            <DropzoneContainer {...getRootProps()} >
                <input {...getInputProps()} />
                <CloudUploadIcon fontSize="large" />
                <Typography variant="h6">{'Drag & drop files here, or click to select files'}</Typography>
            </DropzoneContainer>
            {files.length > 0 && (
                <Box mt={2}>
                    {files.map((file) => (
                        <Paper key={file.name} variant="outlined" sx={{ mb: 2, p: 2 }}>
                            <Typography variant="body1">{file.name}</Typography>
                            {uploading && (
                                <LinearProgress variant="determinate" value={progress[file.name] || 0} />
                            )}
                        </Paper>
                    ))}
                </Box>
            )}
            <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => handleUpload()}
                disabled={uploading}
                sx={{ mt: 2 }}
            >
                {'Upload Files'}
            </Button>
            <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity={success ? 'success' : 'error'}>
                    {success ? 'Files uploaded successfully' : 'Failed to upload files'}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default MultipleFileUpload;