import React, { useState } from 'react';
import { 
  Paper, Typography, Box, Tabs, Tab, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, TablePagination, Chip, Button 
} from '@mui/material';
import { Visibility, GetApp } from '@mui/icons-material';

const DetailedDataView = ({ parsedData, assessmentData }) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  if (!parsedData) return null;

  const sheets = Object.keys(parsedData);
  const currentSheet = sheets[selectedTab];
  const currentData = parsedData[currentSheet] || [];

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    setPage(0);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(currentData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentSheet}_data.json`;
    link.click();
  };

  const getColumns = (data) => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]);
  };

  const columns = getColumns(currentData);
  const paginatedData = currentData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" gutterBottom>
          <Visibility sx={{ mr: 1, verticalAlign: 'middle' }} />
          Detailed Data Analysis
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<GetApp />} 
          onClick={handleExport}
          disabled={!currentData.length}
        >
          Export {currentSheet}
        </Button>
      </Box>

      <Tabs 
        value={selectedTab} 
        onChange={handleTabChange} 
        variant="scrollable" 
        scrollButtons="auto"
        sx={{ mb: 3 }}
      >
        {sheets.map((sheet, index) => (
          <Tab 
            key={index} 
            label={
              <Box display="flex" alignItems="center">
                {sheet}
                <Chip 
                  label={parsedData[sheet].length} 
                  size="small" 
                  sx={{ ml: 1 }} 
                />
              </Box>
            } 
          />
        ))}
      </Tabs>

      {currentData.length > 0 ? (
        <>
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell key={column} sx={{ fontWeight: 'bold' }}>
                      {column}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.map((row, index) => (
                  <TableRow key={index} hover>
                    {columns.map((column) => (
                      <TableCell key={column}>
                        {typeof row[column] === 'object' 
                          ? JSON.stringify(row[column]) 
                          : String(row[column] || '')
                        }
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            component="div"
            count={currentData.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 25, 50, 100]}
          />
        </>
      ) : (
        <Typography variant="body1" color="text.secondary">
          No data available for {currentSheet}
        </Typography>
      )}
    </Paper>
  );
};

export default DetailedDataView;