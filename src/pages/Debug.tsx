import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import React from 'react'

function Debug() {
  return (
    <React.Fragment>
    <Box sx={{ my: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Debugger for Viewer
      </Typography>
      This is built with React Material UI
      {/* <ProTip />*/}
    </Box>
    <Box sx={{ my: 4 }}>
    <Typography variant="h4" component="h1" gutterBottom>
      Debug Output
    </Typography>
    This will show Text Output of different data
  </Box>
  </React.Fragment>
  )
}

export default Debug