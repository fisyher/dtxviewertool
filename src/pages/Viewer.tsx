import { Box, Typography } from '@mui/material'

function Viewer() {
  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Main Viewer
      </Typography>
      This is the main viewer
      {/* <ProTip />*/}
    </Box>
  )
}

export default Viewer